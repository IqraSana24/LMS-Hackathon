import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setMessage('Please fill all required fields.');
      return;
    }

    if (!formData.role) {
      setMessage('Please select a role.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Send registration to backend. Use a separate endpoint for students so student data
      // is stored separately in the backend.
      const endpoint = formData.role === 'Student' ? '/api/register-student' : '/api/register';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.fullName, email: formData.email, password: formData.password })
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        // Use the error property from the backend body, which may now contain the Mongoose error message
        throw new Error(errBody.error || 'Registration failed'); 
      }

  await resp.json().catch(() => null);
  setMessage(`Registration successful as ${formData.role}! Redirecting to login...`);

      // If student, redirect to student login page, otherwise to admin/staff login
      setTimeout(() => navigate(formData.role === 'Student' ? '/login/student' : '/login'), 1000);
    } catch (err) {
      setMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page-container">
      <div className="registration-card">
        {/* CORRECTION 1: Change "Create your account" to "LMS Portal" */}
        <h2 className="card-title">LMS Portal</h2> 

        {message && (
          <div className={`message ${message.includes('successful') ? 'message-success' : 'message-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-input"
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input form-select"
            >
              <option>Student</option>
              <option>Teacher</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="example@domain.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Repeat password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering…' : 'Create your account'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <a className="link-secondary" href="/">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
