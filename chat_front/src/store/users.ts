import { defineStore } from 'pinia'
import { ref} from 'vue'
import { getUsersAPI} from '../api/users'

export interface UserPubKey{
    signPub:Uint8Array,
    dhPub: Uint8Array
}

export interface User{
    id:number,
    username:string,
    public_key: UserPubKey | null,
}

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const users = ref<User[]>([])

  // --- Getters ---
  async function getUsers(){
    const usersArray = await getUsersAPI();
    users.value=usersArray;
  }

  return {
    users,
    getUsers,
  }
})