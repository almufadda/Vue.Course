<template>
    <div class="login-overlay">
      <div class="login-box">
        <div class="logo">
          <img src="../assets/logo.png" alt="Sanaam Logo" />
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Email or Username</label>
            <input 
              type="text" 
              id="username"
              v-model="credentials.username"
              required
              placeholder="Enter your email or username"
            >
          </div>
  
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password"
              v-model="credentials.password"
              required
              placeholder="Enter your password"
            >
          </div>
  
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
  
          <button type="submit" class="login-button" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const loading = ref(false)
  const error = ref('')
  
  const credentials = ref({
    username: '',
    password: ''
  })
  
  async function handleLogin() {
    loading.value = true
    error.value = ''
  
    try {
        const loginResponse = await fetch('http://172.20.10.2:8002/api/method/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'token f4d8bec94019549:1a48abc38187727'
          },
          body: JSON.stringify({
            usr: credentials.value.username,
            pwd: credentials.value.password
          })
        })

      const data = await loginResponse.json()
      console.log('Login response:', data)

      if (!loginResponse.ok) {
        throw new Error(data._server_messages ? JSON.parse(data._server_messages)[0].message : 'Login failed')
      }

      // Store authentication info
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('accessToken', 'token f4d8bec94019549:1a48abc38187727')
      
      // Get user info after successful login
      const userResponse = await fetch('http://172.20.10.2:8002/api/method/frappe.auth.get_logged_user', {
        headers: {
          'Authorization': 'token f4d8bec94019549:1a48abc38187727'
        }
      })
      
      const userData = await userResponse.json()
      console.log('User data:', userData)

      localStorage.setItem('userInfo', JSON.stringify({
        username: userData.message,
        apiKey: 'f4d8bec94019549',
        apiSecret: '1a48abc38187727'
      }))
      
      // Navigate to home page
      router.push('/')

    } catch (err) {
      error.value = err.message
      console.error('Login error:', err)
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .login-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  .logo {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .logo img {
    height: 60px;
    width: auto;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group label {
    font-weight: 500;
    color: #2c3e50;
  }
  
  .form-group input {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #0d6efd;
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
  
  .login-button {
    background: #0d6efd;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .login-button:hover {
    background: #0b5ed7;
  }
  
  .login-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #dc3545;
    text-align: center;
    font-size: 0.9rem;
  }
  </style> 