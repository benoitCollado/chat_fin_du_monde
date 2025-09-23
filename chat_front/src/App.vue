<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation -->
    <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Mon App</h1>
      <nav class="space-x-4">
        <router-link to="/" class="hover:underline">Accueil</router-link>
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
</script>