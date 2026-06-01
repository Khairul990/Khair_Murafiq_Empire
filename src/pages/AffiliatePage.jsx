import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Link, MousePointerClick, TrendingUp, DollarSign,
  CheckCircle, Clock, Trophy, ExternalLink,
} from 'lucide-react'
import affiliateCampaigns from '../data/affiliate'

export default function AffiliatePage() {
  const [campaigns] = useState(affiliateCampaigns)

  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const totalEstimated = campaigns.reduce((s, c) => s + c.estimatedIncome, 0)
  const totalActual = campaigns.reduce((s, c) => s + c.actualIncome, 0)
  const bestCampaign = campaigns.find(c => c.bestPerforming)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          Affiliate <span className="gold-gradient-text">Link Tracker</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Track affiliate campaigns, clicks, and earnings
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4 text-gold" />
            <span className="text-xs text-obsidian-muted">Campaigns</span>
          </div>
          <p className="text-xl font-extrabold text-white">{campaigns.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-status-dev" />
            <span className="text-xs text-obsidian-muted">Total Clicks</span>
          </div>
          <p className="text-xl font-extrabold text-status-dev">{totalClicks}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-status-warning" />
            <span className="text-xs text-obsidian-muted">Est. Income</span>
          </div>
          <p className="text-xl font-extrabold text-status-warning">${totalEstimated}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-status-live" />
            <span className="text-xs text-obsidian-muted">Actual Income</span>
          </div>
          <p className="text-xl font-extrabold text-status-live">${totalActual}</p>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">Campaigns</h3>
        <div className="space-y-2">
          {campaigns.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  c.bestPerforming ? 'gold-gradient text-obsidian-dark' : 'bg-obsidian-card border border-obsidian-border text-obsidian-muted'
                }`}>
                  <Link className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-[10px] text-obsidian-muted">{c.platform} · {c.shortLink}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-center">
                  <p className="text-sm font-bold text-status-dev">{c.clicks}</p>
                  <p className="text-[9px] text-obsidian-muted">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-status-warning">${c.estimatedIncome}</p>
                  <p className="text-[9px] text-obsidian-muted">Est.</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-status-live">${c.actualIncome}</p>
                  <p className="text-[9px] text-obsidian-muted">Actual</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-semibold bg-obsidian-card border border-obsidian-border">
                  {c.payoutStatus === 'Paid'
                    ? <CheckCircle className="w-3 h-3 text-status-live" />
                    : <Clock className="w-3 h-3 text-status-warning" />
                  }
                  <span className="text-obsidian-muted">{c.payoutStatus}</span>
                </div>
                {c.bestPerforming && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gold/10 border border-gold/20">
                    <Trophy className="w-3 h-3 text-gold" />
                    <span className="text-[9px] font-bold text-gold">Best</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
