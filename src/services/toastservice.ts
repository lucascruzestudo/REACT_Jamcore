
import { toast, ToastOptions } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface CustomToastOptions extends ToastOptions {
  duration?: number;
}

class ToastService {
  success(message: string, options: CustomToastOptions = {}) {
    toast.success(message, {
      position: "top-right",
      autoClose: options.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
    })
  }

  error(message: string, options: CustomToastOptions = {}) {
    toast.error(message, {
      position: "top-right",
      autoClose: options.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
    })
  }

  info(message: string, options: CustomToastOptions = {}) {
    toast.info(message, {
      position: "top-right",
      autoClose: options.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
    })
  }

  warning(message: string, options: CustomToastOptions = {}) {
    toast.warning(message, {
      position: "top-right",
      autoClose: options.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options,
    })
  }
}

const toastService = new ToastService()
export default toastService
