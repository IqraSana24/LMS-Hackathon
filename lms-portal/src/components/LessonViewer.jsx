import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LessonViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Orange theme colors
  const ORANGE = '#f97316';
  const LIGHT_ORANGE = '#fff7ed';
  const DARK_ORANGE = '#ea580c';
  const BORDER_ORANGE = '#fed7aa';
  const WHITE = '#ffffff';

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    setLoading(true);
    try {
      // Fetch course details
      const courseResponse = await axios.get('http://localhost:5000/api/courses');
      const foundCourse = courseResponse.data.courses.find(c => c._id === courseId);
      
      if (foundCourse) {
        setCourse(foundCourse);
      }

      // Fetch lessons
      const lessonsResponse = await axios.get(`http://localhost:5000/api/courses/${courseId}/lessons`);
      const fetchedLessons = lessonsResponse.data.lessons || [];
      
      // Filter out any invalid lessons (strings instead of objects)
      const validLessons = fetchedLessons.filter(lesson => 
        typeof lesson === 'object' && lesson.title && lesson.content
      );
      
      setLessons(validLessons);
      
      if (validLessons.length === 0) {
        setError('No lessons available for this course yet.');
      }
    } catch (err) {
      console.error('Failed to fetch course/lessons:', err);
      setError('Failed to load course content.');
    } finally {
      setLoading(false);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: LIGHT_ORANGE, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: ORANGE }}>Loading lessons...</h2>
        </div>
      </div>
    );
  }

  if (error || lessons.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: LIGHT_ORANGE, padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              backgroundColor: ORANGE,
              color: WHITE,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Go Back
          </button>
          <h2 style={{ color: DARK_ORANGE }}>😔 {error || 'No lessons available'}</h2>
          <p style={{ color: '#666', marginTop: '20px' }}>
            This course doesn't have any lessons yet. Please check back later!
          </p>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[currentLessonIndex];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: LIGHT_ORANGE, padding: '40px 20px' }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        backgroundColor: WHITE, 
        borderRadius: '15px', 
        boxShadow: '0 8px 20px rgba(249, 115, 22, 0.15)', 
        padding: '40px' 
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => navigate(-1)}
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
            ← Back
          </button>
          
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '10px', 
            color: DARK_ORANGE, 
            fontSize: '32px' 
          }}>
            📚 {course?.title || 'Course Lessons'}
          </h1>
          
          {/* Progress Indicator */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
              Lesson {currentLessonIndex + 1} of {lessons.length}
            </p>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: BORDER_ORANGE,
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentLessonIndex + 1) / lessons.length) * 100}%`,
                height: '100%',
                backgroundColor: ORANGE,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div style={{
          padding: '30px',
          backgroundColor: LIGHT_ORANGE,
          borderRadius: '12px',
          border: `2px solid ${BORDER_ORANGE}`,
          marginBottom: '30px',
          minHeight: '400px'
        }}>
          <h2 style={{ 
            color: ORANGE, 
            fontSize: '28px', 
            marginBottom: '20px',
            borderBottom: `3px solid ${ORANGE}`,
            paddingBottom: '10px'
          }}>
            {currentLesson.title}
          </h2>
          
          <div style={{ 
            color: '#333', 
            fontSize: '16px', 
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap'
          }}>
            {currentLesson.content}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '20px'
        }}>
          <button
            onClick={goToPreviousLesson}
            disabled={currentLessonIndex === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: currentLessonIndex === 0 ? '#ccc' : ORANGE,
              color: WHITE,
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: currentLessonIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              flex: 1
            }}
          >
            ← Previous Lesson
          </button>

          {/* Lesson Selector */}
          <div style={{ flex: 2, textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#666' }}>
              Jump to Lesson:
            </label>
            <select
              value={currentLessonIndex}
              onChange={(e) => setCurrentLessonIndex(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                border: `2px solid ${BORDER_ORANGE}`,
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: WHITE
              }}
            >
              {lessons.map((lesson, index) => (
                <option key={index} value={index}>
                  Lesson {index + 1}: {lesson.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={goToNextLesson}
            disabled={currentLessonIndex === lessons.length - 1}
            style={{
              padding: '12px 24px',
              backgroundColor: currentLessonIndex === lessons.length - 1 ? '#ccc' : ORANGE,
              color: WHITE,
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: currentLessonIndex === lessons.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              flex: 1
            }}
          >
            Next Lesson →
          </button>
        </div>

        {/* Completion Message */}
        {currentLessonIndex === lessons.length - 1 && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#d1fae5',
            border: '2px solid #86efac',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#065f46', marginBottom: '10px' }}>
              🎉 Congratulations!
            </h3>
            <p style={{ color: '#065f46', fontSize: '14px' }}>
              You've reached the last lesson. Great job on completing this course!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;
