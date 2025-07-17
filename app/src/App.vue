

<template>
  <Header />
  <router-view />
</template>

<style scoped>
body{
  color: #fff;
  background-color: red;
}
</style>

<script setup lang="ts">
import Header from '@/components/Header.vue';
</script>