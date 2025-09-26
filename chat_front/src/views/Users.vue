<script setup lang="ts">
    import { onMounted } from 'vue';
    import { useUserStore} from '../store/users';
    const users = useUserStore();
    onMounted(async() => {
        await users.getUsers();
    })
</script>

<template>
    <h3>
        users
    </h3>
    <div v-for="user in users.users" :key="user.id">
        <p>{{user.username }}</p>
        <p>{{user.id }}</p>
        <p v-if="user.public_key !== null">{{JSON.stringify(user.public_key) }}</p>
    </div>
</template>