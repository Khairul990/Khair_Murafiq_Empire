const initialFinance = {
  businesses: ['Embroidery', 'Ads', 'Personal'],
  activeBusiness: 'Embroidery',
  income: 0,
  expense: 0,
  balance: 0,
  monthlyProfit: 0,
  entries: [
    { id: 1, date: '2026-06-01', type: 'income', description: 'Embroidery order #1', business: 'Embroidery', amount: 0, category: 'Order' },
    { id: 2, date: '2026-05-30', type: 'expense', description: 'Threads and materials', business: 'Embroidery', amount: 0, category: 'Supplies' },
    { id: 3, date: '2026-05-28', type: 'income', description: 'Website maintenance', business: 'Personal', amount: 0, category: 'Freelance' },
  ],
}

export default initialFinance
