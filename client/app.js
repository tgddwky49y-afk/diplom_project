const statusText = document.querySelector('#server-status');
const checkButton = document.querySelector('#check-button');

async function checkServer() {
  checkButton.disabled = true;
  statusText.className = '';
  statusText.textContent = 'Проверяем подключение…';

  try {
    // fetch отправляет запрос из браузера на наш сервер.
    const response = await fetch('/api/health', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error('Ошибка ответа сервера');
    }
    const data = await response.json();
    if (data.status !== 'ok') {
      throw new Error('Неожиданный ответ сервера');
    }
    statusText.textContent = data.message;
    statusText.className = 'success';
  } catch (error) {
    statusText.textContent = 'Нет связи с сервером. Проверьте, запущен ли он, и повторите попытку.';
    statusText.className = 'error';
  } finally {
    checkButton.disabled = false;
  }
}

checkButton.addEventListener('click', checkServer);
checkServer();
