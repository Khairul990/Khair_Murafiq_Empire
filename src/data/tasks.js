const TASKS_KEY = 'km_empire_tasks'

const defaultTasks = [
  {
    id: 1,
    title: 'Deploy BillQyro beta to Firebase',
    description: 'Initial production deploy to Firebase Hosting and Firestore setup.',
    projectId: 'billqyro',
    projectName: 'BillQyro',
    priority: 'High',
    status: 'Working',
    assignedTo: 'Khairul',
    dueDate: '2026-06-10',
    createdAt: '2026-05-28T10:00:00.000Z',
    updatedAt: '2026-05-28T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Complete Empire OS Phase 1 UI',
    description: 'Finalize all dashboard screens, control room, tasks, and settings.',
    projectId: 'khair-murafiq-empire-os',
    projectName: 'Khair Murafiq Empire OS',
    priority: 'High',
    status: 'Review',
    assignedTo: 'Khairul',
    dueDate: '2026-06-05',
    createdAt: '2026-05-30T10:00:00.000Z',
    updatedAt: '2026-05-30T10:00:00.000Z'
  },
  {
    id: 3,
    title: 'Set up payment gateway for BillQyro',
    description: 'Integrate Stripe and verify webhooks.',
    projectId: 'billqyro',
    projectName: 'BillQyro',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Khairul',
    dueDate: '2026-06-15',
    createdAt: '2026-05-25T10:00:00.000Z',
    updatedAt: '2026-05-25T10:00:00.000Z'
  },
  {
    id: 4,
    title: 'Research AI embroidery models',
    description: 'Evaluate stable diffusion models for embroidery patterns.',
    projectId: 'embroidery-ai-tool',
    projectName: 'Embroidery AI Tool',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'AI Agent',
    dueDate: '2026-07-01',
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-05-20T10:00:00.000Z'
  },
  {
    id: 5,
    title: 'Audit admin panel security rules',
    description: 'Review Firestore rules and ensure no read/write holes.',
    projectId: 'khair-murafiq-empire-os',
    projectName: 'Khair Murafiq Empire OS',
    priority: 'Critical',
    status: 'Done',
    assignedTo: 'Khairul',
    dueDate: '2026-06-08',
    createdAt: '2026-05-22T10:00:00.000Z',
    updatedAt: '2026-05-22T10:00:00.000Z'
  }
]

const loadTasks = () => {
  try {
    const stored = localStorage.getItem(TASKS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Migration for old schema
      return parsed.map(t => ({
        ...t,
        description: t.description || '',
        projectName: t.projectName || t.project || 'General / No Project',
        projectId: t.projectId || (t.project ? t.project.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general'),
        assignedTo: t.assignedTo || 'Unassigned',
        status: t.status === 'In Progress' ? 'Working' : (t.status === 'Completed' ? 'Done' : (t.status === 'Blocked' ? 'Review' : t.status)),
        priority: t.priority || 'Medium',
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString()
      }))
    }
  } catch {}
  
  localStorage.setItem(TASKS_KEY, JSON.stringify(defaultTasks))
  return [...defaultTasks]
}

const saveTasks = (tasks) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

const getNextId = (tasks) => {
  return tasks.length > 0 ? Math.max(...tasks.map(t => parseInt(t.id) || 0)) + 1 : 1
}

export { loadTasks, saveTasks, getNextId, TASKS_KEY }
