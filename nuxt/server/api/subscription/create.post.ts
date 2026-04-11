type CreateSubscriptionPayload = {
  planSlug: string
  cardNumber: string
  expiry: string
  cvc: string
  fullName: string
  address: string
  acceptedTerms: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateSubscriptionPayload>(event)

  if (!body?.planSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Plan is required' })
  }

  if (!body.fullName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Full name is required' })
  }

  if (!body.address?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Address is required' })
  }

  if (!body.acceptedTerms) {
    throw createError({ statusCode: 400, statusMessage: 'Terms must be accepted' })
  }

  return {
    success: true,
    message: 'Subscription has been created',
    subscriptionId: `sub_${Date.now()}`,
    receivedAt: new Date().toISOString()
  }
})
