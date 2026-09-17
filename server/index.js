const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

const { routes, controllers } = require('./routes');

const port = Number(process.env.PORT || 3000);
const clientFolder = path.join(__dirname, '..', 'client');

const pages = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/style.css': { file: 'style.css', type: 'text/css; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'text/javascript; charset=utf-8' }
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  const parts = [];
  let size = 0;

  for await (const part of req) {
    size += part.length;
    if (size > 1_000_000) {
      const error = new Error('Запрос слишком большой');
      error.status = 413;
      throw error;
    }
    parts.push(part);
  }

  if (parts.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(parts).toString('utf8'));
  } catch {
    const error = new Error('Некорректный JSON');
    error.status = 400;
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const address = url.pathname;
    const taskMatch = address.match(/^\/api\/tasks\/(\d+)$/);

    if (req.method === 'GET' && address === routes.health) {
      sendJson(res, 200, await controllers.getHealth());
      return;
    }

    if (req.method === 'GET' && address === routes.info) {
      sendJson(res, 200, controllers.getProjectInfo());
      return;
    }

    if (req.method === 'GET' && address === routes.tasks) {
      sendJson(res, 200, await controllers.getTasks());
      return;
    }

    if (req.method === 'POST' && address === routes.tasks) {
      sendJson(res, 201, await controllers.createTask(await readJson(req)));
      return;
    }

    if (taskMatch && req.method === 'GET') {
      const task = await controllers.getTask(Number(taskMatch[1]));
      sendJson(res, task ? 200 : 404, task || { error: 'Задача не найдена' });
      return;
    }

    if (taskMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
      const task = await controllers.updateTask(Number(taskMatch[1]), await readJson(req));
      sendJson(res, task ? 200 : 404, task || { error: 'Задача не найдена' });
      return;
    }

    if (taskMatch && req.method === 'DELETE') {
      const deleted = await controllers.deleteTask(Number(taskMatch[1]));
      sendJson(res, deleted ? 200 : 404, deleted ? { message: 'Задача удалена' } : { error: 'Задача не найдена' });
      return;
    }

    if (req.method === 'GET' && Object.hasOwn(pages, address)) {
      const page = pages[address];
      const content = await fs.readFile(path.join(clientFolder, page.file));
      res.writeHead(200, { 'Content-Type': page.type });
      res.end(content);
      return;
    }

    sendJson(res, 404, { error: 'Адрес не найден' });
  } catch (error) {
    console.error('Ошибка обработки запроса:', error.message);
    sendJson(res, error.status || 500, {
      error: error.status ? error.message : 'Внутренняя ошибка сервера'
    });
  }
});

server.on('error', (error) => {
  console.error('Не удалось запустить сервер:', error.message);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Планировщик открыт по адресу http://localhost:${port}`);
});

