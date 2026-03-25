"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const colors = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl text-white shadow-2xl text-sm font-medium ${colors[type]}`}
    >
      <span className="text-lg">{icons[type]}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-3 text-white opacity-70 hover:opacity-100 text-lg"
      >
        ×
      </button>
    </div>
  );
}