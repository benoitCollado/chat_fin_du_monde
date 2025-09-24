import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginUser, registerUser } from '../api/auth'
import { useIdentityStore } from './identity'

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const access_token = ref<string>("")
  const expiresAt = ref<number>(Date.now())

  // --- Getters ---
  const isAuthenticated = computed(() => {
    if(!expiresAt.value){
        return false
    }
    return !!access_token.value && Date.now() < expiresAt.value
  })

  // --- Actions ---
  async function login(email: string, password: string) {
    try{
        const { access_token , expiresAt } = await loginUser(email, password)
        setSession(access_token, expiresAt)
        const identity = useIdentityStore();
        console.log("on appelle la fonction pour créer ou récupérer les clés");
        identity.saveKeysLocal();
    }catch{
        console.log("impossible de se connecter");
    }
  }

  async function register(email: string, password: string) {
    try{
        await registerUser(email, password);
        console.log("création utilisateur réussie");
    }catch{
        console.log("la création de l'utilistauer a échouée");
    }
  }

  function logout() {
    access_token.value = ""
    expiresAt.value = 0
  }

  function setSession(newToken: string, newExpiresAt: number) {
    access_token.value = newToken;
    expiresAt.value = newExpiresAt
  }

  return {
    // State
    access_token,
    expiresAt,
    // Getters
    isAuthenticated,
    // Actions
    login,
    logout,
    setSession,
    register
  }
})