import { useState } from 'react'
import { BookOpen, Rocket, Shield, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'

const faqs = [
  { q: 'Is this connected to Firebase?', a: 'No. This is a standalone demo dashboard. No real backend.' },
  { q: 'Can I modify the demo data?', a: 'Yes. All data is in src/data/ as plain JS files.' },
  { q: 'How do I add a new project?', a: 'Add an object to src/data/projects.js and it appears automatically.' },
  { q: 'Is this mobile-friendly?', a: 'Yes. The sidebar collapses on screens narrower than 1024px.' },
  { q: 'Can I deploy this?', a: 'Yes. Run npm run build and deploy the dist/ folder to any static host.' },
]

const guides = [
  { icon: Rocket, title: 'Getting Started', desc: 'Explore the sidebar — all pages are pre-populated with demo data.' },
  { icon: BookOpen, title: 'Understanding Projects', desc: 'Each project card shows status, links, Firebase note, and income.' },
  { icon: Shield, title: 'Security Awareness', desc: 'No real secrets are stored here. All logs are demonstrative.' },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guides.map((g, i) => {
          const Icon = g.icon
          return (
            <div key={i} className="bg-card border border-gray-800 rounded-xl p-5">
              <Icon className="w-6 h-6 text-gold mb-3" />
              <h3 className="text-white font-semibold mb-1">{g.title}</h3>
              <p className="text-xs text-gray-400">{g.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-card border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-1">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-surface transition-colors text-left"
              >
                <span className="text-sm text-gray-300 font-medium">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronDown className="w-4 h-4 text-gold flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <p className="px-3 pb-3 text-sm text-gray-500">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-gold" />
          <h3 className="text-white font-semibold">Coming Next</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Real Firebase integration for live project data</li>
          <li>• Stripe / SSLCommerz payment gateway</li>
          <li>• Persistent theme & settings (localStorage)</li>
          <li>• Notification system with real alerts</li>
          <li>• Export data as JSON / CSV</li>
        </ul>
      </div>
    </div>
  )
}
