import stats from './stats'
import projects from './projects'
import staff from './staff'

const loadDefaultTasks = () => {
  try {
    const stored = localStorage.getItem('km_empire_tasks')
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export const getAssistantResponse = (command) => {
  const cmd = command.toLowerCase().trim()

  if (cmd === 'help' || cmd === '?') {
    return {
      bn: `আমি Empire AI — আপনার ডিজিটাল সাম্রাজ্যের সহায়ক।\n\n` +
        `উপলব্ধ কমান্ড:\n` +
        `• help — সাহায্য দেখুন\n` +
        `• projects — প্রজেক্ট তালিকা\n` +
        `• status — সিস্টেম স্ট্যাটাস\n` +
        `• social — সোশ্যাল মিডিয়া প্ল্যান\n` +
        `• whatsapp — হোয়াটসঅ্যাপ স্ট্যাটাস\n` +
        `• income — আয়ের সারাংশ\n` +
        `• staff — স্টাফ তালিকা\n` +
        `• tasks — কাজের তালিকা\n` +
        `• report — সম্পূর্ণ রিপোর্ট\n` +
        `• summary — দ্রুত সারাংশ`,
      en: `I am Empire AI — your digital empire assistant.\n\n` +
        `Available commands:\n` +
        `• help — Show help\n` +
        `• projects — List projects\n` +
        `• status — System status\n` +
        `• social — Social media plan\n` +
        `• whatsapp — WhatsApp status\n` +
        `• income — Income summary\n` +
        `• staff — Staff list\n` +
        `• tasks — Task list\n` +
        `• report — Full report\n` +
        `• summary — Quick summary`,
    }
  }

  if (cmd === 'projects' || cmd === 'project') {
    const list = projects.map(p => `• ${p.name} (${p.type}) — ${p.status}`).join('\n')
    return {
      bn: `📂 **প্রজেক্ট সমূহ (${projects.length}টি):**\n${list}`,
      en: `📂 **Projects (${projects.length}):**\n${list}`,
    }
  }

  if (cmd === 'status') {
    return {
      bn: `📊 **সিস্টেম স্ট্যাটাস** [${formatTime()}]\n\n` +
        `মোট প্রজেক্ট: ${stats.totalProjects}\n` +
        `লাইভ ওয়েবসাইট: ${stats.liveWebsites}\n` +
        `সক্রিয় অ্যালার্ট: ${stats.activeAlerts}\n` +
        `পেন্ডিং টাস্ক: ${stats.pendingTasks}\n` +
        `সোশ্যাল পোস্ট প্ল্যান: ${stats.socialPostsPlanned}\n` +
        `হোয়াটসঅ্যাপ: ${stats.whatsappConnected ? '✅ সংযুক্ত' : '❌ সংযুক্ত নয়'}`,
      en: `📊 **System Status** [${formatTime()}]\n\n` +
        `Total Projects: ${stats.totalProjects}\n` +
        `Live Websites: ${stats.liveWebsites}\n` +
        `Active Alerts: ${stats.activeAlerts}\n` +
        `Pending Tasks: ${stats.pendingTasks}\n` +
        `Social Posts Planned: ${stats.socialPostsPlanned}\n` +
        `WhatsApp: ${stats.whatsappConnected ? '✅ Connected' : '❌ Not Connected'}`,
    }
  }

  if (cmd === 'social') {
    return {
      bn: `📱 **সোশ্যাল মিডিয়া প্ল্যান**\n\n` +
        `মোট প্ল্যান করা পোস্ট: ${stats.socialPostsPlanned}\n` +
        `প্লাটফর্ম: Instagram, Facebook, YouTube, Blogger, Pinterest\n\n` +
        `_বিস্তারিত দেখতে Social Media Planner পেজ ওপেন করুন।_`,
      en: `📱 **Social Media Plan**\n\n` +
        `Total Planned Posts: ${stats.socialPostsPlanned}\n` +
        `Platforms: Instagram, Facebook, YouTube, Blogger, Pinterest\n\n` +
        `_Open Social Media Planner page for details._`,
    }
  }

  if (cmd === 'whatsapp' || cmd === 'wa') {
    return {
      bn: `💬 **হোয়াটসঅ্যাপ অ্যালার্ট সেন্টার**\n\n` +
        `স্ট্যাটাস: ❌ সংযুক্ত নয়\n` +
        `এপিআই: WhatsApp Cloud API (ভবিষ্যতে)\n\n` +
        `_হোয়াটসঅ্যাপ অ্যালার্ট পরে অফিসিয়াল API-র মাধ্যমে সংযুক্ত হবে।_\n` +
        `_কখনো ফ্রন্টএন্ড কোডে টোকেন সংরক্ষণ করবেন না।_`,
      en: `💬 **WhatsApp Alert Center**\n\n` +
        `Status: ❌ Not Connected\n` +
        `API: WhatsApp Cloud API (future)\n\n` +
        `_WhatsApp alerts will be connected later using official API._\n` +
        `_Never store tokens in frontend code._`,
    }
  }

  if (cmd === 'income' || cmd === 'finance') {
    return {
      bn: `💰 **আয়ের সারাংশ**\n\n` +
        `আনুমানিক আয়: $${stats.estimatedIncome}\n` +
        `এই মাসে: $${stats.monthlyIncome}\n` +
        `ডেইলি গোল: $${stats.dailyIncomeGoal}\n` +
        `আজকের অগ্রগতি: $${stats.currentDailyIncome}\n\n` +
        `_বিস্তারিত Finance Ledger পেজে দেখুন।_`,
      en: `💰 **Income Summary**\n\n` +
        `Estimated Income: $${stats.estimatedIncome}\n` +
        `This Month: $${stats.monthlyIncome}\n` +
        `Daily Goal: $${stats.dailyIncomeGoal}\n` +
        `Today's Progress: $${stats.currentDailyIncome}\n\n` +
        `_See Finance Ledger page for details._`,
    }
  }

  if (cmd === 'staff' || cmd === 'team') {
    const list = staff.map(s => `• ${s.name} — ${s.role} (${s.status})`).join('\n')
    return {
      bn: `👥 **স্টাফ তালিকা (${staff.length}জন):**\n${list}\n\n_বিস্তারিত Staff Management পেজে দেখুন।_`,
      en: `👥 **Staff List (${staff.length}):**\n${list}\n\n_See Staff Management page for details._`,
    }
  }

  if (cmd === 'tasks' || cmd === 'task') {
    const allTasks = loadDefaultTasks()
    const pendingTasks = allTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress')
    const list = pendingTasks.map(t => `• ${t.title} — ${t.priority} (${t.status})`).join('\n')
    return {
      bn: `📋 **পেন্ডিং টাস্ক (${pendingTasks.length}টি):**\n${list}\n\n_বিস্তারিত Task Manager পেজে দেখুন।_`,
      en: `📋 **Pending Tasks (${pendingTasks.length}):**\n${list}\n\n_See Task Manager page for details._`,
    }
  }

  if (cmd === 'report' || cmd === 'full') {
    return {
      bn: `📈 **সম্পূর্ণ এম্পায়ার রিপোর্ট** [${formatTime()}]\n\n` +
        `📂 প্রজেক্ট: ${stats.totalProjects}\n` +
        `🌐 লাইভ: ${stats.liveWebsites}\n` +
        `⚠️ অ্যালার্ট: ${stats.activeAlerts}\n` +
        `📋 টাস্ক: ${stats.pendingTasks}\n` +
        `📱 সোশ্যাল পোস্ট: ${stats.socialPostsPlanned}\n` +
        `💰 আয়: $${stats.estimatedIncome}\n` +
        `👥 স্টাফ: ${stats.staffTasksPending} টাস্ক পেন্ডিং\n` +
        `💬 হোয়াটসঅ্যাপ: ${stats.whatsappConnected ? '✅' : '❌'}`,
      en: `📈 **Full Empire Report** [${formatTime()}]\n\n` +
        `📂 Projects: ${stats.totalProjects}\n` +
        `🌐 Live: ${stats.liveWebsites}\n` +
        `⚠️ Alerts: ${stats.activeAlerts}\n` +
        `📋 Tasks: ${stats.pendingTasks}\n` +
        `📱 Social Posts: ${stats.socialPostsPlanned}\n` +
        `💰 Income: $${stats.estimatedIncome}\n` +
        `👥 Staff: ${stats.staffTasksPending} tasks pending\n` +
        `💬 WhatsApp: ${stats.whatsappConnected ? '✅' : '❌'}`,
    }
  }

  if (cmd === 'summary' || cmd === 'sum') {
    return {
      bn: `⚡ **দ্রুত সারাংশ:** ${stats.totalProjects} প্রজেক্ট, ${stats.pendingTasks} টাস্ক, ` +
        `${stats.activeAlerts} অ্যালার্ট, আয় $${stats.estimatedIncome}`,
      en: `⚡ **Quick Summary:** ${stats.totalProjects} projects, ${stats.pendingTasks} tasks, ` +
        `${stats.activeAlerts} alerts, income $${stats.estimatedIncome}`,
    }
  }

  if (cmd === 'hi' || cmd === 'hello' || cmd === 'hey' || cmd === 'assalamu' || cmd === 'salam') {
    return {
      bn: `${getGreeting()}! 👋 আমি Empire AI — আপনার ডিজিটাল সাম্রাজ্যের ব্যক্তিগত সহায়ক।\n\n` +
        `সাহায্যের জন্য \`help\` টাইপ করুন বা \`?\` লিখুন।\n` +
        `আমি ইংরেজি ও বাংলা উভয় ভাষায় উত্তর দিতে পারি।`,
      en: `${getGreeting()}! 👋 I am Empire AI — your personal digital empire assistant.\n\n` +
        `Type \`help\` or \`?\` to see available commands.\n` +
        `I can respond in both English and Bangla.`,
    }
  }

  if (cmd === 'who' || cmd === 'who are you') {
    return {
      bn: `আমি **Empire AI** 🤖 — \n` +
        `খাইর মুরাফিক এম্পায়ার ওএস-এর কেন্দ্রীয় কৃত্রিম বুদ্ধিমত্তা সহায়ক।\n\n` +
        `আমি আপনার সব প্রজেক্ট, টাস্ক, স্টাফ, ফাইন্যান্স এবং সোশ্যাল মিডিয়া \n` +
        `মনিটর করতে সাহায্য করি — সবকিছু একটি গোল্ডেন ওবসিডিয়ান কন্ট্রোল সেন্টার থেকে।\n\n` +
        `টাইপ করুন \`help\` বা \`?\``,
      en: `I am **Empire AI** 🤖 — \n` +
        `The central artificial intelligence assistant of Khair Murafiq Empire OS.\n\n` +
        `I help you monitor all your projects, tasks, staff, finances, and social media \n` +
        `from a single Golden Obsidian control center.\n\n` +
        `Type \`help\` or \`?\` to get started.`,
    }
  }

  return {
    bn: `🤔 আমি বুঝতে পারিনি। সাহায্যের জন্য \`help\` বা \`?\` টাইপ করুন।\n\n` +
      `আমি ইংরেজি ও বাংলা উভয় ভাষায় কমান্ড বুঝতে পারি।`,
    en: `🤔 I didn't understand that. Type \`help\` or \`?\` for available commands.\n\n` +
      `I understand commands in both English and Bangla.`,
  }
}
