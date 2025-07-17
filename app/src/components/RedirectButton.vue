<template>
  <button class="redirect-btn" @click="goToRoute">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps<{
  to: string;
}>();

const router = useRouter();

function goToRoute() {
  router.push(props.to);
}
</script>

<style scoped>
.redirect-btn {
  height: 32px
}
</style>
