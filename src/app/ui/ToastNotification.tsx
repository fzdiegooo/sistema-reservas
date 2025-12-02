

import React from "react";

interface ToastProps {
  /** Texto del mensaje de la notificación */
  message: string;
  /** Tipo de notificación: 'success' para verde, 'error' para rojo. */
  type: "success" | "error";
  /** Función para cerrar/ocultar el Toast */
  onClose: () => void;
  /** Booleano para controlar si el toast es visible */
  isVisible: boolean;
}

const ToastNotification: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  isVisible,
}) => {
  if (!isVisible) return null;

  // Clases base y específicas de color
  const baseClasses =
    "fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 ease-in-out transform";

  const colorClasses =
    type === "success"
      ? "bg-green-600 border border-green-700 text-white"
      : "bg-rose-600 border border-rose-700 text-white";

  const icon = type === "success" ? "✅" : "❌";

  return (
    <div
      className={`${baseClasses} ${colorClasses} ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <p className="text-sm font-medium">{message}</p>
        <button
          type="button"
          className="ml-auto text-white/80 hover:text-white transition"
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;