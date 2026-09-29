import { Download, Copy, FileJson, FileText, FileCode } from "lucide-react";
import type { ActionItem, MeetingResult } from "@/types";
import {
  downloadCSV,
  downloadMarkdownChecklist,
  copyToClipboard,
  downloadJSON,
  downloadFullMarkdown,
} from "@/lib/export";

interface ExportToolbarProps {
  items: ActionItem[];
  result: MeetingResult;
  meetingTitle: string;
  meetingDate: string;
  onToast: (msg: string) => void;
}

export function ExportToolbar({
  items,
  result,
  meetingTitle,
  meetingDate,
  onToast,
}: ExportToolbarProps) {
  const handleCSV = () => {
    downloadCSV(items, meetingTitle);
    onToast("CSV downloaded");
  };
  const handleMd = () => {
    downloadMarkdownChecklist(items);
    onToast("Markdown checklist downloaded");
  };
  const handleCopy = async () => {
    try {
      await copyToClipboard(items);
      onToast("Copied to clipboard");
    } catch {
      onToast("Failed to copy");
    }
  };
  const handleJSON = () => {
    downloadJSON(result, meetingTitle, meetingDate);
    onToast("JSON downloaded");
  };
  const handleFullMd = () => {
    downloadFullMarkdown(result, meetingTitle, meetingDate);
    onToast("Full summary downloaded");
  };

  const btnClass =
    "px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 text-sm font-medium";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">Export:</span>
      <button onClick={handleCSV} className={btnClass}>
        <Download className="w-4 h-4" />
        CSV
      </button>
      <button onClick={handleMd} className={btnClass}>
        <FileText className="w-4 h-4" />
        Checklist
      </button>
      <button onClick={handleCopy} className={btnClass}>
        <Copy className="w-4 h-4" />
        Copy
      </button>
      <button onClick={handleJSON} className={btnClass}>
        <FileJson className="w-4 h-4" />
        JSON
      </button>
      <button onClick={handleFullMd} className={btnClass}>
        <FileCode className="w-4 h-4" />
        Full .md
      </button>
    </div>
  );
}
