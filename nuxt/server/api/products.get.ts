type Feature = {
  main: string
  note: string
}

type ProductPlan = {
  title: string
  price: string
  yearly: string
  features: Feature[]
}

export default defineEventHandler((): ProductPlan[] => {
  return [
    {
      title: 'Starter-Annual',
      price: '$83.25',
      yearly: '$999.00',
      features: [
        { main: 'Primary user + 0 free team members', note: '(extra team members for $35/month)' },
        { main: 'Save unlimited properties', note: '' },
        { main: '<strong>10 000</strong> exports', note: '(additional exports at $0.02 each)' },
        { main: '<strong>500</strong> free skip traces', note: '(additional skip tracing at $0.08 each)' },
        { main: 'Imports $0.01', note: '' }
      ]
    },
    {
      title: 'Team-Annual',
      price: '$207.50',
      yearly: '$2,490',
      features: [
        { main: 'Primary user + 2 free team members', note: '(extra team members for $35/month)' },
        { main: 'Save unlimited properties', note: '' },
        { main: '<strong>50 000</strong> exports', note: '(additional exports at $0.01 each)' },
        { main: '<strong>1000</strong> free skip traces', note: '(additional skip tracing at $0.08 each)' },
        { main: 'Imports $0.01', note: '' }
      ]
    },
    {
      title: 'Business-Annual',
      price: '$457.50',
      yearly: '$5,490',
      features: [
        { main: 'Primary user + 6 free team members', note: '(extra team members for $20/month)' },
        { main: 'Save unlimited properties', note: '' },
        { main: '<strong>100 000</strong> exports', note: '(additional exports at $0.01 each)' },
        { main: '<strong>2,000</strong> free skip traces', note: '(additional skip tracing at $0.08 each)' },
        { main: 'Imports $0.01', note: '' }
      ]
    }
  ]
})
