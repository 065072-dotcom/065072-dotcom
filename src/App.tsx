import { useState, useEffect, useCallback } from "react";
import { Settings, Moon, Sun, Zap, FileStack } from "lucide-react";
import { InputPanel } from "@/components/InputPanel";
import { SummaryCard } from "@/components/SummaryCard";
import { ActionItemsTable } from "@/components/ActionItemsTable";
import { ExportToolbar } from "@/components/ExportToolbar";
import { HistorySidebar } from "@/components/HistorySidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { Toast } from "@/components/Toast";
import { generateSummary, GroqError } from "@/lib/groq";
import { loadHistory, saveToHistory, deleteFromHistory } from "@/lib/export";
import type { ActionItem, MeetingResult, SavedMeeting } from "@/types";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function emptyResult(): MeetingResult {
  return { summary: "", key_decisions: [], open_questions: [], action_items: [] };
}

function App() {
  const [transcript, setTranscript] = useState("");
  const [meetingDate, setMeetingDate] = useState(todayStr());
  const [meetingTitle, setMeetingTitle] = useState("");
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<SavedMeeting[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("actionpoint_dark");
    if (saved === "true" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
    }
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("actionpoint_dark", String(dark));
  }, [dark]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateSummary(transcript, meetingDate, meetingTitle);
      setResult(res);
      setItems(res.action_items);
      const entry: SavedMeeting = {
        id: `meeting-${Date.now()}`,
        title: meetingTitle || "Untitled Meeting",
        date: meetingDate,
        result: res,
        transcript,
        createdAt: Date.now(),
      };
      setHistory(saveToHistory(entry));
      showToast("Summary generated successfully");
    } catch (e) {
      if (e instanceof GroqError) {
        setError(e.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = (entry: SavedMeeting) => {
    setTranscript(entry.transcript);
    setMeetingDate(entry.date);
    setMeetingTitle(entry.title);
    setResult(entry.result);
    setItems(entry.result.action_items);
    setError(null);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(deleteFromHistory(id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">
                ActionPoint
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                Meeting notes → action items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* History sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20">
              <HistorySidebar
                history={history}
                onLoad={handleLoadHistory}
                onDelete={handleDeleteHistory}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile history toggle */}
            <details className="lg:hidden mb-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FileStack className="w-4 h-4" />
                History ({history.length})
              </summary>
              <div className="mt-3">
                <HistorySidebar
                  history={history}
                  onLoad={handleLoadHistory}
                  onDelete={handleDeleteHistory}
                />
              </div>
            </details>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input column */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <InputPanel
                  transcript={transcript}
                  setTranscript={setTranscript}
                  meetingDate={meetingDate}
                  setMeetingDate={setMeetingDate}
                  meetingTitle={meetingTitle}
                  setMeetingTitle={setMeetingTitle}
                  onGenerate={handleGenerate}
                  loading={loading}
                />
              </div>

              {/* Results column */}
              <div className="flex flex-col gap-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                )}

                {!loading && !result && !error && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      How ActionPoint works
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                      Paste a meeting transcript on the left, set the meeting date, and click Generate.
                      You'll get a summary, key decisions, open questions, and an editable action items
                      table you can export in multiple formats.
                    </p>
                  </div>
                )}

                {!loading && result && (
                  <>
                    <SummaryCard result={result} />
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                      <ExportToolbar
                        items={items}
                        result={{ ...result, action_items: items }}
                        meetingTitle={meetingTitle}
                        meetingDate={meetingDate}
                        onToast={showToast}
                      />
                      <div className="mt-4">
                        <ActionItemsTable items={items} setItems={setItems} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default App;
