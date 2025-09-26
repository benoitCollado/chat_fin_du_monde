<template>
<h2>
vos conversations
</h2>
</template>

<script setup lang="ts">

import * as crypt from "../services/crypto";
(async () => {
  const alice = await crypt.generateIdentity(); // émetteur
  const bob   = await crypt.generateIdentity(); // destinataire

  const msg = "Hello Bob !";

  // Alice chiffre pour Bob
  const payload = crypt.encryptForRecipient(
    msg,
    crypt.b64.enc(bob.dhPub),
    crypt.b64.enc(alice.signPriv)  // même si tu ignores la signature au déchiffrement
  );

  // Bob déchiffre
  const plain = crypt.decryptFromSender(
    payload,                 // on ignore la signature
    crypt.b64.enc(bob.dhPriv)  // la clé privée du destinataire réel
  );

  console.log("OK:", plain); // doit afficher "Hello Bob !"
})();

</script>

<style scoped>
/* Tu peux mettre ici des styles spécifiques à la page d'accueil si nécessaire */
</style>