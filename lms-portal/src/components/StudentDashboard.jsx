// src/components/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('courses');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolling, setEnrolling] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate();

  // Orange Theme Colors
  const ORANGE = '#f97316';
  const LIGHT_ORANGE = '#fff7ed';
  const DARK_ORANGE = '#ea580c';
  const BORDER_ORANGE = '#fed7aa';
  const WHITE = '#ffffff';

  useEffect(() => {
    fetchAvailableCourses();
    fetchEnrolledCourses();
    checkNotifications();
    checkDeadlines();
    
    // Check for new notifications every 5 minutes
    const interval = setInterval(() => {
      checkNotifications();
      checkDeadlines();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Get logged-in user's name
  const getUserName = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.name || 'Student';
  };

  const fetchAvailableCourses = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:5000/api/courses');
      setCourses(response.data.courses || []);
      
    } catch (err) {
      console.error('Failed to fetch courses:', err.response || err);
      setError('Failed to load courses. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled courses for the student
  const fetchEnrolledCourses = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user._id;
    
    if (!studentId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${studentId}/enrolled-courses`);
      setEnrolledCourses(response.data.enrolledCourses || []);
    } catch (err) {
      console.error('Failed to fetch enrolled courses:', err);
    }
  };

  // Handle course enrollment
  const handleEnrollNow = async (courseId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user._id;
    
    if (!studentId) {
      alert('Please log in to enroll in courses');
      return;
    }
    
    // Check if already enrolled
    const isEnrolled = enrolledCourses.some(
      enrollment => enrollment.courseId && enrollment.courseId._id === courseId
    );
    
    if (isEnrolled) {
      // Navigate to course view if already enrolled
      navigate(`/student/course/${courseId}`);
      return;
    }
    
    setEnrolling(courseId);
    
    try {
      const response = await axios.post('http://localhost:5000/api/enroll', {
        studentId,
        courseId
      });
      
      // Update enrolled courses list
      await fetchEnrolledCourses();
      
      // Navigate to course view page
      navigate(`/student/course/${courseId}`);
    } catch (err) {
      console.error('Enrollment error:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Failed to enroll in course. Please try again.');
      }
    } finally {
      setEnrolling(null);
    }
  };

  // Check if a course is enrolled
  const isCourseEnrolled = (courseId) => {
    return enrolledCourses.some(
      enrollment => enrollment.courseId && enrollment.courseId._id === courseId
    );
  };

  // Fetch notification count
  const checkNotifications = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user._id;
    
    if (!studentId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${studentId}/notifications`);
      setUnreadNotificationCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  };

  // Check for upcoming assignment deadlines
  const checkDeadlines = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user._id;
    
    if (!studentId) return;
    
    try {
      await axios.post(`http://localhost:5000/api/students/${studentId}/check-deadlines`);
      checkNotifications(); // Refresh notification count
    } catch (err) {
      console.error('Failed to check deadlines:', err);
    }
  };

  // Get student ID
  const getStudentId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id;
  };

  // Function to calculate end date based on duration
  const calculateEndDate = (duration) => {
    const startDate = new Date();
    let weeks = 0;
    
    // Parse duration string (e.g., "6 weeks", "8 weeks, self-paced")
    const match = duration.match(/(\d+)\s*week/i);
    if (match) {
      weeks = parseInt(match[1]);
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (weeks * 7));
    
    return endDate;
  };

  // Function to format date as "1 Sep, 25"
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month}, ${year}`;
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff7ed' }}>Loading courses...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red', backgroundColor: '#fff7ed' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: LIGHT_ORANGE }}>
      {/* Top Navigation Bar */}
      <div style={{
        backgroundColor: WHITE,
        borderBottom: `1px solid ${BORDER_ORANGE}`,
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
        <div 
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            cursor: 'pointer',
            fontSize: '24px',
            color: '#666',
            position: 'relative'
          }}
        >
          🔔
          {unreadNotificationCount > 0 && (
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#dc2626',
              color: WHITE,
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </div>
          )}
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
            onMouseOver={e => e.currentTarget.style.backgroundColor = LIGHT_ORANGE}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: ORANGE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: WHITE,
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
              backgroundColor: WHITE,
              border: `1px solid ${BORDER_ORANGE}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '150px',
              overflow: 'hidden',
              zIndex: 1000
            }}>
              <div
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/student-profile');
                }}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: `1px solid ${BORDER_ORANGE}`,
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = LIGHT_ORANGE}
                onMouseOut={e => e.currentTarget.style.backgroundColor = WHITE}
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
                onMouseOver={e => e.currentTarget.style.backgroundColor = LIGHT_ORANGE}
                onMouseOut={e => e.currentTarget.style.backgroundColor = WHITE}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div style={{ display: 'flex', flex: 1 }}>
      {/* Left Sidebar Navigation */}
      <div style={{
        width: '250px',
        backgroundColor: WHITE,
        borderRight: `1px solid ${BORDER_ORANGE}`,
        padding: '20px',
        boxShadow: '2px 0 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ color: ORANGE, fontSize: '24px', margin: '0' }}>LMS Portal</h2>
        </div>
        
        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            to="/"
            style={{
              padding: '12px 15px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#666',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s'
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = LIGHT_ORANGE;
              e.currentTarget.style.color = ORANGE;
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#666';
            }}
          >
            <span style={{ fontSize: '20px' }}>🏠</span>
            <span>Home</span>
          </Link>

          <div
            style={{
              padding: '12px 15px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#666',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: activeTab === 'dashboard' ? LIGHT_ORANGE : 'transparent',
              color: activeTab === 'dashboard' ? ORANGE : '#666',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => setActiveTab('dashboard')}
            onMouseOver={e => {
              if (activeTab !== 'dashboard') {
                e.currentTarget.style.backgroundColor = LIGHT_ORANGE;
                e.currentTarget.style.color = ORANGE;
              }
            }}
            onMouseOut={e => {
              if (activeTab !== 'dashboard') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>📊</span>
            <span>Dashboard</span>
          </div>

          <div
            style={{
              padding: '12px 15px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: activeTab === 'courses' ? ORANGE : '#666',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: activeTab === 'courses' ? LIGHT_ORANGE : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => setActiveTab('courses')}
            onMouseOver={e => {
              if (activeTab !== 'courses') {
                e.currentTarget.style.backgroundColor = LIGHT_ORANGE;
                e.currentTarget.style.color = ORANGE;
              }
            }}
            onMouseOut={e => {
              if (activeTab !== 'courses') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>📚</span>
            <span>Courses</span>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto'
        }}>
          <h1 style={{ marginBottom: '30px', color: DARK_ORANGE }}>Available Courses</h1>
          
          <p style={{ color: '#9a3412', marginBottom: '40px' }}>
            Welcome! Browse and select from the courses below ({courses.length}).
          </p>

          {courses.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#777' }}>No courses are currently available.</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '20px' 
            }}>
              {courses.map(course => {
                const startDate = new Date();
                const endDate = calculateEndDate(course.duration);
                
                return (
                  <div key={course._id} style={{ 
                    backgroundColor: WHITE,
                    border: `1px solid ${BORDER_ORANGE}`, 
                    borderLeft: `5px solid ${ORANGE}`,
                    padding: '20px', 
                    borderRadius: '10px',
                    boxShadow: '0 2px 5px rgba(249, 115, 22, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '380px',
                    maxWidth: '380px'
                  }}>
                    <h3 style={{ margin: '0 0 10px 0', color: ORANGE, fontSize: '18px' }}>{course.title}</h3>
                    <p style={{ 
                      margin: '0', 
                      color: '#666', 
                      fontSize: '14px',
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>{course.description}</p>
                    
                    {/* Duration with Start and End Dates */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      margin: '0 0 10px 0',
                      padding: '12px',
                      backgroundColor: LIGHT_ORANGE,
                      borderRadius: '6px'
                    }}>
                      {/* Start Date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <div style={{
                          width: '35px',
                          height: '35px',
                          backgroundColor: WHITE,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2px solid ${ORANGE}`,
                          flexShrink: 0
                        }}>
                          <span style={{ fontSize: '16px' }}>📅</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                            {formatDate(startDate)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#888' }}>Start Date</div>
                        </div>
                      </div>
                      
                      {/* End Date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <div style={{
                          width: '35px',
                          height: '35px',
                          backgroundColor: WHITE,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2px solid ${ORANGE}`,
                          flexShrink: 0
                        }}>
                          <span style={{ fontSize: '16px' }}>📅</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                            {formatDate(endDate)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#888' }}>End Date</div>
                        </div>
                      </div>
                    </div>

                    <p style={{ margin: '8px 0', fontSize: '12px', color: '#888' }}>
                      <span style={{ fontWeight: 'bold' }}>Duration:</span> {course.duration}
                      {course.instructor && course.instructor.name && (
                          <span style={{ display: 'block', marginTop: '4px' }}><span style={{ fontWeight: 'bold' }}>Taught By:</span> {course.instructor.name}</span>
                      )}
                    </p>
                    
                    <button 
                      onClick={() => handleEnrollNow(course._id)}
                      disabled={enrolling === course._id}
                      style={{
                        marginTop: 'auto',
                        background: isCourseEnrolled(course._id)
                          ? '#10b981' // Green for enrolled
                          : enrolling === course._id 
                            ? '#ccc' 
                            : `linear-gradient(to right, ${ORANGE} 0%, #fb923c 100%)`,
                        color: 'white',
                        border: 'none',
                        padding: '10px 15px',
                        borderRadius: '6px',
                        cursor: isCourseEnrolled(course._id) ? 'pointer' : enrolling === course._id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                        width: '100%'
                      }}
                    >
                      {isCourseEnrolled(course._id) 
                        ? '✓ Enrolled' 
                        : enrolling === course._id 
                          ? 'Enrolling...' 
                          : 'Enroll Now'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Courses & Badges Stats */}
      <div style={{
        width: '220px',
        backgroundColor: WHITE,
        borderLeft: `1px solid ${BORDER_ORANGE}`,
        padding: '30px 15px',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ color: DARK_ORANGE, fontSize: '18px', marginBottom: '20px' }}>Courses & Badges</h2>
        
        {/* Stats Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Courses Enrolled */}
          <div style={{
            padding: '12px',
            backgroundColor: LIGHT_ORANGE,
            borderRadius: '8px',
            border: `1px solid ${BORDER_ORANGE}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📖</span>
              <span style={{ color: '#666', fontWeight: '500', fontSize: '13px' }}>Courses Enrolled</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: ORANGE, textAlign: 'center' }}>{enrolledCourses.length}</span>
          </div>

          {/* Courses Completed */}
          <div style={{
            padding: '12px',
            backgroundColor: LIGHT_ORANGE,
            borderRadius: '8px',
            border: `1px solid ${BORDER_ORANGE}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <span style={{ color: '#666', fontWeight: '500', fontSize: '13px' }}>Courses Completed</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: ORANGE, textAlign: 'center' }}>0</span>
          </div>

          {/* Badges */}
          <div style={{
            padding: '12px',
            backgroundColor: LIGHT_ORANGE,
            borderRadius: '8px',
            border: `1px solid ${BORDER_ORANGE}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🏅</span>
              <span style={{ color: '#666', fontWeight: '500', fontSize: '13px' }}>Badges</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: ORANGE, textAlign: 'center' }}>0</span>
          </div>

          {/* Super Badges */}
          <div style={{
            padding: '12px',
            backgroundColor: LIGHT_ORANGE,
            borderRadius: '8px',
            border: `1px solid ${BORDER_ORANGE}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⭐</span>
              <span style={{ color: '#666', fontWeight: '500', fontSize: '13px' }}>Super Badges</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: ORANGE, textAlign: 'center' }}>0</span>
          </div>
        </div>
      </div>
      </div>
      
      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          checkNotifications(); // Refresh count when closing
        }}
        studentId={getStudentId()}
      />
    </div>
  );
};

export default StudentDashboard;