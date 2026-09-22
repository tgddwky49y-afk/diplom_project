import { useEffect, useState, type FormEvent } from 'react';
import { request, type StudyTask, type TaskInput } from './api';

const empty: TaskInput = { title: '', description: '', dueDate: null, priority: 'medium', status: 'todo', progress: 0 };
const priorities = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
const statuses = { todo: 'Не начата', in_progress: 'В работе', completed: 'Выполнена' };

export function App() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [form, setForm] = useState<TaskInput>({ ...empty });
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [health, setHealth] = useState('Проверка подключения…');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setTasks(await request<StudyTask[]>('/api/tasks')); }
    finally { setLoading(false); }
  }
  function showError(e: unknown) {
    setError(e instanceof Error ? e.message : 'Ошибка подключения');
  }
  useEffect(() => {
    load().catch(showError);
    request<{message: string}>('/api/health').then(x => setHealth(x.message))
      .catch(() => setHealth('Нет подключения к серверу или SQL Server'));
  }, []);
  function reset() { setForm({ ...empty }); setEditId(null); }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) { setError('Введите название задачи'); return; }
    setBusy(true); setError('');
    try {
      await request(editId ? '/api/tasks/' + editId : '/api/tasks', editId ? 'PUT' : 'POST', form);
      reset();
      await load();
    } catch (e) { showError(e); }
    finally { setBusy(false); }
  }
  async function remove(task: StudyTask) {
    if (!confirm('Удалить задачу «' + task.title + '»?')) return;
    setBusy(true); setError('');
    try {
      await request('/api/tasks/' + task.id, 'DELETE');
      if (editId === task.id) reset();
      await load();
    } catch (e) { showError(e); }
    finally { setBusy(false); }
  }
  function edit(task: StudyTask) {
    setEditId(task.id);
    setForm({ title: task.title, description: task.description, dueDate: task.dueDate,
      priority: task.priority, status: task.status, progress: task.progress });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  return <main>
    <header><h1>Учебный планировщик</h1><p>Задачи, сроки и прогресс · Неделя 2</p></header>
    <p className="connection" role="status">{health}</p>
    {error && <p className="error" role="alert">{error}</p>}
    <section>
      <h2>{editId ? 'Редактирование задачи' : 'Новая задача'}</h2>
      <form onSubmit={save}>
        <fieldset disabled={busy}>
          <label>Название<input required maxLength={150} value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <label>Описание<textarea maxLength={2000} value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <div className="row">
            <label>Срок<input type="date" value={form.dueDate || ''}
              onChange={e => setForm({ ...form, dueDate: e.target.value || null })} /></label>
            <label>Приоритет<select value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value as TaskInput['priority'] })}>
              {Object.entries(priorities).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
            </select></label>
            <label>Статус<select value={form.status}
              onChange={e => {
                const status = e.target.value as TaskInput['status'];
                setForm({ ...form, status, progress: status === 'completed' ? 100 : Math.min(form.progress, 99) });
              }}>
              {Object.entries(statuses).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
            </select></label>
            <label>Прогресс, %<input type="number" min="0" max="100" required value={form.progress}
              onChange={e => {
                const progress = Number(e.target.value);
                setForm({ ...form, progress, status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'todo' });
              }} /></label>
          </div>
          <button type="submit">{busy ? 'Сохранение…' : editId ? 'Сохранить' : 'Добавить'}</button>
          {editId && <button type="button" className="secondary" onClick={reset}>Отмена</button>}
        </fieldset>
      </form>
    </section>
    <section>
      <div className="heading"><h2>Задачи ({tasks.length})</h2>
        <button disabled={busy || loading} onClick={() => { setError(''); load().catch(showError); }}>Обновить</button></div>
      {loading ? <p role="status">Загрузка…</p> : !tasks.length ? <p>Пока нет задач. Добавьте первую.</p> :
        tasks.map(task => <article key={task.id} className={task.status === 'completed' ? 'completed' : ''}>
          <h3>{task.title}</h3><p className="description">{task.description}</p>
          <p>{task.dueDate ? task.dueDate.split('-').reverse().join('.') : 'Без срока'} · {priorities[task.priority]} приоритет · {statuses[task.status]}</p>
          <label>Прогресс: {task.progress}% <progress max="100" value={task.progress} /></label>
          <button disabled={busy || loading} onClick={() => edit(task)}>Изменить</button>
          <button disabled={busy || loading} className="danger" onClick={() => remove(task)}>Удалить</button>
        </article>)}
    </section>
    <footer>Учебный проект · БВ411</footer>
  </main>;
}

