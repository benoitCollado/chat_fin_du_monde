import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUsersAPI} from '../api/users'

export interface User{
    id:number,
    username:string,
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