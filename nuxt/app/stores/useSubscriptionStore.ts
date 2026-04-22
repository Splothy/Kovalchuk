import { defineStore } from 'pinia'

type SubscriptionFeature = {
  main: string
  note: string
}

export type SubscriptionPlan = {
  slug: string
  title: string
  price: string
  yearly: string
  features: SubscriptionFeature[]
}

export type BillingCycle = 'monthly' | 'yearly'

export const useSubscriptionStore = defineStore('subscription', () => {
  const selectedSubscription = ref<SubscriptionPlan | null>(null)
  const selectedBillingCycle = ref<BillingCycle>('monthly')

  const hasSelectedSubscription = computed(() => selectedSubscription.value !== null)

  function setSubscription(plan: SubscriptionPlan) {
    selectedSubscription.value = plan
  }

  function setBillingCycle(cycle: BillingCycle) {
    selectedBillingCycle.value = cycle
  }

  function clearSubscription() {
    selectedSubscription.value = null
  }

  return {
    selectedSubscription,
    selectedBillingCycle,
    hasSelectedSubscription,
    setSubscription,
    setBillingCycle,
    clearSubscription
  }
})
