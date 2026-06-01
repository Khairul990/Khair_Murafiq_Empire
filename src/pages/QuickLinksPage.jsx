import { ExternalLink } from 'lucide-react'

const categories = [
  {
    title: 'Admin Panels',
    links: [
      { name: 'Khair Murafiq Admin', url: 'https://khair-murafiq-admin.web.app' },
      { name: 'BillQyro (coming soon)', url: '#' },
    ],
  },
  {
    title: 'GitHub Repositories',
    links: [
      { name: 'Khair_Murafiq_Admin', url: 'https://github.com/KhairMurafiq/khair-murafiq-admin' },
      { name: 'BillQyro', url: 'https://github.com/KhairMurafiq/BillQyro' },
    ],
  },
  {
    title: 'Firebase Consoles',
    links: [
      { name: 'Firebase Console', url: 'https://console.firebase.google.com' },
    ],
  },
  {
    title: 'Tools & Resources',
    links: [
      { name: 'Vite Docs', url: 'https://vite.dev' },
      { name: 'React Docs', url: 'https://react.dev' },
      { name: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs' },
      { name: 'Lucide Icons', url: 'https://lucide.dev' },
    ],
  },
]

export default function QuickLinksPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <div key={cat.title} className="bg-card border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">{cat.title}</h3>
          <div className="space-y-2">
            {cat.links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-gray-800 hover:border-gray-700 transition-colors group"
              >
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{link.name}</span>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gold transition-colors" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
