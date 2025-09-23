import nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import { hammingEncode, hammingDecode } from "./hamming.js";

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
export function generateIdentity(): Identity {
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

// ---------- Sérialisation identités ----------
export const serializeIdentity = (id: Identity) => ({
  signPub: b64.enc(id.signPub),
  signPriv: b64.enc(id.signPriv),
  dhPub: b64.enc(id.dhPub),
  dhPriv: b64.enc(id.dhPriv),
});
