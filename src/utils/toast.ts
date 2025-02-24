import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      id: message, // Prevents duplicate toasts
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      id: message,
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      id: message,
    });
  },

  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  }
}; 