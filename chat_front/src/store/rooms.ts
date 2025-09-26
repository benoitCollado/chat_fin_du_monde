import { defineStore } from "pinia";
import { ref } from "vue";
import { sendMessage} from "../services/crypto";
import { useIdentityStore } from "./identity";
import { postMessage, postOpenDM, getMyRooms } from "../api/messages";



export const useRoomStore = defineStore("rooms", () => {
  const myRooms = ref<string[]>([]);
  const selectedRoom = ref<string|null>();
  const error = ref<string | null>(null);
  const identity = useIdentityStore();

  async function send(
    message: string,
    recipientDhPub_b64: Uint8Array,
  ) {
    console.log('ok send')
    if(selectedRoom.value){
        if (!identity.identity) {
        error.value = "Identité non chargée";
        return;
        }
        const to_dest = sendMessage(message, recipientDhPub_b64, identity.identity);
        const to_me = sendMessage(message, identity.identity.dhPub, identity.identity);

        await postMessage(selectedRoom.value, JSON.stringify(to_dest));
        await postMessage(selectedRoom.value, JSON.stringify(to_me));
    }
  }

  async function createRoom(other:number){
    selectedRoom.value = await postOpenDM(other);
  }

  async function getRooms(){
    myRooms.value = await getMyRooms();
    //myRooms.value = rooms;
  }

  return {
    myRooms,
    selectedRoom,
    error,
    send,
    createRoom,
    getRooms
  };
});