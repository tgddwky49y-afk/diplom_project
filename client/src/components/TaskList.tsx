import type { StudyTask } from "../types/task";
import { priorities, statuses } from "../data/taskOptions";

interface Props {
  tasks: StudyTask[];
  loading: boolean;
  busy: boolean;
  onRefresh: () => void;
  onEdit: (task: StudyTask) => void;
  onDelete: (task: StudyTask) => void;
}

export function TaskList({
  tasks,
  loading,
  busy,
  onRefresh,
  onEdit,
  onDelete,
}: Props) {
  return (
    <section>
      <div className="heading">
        <h2>Задачи ({tasks.length})</h2>
        <button disabled={busy || loading} onClick={onRefresh}>
          Обновить
        </button>
      </div>
      {loading ? (
        <p role="status">Загрузка…</p>
      ) : !tasks.length ? (
        <p>Пока нет задач. Добавьте первую.</p>
      ) : (
        tasks.map((task) => (
          <article
            key={task.id}
            className={task.status === "completed" ? "completed" : ""}
          >
            <h3>{task.title}</h3>
            <p className="description">{task.description}</p>
            <p>
              {task.dueDate
                ? task.dueDate.split("-").reverse().join(".")
                : "Без срока"}{" "}
              · {priorities[task.priority]} приоритет · {statuses[task.status]}
            </p>
            <label>
              Прогресс: {task.progress}%{" "}
              <progress max="100" value={task.progress} />
            </label>
            <button disabled={busy || loading} onClick={() => onEdit(task)}>
              Изменить
            </button>
            <button
              disabled={busy || loading}
              className="danger"
              onClick={() => onDelete(task)}
            >
              Удалить
            </button>
          </article>
        ))
      )}
    </section>
  );
}
