<template>
  <div class="p-4 max-w-2xl mx-auto bg-white shadow rounded-2xl">
    <h2 class="text-xl font-bold mb-4">Mes Messages</h2>

    <!-- === Liste des rooms (affichée si aucune room sélectionnée) === -->
    <div v-if="!roomStore.selectedRoom" class="mb-4">
      <h3 class="font-semibold mb-2">Mes rooms</h3>

      <ul v-if="roomStore.myRooms.length" class="divide-y divide-gray-200 mb-4">
        <li
          v-for="room in roomStore.myRooms"
          :key="room"
          @click="selectRoom(room)"
          class="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
        >
          {{ room }}
        </li>
      </ul>

      <button
        @click="creatingRoom = !creatingRoom"
        class="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Créer une nouvelle room
      </button>

      <!-- Création de room -->
      <div v-if="creatingRoom" class="mt-3">
        <input
          type="text"
          v-model="search"
          placeholder="Tapez @ pour chercher un utilisateur"
          class="border p-2 rounded w-full mb-2"
          @input="filterUsers"
        />
        <ul v-if="filteredUsers.length" class="bg-gray-50 border rounded mb-2">
          <li
            v-for="user in filteredUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="p-2 hover:bg-blue-100 cursor-pointer"
          >
            @{{ user.username }}
          </li>
        </ul>

        <button
          v-if="selectedUser"
          @click="createRoom"
          class="bg-green-500 text-white px-4 py-2 rounded w-full"
        >
          Ouvrir un DM avec @{{ selectedUser.username }}
        </button>
      </div>
    </div>

    <!-- === Zone de chat (affichée si une room est sélectionnée) === -->
    <div v-else class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-semibold text-lg">
          Room : {{ roomStore.selectedRoom }}
        </h3>
        <button
          @click="backToRoomList"
          class="text-sm text-blue-600 hover:underline"
        >
          ← Retour
        </button>
      </div>

      <!-- Historique des messages -->
      <div class="bg-gray-50 border rounded p-2 mb-2 max-h-64 overflow-y-auto">
        <div v-for="(msg, i) in messages" :key="i" class="mb-2">
          <span class="font-semibold text-sm">{{ msg.sender }}</span>
          <p class="bg-white border rounded p-2 text-sm">{{ msg.content }}</p>
        </div>
      </div>

      <!-- Envoi d'un message -->
      <textarea
        v-model="message"
        placeholder="Votre message..."
        class="border p-2 rounded w-full mb-2"
      ></textarea>

      <button
        @click="sendMessage"
        class="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Envoyer
      </button>
    </div>

    <p v-if="roomStore.error" class="text-red-500 mt-2">{{ roomStore.error }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount} from "vue";
import { useIdentityStore } from "../store/identity";
import { useUserStore, type User } from "../store/users";
import { useRoomStore } from "../store/rooms";
import { getMessage } from "../api/messages";
import { decryptFromSender, b64 } from "../services/crypto";
import { useAuthStore } from "../store/auth";
import type { WirePayload } from "../services/crypto";

const identity = useIdentityStore();
const userStore = useUserStore();
const roomStore = useRoomStore();
const authStore = useAuthStore();

const message = ref("");
const search = ref("");
const filteredUsers = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const creatingRoom = ref(false);
const messages = ref<{ sender: string; content: string }[]>([]);


let refreshInterval: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  await userStore.getUsers();
  await roomStore.getRooms();

  refreshInterval = setInterval(async () => {
    if (roomStore.selectedRoom) {
      await loadMessages(roomStore.selectedRoom);
    }
  }, 3000);
});

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

function filterUsers() {
  const query = search.value.replace("@", "").toLowerCase();
  filteredUsers.value = query
    ? userStore.users.filter((u) =>
        u.username.toLowerCase().startsWith(query)
      )
    : [];
}

function selectUser(user: User) {
  selectedUser.value = user;
  search.value = `@${user.username}`;
  filteredUsers.value = [];
}

async function createRoom() {
  if (!selectedUser.value) return;
  await roomStore.createRoom(selectedUser.value.id);
  creatingRoom.value = false;
  if (roomStore.selectedRoom) {
    await loadMessages(roomStore.selectedRoom);
  }
}

async function selectRoom(room: string) {
  roomStore.selectedRoom = room;
  const parts = room.split(":");
  if (parts.length === 3 && parts[0] === "dmid") {
    const id1 = Number(parts[1]);
    const id2 = Number(parts[2]);

    // Trouver l'id de l'autre utilisateur (pas moi)
    const myId = authStore.myInfo.id // ⚠️ tu dois avoir cet id dans ton identityStore
    const otherId = myId === id1 ? id2 : id1;

    // Chercher l'utilisateur dans le store
    const u = userStore.users.find((usr) => usr.id === otherId);
    if (u) selectedUser.value = u;
    else console.warn("⚠️ Aucun user trouvé pour", otherId);
  }
  await loadMessages(room);
}

function backToRoomList() {
  roomStore.selectedRoom = null;
  messages.value = [];
  message.value = "";
}

async function loadMessages(room: string) {
  const rawMessages = await getMessage(room);
  console.log('totos')
  messages.value = [];

  for (const m of rawMessages) {
    try {
      // ✅ Parse du JSON dans "content"
      const payload: WirePayload = JSON.parse(m.content);
      console.log(payload);
      //alert("ligne168" + JSON.stringify(payload));
      // Décryptage

      const plaintext = decryptFromSender(
        payload,// ou m.sender_sign_pub selon ton API
        b64.enc(identity.identity.dhPriv)
      );
      //alert("ligne175" + JSON.stringify(payload));
      console.log("apr",identity.identity);

      messages.value.push({
        sender: m.sender, // affichage du pseudo
        content: plaintext,
      });
      //alert("ligne182" + JSON.stringify(payload));
    } catch (e) {
      /*if( e instanceof Error){
          console.log(e.message);
      }*/
    
      /*console.warn("Impossible de déchiffrer un message", e, m);*/
     /*messages.value.push({
        sender: m.sender,
        content: "[Message illisible ou corrompu]",
      });*/
    }
  }
}

async function sendMessage() {
  if (!roomStore.selectedRoom || !selectedUser.value?.public_key) return;
  await roomStore.send(message.value, selectedUser.value.public_key.dhPub);
  message.value = "";
  await loadMessages(roomStore.selectedRoom);
}
</script>

<style scoped>
textarea {
  min-height: 80px;
}
</style>
