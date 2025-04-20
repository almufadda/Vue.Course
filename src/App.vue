<template>
  <div class="app-container">
    <!-- HEADER -->
    <header class="header">
      <button class="menu-toggle" @click="toggleSidebar">
        ☰
      </button>
      <div class="logo">
        <img 
          src="./assets/logo.png" 
          alt="Logo" 
          class="logo-image" 
          @click="selectView('employees')"
        />
      </div>
    </header>

    <div class="main">
      <!-- LEFT SIDEBAR MENU - Fixed position -->
      <aside class="sidebar" :class="{ open: showSidebar }">
        <ul class="menu">
          <!-- Employees Link -->
          <li
            :class="{ active: currentView === 'employees' }"
            @click="selectView('employees')"
          >
            Employees
          </li>

          <!-- Projects Dropdown -->
          <li>
            <div class="projects-section">
              <button class="create-project-btn" @click="showCreateProjectModal = true">
                + Create Project
              </button>
              <div
                class="projects-header"
                :class="{ active: currentView === 'projects' }"
                @click="toggleProjectsMenu"
              >
                Projects
                <span class="arrow">{{ showProjectsMenu ? '▾' : '▸' }}</span>
              </div>
            </div>
            <ul v-if="showProjectsMenu" class="submenu">
              <li
                v-for="proj in allProjects"
                :key="proj.name"
                :class="{ active: selectedProject?.name === proj.name }"
                @click="selectProject(proj)"
              >
                {{ proj.project_name }}
              </li>
            </ul>
          </li>
        </ul>
      </aside>
      <!-- END SIDEBAR -->

      <!-- MAIN CONTENT - Takes remaining space -->
      <section class="content" :class="{ 'with-sidebar': showSidebar }">
        <!-- Employee List -->
        <div v-if="currentView === 'employees'" class="content-section">
          <h2>Employee List</h2>
          <table class="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Department</th></tr>
            </thead>
            <tbody>
              <tr v-for="emp in employees" :key="emp.name">
                <td>{{ emp.employee_name }}</td>
                <td>{{ emp.email }}</td>
                <td>{{ emp.department }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Project Board -->
        <div v-else-if="currentView === 'projects' && selectedProject" class="content-section">
          <h2>Board: {{ selectedProject.project_name }}</h2>
          
          <!-- Main project board -->
          <div class="board">
            <div v-for="status in statuses" :key="status" class="column">
              <h3>{{ statusLabels[status] }}</h3>
              <!-- Tasks -->
              <div
                v-for="task in tasksByStatus(status)"
                :key="task.name"
                class="card"
              >
                {{ task.task_name }}
              </div>
              
              <!-- Child projects in their respective status columns -->
              <div
                v-for="childProj in childProjectsByStatus(status)"
                :key="childProj.name"
                class="card child-project"
                @click="selectProject(childProj)"
              >
                <div class="child-project-header">
                  {{ childProj.project_name }}
                </div>
                <div class="child-project-tasks">
                  Tasks: {{ childProj.tasks ? childProj.tasks.length : 0 }}
                </div>
              </div>
              
              <!-- Empty state -->
              <div 
                v-if="!hasItemsInStatus(status)" 
                class="empty-column"
              >
                No items
              </div>
            </div>
          </div>
        </div>

        <!-- Fallback / Original Table -->
        <div v-else class="content-section">
          <project-hierarchy-table />
        </div>
      </section>
    </div>

    <!-- Create Project Modal -->
    <div v-if="showCreateProjectModal" class="modal-overlay">
      <div class="modal">
        <h3>Create New Project</h3>
        <form @submit.prevent="createProject">
          <div class="form-group">
            <label>Project Name</label>
            <input 
              v-model="newProject.project_name" 
              type="text" 
              required
            >
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="newProject.description"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Status</label>
            <select v-model="newProject.status">
              <option value="Waiting">Waiting</option>
              <option value="On Progress">On Progress</option>
              <option value="Hold">Hold</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
          
          <div class="form-group checkbox">
            <label>
              <input 
                type="checkbox" 
                v-model="newProject.is_parent"
              >
              Is Parent Project
            </label>
          </div>

          <div v-if="!newProject.is_parent" class="form-group">
            <label>Parent Project</label>
            <select 
              v-model="newProject.parent_project"
              required
            >
              <option value="">Select Parent Project</option>
              <option 
                v-for="proj in parentProjects" 
                :key="proj.name" 
                :value="proj.name"
              >
                {{ proj.project_name }}
              </option>
            </select>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showCreateProjectModal = false">
              Cancel
            </button>
            <button type="submit" class="primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// STATE
const currentView      = ref('employees')
const showSidebar      = ref(true) // Set to true by default for all screens
const showProjectsMenu = ref(false)
const allProjects      = ref([])
const selectedProject  = ref(null)
const employees        = ref([
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
const statuses         = ['waiting','on_progress','hold','completed','canceled']

const statusLabels = {
  waiting:     'Waiting',
  on_progress: 'On Progress',
  hold:        'Hold',
  completed:   'Completed',
  canceled:    'Canceled'
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
const apiKey    = 'a8f68ca349940e1'
const apiSecret = '5ac9be99799c90f'

// MOBILE CHECK
function isMobile() {
  return window.innerWidth < 768  // Increased breakpoint for better tablet support
}

// SIDEBAR TOGGLE
function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

// GENERIC FRAPPE FETCH
async function fetchFromFrappe(method, params = {}) {
  const url = new URL(`http://127.0.0.1:8000/api/method/${method}`)
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
    // If API fails, mock data will remain
  } catch (error) {
    console.error('Failed to load employees:', error)
    // Mock data will be used as fallback
  }
}

// LOAD PROJECTS
async function loadProjects() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/method/sanaamstride.api.project.get_all', {
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

// SELECT VIEW - Modified to prevent layout shifts
function selectView(view) {
  currentView.value = view
  // Only hide sidebar on mobile
  if (isMobile()) showSidebar.value = false
  // Show projects submenu when projects tab is clicked
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
  // Only hide sidebar on mobile
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
    
    const response = await fetch('http://127.0.0.1:8000/api/method/sanaamstride.api.project.create_project', {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    // Refresh projects list
    await loadProjects()
    
    // Reset form and close modal
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

// HANDLE RESIZE - Always show sidebar on desktop
function handleResize() {
  if (!isMobile()) {
    showSidebar.value = true
  }
}

onMounted(async () => {
  // Always show sidebar by default (for all screen sizes)
  showSidebar.value = true
  
  // Add resize listener
  window.addEventListener('resize', handleResize)
  
  // Fetch data
  await Promise.all([loadEmployees(), loadProjects()])
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* BASE LAYOUT - Full screen, fixed positioning */
.app-container {
  display: flex; 
  flex-direction: column; 
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.header {
  display: flex; 
  align-items: center;
  padding: 0.75rem 1rem;
  background: #fff; 
  border-bottom: 1px solid #ddd;
  height: 60px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 30;
  position: relative;
}

.menu-toggle {
  background: none; 
  border: none;
  font-size: 1.5rem; 
  margin-right: 1rem;
  cursor: pointer;
  color: #333;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.logo-image {
  height: 32px;
  width: auto;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.logo-image:hover {
  transform: scale(1.05);
}

.main {
  flex: 1;
  display: flex;
  position: relative;
  height: calc(100vh - 60px);
  margin-top: 60px; /* Account for fixed header */
}

/* SIDEBAR STYLES - Fixed width, full height */
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  height: calc(100vh - 60px);
  width: 250px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  z-index: 20;
  overflow-y: auto;
}

/* Menu Styling */
.menu {
  list-style: none; 
  padding: 1rem 0; 
  margin: 0;
}
/* filepath: c:\Users\Win11\vue-project\src\App.vue */
/* Ensure the content starts after the sidebar */
.content {
  position: fixed;
  top: 60px;
  left: 250px; /* Start after sidebar */
  right: 0;
  bottom: 0;
  overflow-y: auto;
  background: #f9fafb;
  padding: 1.5rem;
  z-index: 10;
}

.content.with-sidebar {
  left: 250px;
  width: auto; /* Let it fill remaining space */
}

.menu > li {
  padding: 0.75rem 1rem; 
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu > li.active {
  background: #e9ecef;
  border-left: 3px solid #0d6efd;
  font-weight: 500;
}

.menu > li:hover:not(.active) {
  background: #e9ecef;
}

.projects-header {
  display: flex; 
  justify-content: space-between;
  align-items: center;
}

.arrow {
  transition: transform 0.2s;
}

.submenu {
  list-style: none; 
  padding: 0.5rem 0 0.5rem 1.5rem; 
  margin: 0;
}

.submenu li {
  padding: 0.5rem 0.5rem; 
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.submenu li.active {
  color: #0d6efd;
  font-weight: 500;
}

.submenu li:hover:not(.active) {
  background: rgba(233, 236, 239, 0.5);
}

.child-submenu {
  list-style: none;
  padding-left: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9em;
}

.child-project {
  background: #fff;
  border-left: 3px solid #0d6efd;
  margin-bottom: 1rem;
}

.child-project-header {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0d6efd;
}

.child-project-tasks {
  font-size: 0.9em;
  color: #666;
}

.card.child-project:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 5px rgba(13, 110, 253, 0.15);
  background: #f8f9fa;
}

/* Update card hover effect */
.card.child-project:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 5px rgba(13, 110, 253, 0.15);
}

/* CONTENT AREA - Fills remaining space */
.content-section {
  width: 100%; /* Ensure it spans the full width of the content area */
  margin: 0; /* Remove auto margin */
  padding: 0; /* Remove padding if not needed */
}

/* EMPLOYEE TABLE - Full width with better styling */
.data-table {
  width: 100%; 
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-top: 1rem;
}

.data-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.data-table tr:hover {
  background: #f8f9fa;
}

/* BOARD - Improved layout and sizing */
.board {
  display: grid; 
  gap: 1.5rem;
  grid-template-columns: repeat(5, 1fr);
  margin-top: 1.5rem;
  min-height: 500px;
}

.column {
  background: #f0f0f0; 
  padding: 1rem;
  border-radius: 6px; 
  min-height: 300px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.column h3 {
  margin-top: 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #ddd;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.card {
  background: #fff; 
  padding: 1rem; 
  margin-bottom: 1rem;
  border-radius: 4px; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 5px rgba(0,0,0,0.15);
}

.empty-column {
  color: #999;
  text-align: center;
  padding: 2rem 0;
  font-style: italic;
  font-size: 0.9rem;
}

/* RESPONSIVE STYLES */
/* Mobile (default) */
@media (max-width: 767px) {
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    box-shadow: 3px 0 10px rgba(0,0,0,0.1);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .board {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .board {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop */
@media (min-width: 768px) {
  .sidebar {
    transform: none !important;
    box-shadow: none;
  }
  
  .menu-toggle {
    display: none;
  }
  
  .content.with-sidebar {
    margin-left: 0; /* No need to adjust margin since sidebar has fixed position */
  }
}

/* Large Desktop */
@media (min-width: 1400px) {
  .content-section {
    max-width: 1600px;
  }
}

/* Add to your existing <style> section */
.create-project-btn {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.create-project-btn:hover {
  background: #0b5ed7;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox input {
  width: auto;
  margin-right: 0.5rem;
}

.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

.form-group select:focus {
  border-color: #0d6efd;
  outline: none;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.modal-actions button.primary {
  background: #0d6efd;
  color: white;
  border: none;
}

.modal-actions button:not(.primary) {
  background: #f8f9fa;
  border: 1px solid #ddd;
}
</style>