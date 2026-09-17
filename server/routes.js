const controllers = require('./controllers');

const routes = {
  health: '/api/health',
  info: '/api/info',
  tasks: '/api/tasks'
};

module.exports = { routes, controllers };

