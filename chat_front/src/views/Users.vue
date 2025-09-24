<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useUserStore} from '../store/users';
    import type { User } from '../store/users';
    const users = useUserStore();
    console.log(users.users);
    const userList = ref<User[]>([]);
    onMounted(async() => {
        await users.getUsers();
    })
</script>

<template>
    <p v-for="user in users.users" :key="user.id">
        {{user.username }}
    </p>
</template>