const TASKS_KEY = 'km_empire_tasks'

const defaultTasks = [
  {
    id: 1,
    title: 'Deploy BillQyro beta to Firebase',
    project: 'BillQyro',
    assignedTo: 'Khairul Islam',
    priority: 'High',
    status: 'Working',
    dueDate: '2026-06-10',
    createdAt: '2026-05-28',
  },
  {
    id: 2,
    title: 'Complete Empire OS Phase 1 UI',
    project: 'Khair Murafiq Empire OS',
    assignedTo: 'Khairul Islam',
    priority: 'High',
    status: 'Working',
    dueDate: '2026-06-05',
    createdAt: '2026-05-30',
  },
  {
    id: 3,
    title: 'Set up payment gateway for BillQyro',
    project: 'BillQyro',
    assignedTo: 'Staff Member 1',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2026-06-15',
    createdAt: '2026-05-25',
  },
  {
    id: 4,
    title: 'Research AI embroidery models',
    project: 'Embroidery AI Tool',
    assignedTo: 'Staff Member 2',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2026-07-01',
    createdAt: '2026-05-20',
  },
  {
    id: 5,
    title: 'Audit admin panel security rules',
    project: 'Khair Murafiq Empire OS',
    assignedTo: 'Khairul Islam',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-06-08',
    createdAt: '2026-05-22',
  },
  {
    id: 6,
    title: 'Write blog post: SaaS building journey',
    project: 'TechWithKhairul Blog',
    assignedTo: 'Khairul Islam',
    priority: 'Low',
    status: 'Pending',
    dueDate: '2026-06-25',
    createdAt: '2026-05-29',
  },
  {
    id: 7,
    title: 'Create Gopal Bhar storyboard',
    project: 'Gopal Bhar Cartoon Studio',
    assignedTo: 'Staff Member 3',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2026-06-20',
    createdAt: '2026-05-26',
  },
  {
    id: 8,
    title: 'Test PWA offline features',
    project: 'BillQyro',
    assignedTo: 'Staff Member 1',
    priority: 'Medium',
    status: 'Review',
    dueDate: '2026-06-12',
    createdAt: '2026-05-24',
  },
]

const loadTasks = () => {
  try {
    const stored = localStorage.getItem(TASKS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  localStorage.setItem(TASKS_KEY, JSON.stringify(defaultTasks))
  return [...defaultTasks]
}

const saveTasks = (tasks) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

const getNextId = (tasks) => {
  return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
}

export { loadTasks, saveTasks, getNextId, TASKS_KEY }
