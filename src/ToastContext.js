import { createContext } from 'react';

// Cria o contexto com valor inicial nulo para evitar crash
export const ToastContext = createContext({
  showToast: (msg) => console.log(msg), 
});