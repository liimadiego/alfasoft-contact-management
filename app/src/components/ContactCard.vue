<template>
  <div class="contact-card">
    <div class="card-content" @click="$emit('click')">
      <img :src="contact.picture" alt="Contact image" crossorigin="anonymous" />
      <div class="info">
        <h3>{{ contact.name }}</h3>
        <p>Contact: {{ contact.contact }}</p>
        <p>Email: {{ contact.email }}</p>
      </div>
    </div>
    
    <div class="actions-section">
      <RedirectButton :to="`/edit/${contact.id}`" class="edit-btn">Edit</RedirectButton>
      <button @click="deleteContact(contact)" class="delete-btn" :disabled="isDeleting">
        {{ isDeleting ? 'Deleting...' : 'Delete' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RedirectButton from './RedirectButton.vue';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

defineProps<{
  contact: {
    id: number;
    name: string;
    contact: string;
    email: string;
    picture: string;
  };
}>();

const emit = defineEmits<{
  click: [];
  deleted: [id: number];
}>();

const isDeleting = ref<boolean>(false);

async function deleteContact(contact: any) {
  const confirmDelete = confirm(`Are you sure you want to delete ${contact.name}?`);
  if (!confirmDelete) return;

  isDeleting.value = true;
  
  try {
    const res = await fetch(`${SERVER_URL}/api/contacts/${contact.id}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) throw new Error('Failed to delete contact');
    
    alert('Contact deleted successfully!');
    emit('deleted', contact.id);
  } catch (err: any) {
    alert('Error deleting contact: ' + (err.message || 'Unknown error'));
    isDeleting.value = false;
  }
}
</script>

<style scoped>
.contact-card {
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.contact-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
}

.card-content {
  cursor: pointer;
  flex: 1;
}

.contact-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.info {
  padding: 0.5rem;
}

.actions-section {
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  padding: 0.3rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.edit-btn {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.edit-btn:hover {
  background-color: #0056b3;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

.delete-btn:hover {
  background-color: #c82333;
}

.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  border-color: #ccc;
}
</style>