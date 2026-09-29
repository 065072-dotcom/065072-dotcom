export type Priority = "High" | "Medium" | "Low";

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  due_date: string;
  priority: Priority;
  done: boolean;
}

export interface GroqActionItem {
  task: string;
  owner: string | null;
  due_date: string | null;
  priority: Priority;
}

export interface MeetingResult {
  summary: string;
  key_decisions: string[];
  open_questions: string[];
  action_items: ActionItem[];
}

export interface GroqResponse {
  summary: string;
  key_decisions: string[];
  open_questions: string[];
  action_items: GroqActionItem[];
}

export interface SavedMeeting {
  id: string;
  title: string;
  date: string;
  result: MeetingResult;
  transcript: string;
  createdAt: number;
}
