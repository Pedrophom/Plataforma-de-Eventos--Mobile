import axios from 'axios';

// Usamos o seu IP local para o telemóvel conseguir ver o servidor Web
export const api = axios.create({
  baseURL: 'http://192.168.1.121:3000', 
});