// src/stores/messageStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { sendMessage} from "../services/crypto";
import type { WirePayload } from "../services/crypto";
import { useIdentityStore } from "./identity";

export const useMessageStore = defineStore("message", () => {
  
  const sentMessages = ref<{ toRecipient: WirePayload; toSelf: WirePayload }[]>([]);
  const error = ref<string | null>(null);
  const identity = useIdentityStore();

  function send(
    message: string,
    recipientDhPub_b64: Uint8Array,
  ) {
    if (!identity.identity) {
      error.value = "Identité non chargée";
      return;
    }
    const payload = sendMessage(message, recipientDhPub_b64, identity.identity);
    

    const payload_self = sendMessage(message, identity.identity.dhPub, identity.identity);

    sentMessages.value.push({toRecipient: payload, toSelf:payload_self});
    return {toRecipient: payload, toSelf:payload_self};
  }

  return {
    identity,
    sentMessages,
    error,
    send,
  };
});