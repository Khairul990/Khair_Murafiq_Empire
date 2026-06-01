const whatsappConfig = {
  connected: false,
  api: 'WhatsApp Cloud API',
  phoneNumberId: 'Pending',
  businessAccountId: 'Pending',
  webhookUrl: 'Not configured',
  alertTypes: [
    { id: 'website-down', label: 'Website Down', enabled: true },
    { id: 'deploy-failed', label: 'Deployment Failed', enabled: true },
    { id: 'security', label: 'Security Warning', enabled: true },
    { id: 'daily-report', label: 'Daily Report', enabled: false },
    { id: 'task-reminder', label: 'Task Reminder', enabled: true },
    { id: 'income-update', label: 'Income Update', enabled: false },
    { id: 'staff-review', label: 'Staff Task Review', enabled: true },
  ],
  warning: 'WhatsApp alerts will be connected later using official WhatsApp Cloud API. Never store tokens in frontend code.',
}

export default whatsappConfig
