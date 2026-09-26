import type { TaskInput, StudyTask } from "../types/task";
import { request } from "./http";
export async function getTasks(): Promise<StudyTask[]> {
  return request("/api/tasks");
}

export async function createTask(task: TaskInput): Promise<StudyTask> {
  return request("/api/tasks", "POST", task);
}

export async function updateTask(
  id: number,
  task: TaskInput,
): Promise<StudyTask> {
  return request("/api/tasks/" + id, "PUT", task);
}

export async function deleteTask(id: number): Promise<void> {
  await request("/api/tasks/" + id, "DELETE");
}
