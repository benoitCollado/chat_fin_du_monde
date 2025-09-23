import sodium from "libsodium-wrappers";
/** =========================
 *  Base64url (navigateur)
 *  ========================= */
export const b64u = {
    enc: (u8) => {
        let binary = "";
        for (let i = 0; i < u8.length; i++)
            binary += String.fromCharCode(u8.at(i));
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    },
    dec: (s) => {
        s = s.replace(/-/g, "+").replace(/_/g, "/");
        const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
        const base64 = s + "=".repeat(pad);
        const binStr = atob(base64);
        const u8 = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++)
            u8[i] = binStr.charCodeAt(i);
        return u8;
    },
};
/** =========================
 *  Hamming(7,4) — correction
 *  =========================
 *  Encodage: 1 octet -> 2 codewords (7 bits chacun) -> 2 octets (on utilise les 7 bits bas)
 *  Décodage: 2 octets -> 2 codewords -> correction 1 bit -> 1 octet
 */
// Encode un nibble (4 bits) en mot Hamming(7,4).
function hammingEncodeNibble(n) {
    const d3 = (n >> 3) & 1; // bit le plus haut du nibble
    const d2 = (n >> 2) & 1;
    const d1 = (n >> 1) & 1;
    const d0 = n & 1;
    // Positions (1..7): p1, p2, d3, p4, d2, d1, d0
    const c3 = d3;
    const c5 = d2;
    const c6 = d1;
    const c7 = d0;
    const p1 = (c3 ^ c5 ^ c7) & 1; // couvre positions 1,3,5,7
    const p2 = (c3 ^ c6 ^ c7) & 1; // couvre positions 2,3,6,7
    const p4 = (c5 ^ c6 ^ c7) & 1; // couvre positions 4,5,6,7
    // codeword bits c1..c7, on les place sur 7 bits (bit0 = position1)
    let cw = 0;
    cw |= (p1 << 0); // pos1
    cw |= (p2 << 1); // pos2
    cw |= (c3 << 2); // pos3
    cw |= (p4 << 3); // pos4
    cw |= (c5 << 4); // pos5
    cw |= (c6 << 5); // pos6
    cw |= (c7 << 6); // pos7
    return cw; // 0..127, 7 bits
}
// Décode un mot Hamming(7,4) avec correction d’1 bit si nécessaire.
// Retourne le nibble (4 bits) décodé.
function hammingDecodeCodeword(cw) {
    // Extraire bits positions 1..7
    const c1 = (cw >> 0) & 1;
    const c2 = (cw >> 1) & 1;
    const c3 = (cw >> 2) & 1;
    const c4 = (cw >> 3) & 1;
    const c5 = (cw >> 4) & 1;
    const c6 = (cw >> 5) & 1;
    const c7 = (cw >> 6) & 1;
    // Syndrome (p1, p2, p4)
    const s1 = (c1 ^ c3 ^ c5 ^ c7) & 1;
    const s2 = (c2 ^ c3 ^ c6 ^ c7) & 1;
    const s4 = (c4 ^ c5 ^ c6 ^ c7) & 1;
    const syndrome = (s4 << 2) | (s2 << 1) | s1; // valeur 0..7
    let corrected = cw;
    if (syndrome !== 0 && syndrome <= 7) {
        // Inverser le bit à la position = syndrome
        corrected ^= (1 << (syndrome - 1));
    }
    // Lire les données (positions 3,5,6,7) = d3,d2,d1,d0
    const cc3 = (corrected >> 2) & 1;
    const cc5 = (corrected >> 4) & 1;
    const cc6 = (corrected >> 5) & 1;
    const cc7 = (corrected >> 6) & 1;
    const nibble = (cc3 << 3) | (cc5 << 2) | (cc6 << 1) | cc7;
    return nibble & 0xF;
}
// Encodage ECC d’un buffer arbitraire : pour chaque octet, produit 2 octets (7 bits utiles chacun).
export function eccEncode(bytes) {
    const out = new Uint8Array(bytes.length * 2);
    let j = 0;
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b === undefined) {
            throw new Error("b is undefined");
        }
        const high = (b >> 4) & 0xF;
        const low = b & 0xF;
        const cw1 = hammingEncodeNibble(high);
        const cw2 = hammingEncodeNibble(low);
        out[j++] = cw1; // on utilise seulement les 7 bits bas
        out[j++] = cw2;
    }
    return out;
}
// Décodage ECC : corrige 1 bit par codeword si nécessaire.
export function eccDecode(bytes) {
    if (bytes.length % 2 !== 0)
        throw new Error("Longueur ECC invalide");
    const out = new Uint8Array(bytes.length / 2);
    let j = 0;
    for (let i = 0; i < bytes.length - 1; i += 2) {
        if (bytes[i] === undefined) {
            throw new Error("un byte est undefined");
        }
        const cw1 = bytes[i] & 0x7F; // 7 bits utiles
        const cw2 = bytes[i + 1] & 0x7F;
        const high = hammingDecodeCodeword(cw1);
        const low = hammingDecodeCodeword(cw2);
        out[j++] = ((high << 4) | low) & 0xFF;
    }
    return out;
}
// Génère l’identité persistante (sign + dh)
export async function generateIdentity() {
    await sodium.ready;
    const sign = sodium.crypto_sign_keypair(); // Ed25519
    const ecdh = sodium.crypto_box_keypair(); // X25519
    return { signPub: sign.publicKey, signPriv: sign.privateKey, dhPub: ecdh.publicKey, dhPriv: ecdh.privateKey };
}
/** =========================
 *  Dérivation & AEAD
 *  ========================= */
function deriveSessionKey(shared, salt) {
    const master = sodium.crypto_generichash(32, shared, salt); // BLAKE2b(shared, salt) -> 32o
    const subkey = sodium.crypto_kdf_derive_from_key(32, 1, "CHATKEYS", master); // 32o
    return subkey;
}
/** =========================
 *  Chiffrement (avec ECC après)
 *  ========================= */
export async function encryptForRecipient(plaintext, recipientDhPub_b64u, senderSignPriv_b64u, aad) {
    await sodium.ready;
    const recipientDhPub = b64u.dec(recipientDhPub_b64u);
    const senderSignPriv = b64u.dec(senderSignPriv_b64u);
    // 1) Paire éphémère X25519
    const eph = sodium.crypto_box_keypair();
    // 2) Signature de la clé éphémère
    const signature = sodium.crypto_sign_detached(eph.publicKey, senderSignPriv);
    // 3) Secret partagé
    const shared = sodium.crypto_scalarmult(eph.privateKey, recipientDhPub);
    // 4) Dérive clé de session
    const salt = sodium.randombytes_buf(16);
    const key = deriveSessionKey(shared, salt);
    // 5) AEAD XChaCha20-Poly1305
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(plaintext, aad ?? null, null, nonce, key);
    // Concatène salt + ciphertext
    const ctWithSalt = new Uint8Array(salt.length + ciphertext.length);
    ctWithSalt.set(salt, 0);
    ctWithSalt.set(ciphertext, salt.length);
    // 6) **Correction d’erreurs APRES chiffrement**
    const ctECC = eccEncode(ctWithSalt);
    // 7) Sérialisation
    return {
        eph_pub: b64u.enc(eph.publicKey),
        sig: b64u.enc(signature),
        nonce: b64u.enc(nonce),
        aad: aad ? b64u.enc(aad) : undefined,
        ct: b64u.enc(ctECC),
    };
}
/** =========================
 *  Déchiffrement (avec ECC avant)
 *  ========================= */
export async function decryptFromSender(payload, senderSignPub_b64u, myDhPriv_b64u) {
    await sodium.ready;
    const ephPub = b64u.dec(payload.eph_pub);
    const sig = b64u.dec(payload.sig);
    const nonce = b64u.dec(payload.nonce);
    const aad = payload.aad ? b64u.dec(payload.aad) : null;
    const ctECC = b64u.dec(payload.ct);
    const senderSignPub = b64u.dec(senderSignPub_b64u);
    const myDhPriv = b64u.dec(myDhPriv_b64u);
    // 0) Vérifier signature de la clé éphémère
    const ok = sodium.crypto_sign_verify_detached(sig, ephPub, senderSignPub);
    if (!ok)
        throw new Error("Signature invalide de la clé éphémère.");
    // 1) **Décodage ECC AVANT déchiffrement** (corrige 1 bit/7 si besoin)
    const ctWithSalt = eccDecode(ctECC);
    // 2) Refaire ECDH
    const shared = sodium.crypto_scalarmult(myDhPriv, ephPub);
    // 3) Extraire salt + ciphertext
    const salt = ctWithSalt.slice(0, 16);
    const ct = ctWithSalt.slice(16);
    // 4) Dérive clé de session
    const key = deriveSessionKey(shared, salt);
    // 5) Déchiffre
    const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, ct, aad, nonce, key);
    return plaintext;
}
//# sourceMappingURL=crypt_lib.js.map