// Simple mock API utility for authentication

// Calls the backend /api/login endpoint for admin/staff
export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error('Email and password are required');

  const resp = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || 'Login failed');
  }

  return resp.json();
}

// Calls the backend /api/login-student endpoint for students
export async function loginStudent({ email, password }) {
  if (!email || !password) throw new Error('Email and password are required');

  const resp = await fetch('/api/login-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || 'Student login failed');
  }

  return resp.json();
}
