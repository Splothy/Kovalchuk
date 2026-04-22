import { defineStore } from 'pinia'

type GithubProfile = {
  id: number
  login: string
  name: string | null
  avatar_url: string
  html_url: string
}

export const useUserStore = defineStore('user', () => {
  const name = ref('Гість')
  const isLoggedIn = ref(false)
  const loginTime = ref<string | null>(null)

  const profileData = ref<GithubProfile | null>(null)
  const isLoading = ref(false)

  const welcomeMessage = computed(() => `Вітаємо, ${name.value}!`)

  function login(userName: string) {
    name.value = userName
    isLoggedIn.value = true
    loginTime.value = new Date().toLocaleTimeString()
  }

  function logout() {
    name.value = 'Гість'
    isLoggedIn.value = false
    loginTime.value = null
    profileData.value = null
  }

  async function fetchProfile() {
    isLoading.value = true

    try {
      const response = await $fetch<GithubProfile>('https://api.github.com/users/octocat')
      profileData.value = response
    } finally {
      isLoading.value = false
    }
  }

  return {
    name,
    isLoggedIn,
    loginTime,
    profileData,
    isLoading,
    welcomeMessage,
    login,
    logout,
    fetchProfile
  }
})
