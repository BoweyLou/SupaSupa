// src/utils/toast.ts
// A simple toast notification utility

import { toast } from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: 'bold',
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: 'bold',
      },
    });
  },
  
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: 'bold',
      },
    });
  },
  
  warning: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-center',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: 'bold',
      },
    });
  },
}; 