import sodium from "libsodium-wrappers";
import {
  b64u, generateIdentity,
  encryptForRecipient, decryptFromSender
} from "./crypt_lib.js";

let A: any = null; // Alice identity (serialized)
let B: any = null; // Bob   identity (serialized)
let lastPayload: any = null;

function serializeIdentity(id: any) {
  return {
    signPub: b64u.enc(id.signPub),
    signPriv: b64u.enc(id.signPriv),
    dhPub: b64u.enc(id.dhPub),
    dhPriv: b64u.enc(id.dhPriv),
  };
}

(async () => {
  await sodium.ready;

  const $ids = document.getElementById("ids")!;
  const $payload = document.getElementById("payload")!;
  const $clear = document.getElementById("clear")!;

  document.getElementById("genAlice")!.onclick = async () => {
    const id = await generateIdentity();
    A = serializeIdentity(id);
    $ids.textContent = `Alice:\n${JSON.stringify(A, null, 2)}\n\n${$ids.textContent ?? ""}`;
  };

  document.getElementById("genBob")!.onclick = async () => {
    const id = await generateIdentity();
    B = serializeIdentity(id);
    $ids.textContent = `Bob:\n${JSON.stringify(B, null, 2)}\n\n${$ids.textContent ?? ""}`;
  };

  document.getElementById("send")!.onclick = async () => {
    if (!A || !B) { alert("Génère d'abord Alice et Bob"); return; }
    const msgStr = (document.getElementById("msg") as HTMLInputElement).value || "Bonjour Bob (avec ECC)!";
    const msg = new TextEncoder().encode(msgStr);

    // Chiffre + ECC (appliqué sur ciphertext)
    lastPayload = await encryptForRecipient(msg, B.dhPub, A.signPriv);
    $payload.textContent = JSON.stringify(lastPayload, null, 2);
  };

  document.getElementById("recv")!.onclick = async () => {
    if (!A || !B || !lastPayload) { alert("Rien à recevoir"); return; }
    try {
      const clear = await decryptFromSender(lastPayload, A.signPub, B.dhPriv);
      $clear.textContent = new TextDecoder().decode(clear);
    } catch (e: any) {
      $clear.textContent = "Erreur de déchiffrement: " + (e?.message || e);
    }
  };
})();