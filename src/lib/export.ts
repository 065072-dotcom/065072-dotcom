import type { ActionItem, MeetingResult, SavedMeeting } from "@/types";

function escapeCSV(value: string): string {
  const v = value ?? "";
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function downloadCSV(items: ActionItem[], meetingTitle: string): void {
  const headers = ["Task", "Owner", "Due Date", "Priority", "Status", "Meeting Title"];
  const rows = items.map((item) => [
    escapeCSV(item.task),
    escapeCSV(item.owner || "Unassigned"),
    escapeCSV(item.due_date || "No date"),
    escapeCSV(item.priority),
    escapeCSV(item.done ? "Done" : "Pending"),
    escapeCSV(meetingTitle),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  triggerDownload(csv, "action-items.csv", "text/csv");
}

export function itemsToMarkdown(items: ActionItem[]): string {
  return items
    .map((item) => {
      const check = item.done ? "x" : " ";
      const owner = item.owner || "Unassigned";
      const due = item.due_date || "No date";
      return `- [${check}] ${item.task} — @${owner} — due ${due} [${item.priority}]`;
    })
    .join("\n");
}

export function downloadMarkdownChecklist(items: ActionItem[]): void {
  const md = itemsToMarkdown(items);
  triggerDownload(md, "action-items-checklist.md", "text/markdown");
}

export async function copyToClipboard(items: ActionItem[]): Promise<void> {
  const md = itemsToMarkdown(items);
  await navigator.clipboard.writeText(md);
}

export function downloadJSON(result: MeetingResult, meetingTitle: string, meetingDate: string): void {
  const payload = {
    meetingTitle,
    meetingDate,
    ...result,
  };
  triggerDownload(JSON.stringify(payload, null, 2), "meeting-summary.json", "application/json");
}

export function downloadFullMarkdown(result: MeetingResult, meetingTitle: string, meetingDate: string): void {
  const lines: string[] = [];
  lines.push(`# ${meetingTitle || "Untitled Meeting"}`);
  lines.push(`**Date:** ${meetingDate}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(result.summary);
  lines.push("");
  lines.push("## Key Decisions");
  if (result.key_decisions.length) {
    result.key_decisions.forEach((d) => lines.push(`- ${d}`));
  } else {
    lines.push("- None identified");
  }
  lines.push("");
  lines.push("## Open Questions");
  if (result.open_questions.length) {
    result.open_questions.forEach((q) => lines.push(`- ${q}`));
  } else {
    lines.push("- None identified");
  }
  lines.push("");
  lines.push("## Action Items");
  lines.push(itemsToMarkdown(result.action_items));
  lines.push("");
  triggerDownload(lines.join("\n"), "meeting-full-summary.md", "text/markdown");
}

function triggerDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const HISTORY_KEY = "actionpoint_history";
const MAX_HISTORY = 10;

export function loadHistory(): SavedMeeting[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedMeeting[];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: SavedMeeting): SavedMeeting[] {
  const history = loadHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function deleteFromHistory(id: string): SavedMeeting[] {
  const history = loadHistory().filter((m) => m.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}
