<!-- Login Page HTML -->

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
  

  <!-- Login Page JavaScript -->
  <script setup>
  import { useLogin } from '../javascript/login_javascript.js'
  
  const { loading, error, credentials, handleLogin } = useLogin()
  </script>


<!-- Login Page CSS -->
  
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