const pool = require('./db');

const priorities = ['low', 'medium', 'high'];
const statuses = ['todo', 'in_progress', 'completed'];

async function getHealth() {
  await pool.query('SELECT 1');
  return { status: 'ok', message: 'Сервер и база данных работают' };
}

function getProjectInfo() {
  return {
    name: 'Учебный планировщик',
    description: 'Приложение для управления учебными проектами и задачами.',
    stage: 'Месяц 1, неделя 2',
    version: '0.2.0'
  };
}

async function getTasks() {
  const result = await pool.query(
    `SELECT id, project_id, title, description, due_date, priority, status, progress,
            created_at, updated_at
     FROM tasks
     ORDER BY (status = 'completed'), due_date NULLS LAST, id DESC`,
  );
  return result.rows;
}

async function getTask(id) {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return result.rows[0];
}

async function createTask(data) {
  const title = String(data.title || '').trim();
  const description = String(data.description || '').trim() || null;
  const dueDate = data.due_date || null;
  const priority = data.priority || 'medium';

  if (!title) {
    const error = new Error('Введите название задачи');
    error.status = 400;
    throw error;
  }
  if (!priorities.includes(priority)) {
    const error = new Error('Указан неизвестный приоритет');
    error.status = 400;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO tasks (title, description, due_date, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, dueDate, priority]
  );
  return result.rows[0];
}

async function updateTask(id, data) {
  const current = await getTask(id);
  if (!current) {
    return undefined;
  }

  const title = data.title === undefined ? current.title : String(data.title).trim();
  const description = data.description === undefined ? current.description : String(data.description).trim() || null;
  const dueDate = data.due_date === undefined ? current.due_date : data.due_date || null;
  const priority = data.priority === undefined ? current.priority : data.priority;
  const status = data.status === undefined ? current.status : data.status;
  const progress = data.progress === undefined ? current.progress : Number(data.progress);

  if (!title) {
    const error = new Error('Введите название задачи');
    error.status = 400;
    throw error;
  }
  if (!priorities.includes(priority) || !statuses.includes(status)) {
    const error = new Error('Передано неверное значение');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    const error = new Error('Прогресс должен быть от 0 до 100');
    error.status = 400;
    throw error;
  }

  const result = await pool.query(
    `UPDATE tasks
     SET title = $1, description = $2, due_date = $3, priority = $4,
         status = $5, progress = $6, updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [title, description, dueDate, priority, status, progress, id]
  );
  return result.rows[0];
}

async function deleteTask(id) {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

module.exports = {
  getHealth,
  getProjectInfo,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
