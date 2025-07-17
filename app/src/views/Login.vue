<template>
  <div class="login">
    <h2 class="header-text-login">Login</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { user } from '@/stores/user';

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const router = useRouter();
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

async function login() {
  error.value = null;
  try {
    const res = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    if (!res.ok) throw new Error('User or password not valid');
    const data = await res.json();

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    user.value = data.user;

    router.push('/');
  } catch (err: any) {
    error.value = err.message;
  }
}
</script>

<style scoped>
.header-text-login{
  margin-bottom: 10px;
}
.login {
  max-width: 400px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
}
input {
  margin-bottom: 1rem;
  padding: 0.5rem;
  width: 100%;
}
button {
  padding: 0.5rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
