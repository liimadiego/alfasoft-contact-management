<template>
  <div class="landing-page">
    <div class="header-landingpage">
        <h1 class="contact-list-header">Contact List</h1>
        <RedirectButton to="/create">Create New</RedirectButton>
    </div>

    <div v-if="loading">Carregando contatos...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-if="contacts.length === 0">Nenhum contato encontrado.</div>
      <div class="contacts-list">
        <ContactCard
          v-for="contact in contacts"
          :key="contact.id"
          :contact="contact"
          @click.native="goToDetails(contact.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ContactCard from '@/components/ContactCard.vue';
import RedirectButton from '@/components/RedirectButton.vue';

interface Contact {
  id: number;
  name: string;
  contact: string;
  email: string;
  picture: string;
}

const contacts = ref<Contact[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const router = useRouter();
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

async function fetchContacts() {
  loading.value = true;
  error.value = null;

  try {
    const res = await fetch(`${SERVER_URL}/api/contacts`);
    if (!res.ok) throw new Error('Falha ao buscar contatos');

    const contactsJson = await res.json();
    const contactsTraated = contactsJson.map((el: any) => ({
      ...el,
      picture: `${SERVER_URL}/uploads/${el.picture}`
    }))

    contacts.value = contactsTraated;
  } catch (err: any) {
    error.value = err.message || 'Erro desconhecido';
  } finally {
    loading.value = false;
  }
}

function goToDetails(id: number) {
  router.push(`/contact/${id}`);
}

onMounted(() => {
  fetchContacts();
});
</script>

<style scoped>
.contact-list-header{
  margin-bottom: 10px;
}

.landing-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.contacts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-landingpage{
    display: flex;
    justify-content: space-between;
}
</style>
