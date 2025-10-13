import { toast as hotToast } from 'react-hot-toast';

const TOAST_STYLES = {
  base: {
    borderRadius: '20px',
    padding: '16px 20px',
    fontSize: '14px',
    fontWeight: '500',
    maxWidth: '420px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  },
  success: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#fff'
  },
  error: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fff'
  },
  info: {
    background: 'rgba(255, 134, 200, 0.2)',
    color: '#fff'
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.2)',
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

