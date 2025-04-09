<template>
  <div>
    <h1>Posts List:</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">
        <strong>{{ post.title }}</strong>
        <p>{{ post.body }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const posts = ref([])

onMounted(async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    if (!response.ok) throw new Error('Failed to fetch')
    posts.value = await response.json()
  } catch (error) {
    console.error('Fetch error:', error)
  }
})
</script>
