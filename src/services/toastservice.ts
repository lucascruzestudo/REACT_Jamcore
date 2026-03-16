
import { toast, ToastOptions } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../styles/toast.css'

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
      className: 'jamcore-toast jamcore-toast--success',
      bodyClassName: 'jamcore-toast__body',
      progressClassName: 'jamcore-toast__progress',
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
      className: 'jamcore-toast jamcore-toast--error',
      bodyClassName: 'jamcore-toast__body',
      progressClassName: 'jamcore-toast__progress',
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
      className: 'jamcore-toast jamcore-toast--info',
      bodyClassName: 'jamcore-toast__body',
      progressClassName: 'jamcore-toast__progress',
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
      className: 'jamcore-toast jamcore-toast--warning',
      bodyClassName: 'jamcore-toast__body',
      progressClassName: 'jamcore-toast__progress',
      ...options,
    })
  }
}

const toastService = new ToastService()
export default toastService
