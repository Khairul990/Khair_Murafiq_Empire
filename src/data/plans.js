const plans = [
  {
    id: 1,
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Access to 1 project',
      'Basic analytics',
      'Community support',
      '1 GB storage',
    ],
    status: 'current',
  },
  {
    id: 2,
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '50 GB storage',
      'Custom domain',
    ],
    status: 'available',
  },
  {
    id: 3,
    name: 'Lifetime',
    price: '$149',
    period: 'once',
    features: [
      'Everything in Premium',
      'Early access features',
      'Direct dev access',
      'Unlimited storage',
      'White-label option',
    ],
    status: 'available',
  },
]

export default plans
