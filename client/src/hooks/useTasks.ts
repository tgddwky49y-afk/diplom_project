import { useEffect, useState } from "react";
import type { TaskInput, StudyTask } from "../types/task";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ошибка подключения";
}

export function useTasks() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTasks()
      .then((items) => {
        if (active) setTasks(items);
      })
      .catch((e: unknown) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setTasks(await getTasks());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function save(input: TaskInput): Promise<boolean> {
    setBusy(true);
    setError("");
    try {
      const saved = editingTask
        ? await updateTask(editingTask.id, input)
        : await createTask(input);
      setTasks((items) =>
        editingTask
          ? items.map((task) => (task.id === saved.id ? saved : task))
          : [saved, ...items],
      );
      setEditingTask(null);
      await refresh();
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function remove(task: StudyTask) {
    setBusy(true);
    setError("");
    try {
      await deleteTask(task.id);
      setTasks((items) => items.filter((item) => item.id !== task.id));
      if (editingTask?.id === task.id) setEditingTask(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return {
    tasks,
    editingTask,
    error,
    busy,
    loading,
    refresh,
    save,
    remove,
    edit: setEditingTask,
    cancelEdit: () => setEditingTask(null),
  };
}
