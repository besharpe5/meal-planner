// src/context/ToastContext.jsx
import { createContext, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const TYPE_STYLES = {
  success: {
    wrap: "border-green-200 bg-green-50",
    bar: "bg-green-500",
    progress: "bg-green-500/70",
    icon: "✅",
    fallbackTitle: "Success",
  },
  error: {
    wrap: "border-red-200 bg-red-50",
    bar: "bg-red-500",
    progress: "bg-red-500/70",
    icon: "❌",
    fallbackTitle: "Error",
  },
  info: {
    wrap: "border-blue-200 bg-blue-50",
    bar: "bg-blue-500",
    progress: "bg-blue-500/70",
    icon: "ℹ️",
    fallbackTitle: "Info",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  };

  /**
   * addToast({
   *   type: "success" | "error" | "info",
   *   title?: string,
   *   message?: string,
   *   duration?: number,
   *   action?: { label: string, onClick: () => void | Promise<void> }
   * })
   */
  const addToast = ({
    title,
    message,
    type = "success",
    duration = 3000,
    action,
  }) => {
    const id = makeId();
    const createdAt = Date.now();

    const toast = {
      id,
      title,
      message,
      type,
      duration,
      createdAt,
      action,
    };

    setToasts((prev) => [toast, ...prev].slice(0, 4)); // max 4 visible

    const timer = setTimeout(() => removeToast(id), duration);
    timers.current.set(id, timer);

    return id;
  };

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed z-[9999] pointer-events-none inset-x-0 bottom-3 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto px-3 sm:px-0">
      <div className="flex flex-col gap-2 sm:w-[380px]">
        {toasts.map((t) => {
          const s = TYPE_STYLES[t.type] || TYPE_STYLES.info;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-xl shadow-lg border p-3 ${s.wrap}`}
            >
              <div className="flex items-stretch gap-3">
                {/* Accent bar (Option 1) */}
                <div className={`w-1 rounded-full ${s.bar}`} />

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span className="truncate">
                          {t.title || s.fallbackTitle}
                        </span>
                      </div>

                      {t.message ? (
                        <div className="text-sm text-gray-800 mt-1 break-words">
                          {t.message}
                        </div>
                      ) : null}

                      {/* Action button (Option 3) */}
                      {t.action ? (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await t.action.onClick();
                            } finally {
                              onClose(t.id);
                            }
                          }}
                          className="mt-2 text-sm font-semibold text-gray-900 underline hover:no-underline"
                        >
                          {t.action.label}
                        </button>
                      ) : null}
                    </div>

                    <button
                      onClick={() => onClose(t.id)}
                      className="text-gray-500 hover:text-gray-900"
                      aria-label="Close toast"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Progress bar (Option 2) */}
                  <div className="mt-3 h-1 w-full bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.progress}`}
                      style={{
                        width: "100%",
                        transformOrigin: "left",
                        animation: `toast-shrink ${t.duration}ms linear forwards`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
