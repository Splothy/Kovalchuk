<script setup lang="ts">
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { name, isLoggedIn, welcomeMessage, profileData, isLoading } = storeToRefs(userStore)

const inputName = ref('')

const handleLogin = () => {
  if (!inputName.value) {
    return
  }

  userStore.login(inputName.value)
  inputName.value = ''
}
</script>

<template>
  <div class="container">
    <h1>{{ welcomeMessage }}</h1>

    <div v-if="!isLoggedIn">
      <input v-model="inputName" placeholder="Введіть ваше ім'я">
      <button @click="handleLogin">
        Увійти
      </button>
    </div>

    <div v-else>
      <p>Користувач: {{ name }}</p>
      <p>Ви зайшли о: {{ userStore.loginTime }}</p>

      <button :disabled="isLoading" @click="userStore.fetchProfile">
        {{ isLoading ? 'Завантаження...' : 'Завантажити профіль' }}
      </button>

      <p v-if="profileData">
        GitHub: <a :href="profileData.html_url" target="_blank" rel="noopener noreferrer">{{ profileData.login }}</a>
      </p>

      <button @click="userStore.logout">
        Вийти
      </button>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 2rem; font-family: sans-serif; }
button { margin-left: 0.5rem; cursor: pointer; }
</style>
