// src/components/ViewStudentCourseContent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewStudentCourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch details of the specific course including its materials
      // This uses the /api/courses endpoint that fetches all courses, then filters.
      // For large number of courses, a dedicated /api/courses/:id endpoint would be better.
      const response = await axios.get(`http://localhost:5000/api/courses`);
      const specificCourse = response.data.courses.find(c => c._id === courseId);
      
      if (specificCourse) {
        setCourse(specificCourse);
      } else {
        setError("Course not found.");
      }
    } catch (err) {
      console.error('Failed to fetch course details:', err.response || err);
      setError('Failed to load course details. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading course content...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>;
  if (!course) return <div style={{ textAlign: 'center', padding: '50px' }}>Course data not available.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e40af' }}>Content for: {course.title}</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Explore the materials provided by your instructor.</p>

      <h3 style={{ marginBottom: '20px', color: '#333' }}>Course Materials ({course.materials.length})</h3>
      {course.materials.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>No materials available for this course yet.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {course.materials.map(material => (
            <li key={material._id} style={{ 
              backgroundColor: '#f9f9f9', 
              border: '1px solid #eee', 
              padding: '15px', 
              marginBottom: '10px', 
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                  {material.fileType.toUpperCase()}:
                </span> {material.originalName} 
                <a 
                  href={`http://localhost:5000${material.filePath}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ marginLeft: '10px', color: '#1e40af', textDecoration: 'none', fontSize: '0.9em' }}
                >
                  (View)
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={() => navigate('/student-dashboard')}
          style={{
            backgroundColor: '#6c757d', // Grey
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em'
          }}
        >
          Back to Course List
        </button>
      </div>
    </div>
  );
};

export default ViewStudentCourseContent;