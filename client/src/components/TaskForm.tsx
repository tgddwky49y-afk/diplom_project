import { useState, type FormEvent } from "react";
import type { TaskInput, StudyTask } from "../types/task";
import { empty, priorities, statuses } from "../data/taskOptions";

interface Props {
  initialTask: StudyTask | null;
  disabled: boolean;
  onSave: (input: TaskInput) => Promise<boolean>;
  onCancel: () => void;
}

export function TaskForm({ initialTask, disabled, onSave, onCancel }: Props) {
  const [form, setForm] = useState<TaskInput>(() =>
    initialTask
      ? {
          title: initialTask.title,
          description: initialTask.description,
          dueDate: initialTask.dueDate,
          priority: initialTask.priority,
          status: initialTask.status,
          progress: initialTask.progress,
        }
      : { ...empty },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setForm({ ...empty });
    setError("");
    onCancel();
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (disabled || saving) return;
    if (!form.title.trim()) {
      setError("Введите название задачи");
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (await onSave(form)) setForm({ ...empty });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2>{initialTask ? "Редактирование задачи" : "Новая задача"}</h2>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={save}>
        <fieldset disabled={disabled || saving}>
          <label>
            Название
            <input
              required
              maxLength={150}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            Описание
            <textarea
              maxLength={2000}
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div className="row">
            <label>
              Срок
              <input
                type="date"
                value={form.dueDate || ""}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value || null })
                }
              />
            </label>
            <label>
              Приоритет
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value as TaskInput["priority"],
                  })
                }
              >
                {Object.entries(priorities).map(([key, text]) => (
                  <option key={key} value={key}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Статус
              <select
                value={form.status}
                onChange={(e) => {
                  const status = e.target.value as TaskInput["status"];
                  setForm({
                    ...form,
                    status,
                    progress:
                      status === "completed"
                        ? 100
                        : Math.min(form.progress, 99),
                  });
                }}
              >
                {Object.entries(statuses).map(([key, text]) => (
                  <option key={key} value={key}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Прогресс, %
              <input
                type="number"
                min="0"
                max="100"
                required
                value={form.progress}
                onChange={(e) => {
                  const progress = Number(e.target.value);
                  setForm({
                    ...form,
                    progress,
                    status:
                      progress === 100
                        ? "completed"
                        : progress > 0
                          ? "in_progress"
                          : "todo",
                  });
                }}
              />
            </label>
          </div>
          <button type="submit">
            {saving ? "Сохранение…" : initialTask ? "Сохранить" : "Добавить"}
          </button>
          {initialTask && (
            <button type="button" className="secondary" onClick={reset}>
              Отмена
            </button>
          )}
        </fieldset>
      </form>
    </section>
  );
}
