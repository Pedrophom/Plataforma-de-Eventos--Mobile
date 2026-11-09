import axios from 'axios';

// 1. Defina o seu IP atual aqui. Quando mudar de rede (ex: Wi-Fi do IFMA), altere APENAS esta linha!
export const MEU_IP = '10.99.26.29'; 

// O Axios já usa a variável automaticamente
export const api = axios.create({
  baseURL: `http://${MEU_IP}:3000`, 
});