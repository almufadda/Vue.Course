<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h1>Project Hierarchy</h1>

    <!-- Filter row -->
    <div style="margin-bottom: 1rem;">
      <label for="filter">Parent Project Name:</label>
      <input
        id="filter"
        type="text"
        v-model="filter"
        placeholder="Enter project name"
        style="margin: 0 0.5rem; padding: 4px;"
      />
      <button @click="applyFilter" style="padding: 5px 10px;">Apply Filter</button>
    </div>

    <!-- Error message -->
    <div v-if="error" style="color: red; margin-bottom: 1rem;">
      Error: {{ error }}
    </div>

    <!-- Data table -->
    <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
      <thead style="background: #f0f0f0;">
        <tr>
          <th>Parent Project</th>
          <th>Child Project</th>
          <th>Sprints</th>
          <th>Tasks</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="parent in projects" :key="parent.name">
          <td rowspan="getRowspan(parent)">{{ parent.project_name }}</td>

          <!-- first child row -->
          <template v-if="parent.child_projects.length">
            <td>{{ parent.child_projects[0].project_name }}</td>
            <td>
              <ul style="margin:0; padding-left:1rem;">
                <li v-for="s in parent.child_projects[0].sprints" :key="s.name">
                  {{ s.sprint_name }}
                </li>
              </ul>
            </td>
            <td>
              <ul style="margin:0; padding-left:1rem;">
                <li v-for="t in parent.child_projects[0].tasks" :key="t.name">
                  {{ t.task_name }}
                </li>
              </ul>
            </td>
          </template>
          <template v-else>
            <td colspan="3" style="text-align:center;">— No Child Projects —</td>
          </template>
        </tr>

        <!-- additional child rows -->
        <template v-for="parent in projects" :key="parent.name + '-children'">
          <tr
            v-for="(child, idx) in parent.child_projects"
            v-if="idx > 0"
            :key="child.name"
          >
            <td>{{ child.project_name }}</td>
            <td>
              <ul style="margin:0; padding-left:1rem;">
                <li v-for="s in child.sprints" :key="s.name">{{ s.sprint_name }}</li>
              </ul>
            </td>
            <td>
              <ul style="margin:0; padding-left:1rem;">
                <li v-for="t in child.tasks" :key="t.name">{{ t.task_name }}</li>
              </ul>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const filter = ref('')
const projects = ref([])
const error = ref(null)

// Your Frappe API credentials
const apiKey = "a8f68ca349940e1"
const apiSecret = "5ac9be99799c90f"

// Build URL with optional filter query
function buildUrl() {
  const base = 'http://127.0.0.1:8000/api/method/sanaamstride.api.project.get_all'
  if (filter.value.trim()) {
    return `${base}?project_name=${encodeURIComponent(filter.value.trim())}`
  }
  return base
}

// Fetch data from Frappe
async function fetchData() {
  error.value = null
  try {
    const res = await fetch(buildUrl(), {
      credentials: 'include',
      headers: {
        'Authorization': `token ${apiKey}:${apiSecret}`,
        'Accept': 'application/json'
      }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    projects.value = data.message || []
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Fetch failed'
  }
}

// Called when “Apply Filter” is clicked
function applyFilter() {
  fetchData()
}

// Compute how many rows a parent spans in the table
function getRowspan(parent) {
  return parent.child_projects.length > 0
    ? parent.child_projects.length
    : 1
}

// Initial fetch
fetchData()
</script>

<style scoped>
table th {
  text-align: left;
}
</style>
