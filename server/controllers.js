// Контроллер готовит данные для ответа на запрос.
function getHealth() {
  return { status: 'ok', message: 'Сервер работает' };
}

function getProjectInfo() {
  return {
    name: 'Учебный планировщик',
    description: 'Приложение для управления учебными проектами и задачами.',
    stage: 'Месяц 1, неделя 1',
    version: '0.1.0'
  };
}

module.exports = { getHealth, getProjectInfo };
