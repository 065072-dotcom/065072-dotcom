import { CheckCircle2, HelpCircle, ClipboardList } from "lucide-react";
import type { MeetingResult } from "@/types";

interface SummaryCardProps {
  result: MeetingResult;
}

export function SummaryCard({ result }: SummaryCardProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Summary
        </h3>
        <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{result.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Key Decisions
            </h3>
          </div>
          {result.key_decisions.length > 0 ? (
            <ul className="space-y-2">
              {result.key_decisions.map((d, i) => (
                <li key={i} className="flex gap-2 text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                  {d}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">None identified</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Open Questions
            </h3>
          </div>
          {result.open_questions.length > 0 ? (
            <ul className="space-y-2">
              {result.open_questions.map((q, i) => (
                <li key={i} className="flex gap-2 text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">?</span>
                  {q}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">None identified</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Action Items ({result.action_items.length})
          </h3>
        </div>
      </div>
    </div>
  );
}
