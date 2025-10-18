import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api.js'; 
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);
    setMessage('');

    try {
        console.log('Attempting Staff/Admin Login with:', formData.email);
        
        const response = await loginUser(formData);

        if (!response.user) {
            throw new Error('Invalid response from server. Missing user data.');
        }

        const user = response.user;
        const role = user.role || 'Staff';

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', role);
        localStorage.setItem('isLoggedIn', 'true');
        
        setMessage(`Login successful as ${role}! Redirecting...`);
        
        // 2. Role-Based Redirection
        let redirectPath; 
        
        // FIX: Redirect all staff roles to the new TeacherDashboard homepage
       if (role === 'Teacher' || role === 'Admin' || role === 'Staff') {
            redirectPath = '/teacher-dashboard'; 
        } else {
             // Fallback for unexpected roles
            redirectPath = '/staff/dashboard'; 
        }

        setTimeout(() => {
            navigate(redirectPath); 
        }, 1000);

    } catch (error) {
        const errorMessage = error.message.includes('Failed to fetch') 
            ? 'Could not connect to the server.' 
            : error.message;

        console.error('Login Error:', errorMessage);
        setMessage(`❌ Error: ${errorMessage}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        
        <h2 className="login-title">Admin/Staff Login</h2> 
        
        {/* Existing student link */}
        <div className="student-login-prompt">
          Are you a student? 
          <a href="/login/student" className="student-login-link">Login here</a>
        </div>
        
        {/* NEW CODE: Link to Registration Form */}
        <div className="student-login-prompt" style={{ marginTop: '10px', fontSize: '15px' }}>
          New User? 
          <a href="/register" className="student-login-link" style={{ marginLeft: '5px' }}>Register an account</a>
        </div>
        {/* End NEW CODE */}

        {/* Message Display (Success/Error) */}
        {message && (
            <div className={`message ${message.includes('successful') ? 'message-success' : 'message-error'}`}>
                {message}
            </div>
        )}

        <form onSubmit={handleSubmit} className="login-form-content">
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Password"
            />
          </div>

          <div className="password-links">
            <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
            <a href="/activation-link" className="activation-link">Get Activation Link</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn login-btn-primary"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;
