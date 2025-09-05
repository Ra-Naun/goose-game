import { toast, type ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

type NotificationType = "error" | "success" | "info" | "warning";

interface NotificationPayload {
  message: string;
  type?: NotificationType;
  options?: ToastOptions;
}

interface IUserNotificationService {
  notify(payload: NotificationPayload): void;
  showError(message: string, options?: ToastOptions): void;
  showSuccess(message: string, options?: ToastOptions): void;
  showInfo(message: string, options?: ToastOptions): void;
  showWarning(message: string, options?: ToastOptions): void;
}

export const UserNotificationService: IUserNotificationService = {
  notify({ message, type = "info", options = {} }) {
    switch (type) {
      case "error":
        this.showError(message, options);
        break;
      case "success":
        this.showSuccess(message, options);
        break;
      case "warning":
        this.showWarning(message, options);
        break;
      default:
        this.showInfo(message, options);
    }
  },
  showError(message, options) {
    toast.error(message, { ...defaultOptions, ...options });
  },
  showSuccess(message, options) {
    toast.success(message, { ...defaultOptions, ...options });
  },
  showInfo(message, options) {
    toast.info(message, { ...defaultOptions, ...options });
  },
  showWarning(message, options) {
    toast.warning(message, { ...defaultOptions, ...options });
  },
};
