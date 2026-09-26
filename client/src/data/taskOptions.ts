import type { TaskInput } from "../types/task";
export const empty: TaskInput = {
  title: "",
  description: "",
  dueDate: null,
  priority: "medium",
  status: "todo",
  progress: 0,
};
export const priorities = { low: "Низкий", medium: "Средний", high: "Высокий" };
export const statuses = {
  todo: "Не начата",
  in_progress: "В работе",
  completed: "Выполнена",
};
