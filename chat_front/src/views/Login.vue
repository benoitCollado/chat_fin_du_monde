<template>
  <div class="max-w-sm mx-auto mt-10 p-4 border rounded-lg">
    <h1 class="text-2xl font-bold mb-4">Connexion</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" class="border p-2 w-full mb-2" />
      <input v-model="password" type="password" placeholder="Mot de passe" class="border p-2 w-full mb-4" />
      <button class="bg-blue-600 text-white px-4 py-2 rounded w-full" :disabled="loading">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>
    <p class="mt-4 text-sm">
      Pas encore inscrit ?
      <router-link to="/register" class="text-blue-600">Créer un compte</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    alert('Échec de la connexion')
  } finally {
    loading.value = false
  }
}
</script>