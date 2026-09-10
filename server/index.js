const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const routes = require('./routes');

const port = Number(process.env.PORT || 3000);
const clientFolder = path.join(__dirname, '..', 'client');

// Отдаём только перечисленные файлы клиентской части.
const pages = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/style.css': { file: 'style.css', type: 'text/css; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'text/javascript; charset=utf-8' }
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const address = url.pathname;

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      sendJson(res, 405, { error: 'Этот метод пока не поддерживается' });
      return;
    }

    if (Object.hasOwn(routes, address)) {
      sendJson(res, 200, routes[address]());
      return;
    }

    if (Object.hasOwn(pages, address)) {
      const page = pages[address];
      const content = await fs.readFile(path.join(clientFolder, page.file));
      res.writeHead(200, { 'Content-Type': page.type });
      res.end(content);
      return;
    }

    sendJson(res, 404, { error: 'Адрес не найден' });
  } catch (error) {
    console.error('Ошибка обработки запроса:', error.message);
    sendJson(res, 500, { error: 'Внутренняя ошибка сервера' });
  }
});

server.on('error', (error) => {
  console.error('Не удалось запустить сервер:', error.message);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Планировщик открыт по адресу http://localhost:${port}`);
});
