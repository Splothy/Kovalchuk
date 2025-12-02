<script setup lang="ts">
import UserCard from '@/components/UserCard.vue';
</script>

<template>
  <!-- Замість <div class="contact-page"> -->
  <div class="p-5">
    <h1 class="text-2xl font-bold mb-4">Сторінка контактів</h1>
    <p>Це наша нова сторінка контактів!</p>

    <UserCard username="Student_1" :isActive="true" />
    <UserCard username="Student_2" :isActive="false" />
  </div>
</template>
