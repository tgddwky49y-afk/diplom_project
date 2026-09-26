import { ConnectionStatus } from "./components/ConnectionStatus";
import { TasksPage } from "./pages/TasksPage";

export function App() {
  return (
    <main>
      <header>
        <h1>Учебный планировщик</h1>
        <p>Задачи, сроки и прогресс · Неделя 2</p>
      </header>
      <ConnectionStatus />
      <TasksPage />
      <footer>Учебный проект · БВ411</footer>
    </main>
  );
}
