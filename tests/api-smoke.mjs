// Запускать при работающем API с отдельной учебной базой.
import assert from 'node:assert/strict';
const base = process.env.API_URL || 'http://localhost:5080';
let id;
async function call(path, method = 'GET', data) {
  return fetch(base + path, {
    method, signal: AbortSignal.timeout(20000),
    headers: data ? {'Content-Type':'application/json'} : undefined,
    body: data ? JSON.stringify(data) : undefined
  });
}
const input = {title: 'Smoke test ' + Date.now(), description: 'temporary', dueDate: '2026-12-20',
  priority: 'high', status: 'todo', progress: 0};
try {
  assert.equal((await call('/api/health')).status, 200, 'SQL Server health');
  const created = await call('/api/tasks', 'POST', input);
  assert.equal(created.status, 201, 'Create');
  id = (await created.json()).id;
  assert.ok(id > 0);
  assert.equal((await call('/api/tasks/' + id)).status, 200, 'Read');
  const list = await (await call('/api/tasks')).json();
  assert.ok(list.some(x => x.id === id), 'List');
  const updated = await call('/api/tasks/' + id, 'PUT', {...input, title:'Changed', status:'completed', progress:100});
  assert.equal(updated.status, 200, 'Update');
  const persisted = await (await call('/api/tasks/' + id)).json();
  assert.equal(persisted.title, 'Changed');
  assert.equal(persisted.progress, 100);
  assert.equal(persisted.dueDate, input.dueDate);
  assert.equal((await call('/api/tasks', 'POST', {...input, title:' '})).status, 400, 'Validation');
  assert.equal((await call('/api/tasks/' + id, 'PUT', {...input, progress:101})).status, 400);
  assert.equal((await call('/api/tasks/' + id, 'DELETE')).status, 204, 'Delete');
  assert.equal((await call('/api/tasks/' + id)).status, 404, 'Missing after delete');
  id = undefined;
  console.log('PASS: SQL Server CRUD and validation');
} finally {
  if (id) {
    const cleanup = await call('/api/tasks/' + id, 'DELETE');
    if (![204,404].includes(cleanup.status)) throw new Error('Could not clean temporary task ' + id);
  }
}

