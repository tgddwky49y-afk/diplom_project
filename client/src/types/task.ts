export interface TaskInput {
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed";
  progress: number;
}
export interface StudyTask extends TaskInput {
  id: number;
}
