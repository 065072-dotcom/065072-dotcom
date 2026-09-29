import { Plus, Trash2, ArrowUpDown, Check } from "lucide-react";
import type { ActionItem, Priority } from "@/types";

interface ActionItemsTableProps {
  items: ActionItem[];
  setItems: (items: ActionItem[]) => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function ActionItemsTable({ items, setItems }: ActionItemsTableProps) {
  const updateItem = (id: string, field: keyof ActionItem, value: string | boolean) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addRow = () => {
    const newItem: ActionItem = {
      id: `item-${Date.now()}`,
      task: "",
      owner: "",
      due_date: "",
      priority: "Medium",
      done: false,
    };
    setItems([...items, newItem]);
  };

  const deleteRow = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const sortByDueDate = () => {
    const sorted = [...items].sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
    setItems(sorted);
  };

  const sortByPriority = () => {
    const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
    const sorted = [...items].sort((a, b) => order[a.priority] - order[b.priority]);
    setItems(sorted);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={addRow}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
        <button
          onClick={sortByDueDate}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowUpDown className="w-4 h-4" />
          Sort by Due Date
        </button>
        <button
          onClick={sortByPriority}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowUpDown className="w-4 h-4" />
          Sort by Priority
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-left">
              <th className="px-3 py-2.5 w-10 text-gray-600 dark:text-gray-400 font-medium">
                <span className="sr-only">Done</span>
              </th>
              <th className="px-3 py-2.5 text-gray-600 dark:text-gray-400 font-medium">Task</th>
              <th className="px-3 py-2.5 w-32 text-gray-600 dark:text-gray-400 font-medium">Owner</th>
              <th className="px-3 py-2.5 w-36 text-gray-600 dark:text-gray-400 font-medium">Due Date</th>
              <th className="px-3 py-2.5 w-28 text-gray-600 dark:text-gray-400 font-medium">Priority</th>
              <th className="px-3 py-2.5 w-10 text-gray-600 dark:text-gray-400 font-medium">
                <span className="sr-only">Delete</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400 dark:text-gray-500">
                  No action items yet. Add a row or generate from a transcript.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => updateItem(item.id, "done", !item.done)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      item.done
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"
                    }`}
                    aria-label={item.done ? "Mark as not done" : "Mark as done"}
                  >
                    {item.done && <Check className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.task}
                    onChange={(e) => updateItem(item.id, "task", e.target.value)}
                    className={`w-full bg-transparent text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 ${
                      item.done ? "line-through text-gray-400 dark:text-gray-500" : ""
                    }`}
                    aria-label="Task"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.owner}
                    onChange={(e) => updateItem(item.id, "owner", e.target.value)}
                    placeholder="Unassigned"
                    className={`w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 ${
                      !item.owner
                        ? "text-amber-600 dark:text-amber-400 italic placeholder-amber-600 dark:placeholder-amber-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                    aria-label="Owner"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={item.due_date}
                    onChange={(e) => updateItem(item.id, "due_date", e.target.value)}
                    className={`w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 ${
                      !item.due_date
                        ? "text-amber-600 dark:text-amber-400 italic"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                    aria-label="Due date"
                  />
                  {!item.due_date && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">No date</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.priority}
                    onChange={(e) => updateItem(item.id, "priority", e.target.value)}
                    className={`w-full rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}
                    aria-label="Priority"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => deleteRow(item.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                    aria-label="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
