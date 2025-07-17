<template>
  <header class="header">
    <router-link to="/" class="logo">Contacts</router-link>

    <div class="actions">
      <template v-if="user">
        <span>Welcome, {{ user.email }}</span>
        <button @click="logout">Logout</button>
      </template>

      <template v-else>
        <router-link to="/login">
          <button>Sign In</button>
        </router-link>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { user, logoutUser, loadUserFromStorage } from '@/stores/user';

const router = useRouter();

function logout() {
  logoutUser();
}

onMounted(() => loadUserFromStorage());
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e1e1e;
  color: white;
  padding: 1rem 3%;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
}

.logo {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width:600px) {
  .header{
    flex-direction: column;
    padding-top: 5px;
  }
}
</style>
