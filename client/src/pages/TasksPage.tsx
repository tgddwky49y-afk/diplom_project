import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { useTasks } from "../hooks/useTasks";

export function TasksPage() {
  const planner = useTasks();
  return (
    <>
      {planner.error && (
        <p className="error" role="alert">
          {planner.error}
        </p>
      )}
      <TaskForm
        key={planner.editingTask?.id ?? "new"}
        initialTask={planner.editingTask}
        disabled={planner.busy || planner.loading}
        onSave={planner.save}
        onCancel={planner.cancelEdit}
      />
      <TaskList
        tasks={planner.tasks}
        loading={planner.loading}
        busy={planner.busy}
        onRefresh={planner.refresh}
        onEdit={(task) => {
          planner.edit(task);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onDelete={(task) => {
          if (window.confirm("Удалить задачу «" + task.title + "»?")) {
            void planner.remove(task);
          }
        }}
      />
    </>
  );
}
