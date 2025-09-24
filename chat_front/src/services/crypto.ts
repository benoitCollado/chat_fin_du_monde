import nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import { hammingEncode, hammingDecode } from "./ECC";
import { WrongPasswordError, IdentityAlreadyExistError, NoIdentity } from "../utils.ts/Errors";


// ---------- Helpers Base64 ----------
const b64 = {
  enc: (u8: Uint8Array) => naclUtil.encodeBase64(u8),
  dec: (s: string) => naclUtil.decodeBase64(s),
};

// ---------- Types ----------
export interface Identity {
  signPub: Uint8Array;
  signPriv: Uint8Array;
  dhPub: Uint8Array;
  dhPriv: Uint8Array;
}

export interface WirePayload {
  eph_pub: string;
  sig: string;
  nonce: string;
  ct: string;
}

// ---------- Génération identité persistante ----------
export async function generateIdentity(): Promise<Identity> {
  const sign = nacl.sign.keyPair();
  const dh = nacl.box.keyPair();
  return {
    signPub: sign.publicKey,
    signPriv: sign.secretKey,
    dhPub: dh.publicKey,
    dhPriv: dh.secretKey,
  };
}

// ---------- Chiffrement ----------
export function encryptForRecipient(
  plaintext: string,
  recipientDhPub_b64: string,
  senderSignPriv_b64: string
): WirePayload {
  const recipientDhPub = b64.dec(recipientDhPub_b64);
  const senderSignPriv = b64.dec(senderSignPriv_b64);

  const eph = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const shared = nacl.box.before(recipientDhPub, eph.secretKey);

  const ciphertext = nacl.box.after(naclUtil.decodeUTF8(plaintext), nonce, shared);

  // Protection par Hamming
  const protectedCt = hammingEncode(ciphertext);

  const sig = nacl.sign.detached(eph.publicKey, senderSignPriv);

  return {
    eph_pub: b64.enc(eph.publicKey),
    sig: b64.enc(sig),
    nonce: b64.enc(nonce),
    ct: b64.enc(protectedCt),
  };
}

// ---------- Déchiffrement ----------
export function decryptFromSender(
  payload: WirePayload,
  senderSignPub_b64: string,
  myDhPriv_b64: string
): string {
  const ephPub = b64.dec(payload.eph_pub);
  const sig = b64.dec(payload.sig);
  const nonce = b64.dec(payload.nonce);
  const ct_protected = b64.dec(payload.ct);

  const senderSignPub = b64.dec(senderSignPub_b64);
  const myDhPriv = b64.dec(myDhPriv_b64);

  if (!nacl.sign.detached.verify(ephPub, sig, senderSignPub)) {
    throw new Error("Signature invalide : message falsifié.");
  }

  const ciphertext = hammingDecode(ct_protected);
  const shared = nacl.box.before(ephPub, myDhPriv);

  const plaintext = nacl.box.open.after(ciphertext, nonce, shared);
  if (!plaintext) throw new Error("Échec du déchiffrement : données corrompues");

  return naclUtil.encodeUTF8(plaintext);
}

// --- Sérialisation identités ---
export const serializeIdentity = (id: Identity) => ({
  signPub: b64.enc(id.signPub),
  signPriv: b64.enc(id.signPriv),
  dhPub: b64.enc(id.dhPub),
  dhPriv: b64.enc(id.dhPriv),
});


// --- Création d'une clé à partir d'un mot de passe ---

export function keyFromPassword( password: string): Uint8Array {
  //Hash SHA -512 et on ne garde que les 32 premier bits
  const hashed = nacl.hash(naclUtil.decodeUTF8(password));
  return hashed.slice(0,32);
}

// --- Enregistrement ---
export function SaveIdentityTolocalStorage(password: string, id:Identity){
  const serialized = serializeIdentity(id);

  const key = keyFromPassword(password);

  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const secretData = JSON.stringify({
    signPriv: serialized.signPriv,
    dhPriv: serialized.dhPriv,
  });

  const encrypted = nacl.secretbox(naclUtil.decodeUTF8(secretData), nonce, key);

  localStorage.setItem(
    "myIdentity",
    JSON.stringify({
      signPub: serialized.signPub,
      dhPub: serialized.dhPub,
      priv: b64.enc(encrypted),
      nonce: b64.enc(nonce),
    })
  );

  alert("Votre porte clé a été enregistré de manière sécurisée");

}

export function loadIdentityFromLocalStorage(password:string):Identity{
  const raw = localStorage.getItem("myIdentity");
  if(!raw){
    throw new NoIdentity("Aucun trousseau de clé trouvé en local");
  }

  const data = JSON.parse(raw);

  const key = keyFromPassword(password);

  const decrypted = nacl.secretbox.open(b64.dec(data.priv), b64.dec(data.nonce), key);
  if(!decrypted) { 
    alert("Mauvais mot de passe ou données corrompue");
    throw new WrongPasswordError("Mauvais mot de passe ou données corrompue");
  }

  const privData = JSON.parse(naclUtil.encodeUTF8(decrypted));

  return {
    signPub: b64.dec(data.signPub),
    signPriv: b64.dec(privData.signPriv),
    dhPub: b64.dec(data.dhPub),
    dhPriv: b64.dec(privData.dhPriv),
  }


}

// -- Uint8Array considéreé comme false
export const isFalsyUint8Array = (arr: Uint8Array | null | undefined): boolean => {
  return !arr || arr.length === 0;
};