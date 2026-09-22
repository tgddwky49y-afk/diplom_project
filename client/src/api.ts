export interface TaskInput {
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  progress: number;
}
export interface StudyTask extends TaskInput { id: number }

export async function request<T>(path: string, method = 'GET', body?: TaskInput): Promise<T> {
  const response = await fetch(path, {
    method, signal: AbortSignal.timeout(15000),
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const errors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
    throw new Error(errors || data.message || (response.status >= 500
      ? 'Сервер или база данных недоступны. Проверьте запуск и миграции.'
      : 'Не удалось выполнить запрос (' + response.status + ').'));
  }
  return response.status === 204 ? undefined as T : response.json();
}

