import { generateIdentity, serializeIdentity, encryptForRecipient, decryptFromSender } from "./crypt_lib.js";

// Génère identités Alice & Bob
const alice = generateIdentity();
const bob = generateIdentity();

const aliceSerialized = serializeIdentity(alice);
const bobSerialized = serializeIdentity(bob);

// Chiffre un message
const payload = encryptForRecipient("Bonjour Bob !", bobSerialized.dhPub, aliceSerialized.signPriv);
console.log("Payload envoyé :", payload);

// Déchiffre le message
const plaintext = decryptFromSender(payload, aliceSerialized.signPub, bobSerialized.dhPriv);
console.log("Message reçu :", plaintext);
