import { useToast as useToastHook } from '@/components/ui/use-toast'

export interface ToastNotificationOptions {
  title?: string
  description?: string
  duration?: number
  autoDismiss?: boolean
}

export function useToastNotifications() {
  const { toast: toastFn, dismiss } = useToastHook()

  const success = (options: ToastNotificationOptions) => {
    return toastFn({
      variant: 'success',
      title: options.title || 'Success',
      description: options.description,
      duration: options.duration || 5000,
      autoDismiss: options.autoDismiss,
    })
  }

  const error = (options: ToastNotificationOptions) => {
    return toastFn({
      variant: 'destructive',
      title: options.title || 'Error',
      description: options.description,
      duration: options.duration || 7000,
      autoDismiss: options.autoDismiss,
    })
  }

  const warning = (options: ToastNotificationOptions) => {
    return toastFn({
      variant: 'warning',
      title: options.title || 'Warning',
      description: options.description,
      duration: options.duration || 6000,
      autoDismiss: options.autoDismiss,
    })
  }

  const info = (options: ToastNotificationOptions) => {
    return toastFn({
      variant: 'info',
      title: options.title || 'Information',
      description: options.description,
      duration: options.duration || 5000,
      autoDismiss: options.autoDismiss,
    })
  }

  const defaultToast = (options: ToastNotificationOptions) => {
    return toastFn({
      variant: 'default',
      title: options.title,
      description: options.description,
      duration: options.duration || 5000,
      autoDismiss: options.autoDismiss,
    })
  }

  // Convenience methods for common scenarios
  const showSuccess = (message: string, title?: string) => {
    return success({ title, description: message })
  }

  const showError = (message: string, title?: string) => {
    return error({ title, description: message })
  }

  const showWarning = (message: string, title?: string) => {
    return warning({ title, description: message })
  }

  const showInfo = (message: string, title?: string) => {
    return info({ title, description: message })
  }

  // Loading toast that doesn't auto-dismiss
  const showLoading = (message: string, title?: string) => {
    return toastFn({
      variant: 'default',
      title: title || 'Loading',
      description: message,
      autoDismiss: false,
    })
  }

  // Promise-based toast for async operations
  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    const loadingToast = showLoading(messages.loading)

    return promise
      .then((data) => {
        const successMessage =
          typeof messages.success === 'function' ? messages.success(data) : messages.success
        loadingToast.dismiss()
        return showSuccess(successMessage)
      })
      .catch((error) => {
        const errorMessage =
          typeof messages.error === 'function' ? messages.error(error) : messages.error
        loadingToast.dismiss()
        return showError(errorMessage)
      })
  }

  return {
    // Main toast methods
    success,
    error,
    warning,
    info,
    default: defaultToast,

    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    promise,

    // Utility methods
    dismiss,
    dismissAll: () => dismiss(),
  }
}

export default useToastNotifications
