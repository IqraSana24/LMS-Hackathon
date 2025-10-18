import React from 'react';

const Dashboard = () => {
  // You can read the role from localStorage here, as set in LoginPage.jsx
  const role = localStorage.getItem('role') || 'Student';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
      <h1>Welcome to the LMS Portal Dashboard!</h1>
      <h2>Hello, {user.name || 'User'} 👋</h2>
      <p>Your current role is: <strong>{role}</strong></p>
      
      {/* Example links based on role */}
      {role === 'Teacher' && (
        <a href="/create-course" style={{ display: 'block', marginTop: '20px', color: '#1e40af' }}>
          Go to Create Course Page
        </a>
      )}
      
      <p style={{ marginTop: '30px', color: '#666' }}>
        This is your central hub for course management and learning.
      </p>
    </div>
  );
};

export default Dashboard;