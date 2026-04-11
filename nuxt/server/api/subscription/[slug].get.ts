import { subscriptionPlans } from '../../utils/subscription-plans'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const plan = subscriptionPlans.find(item => item.slug === slug)

  if (!plan) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Subscription plan not found'
    })
  }

  return plan
})
