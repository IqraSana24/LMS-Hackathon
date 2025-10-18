import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCourse = () => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    duration: '',
    instructorId: '' // This will be set from localStorage
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load instructorId from localStorage when component mounts
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id) {
      setCourseData(prev => ({ ...prev, instructorId: user._id }));
    } else {
      setMessage("Error: Instructor not logged in. Please log in as a teacher.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!courseData.instructorId) {
      setMessage("Error: Instructor ID is missing. Cannot create course.");
      setLoading(false);
      return;
    }

    try {
      // Create the course
      const courseResponse = await axios.post('http://localhost:5000/api/courses', courseData);
      const newCourseId = courseResponse.data.course._id;
      
      setMessage('Course created successfully!');
      
      // Redirect to the Manage Content page for the newly created course
      setTimeout(() => {
        navigate(`/teacher/manage-course/${newCourseId}`); 
      }, 1500); 
      
    } catch (error) {
      console.error('Course creation failed:', error.response ? error.response.data : error.message);
      setMessage(`Error creating course: ${error.response ? error.response.data.error || error.response.data.message : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#fff7ed', // Light orange background
      padding: '40px 20px'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '40px', 
        border: `1px solid #fed7aa`, 
        borderRadius: '15px', 
        boxShadow: '0 8px 20px rgba(249, 115, 22, 0.15)', 
        backgroundColor: '#ffffff' 
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/teacher-dashboard')}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #fed7aa',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#f97316',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ textAlign: 'center', marginBottom: '15px', color: '#ea580c', fontSize: '32px' }}>Create New Course</h1>
        <p style={{ textAlign: 'center', color: '#9a3412', marginBottom: '30px', fontSize: '15px' }}>
          Define the title, description, and expected duration of the course.
        </p>

        {message && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px', 
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: message.includes('Error') ? '#fee2e2' : '#d1fae5',
            color: message.includes('Error') ? '#991b1b' : '#065f46', 
            fontWeight: '500',
            border: message.includes('Error') ? '1px solid #fca5a5' : '1px solid #86efac'
          }}>
            {message}
          </div>
        )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#9a3412', fontSize: '15px' }}>Course Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={courseData.title}
            onChange={handleChange}
            placeholder="e.g., Basics of Python"
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #fed7aa', 
              borderRadius: '8px', 
              fontSize: '15px', 
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#f97316';
              e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#fed7aa';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#9a3412', fontSize: '15px' }}>Description</label>
          <textarea
            id="description"
            name="description"
            value={courseData.description}
            onChange={handleChange}
            placeholder="Provide a detailed course summary."
            required
            rows="5"
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #fed7aa', 
              borderRadius: '8px', 
              fontSize: '15px', 
              boxSizing: 'border-box', 
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#f97316';
              e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#fed7aa';
              e.target.style.boxShadow = 'none';
            }}
          ></textarea>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label htmlFor="duration" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#9a3412', fontSize: '15px' }}>Duration</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={courseData.duration}
            onChange={handleChange}
            placeholder="e.g., 6 Weeks, Self-Paced"
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #fed7aa', 
              borderRadius: '8px', 
              fontSize: '15px', 
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#f97316';
              e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#fed7aa';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '15px', 
            background: 'linear-gradient(to right, #f97316 0%, #fb923c 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '18px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer', 
            opacity: loading ? 0.7 : 1, 
            transition: 'transform 0.2s, box-shadow 0.3s',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(249, 115, 22, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)';
          }}
        >
          {loading ? 'Creating Course...' : 'Create Course'}
        </button>
      </form>
      </div>
    </div>
  );
};

export default CreateCourse;
