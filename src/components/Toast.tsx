import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (message) {
      const t = setTimeout(onDismiss, 2500);
      return () => clearTimeout(t);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-lg">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
