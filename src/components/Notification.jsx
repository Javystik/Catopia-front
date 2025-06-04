import React, { useEffect, useState } from "react";
import { Info, AlertCircle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

const typeStyles = {
  info: {
    icon: <Info className="text-blue-500" />,
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  error: {
    icon: <AlertCircle className="text-red-500" />,
    bg: "bg-red-50",
    text: "text-red-700",
  },
  success: {
    icon: <CheckCircle2 className="text-green-500" />,
    bg: "bg-green-50",
    text: "text-green-700",
  },
};

const Notification = ({ type = "info", message, onClose, duration = 3000 }) => {
  const style = typeStyles[type] || typeStyles.info;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let autoCloseTimeout;

    const showTimeout = setTimeout(() => {
      setVisible(true);

      autoCloseTimeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
    }, 10);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(autoCloseTimeout);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <div
      onClick={handleClose}
      className={clsx(
        "flex items-center justify-between p-3 rounded-lg shadow-md max-w-md cursor-pointer transition-all duration-300 transform",
        style.bg,
        style.text,
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      <div className="flex items-center">
        <div className="mr-2">{style.icon}</div>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Notification;
