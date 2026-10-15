import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8082', // The port where our backend is running
  withCredentials: true, // IMPORTANT: This tells axios to send HttpOnly cookies with every request
});

export default api;
