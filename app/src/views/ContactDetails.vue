<template>
  <div class="contact-details" v-if="contact">
    <h1>{{ contact.name }}</h1>
    <img :src="contact.picture" alt="Contact img" crossorigin="anonymous" />
    <p><strong>Contact:</strong> {{ contact.contact }}</p>
    <p><strong>Email:</strong> {{ contact.email }}</p>
    <button @click="goBack">Go back</button>
  </div>

  <div v-else-if="error">
    <p>{{ error }}</p>
    <button @click="goBack">Go back</button>
  </div>

  <div v-else>
    <p>Loading contact...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Contact {
  id: number;
  name: string;
  contact: string;
  email: string;
  picture: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const route = useRoute();
const router = useRouter();

const contact = ref<Contact | null>(null);
const error = ref<string | null>(null);

async function fetchContact() {
  try {
    const res = await fetch(`${SERVER_URL}/api/contacts/${route.params.id}`);
    if (!res.ok) throw new Error('Contact not found')

    const contactJson = await res.json();

    contact.value = {
      ...contactJson,
      picture: `${SERVER_URL}/uploads/${contactJson.picture}`
    };
  } catch (err: any) {
    error.value = err.message || 'Erro desconhecido';
  }
}

function goBack() {
  router.push('/');
}

onMounted(() => {
  fetchContact();
});
</script>

<style scoped>
.contact-details {
  max-width: 700px;
  margin: 2rem auto;
  text-align: center;
}

.contact-details img {
  width: 200px;
  object-fit: cover;
  margin: 1rem 0;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>