import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useLogin() {
  const router = useRouter()
  const loading = ref(false)
  const error = ref('')

  const credentials = ref({
    username: '',
    password: ''
  })

  console.log('VITE_URL:', import.meta.env.VITE_URL);

  async function handleLogin() {
    loading.value = true
    error.value = ''

    try {
      const loginResponse = await fetch(`${import.meta.env.VITE_URL}/api/method/login`, {
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
      const userResponse = await fetch(`${import.meta.env.VITE_URL}/api/method/frappe.auth.get_logged_user`, {
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

  return {
    loading,
    error,
    credentials,
    handleLogin
  }
} 