<template>
  <div class="contact-form">
    <h1>{{ isEdit ? 'Edit Contact' : 'New Contact' }}</h1>

    <form @submit.prevent="submitForm">
      <input v-model="name" type="text" placeholder="Name (min 5 letters)" required />
      <input v-model="contact" type="text" placeholder="Contact (9 digits)" required />
      <input v-model="email" type="email" placeholder="Email" required />
      
      <div class="image-field">
        <label>Image:</label>
        <input type="file" @change="onFileChange" :required="!isEdit" />
        <img v-if="previewUrl" :src="previewUrl" alt="Preview" crossorigin="anonymous" />
      </div>
      <div v-if="formErrors && formErrors.length > 0" class="form-errors"> 
      <div v-for="formError in formErrors" :key="formError">
      {{ formError }}
    </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

      <button type="submit">{{ isEdit ? 'Edit' : 'Create' }}</button>
      <button @click.prevent="cancel">Cancel</button>
    </form>

    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const route = useRoute();
const router = useRouter();

const id = route.params.id;
const isEdit = !!id;

const name = ref('');
const contact = ref('');
const email = ref('');
const picture = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const error = ref<string | null>(null);
    let formErrors = ref<string[] | null>([]);

async function fetchContact() {
  try {
    const res = await fetch(`${SERVER_URL}/api/contacts/${id}`);
    if (!res.ok) throw new Error('Contato não encontrado');
    const data = await res.json();
    name.value = data.name;
    contact.value = data.contact;
    email.value = data.email;
    previewUrl.value = `${SERVER_URL}/uploads/${data.picture}`;
  } catch (err: any) {
    error.value = err.message;
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    picture.value = target.files[0];
    previewUrl.value = URL.createObjectURL(target.files[0]);
  }
}

async function submitForm() {
  error.value = null;
  const token = localStorage.getItem('token');

  if (!token) {
    error.value = 'Você precisa estar logado';
    return;
  }

  const formData = new FormData();
  formData.append('name', name.value);
  formData.append('contact', contact.value);
  formData.append('email', email.value);
  if (picture.value) formData.append('picture', picture.value);

  try {
    const url = isEdit ? `${SERVER_URL}/api/contacts/${id}` : `${SERVER_URL}/api/contacts`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok){
      const responseJson = await res.json()
      
      let erroMessage = responseJson && responseJson.errors ? responseJson.errors : []
      erroMessage = erroMessage.length === 0 && responseJson.error ? [{msg: responseJson.error}] : []

      formErrors = erroMessage.length > 0 ? erroMessage.map((err: any) => err.msg) : [];

      throw new Error('Error saving contact')
    };
    router.push('/');
  } catch (err: any) {
    error.value = err.message;
  }
}

function cancel() {
  router.push('/');
}

onMounted(() => {
  if (isEdit) fetchContact();
});
</script>

<style scoped>
.form-errors{
  margin-top: 10px;
}
.contact-form {
  max-width: 500px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
}
input {
  margin-bottom: 1rem;
  padding: 0.5rem;
  width: 100%;
}
.image-field img {
  margin-top: 1rem;
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}
button {
  margin-right: 1rem;
  padding: 0.5rem;
}
.error {
  color: red;
  margin: 1rem 0;
}
</style>