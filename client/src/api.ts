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

async function request(path: string, method = "GET", body?: TaskInput) {
  const response = await fetch(path, {
    method,
    signal: AbortSignal.timeout(15000),
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const errors = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";
    throw new Error(
      errors ||
        data.message ||
        (response.status >= 500
          ? "Сервер или база данных недоступны. Проверьте запуск и миграции."
          : "Не удалось выполнить запрос (" + response.status + ")."),
    );
  }
  if (response.status === 204) {
    return;
  }
  return response.json();
}

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

export async function getHealth(): Promise<{ message: string }> {
  return request("/api/health");
}
