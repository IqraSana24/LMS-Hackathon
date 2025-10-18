import React, { useState, useEffect } from 'react';
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
  const [showEmailRegistration, setShowEmailRegistration] = useState(false);

  // Load Google Sign-In script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) return;
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };
    
    loadGoogleScript();
  }, []);

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

  // Handle Google Sign-Up
  const handleGoogleSignUp = async () => {
    try {
      if (!window.google) {
        setMessage('Google Sign-In is loading. Please try again in a moment.');
        return;
      }

      // Configure Google Sign-In
      window.google.accounts.id.initialize({
        // INSTRUCTION: Replace the line below with your Google Client ID from:
        // https://console.cloud.google.com/ → Credentials → OAuth 2.0 Client IDs
        // Example: client_id: '123456789-abc123.apps.googleusercontent.com',
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // ← REPLACE THIS
        callback: handleGoogleCallback,
        auto_select: false, // Don't auto-select for registration
      });

      // Show account chooser
      window.google.accounts.id.prompt();
      
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      setMessage('❌ Google Sign-Up failed. Please try email registration.');
    }
  };

  // Callback after Google authentication
  const handleGoogleCallback = async (response) => {
    try {
      setLoading(true);
      setMessage('Registering with Google...');

      // Decode the JWT token to get user info
      const userInfo = parseJwt(response.credential);
      
      console.log('Google User Info:', userInfo);

      // Send to backend for registration
      const backendResponse = await fetch('http://localhost:5000/api/google-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: response.credential,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          role: formData.role || 'Student' // Use selected role or default to Student
        })
      });

      if (!backendResponse.ok) {
        const errBody = await backendResponse.json().catch(() => ({}));
        throw new Error(errBody.error || 'Google registration failed');
      }

      const data = await backendResponse.json();
      
      setMessage(`✅ Registration successful! Welcome ${userInfo.name}! Redirecting...`);
      
      // Redirect to appropriate login page
      setTimeout(() => {
        navigate(formData.role === 'Student' ? '/login/student' : '/login');
      }, 1500);

    } catch (error) {
      console.error('Google Registration Error:', error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to decode JWT
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {};
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

        {/* OR Divider */}
        <div className="or-divider">
          <span className="or-text">OR</span>
        </div>

        {/* Continue with Google Button */}
        <button
          className="btn google-register-btn"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Email and Password Button */}
        <button
          className="btn email-register-btn"
          onClick={() => setShowEmailRegistration(!showEmailRegistration)}
        >
          <svg className="email-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Email and password
        </button>

        <div className="login-link">
          Already have an account? <a className="link-secondary" href="/">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
