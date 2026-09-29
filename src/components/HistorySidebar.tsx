import { useState } from "react";
import { History, ChevronLeft, ChevronRight, Trash2, Clock } from "lucide-react";
import type { SavedMeeting } from "@/types";

interface HistorySidebarProps {
  history: SavedMeeting[];
  onLoad: (entry: SavedMeeting) => void;
  onDelete: (id: string) => void;
}

export function HistorySidebar({ history, onLoad, onDelete }: HistorySidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        aria-label="Expand history"
      >
        <ChevronRight className="w-5 h-5" />
        <History className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">History</h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">({history.length})</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          aria-label="Collapse history"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          Your last 10 generated meetings will appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="group rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-indigo-300 dark:hover:border-indigo-600 transition cursor-pointer bg-white dark:bg-gray-800"
              onClick={() => onLoad(entry)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {entry.title || "Untitled Meeting"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{entry.date}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      · {entry.result.action_items.length} items
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition p-1"
                  aria-label="Delete from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
