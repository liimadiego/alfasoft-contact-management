import { ref } from 'vue';

export const user = ref<{ id: number; email: string } | null>(null);

export function loadUserFromStorage() {
    const savedUser = localStorage.getItem('user');
    user.value = savedUser ? JSON.parse(savedUser) : null;
}

export function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    user.value = null;
}
