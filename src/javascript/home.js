import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

export function useHome() {
  const router = useRouter()

  // STATE
  const currentView = ref('employees')
  const showSidebar = ref(true)
  const showProjectsMenu = ref(false)
  const allProjects = ref([])
  const selectedProject = ref(null)
  const employees = ref([
    {
      employee_name: "Abdulrahman Almufadda",
      email: "a.almufadda@sanaam.sa",
      department: "Developer"
    },
    {
      employee_name: "Mohammed Almusined",
      email: "m.almusined@sanaam.sa",
      department: "Developer"
    },
    {
      employee_name: "Meshary",
      email: "m.rumi@sanaam.sa",
      department: "CEO"
    }
  ])
  const statuses = ['waiting','on_progress','hold','completed','canceled']

  const statusLabels = {
    waiting: 'Waiting',
    on_progress: 'On Progress',
    hold: 'Hold',
    completed: 'Completed',
    canceled: 'Canceled'
  }

  const showCreateProjectModal = ref(false)
  const newProject = ref({
    project_name: '',
    description: '',
    status: 'Waiting',
    is_parent: true,
    parent_project: ''
  })
  const parentProjects = computed(() => {
    return allProjects.value.filter(p => !p.parent_project)
  })

  // FRAPPE CREDENTIALS
  const apiKey = import.meta.env.VITE_API_KEY
  const apiSecret = import.meta.env.VITE_API_SECRET

  // MOBILE CHECK
  function isMobile() {
    return window.innerWidth < 768
  }

  // SIDEBAR TOGGLE
  function toggleSidebar() {
    showSidebar.value = !showSidebar.value
  }

  // GENERIC FRAPPE FETCH
  async function fetchFromFrappe(method, params = {}) {
    const url = new URL(`${import.meta.env.VITE_URL}/api/method/${method}`)
    Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v))
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Authorization': `token ${apiKey}:${apiSecret}`,
        'Accept': 'application/json'
      }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { message } = await res.json()
    return message
  }

  // LOAD EMPLOYEES
  async function loadEmployees() {
    try {
      const apiEmployees = await fetchFromFrappe('sanaamstride.api.employee.get_all')
      if (apiEmployees && apiEmployees.length > 0) {
        employees.value = apiEmployees
      }
    } catch (error) {
      console.error('Failed to load employees:', error)
    }
  }

  // LOAD PROJECTS
  async function loadProjects() {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/method/sanaamstride.api.project.get_all`, {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'Accept': 'application/json'
        }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const { message } = await response.json()
      allProjects.value = message || []
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  // SELECT VIEW
  function selectView(view) {
    currentView.value = view
    if (isMobile()) showSidebar.value = false
    if (view === 'projects') showProjectsMenu.value = true
  }

  // TOGGLE PROJECTS MENU
  function toggleProjectsMenu() {
    currentView.value = 'projects'
    showProjectsMenu.value = !showProjectsMenu.value
  }

  // SELECT PROJECT
  async function selectProject(proj) {
    selectedProject.value = proj
    currentView.value = 'projects'
    if (isMobile()) showSidebar.value = false
    
    try {
      const tasks = await fetchFromFrappe(
        'sanaamstride.api.task.get_by_project',
        { project: proj.name }
      )
      selectedProject.value.tasks = tasks
    } catch (error) {
      console.error(`Failed to load tasks for project ${proj.project_name}:`, error)
    }
  }

  // FILTER TASKS BY STATUS
  function tasksByStatus(status) {
    return (selectedProject.value?.tasks || []).filter(t=>t.status===status)
  }

  // FILTER CHILD PROJECTS BY STATUS
  function childProjectsByStatus(status) {
    return (selectedProject.value?.child_projects || [])
      .filter(child => child.status.toLowerCase() === status.toLowerCase())
  }

  // CHECK IF STATUS HAS ITEMS
  function hasItemsInStatus(status) {
    const tasks = tasksByStatus(status)
    const childProjects = childProjectsByStatus(status)
    return tasks.length > 0 || childProjects.length > 0
  }

  // CREATE PROJECT
  async function createProject() {
    try {
      const formData = new URLSearchParams()
      formData.append('project_name', newProject.value.project_name)
      formData.append('description', newProject.value.description)
      formData.append('status', newProject.value.status)
      formData.append('is_parent', newProject.value.is_parent ? '1' : '0')
      
      if (!newProject.value.is_parent && newProject.value.parent_project) {
        formData.append('parent_project', newProject.value.parent_project)
      }
      
      const response = await fetch(`${import.meta.env.VITE_URL}/api/method/sanaamstride.api.project.create_project`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
          'Content-Type': 'application/x-www-form-urlencoded',  
        },
        body: formData
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      await loadProjects()
      
      newProject.value = {
        project_name: '',
        description: '',
        status: 'Waiting',
        is_parent: true,
        parent_project: ''
      }
      showCreateProjectModal.value = false
      
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project. Please try again.')
    }
  }

  // LOGOUT
  function logout() {
    localStorage.removeItem('isAuthenticated')
    router.push('/login')
  }

  // HANDLE RESIZE
  function handleResize() {
    if (!isMobile()) {
      showSidebar.value = true
    }
  }

  // LIFECYCLE HOOKS
  onMounted(async () => {
    showSidebar.value = true
    window.addEventListener('resize', handleResize)
    await Promise.all([loadEmployees(), loadProjects()])
    console.log('VITE_URL:', import.meta.env.VITE_URL);
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    currentView,
    showSidebar,
    showProjectsMenu,
    allProjects,
    selectedProject,
    employees,
    statuses,
    statusLabels,
    showCreateProjectModal,
    newProject,
    parentProjects,
    toggleSidebar,
    selectView,
    toggleProjectsMenu,
    selectProject,
    tasksByStatus,
    childProjectsByStatus,
    hasItemsInStatus,
    createProject,
    logout
  }
}