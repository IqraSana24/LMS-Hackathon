import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');

  // Orange theme colors
  const ORANGE = '#f97316';
  const LIGHT_ORANGE = '#fff7ed';
  const DARK_ORANGE = '#ea580c';
  const BORDER_ORANGE = '#fed7aa';
  const WHITE = '#ffffff';

  useEffect(() => {
    fetchCourseDetails();
    fetchLessons();
    fetchAssignments();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
      setCourse(response.data.course);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch course details:', err);
      setError('Failed to load course details.');
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/lessons`);
      setLessons(response.data.lessons || []);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/assignments`);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: LIGHT_ORANGE, minHeight: '100vh' }}>
        Loading course...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red', backgroundColor: LIGHT_ORANGE, minHeight: '100vh' }}>
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: LIGHT_ORANGE, minHeight: '100vh' }}>
        Course not found.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: LIGHT_ORANGE, padding: '40px 20px' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        backgroundColor: WHITE, 
        borderRadius: '15px', 
        boxShadow: '0 8px 20px rgba(249, 115, 22, 0.15)', 
        padding: '40px' 
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => navigate('/student-dashboard')}
            style={{
              marginBottom: '20px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${BORDER_ORANGE}`,
              borderRadius: '6px',
              cursor: 'pointer',
              color: ORANGE,
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            ← Back to Dashboard
          </button>
          
          <h1 style={{ textAlign: 'center', marginBottom: '10px', color: DARK_ORANGE, fontSize: '32px' }}>
            {course.title}
          </h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px', fontSize: '16px' }}>
            {course.description}
          </p>
          <div style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
            <span>📅 Duration: {course.duration}</span>
            {course.instructor && <span style={{ marginLeft: '20px' }}>👨‍🏫 Instructor: {course.instructor.name}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '0',
          borderBottom: `2px solid ${BORDER_ORANGE}`
        }}>
          {['lessons', 'assignments', 'materials'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === tab ? ORANGE : 'transparent',
                color: activeTab === tab ? WHITE : '#666',
                fontWeight: '600',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'all 0.3s',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'lessons' && `📚 Lessons (${lessons.length})`}
              {tab === 'assignments' && `📝 Assignments (${assignments.length})`}
              {tab === 'materials' && `📄 Materials (${course.materials?.length || 0})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: '30px' }}>
          
          {/* LESSONS TAB */}
          {activeTab === 'lessons' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: DARK_ORANGE }}>
                📚 Course Lessons
              </h3>
              {lessons.length === 0 ? (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#888', 
                  padding: '40px', 
                  backgroundColor: LIGHT_ORANGE, 
                  borderRadius: '8px' 
                }}>
                  No lessons available yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {lessons.map((lesson, index) => (
                    <div key={lesson._id} style={{
                      padding: '20px',
                      backgroundColor: WHITE,
                      border: `2px solid ${BORDER_ORANGE}`,
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)'
                    }}>
                      <h4 style={{ margin: '0 0 15px 0', color: ORANGE, fontSize: '18px' }}>
                        Lesson {index + 1}: {lesson.title}
                      </h4>
                      <p style={{ margin: 0, color: '#666', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                        {lesson.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: DARK_ORANGE }}>
                📝 Course Assignments
              </h3>
              {assignments.length === 0 ? (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#888', 
                  padding: '40px', 
                  backgroundColor: LIGHT_ORANGE, 
                  borderRadius: '8px' 
                }}>
                  No assignments available yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {assignments.map((assignment) => (
                    <div key={assignment._id} style={{
                      padding: '20px',
                      backgroundColor: WHITE,
                      border: `2px solid ${BORDER_ORANGE}`,
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)'
                    }}>
                      <div style={{ marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: ORANGE, fontSize: '18px' }}>{assignment.title}</h4>
                      </div>
                      <p style={{ margin: '0 0 10px 0', color: '#666', lineHeight: '1.6' }}>
                        {assignment.description}
                      </p>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#888' }}>
                        {assignment.dueDate && (
                          <span>📅 Due: {formatDate(assignment.dueDate)}</span>
                        )}
                        <span>⭐ Max Score: {assignment.maxScore || 100}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: DARK_ORANGE }}>
                📄 Course Materials
              </h3>
              {!course.materials || course.materials.length === 0 ? (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#888', 
                  padding: '40px', 
                  backgroundColor: LIGHT_ORANGE, 
                  borderRadius: '8px' 
                }}>
                  No materials uploaded yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {course.materials.map((material) => (
                    <div key={material._id} style={{
                      padding: '20px',
                      backgroundColor: WHITE,
                      border: `2px solid ${BORDER_ORANGE}`,
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: ORANGE, fontSize: '16px' }}>
                          {material.fileType === 'pdf' ? '📕' : '📊'} {material.originalName}
                        </h4>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#888' }}>
                          Uploaded: {formatDate(material.uploadedAt)}
                        </p>
                      </div>
                      <a
                        href={`http://localhost:5000${material.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 16px',
                          background: `linear-gradient(to right, ${ORANGE} 0%, #fb923c 100%)`,
                          color: WHITE,
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourseView;
