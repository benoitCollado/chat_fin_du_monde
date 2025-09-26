<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation -->
    <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Mon App</h1>
      <nav class="space-x-4">
        <router-link to="/" class="hover:underline">Accueil</router-link>
        <router-link v-if="auth.isAuthenticated" to="/messages" class="hover:underline">Message</router-link>
        <router-link v-if="auth.isAuthenticated" to="/users" class="hover:underline">users</router-link>
        <button v-if="auth.isAuthenticated" @click="handleLogout" class="hover:underline" >Logout</button>
      </nav>
    </header>

    <!-- Contenu -->
    <main class="flex-1 p-6">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-100 text-center py-4 text-sm text-gray-600">
      © {{ new Date().getFullYear() }} - Mon App
    </footer>
  </div>
</template>

<script setup lang="ts">
// Rien de spécial à déclarer pour l'instant
import { useAuthStore } from './store/auth';
import { useRouter } from 'vue-router'
import { useIdentityStore } from './store/identity';
const auth = useAuthStore();
const router = useRouter();
const identity = useIdentityStore();

async function handleLogout(){
  await auth.logout();
  identity.resetIdentyStore();
  await router.push("/login");
}

</script>