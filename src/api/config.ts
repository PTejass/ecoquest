// In development, Vite proxies /api to localhost:3000
// In production, this points to the Render backend URL
const API_URL = import.meta.env.VITE_API_URL || '';

export default API_URL;
