const fs = require('node:fs/promises');
const path = require('node:path');

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

const pool = require('./db');

async function migrate() {
  const filePath = path.join(__dirname, '..', 'database', '001_init.sql');
  const sql = await fs.readFile(filePath, 'utf8');

  await pool.query(sql);
  console.log('Таблицы базы данных созданы');
}

migrate()
  .catch((error) => {
    console.error('Не удалось выполнить миграцию:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

