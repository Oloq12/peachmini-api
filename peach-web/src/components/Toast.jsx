import { toast as hotToast } from 'react-hot-toast';

const TOAST_STYLES = {
  base: {
    borderRadius: '12px',
    padding: '16px',
    fontSize: '14px',
    fontWeight: '500',
    maxWidth: '420px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
  },
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff'
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff'
  },
  info: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    color: '#fff'
  },
  warning: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fff'
  }
};

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️'
};

export const toast = {
  success: (message, options = {}) => {
    return hotToast.success(message, {
      icon: ICONS.success,
      style: { ...TOAST_STYLES.base, ...TOAST_STYLES.success },
      duration: options.duration || 3000,
      ...options
    });
  },
  
  error: (message, options = {}) => {
    return hotToast.error(message, {
      icon: ICONS.error,
      style: { ...TOAST_STYLES.base, ...TOAST_STYLES.error },
      duration: options.duration || 4000,
      ...options
    });
  },
  
  info: (message, options = {}) => {
    return hotToast(message, {
      icon: ICONS.info,
      style: { ...TOAST_STYLES.base, ...TOAST_STYLES.info },
      duration: options.duration || 3000,
      ...options
    });
  },
  
  warning: (message, options = {}) => {
    return hotToast(message, {
      icon: ICONS.warning,
      style: { ...TOAST_STYLES.base, ...TOAST_STYLES.warning },
      duration: options.duration || 3500,
      ...options
    });
  },
  
  loading: (message, options = {}) => {
    return hotToast.loading(message, {
      style: { ...TOAST_STYLES.base, ...TOAST_STYLES.info },
      ...options
    });
  },
  
  promise: hotToast.promise,
  dismiss: hotToast.dismiss
};

export default toast;

