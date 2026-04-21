<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <div class="checkout-header">
        Checkout
      </div>

      <p
        v-if="pending"
        class="checkout-status"
      >
        Loading plan...
      </p>
      <p
        v-else-if="error"
        class="checkout-status checkout-status-error"
      >
        Unable to load this plan.
      </p>

      <template v-else-if="plan">
        <NuxtLink
          to="/products"
          class="checkout-back"
        >&lt;&lt; back</NuxtLink>

        <h1 class="checkout-title">
          You're Almost In - Start Your 3-Day Free Trial Now!
        </h1>
        <p class="checkout-subtitle">
          Set up your account to gain instant access! You won't be charged if you decide to cancel within 3 days
        </p>

        <div class="checkout-grid">
          <aside class="plan-card">
            <h2 class="plan-title">
              {{ plan.title }}
            </h2>
            <span class="plan-badge">3-days free then:</span>

            <div class="plan-price-row">
              <span class="plan-price">{{ selectedPlanFormatted }}</span>
              <span class="plan-period">{{ selectedPeriodLabel }}</span>
            </div>

            <p class="plan-yearly">
              {{ billingCycle === 'yearly' ? 'one annual payment' : `billed yearly at ${plan.yearly}` }}
            </p>
            <p class="plan-savings">
              {{ savingsLabel }}
            </p>

            <hr class="plan-divider">

            <div
              v-for="(feature, index) in plan.features"
              :key="index"
              class="plan-feature"
            >
              <span class="plan-feature-icon">
                <iconify-icon
                  icon="material-icon-theme:gemini-ai"
                  style="color:#84cc16;font-size:16px;"
                />
              </span>

              <div>
                <p
                  class="plan-feature-main"
                  v-html="feature.main"
                />
                <p
                  v-if="feature.note"
                  class="plan-feature-note"
                >
                  {{ feature.note }}
                </p>
              </div>
            </div>
          </aside>

          <section class="checkout-card">
            <h2 class="checkout-card-title">
              Order Summary
            </h2>

            <div class="summary-row">
              <span>{{ selectedPlanLabel }}</span>
              <span>{{ selectedPlanFormatted }}</span>
            </div>

            <div class="summary-row">
              <span>Total Due <small>(not including sales tax where applicable)</small></span>
              <span>{{ selectedPlanFormatted }}</span>
            </div>

            <div class="summary-row summary-row-bold">
              <span>Due Today</span>
              <span>$0.00</span>
            </div>

            <div class="trial-box">
              Includes 3-Day Free Trial
            </div>

            <h3 class="checkout-section-title">
              Billing Information
            </h3>

            <form
              class="checkout-form"
              @submit.prevent="submitSubscription"
            >
              <label class="input-label">Card Details</label>
              <div class="card-row">
                <input
                  v-model="form.cardNumber"
                  class="input-field"
                  type="text"
                  placeholder="Number"
                  required
                >
                <input
                  v-model="form.expiry"
                  class="input-field"
                  type="text"
                  placeholder="MM / YY"
                  required
                >
                <input
                  v-model="form.cvc"
                  class="input-field"
                  type="text"
                  placeholder="CVC"
                  required
                >
              </div>

              <label class="input-label">Address</label>
              <input
                v-model="form.fullName"
                class="input-field"
                type="text"
                placeholder="Full name"
                required
              >
              <input
                v-model="form.address"
                class="input-field"
                type="text"
                placeholder="Address"
                required
              >

              <label class="terms-row">
                <input
                  v-model="form.acceptedTerms"
                  type="checkbox"
                  required
                >
                <span>
                  I consent to <strong>Terms of Use</strong> and understand my 3-day free trial will
                  automatically convert to {{ selectedPlanFormatted }} {{ selectedPeriodText }}.
                </span>
              </label>

              <button
                class="submit-btn"
                type="submit"
                :disabled="submitting"
              >
                {{ submitting ? 'Processing...' : 'Try It Free' }}
              </button>
            </form>

            <p
              v-if="submitMessage"
              class="submit-message"
            >
              {{ submitMessage }}
            </p>
            <p
              v-if="submitError"
              class="submit-message submit-message-error"
            >
              {{ submitError }}
            </p>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
type Feature = {
  main: string
  note: string
}

type ProductPlan = {
  slug: string
  title: string
  price: string
  yearly: string
  features: Feature[]
}

type CreateSubscriptionResponse = {
  success: boolean
  message: string
  subscriptionId: string
}

const route = useRoute()
const subscriptionStore = useSubscriptionStore()
const billingCycle = computed(() => subscriptionStore.selectedBillingCycle)

const { data, pending, error } = await useFetch<ProductPlan>(
  () => `/api/subscription/${route.params.slug}`
)

const plan = computed(() => data.value ?? null)
const submitting = ref(false)
const submitMessage = ref('')
const submitError = ref('')

const form = reactive({
  cardNumber: '',
  expiry: '',
  cvc: '',
  fullName: '',
  address: '',
  acceptedTerms: false
})

const yearlyFormatted = computed(() => {
  if (!plan.value) {
    return '$0.00'
  }

  const numeric = Number(plan.value.yearly.replace(/[$,]/g, ''))
  return `$${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
})

const monthlyFormatted = computed(() => {
  if (!plan.value) {
    return '$0.00'
  }

  const numeric = Number(plan.value.price.replace(/[$,]/g, ''))
  return `$${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
})

const selectedPlanLabel = computed(() => billingCycle.value === 'yearly' ? 'Annual Plan' : 'Monthly Plan')
const selectedPlanFormatted = computed(() => billingCycle.value === 'yearly' ? yearlyFormatted.value : monthlyFormatted.value)
const selectedPeriodLabel = computed(() => billingCycle.value === 'yearly' ? '/year' : '/month')
const selectedPeriodText = computed(() => billingCycle.value === 'yearly' ? 'per year' : 'per month')

const savingsLabel = computed(() => {
  if (!plan.value) {
    return '$0 in savings'
  }

  const monthly = Number(plan.value.price.replace(/[$,]/g, ''))
  const yearly = Number(plan.value.yearly.replace(/[$,]/g, ''))
  const fullMonthlyCost = monthly * 12
  const savings = Math.max(0, fullMonthlyCost - yearly)

  return `$${Math.round(savings).toLocaleString('en-US')} in savings`
})

watch(plan, (value) => {
  if (value) {
    subscriptionStore.setSubscription(value)
  }
}, { immediate: true })

useHead(() => ({
  title: plan.value ? `Checkout | ${plan.value.title}` : 'Checkout',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'
    }
  ],
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js',
      defer: true
    }
  ]
}))

async function submitSubscription() {
  if (!plan.value) {
    return
  }

  submitting.value = true
  submitMessage.value = ''
  submitError.value = ''

  try {
    const response = await $fetch<CreateSubscriptionResponse>('/api/subscription/create', {
      method: 'POST',
      body: {
        ...form,
        planSlug: plan.value.slug
      }
    })

    submitMessage.value = `Success: ${response.message} (#${response.subscriptionId})`
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create subscription'
    submitError.value = message
  } finally {
    submitting.value = false
  }
}
</script>

<style>
.checkout-page {
  min-height: 100vh;
  background: #f4f4f5;
  padding: 24px 16px 48px;
  font-family: 'DM Sans', sans-serif;
  color: #1f2937;
}

.checkout-container {
  max-width: 1120px;
  margin: 0 auto;
}

.checkout-header {
  width: 100%;
  background: linear-gradient(90deg, #2f2f32, #444447);
  color: #ffffff;
  text-align: center;
  font-weight: 700;
  padding: 12px;
  font-size: 1.5rem;
  border-radius: 2px;
}

.checkout-status {
  margin-top: 16px;
  color: #374151;
}

.checkout-status-error {
  color: #b91c1c;
}

.checkout-back {
  display: inline-block;
  margin-top: 18px;
  color: #6b7280;
  font-size: 0.95rem;
  text-decoration: none;
}

.checkout-title {
  margin-top: 12px;
  font-size: 2.15rem;
  line-height: 1.2;
  color: #1f2937;
  font-weight: 700;
}

.checkout-subtitle {
  margin-top: 8px;
  font-size: 1.05rem;
  color: #4b5563;
  max-width: 900px;
}

.checkout-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  gap: 26px;
  align-items: start;
}

.plan-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  padding: 22px;
  position: relative;
  overflow: hidden;
}

.plan-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #34d399, #22d3ee);
}

.plan-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.plan-badge {
  font-size: 0.82rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 4px 8px;
  display: inline-block;
}

.plan-price-row {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.plan-price {
  font-size: 3.2rem;
  font-weight: 700;
  line-height: 1;
}

.plan-period {
  color: #6b7280;
  font-weight: 500;
  font-size: 1rem;
}

.plan-yearly {
  margin-top: 4px;
  color: #6b7280;
  font-size: 0.93rem;
}

.plan-savings {
  margin-top: 10px;
  color: #16a34a;
  font-weight: 700;
  background: #ecfdf3;
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.plan-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
}

.plan-feature {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  margin-bottom: 9px;
}

.plan-feature:last-child {
  margin-bottom: 0;
}

.plan-feature-icon {
  margin-top: 2px;
}

.plan-feature-main {
  color: #1f2937;
  font-size: 0.93rem;
  font-weight: 500;
  line-height: 1.32;
}

.plan-feature-note {
  color: #6b7280;
  font-size: 0.86rem;
  margin-top: 2px;
  line-height: 1.3;
}

.checkout-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.checkout-card-title {
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.summary-row small {
  color: #6b7280;
  font-size: 0.75rem;
}

.summary-row-bold {
  font-weight: 700;
  color: #111827;
}

.trial-box {
  margin-top: 14px;
  background: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  text-align: center;
  padding: 12px;
  border-radius: 4px;
}

.checkout-section-title {
  margin-top: 26px;
  font-size: 1.45rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.input-label {
  font-size: 0.9rem;
  color: #4b5563;
  font-weight: 600;
}

.card-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
}

.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 1rem;
  color: #111827;
  background: #ffffff;
}

.input-field:focus {
  outline: none;
  border-color: #6b7280;
}

.terms-row {
  margin-top: 6px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.4;
}

.terms-row input {
  margin-top: 3px;
}

.submit-btn {
  margin-top: 6px;
  width: 150px;
  border: none;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 1rem;
  font-weight: 700;
  background: #e5e7eb;
  color: #374151;
  cursor: pointer;
}

.submit-btn:hover {
  background: #d1d5db;
}

.submit-btn:disabled {
  cursor: wait;
  opacity: 0.8;
}

.submit-message {
  margin-top: 12px;
  color: #166534;
  font-weight: 600;
}

.submit-message-error {
  color: #b91c1c;
}

@media (max-width: 980px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .card-row {
    grid-template-columns: 1fr;
  }

  .checkout-title {
    font-size: 1.65rem;
  }

  .checkout-card-title {
    font-size: 1.4rem;
  }
}
</style>
