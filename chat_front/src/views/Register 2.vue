<template>
  <div class="max-w-sm mx-auto mt-10 p-4 border rounded-lg">
    <h1 class="text-2xl font-bold mb-4">Inscription</h1>
    <form @submit.prevent="handleRegister">
      <input v-model="email" type="email" placeholder="Email" class="border p-2 w-full mb-2" />
      <input v-model="password" type="password" placeholder="Mot de passe" class="border p-2 w-full mb-2" />
      <input v-model="confirm" type="password" placeholder="Confirmer le mot de passe" class="border p-2 w-full mb-4" />
      <button class="bg-green-600 text-white px-4 py-2 rounded w-full">
        S'inscrire
      </button>
    </form>
    <p class="mt-4 text-sm">
      Déjà inscrit ?
      <router-link to="/login" class="text-blue-600">Se connecter</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirm = ref('')
const router = useRouter()

async function handleRegister() {
  if (password.value !== confirm.value) {
    alert('Les mots de passe ne correspondent pas')
    return
  }
  // Appel API d'inscription ici...
  alert('Compte créé, vous pouvez vous connecter')
  router.push('/login')
}
</script>