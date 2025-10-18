const fetch = require('node-fetch');

async function run() {
  const base = 'http://localhost:5000';

  // Register student
  let r = await fetch(base + '/api/register-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Student', email: 'stud@example.com', password: 's3cret' })
  });
  console.log('/api/register-student', r.status);
  console.log(await r.json().catch(() => null));

  // Student login
  r = await fetch(base + '/api/login-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'stud@example.com', password: 's3cret' })
  });
  console.log('/api/login-student', r.status);
  console.log(await r.json().catch(() => null));

  // Register staff
  r = await fetch(base + '/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Staff Member', email: 'staff@example.com', password: 'staffpass' })
  });
  console.log('/api/register', r.status);
  console.log(await r.json().catch(() => null));

  // Staff login
  r = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'staff@example.com', password: 'staffpass' })
  });
  console.log('/api/login', r.status);
  console.log(await r.json().catch(() => null));
}

run().catch(e => console.error(e));
