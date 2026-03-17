import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-200';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200';
      default:
        return 'bg-blue-500/20 border-blue-500/30 text-blue-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border backdrop-blur-md shadow-lg max-w-sm ${getTypeStyles()}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-current/70 hover:text-current transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;