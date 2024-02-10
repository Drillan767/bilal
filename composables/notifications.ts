import { toast } from 'vue3-toastify'

export default function useNotification() {
    const displaySuccess = (message: string) => toast.success(message)
    const displayError = (message: string) => toast.error(message)

    return {
        displaySuccess,
        displayError,
    }
}
