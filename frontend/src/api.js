import axios from 'axios';

const API = axios.create({
  baseURL: 'https://lostandfound-1-zk9m.onrender.com/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post('/register', data);
export const login = (data) => API.post('/login', data);

// Items
export const getItems = () => API.get('/items');
export const getItemById = (id) => API.get(`/items/${id}`);
export const createItem = (data) => API.post('/items', data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const searchItems = (name, category) => {
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (category) params.append('category', category);
  return API.get(`/items/search?${params.toString()}`);
};

export default API;
