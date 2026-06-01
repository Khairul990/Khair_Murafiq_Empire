const monitoring = {
  uptime: '99.2%',
  deploymentHealth: 'Healthy',
  securityStatus: 'No threats',
  brokenLinks: 2,
  performanceScore: 87,
  lastScan: '2026-06-01 10:30 AM',
  services: [
    { name: 'BillQyro', status: 'Operational', uptime: '99.8%', response: '210ms' },
    { name: 'Empire OS', status: 'Operational', uptime: '100%', response: '45ms' },
    { name: 'Admin Panel', status: 'Operational', uptime: '99.5%', response: '180ms' },
    { name: 'API Layer', status: 'Development', uptime: '—', response: '—' },
    { name: 'Database', status: 'Operational', uptime: '99.9%', response: '15ms' },
  ],
  recentIncidents: [
    { date: '2026-05-28', type: 'Deployment', description: 'BillQyro staging deploy failed — build timeout', resolved: true },
    { date: '2026-05-25', type: 'Performance', description: 'Admin panel response degraded to 2.3s', resolved: true },
    { date: '2026-05-20', type: 'Security', description: 'Failed login attempt from unknown IP', resolved: true },
  ],
}

export default monitoring
