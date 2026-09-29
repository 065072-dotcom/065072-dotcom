import { useRef, useState } from "react";
import { FileText, Sparkles, Calendar, Type } from "lucide-react";
import { SAMPLE_TRANSCRIPT } from "@/lib/sample";

interface InputPanelProps {
  transcript: string;
  setTranscript: (v: string) => void;
  meetingDate: string;
  setMeetingDate: (v: string) => void;
  meetingTitle: string;
  setMeetingTitle: (v: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

export function InputPanel({
  transcript,
  setTranscript,
  meetingDate,
  setMeetingDate,
  meetingTitle,
  setMeetingTitle,
  onGenerate,
  loading,
}: InputPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File too large — max 5 MB.");
      e.target.value = "";
      return;
    }
    if (!/\.(txt|md)$/i.test(file.name) && file.type !== "text/plain" && file.type !== "text/markdown") {
      setFileError("Only .txt / .md files are supported.");
      e.target.value = "";
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setTranscript(reader.result as string);
    };
    reader.readAsText(file);
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const canGenerate = transcript.trim().length > 0 && !loading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Meeting Input</h2>
        <button
          onClick={() => {
            setTranscript(SAMPLE_TRANSCRIPT);
            setMeetingTitle("Q3 Product Planning Sync");
          }}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Load sample transcript
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Meeting Title
          </label>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Optional"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Meeting Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Transcript / Notes
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your meeting transcript or notes here..."
          rows={14}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y font-mono text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">{wordCount} words</span>
          {wordCount > 12000 && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Long transcript — will be chunked automatically
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          Upload .txt / .md
        </button>
        {fileName && (
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-40">
            {fileName}
          </span>
        )}
      </div>
      {fileError && (
        <p className="text-xs text-red-600 dark:text-red-400">{fileError}</p>
      )}

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Summary
          </>
        )}
      </button>
    </div>
  );
}
