import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue';
import ContactForm from '../views/ContactForm.vue';
import ContactDetails from '../views/ContactDetails.vue';
import Login from '../views/Login.vue';

const routes = [
  { path: '/', name: 'Home', component: LandingPage },
  { path: '/create', name: 'CreateContact', component: ContactForm },
  { path: '/edit/:id', name: 'EditContact', component: ContactForm },
  { path: '/contact/:id', name: 'ContactDetails', component: ContactDetails },
  { path: '/login', name: 'Login', component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');

  const publicPages = ['Home', 'ContactDetails', 'Login'];

  if (!publicPages.includes(to.name as string) && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router
