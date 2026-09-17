const taskForm = document.querySelector('#task-form');
const taskList = document.querySelector('#task-list');
const tasksMessage = document.querySelector('#tasks-message');
const formMessage = document.querySelector('#form-message');
const refreshButton = document.querySelector('#refresh-button');
const serverStatus = document.querySelector('#server-status');

const priorityNames = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }
  return data;
}

function formatDate(value) {
  if (!value) return 'Без срока';
  return new Date(value).toLocaleDateString('ru-RU');
}

function createTaskCard(task) {
  const card = document.createElement('article');
  card.className = `task ${task.status === 'completed' ? 'completed' : ''}`;

  const text = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = task.title;
  const details = document.createElement('p');
  details.textContent = `${priorityNames[task.priority]} приоритет · ${formatDate(task.due_date)}`;
  text.append(title, details);

  if (task.description) {
    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = task.description;
    text.append(description);
  }

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const completeButton = document.createElement('button');
  completeButton.type = 'button';
  completeButton.className = 'secondary';
  completeButton.textContent = task.status === 'completed' ? 'Вернуть' : 'Выполнено';
  completeButton.addEventListener('click', () => toggleTask(task));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'danger';
  deleteButton.textContent = 'Удалить';
  deleteButton.addEventListener('click', () => removeTask(task.id));

  actions.append(completeButton, deleteButton);
  card.append(text, actions);
  return card;
}

async function loadTasks() {
  tasksMessage.textContent = 'Загружаем задачи…';
  taskList.replaceChildren();

  try {
    const tasks = await request('/api/tasks');
    tasksMessage.textContent = tasks.length ? '' : 'Задач пока нет.';
    taskList.append(...tasks.map(createTaskCard));
  } catch (error) {
    tasksMessage.textContent = error.message;
    tasksMessage.className = 'error';
  }
}

async function toggleTask(task) {
  const completed = task.status !== 'completed';
  await request(`/api/tasks/${task.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: completed ? 'completed' : 'todo',
      progress: completed ? 100 : 0
    })
  });
  await loadTasks();
}

async function removeTask(id) {
  await request(`/api/tasks/${id}`, { method: 'DELETE' });
  await loadTasks();
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = 'Сохраняем…';

  const formData = new FormData(taskForm);
  try {
    await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData))
    });
    taskForm.reset();
    formMessage.textContent = 'Задача добавлена';
    formMessage.className = 'message success';
    await loadTasks();
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.className = 'message error';
  }
});

refreshButton.addEventListener('click', loadTasks);

async function checkServer() {
  try {
    const data = await request('/api/health');
    serverStatus.textContent = data.message;
    serverStatus.className = 'success';
  } catch {
    serverStatus.textContent = 'Нет подключения. Проверьте сервер, PostgreSQL и файл .env.';
    serverStatus.className = 'error';
  }
}

checkServer();
loadTasks();

