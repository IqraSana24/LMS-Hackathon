// src/components/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // --- Theme Colors for Consistency ---
  const PRIMARY_LINK_BLUE = '#f97316'; // Orange for links
  const HEADING_COLOR = '#ea580c'; // Deep Orange for headings
  const CARD_BACKGROUND = '#fff7ed'; // Light orange (Main Container Background)
  const COURSE_CARD_TINT = '#ffffff'; // Pure white for course cards
  const BORDER_COLOR = '#fed7aa'; // Soft orange for borders/accents
  const BUTTON_GRADIENT = 'linear-gradient(to right, #f97316 0%, #fb923c 100%)'; // Orange gradient
  const BUTTON_GRADIENT_HOVER = 'linear-gradient(to right, #ea580c 0%, #f97316 100%)';
  const SUCCESS_GREEN = '#f97316'; // Changed to orange to match theme
  // --- End Theme Colors ---


  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  // Get logged-in teacher's name
  const getUserName = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.name || 'Teacher';
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchTeacherCourses = async () => {
    setLoading(true);
    setError('');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const instructorId = user._id;

    if (!instructorId) {
      setError("Instructor ID not found. Redirecting to login.");
      setLoading(false);
      setTimeout(() => navigate('/'), 1000); 
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/courses/instructor/${instructorId}`);
      setCourses(response.data.courses || []); 
    } catch (err) {
      console.error('Failed to fetch courses:', err.response || err);
      setError('Failed to load courses. Please check the backend connection and endpoint.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', backgroundColor: CARD_BACKGROUND }}>Loading courses...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red', backgroundColor: CARD_BACKGROUND }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: CARD_BACKGROUND }}>
      {/* Top Navigation Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: `1px solid ${BORDER_COLOR}`,
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Notification Bell */}
        <div style={{
          cursor: 'pointer',
          fontSize: '24px',
          color: '#666',
          position: 'relative'
        }}>
          🔔
        </div>

        {/* Cart Icon */}
        <div style={{
          cursor: 'pointer',
          fontSize: '24px',
          color: '#666'
        }}>
          🛒
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '8px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = CARD_BACKGROUND}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: PRIMARY_LINK_BLUE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              👤
            </div>
            <span style={{ fontWeight: '500', color: '#333' }}>{getUserName()}</span>
            <span style={{ fontSize: '12px', color: '#666' }}>▼</span>
          </div>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '10px',
              backgroundColor: '#ffffff',
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '150px',
              overflow: 'hidden',
              zIndex: 1000
            }}>
              <div
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/teacher-profile');
                }}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = CARD_BACKGROUND}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Profile
              </div>
              <div
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  color: '#dc2626'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = CARD_BACKGROUND}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '50px auto', 
        padding: '40px', 
        borderRadius: '15px', 
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
        backgroundColor: CARD_BACKGROUND,
        width: '100%'
      }}>
      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        borderBottom: `2px solid ${BORDER_COLOR}`,
        paddingBottom: '10px'
      }}>
        <Link 
          to="/" 
          style={{
            padding: '10px 20px',
            textDecoration: 'none',
            color: '#666',
            fontWeight: '500',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = PRIMARY_LINK_BLUE;
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
        >
          Home
        </Link>
        <div
          style={{
            padding: '10px 20px',
            textDecoration: 'none',
            color: PRIMARY_LINK_BLUE,
            fontWeight: '600',
            borderRadius: '6px 6px 0 0',
            backgroundColor: '#fff',
            borderBottom: `3px solid ${PRIMARY_LINK_BLUE}`
          }}
        >
          Dashboard
        </div>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: HEADING_COLOR }}>Teacher Dashboard</h1>
      
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <Link 
          to="/create-course" 
          style={{ 
            display: 'inline-block', 
            padding: '12px 25px', 
            background: BUTTON_GRADIENT, // Purple/Blue Gradient Button
            color: 'white', // Text is white
            textDecoration: 'none', 
            borderRadius: '8px', 
            fontSize: '1.1em',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(249, 115, 22, 0.4)',
            transition: 'transform 0.2s',
          }}
          // Basic hover effect for interactivity
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          + Create New Course
        </Link>
      </div>

      <h2 style={{ marginBottom: '25px', color: HEADING_COLOR, borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Courses You Created ({courses.length})</h2>
      {courses.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>You haven't created any courses yet. Click "Create New Course" above!</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px', 
          padding: '10px' 
        }}>
          {courses.map(course => (
            <div key={course._id} style={{ 
              backgroundColor: COURSE_CARD_TINT, // Lighter rose pink/white blend for content cards
              border: `1px solid ${BORDER_COLOR}`,
              borderLeft: `5px solid ${BORDER_COLOR}`, // Strong left border for accent
              padding: '20px', 
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '250px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
            }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: PRIMARY_LINK_BLUE }}>{course.title}</h3> 
                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.95em', flexGrow: 1 }}>
                  {course.description.length > 120 ? course.description.substring(0, 117) + '...' : course.description}
                </p>
                <p style={{ margin: '0', fontSize: '0.85em', color: '#888' }}>Duration: {course.duration}</p>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Link to={`/teacher/manage-course/${course._id}`} style={{
                  backgroundColor: SUCCESS_GREEN, // Keep green for success/management action
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: '0.9em',
                  fontWeight: '600'
                }}>
                  Manage Content
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
