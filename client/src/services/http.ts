export async function request(path: string, method = "GET", body?: unknown) {
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
