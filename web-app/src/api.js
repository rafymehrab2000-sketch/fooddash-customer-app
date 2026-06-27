import axios from 'axios'

const BASE_URL = 'https://fooddash-food-delivery-project-production.up.railway.app/api'

const API = axios.create({ baseURL: BASE_URL })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default API
