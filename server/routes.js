const { getHealth, getProjectInfo } = require('./controllers');

// Маршрут связывает адрес запроса с контроллером.
const routes = {
  '/api/health': getHealth,
  '/api/info': getProjectInfo
};

module.exports = routes;
