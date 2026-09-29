import { useState, useEffect } from "react";
import { X, Key } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [key, setKey] = useState("");

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem("groq_api_key") || "";
      setKey(stored);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem("groq_api_key", key.trim());
    } else {
      localStorage.removeItem("groq_api_key");
    }
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem("groq_api_key");
    setKey("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Groq API Key
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="gsk_..."
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition mb-2"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          Local dev only: stored in your browser's localStorage and overrides{" "}
          <code className="text-xs">VITE_GROQ_API_KEY</code>. On Vercel production the app uses the
          secure <code className="text-xs">/api/summarize</code> proxy with the server-side{" "}
          <code className="text-xs">GROQ_API_KEY</code> — no browser key needed.
          Get a key at{" "}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            console.groq.com/keys
          </a>
          .
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition text-sm"
          >
            Save
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
