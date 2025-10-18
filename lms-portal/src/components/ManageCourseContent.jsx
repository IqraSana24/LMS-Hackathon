import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageCourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Materials state
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Lessons state
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', order: 1 });
  
  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    maxScore: 100 
  });

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

  // Fetch course details
  const fetchCourseDetails = async () => {
    setLoading(true);
    setError('');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const instructorId = user._id;

    if (!instructorId) {
      setError("Instructor ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/courses/instructor/${instructorId}`);
      const specificCourse = response.data.courses.find(c => c._id === courseId);
      
      if (specificCourse) {
        setCourse(specificCourse);
      } else {
        setError("Course not found or you don't have access.");
      }
    } catch (err) {
      console.error('Failed to fetch course details:', err);
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lessons
  const fetchLessons = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/lessons`);
      console.log('Lessons API Response:', response.data);
      console.log('Lessons fetched:', response.data.lessons);
      const fetchedLessons = response.data.lessons || [];
      console.log('First lesson structure:', fetchedLessons[0]);
      setLessons(fetchedLessons);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/assignments`);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  // Add new lesson
  const handleAddLesson = async (e) => {
    e.preventDefault();
    console.log('Adding lesson with data:', newLesson);
    try {
      const response = await axios.post(`http://localhost:5000/api/courses/${courseId}/lessons`, newLesson);
      console.log('Lesson add response:', response.data);
      setUploadMessage('✅ Lesson added successfully!');
      setNewLesson({ title: '', content: '', order: lessons.length + 1 });
      await fetchLessons();
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (err) {
      console.error('Error adding lesson:', err);
      setUploadMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  // Add new assignment
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/courses/${courseId}/assignments`, newAssignment);
      setUploadMessage('✅ Assignment added successfully!');
      setNewAssignment({ title: '', description: '', dueDate: '', maxScore: 100 });
      fetchAssignments();
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (err) {
      setUploadMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (lessonId) => {
    console.log('handleDeleteLesson called with:', lessonId);
    console.log('lessonId type:', typeof lessonId);
    
    if (!lessonId) {
      setUploadMessage('❌ Error: Invalid lesson ID');
      return;
    }
    
    if (window.confirm('Delete this lesson?')) {
      try {
        const deleteUrl = `http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}`;
        console.log('DELETE URL:', deleteUrl);
        
        await axios.delete(deleteUrl);
        setUploadMessage('✅ Lesson deleted!');
        fetchLessons();
        setTimeout(() => setUploadMessage(''), 3000);
      } catch (err) {
        console.error('Delete error:', err);
        console.error('Error response:', err.response?.data);
        setUploadMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Delete this assignment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${courseId}/assignments/${assignmentId}`);
        setUploadMessage('✅ Assignment deleted!');
        fetchAssignments();
        setTimeout(() => setUploadMessage(''), 3000);
      } catch (err) {
        setUploadMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadMessage('');
    
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (ext === 'pdf') {
        setFileType('pdf');
      } else if (ext === 'ppt' || ext === 'pptx') {
        setFileType('ppt');
      } else {
        setFileType('');
        setUploadMessage('Only PDF and PPT/PPTX files allowed.');
      }
    }
  };

  // Upload file
  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadMessage('');

    if (!file) {
      setUploadMessage('Please select a file.');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await axios.post(`http://localhost:5000/api/courses/${courseId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMessage('✅ File uploaded successfully!');
      setFile(null);
      setFileType('');
      fetchCourseDetails();
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (err) {
      setUploadMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Delete material
  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Delete this material?')) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${courseId}/materials/${materialId}`);
        setUploadMessage('✅ Material deleted!');
        fetchCourseDetails();
        setTimeout(() => setUploadMessage(''), 3000);
      } catch (err) {
        setUploadMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Populate course with sample content
  const handlePopulateContent = async () => {
    if (window.confirm('This will add example lessons and assignments based on the course topic. Existing content will be replaced. Continue?')) {
      try {
        const response = await axios.post(`http://localhost:5000/api/courses/${courseId}/populate-content`);
        setUploadMessage(`✅ ${response.data.message}`);
        
        // Wait a bit then reload the page to ensure data is fresh
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setUploadMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px', backgroundColor: LIGHT_ORANGE, minHeight: '100vh' }}>
      Loading course content...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '50px', color: 'red', backgroundColor: LIGHT_ORANGE, minHeight: '100vh' }}>
      {error}
    </div>
  );

  if (!course) return (
    <div style={{ textAlign: 'center', padding: '50px', backgroundColor: LIGHT_ORANGE, minHeight: '100vh' }}>
      Course data not available.
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: LIGHT_ORANGE, padding: '40px 20px' }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        backgroundColor: WHITE, 
        borderRadius: '15px', 
        boxShadow: '0 8px 20px rgba(249, 115, 22, 0.15)', 
        padding: '40px' 
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => navigate('/teacher-dashboard')}
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
            Manage Content: {course.title}
          </h1>
          <p style={{ textAlign: 'center', color: '#9a3412', marginBottom: '20px', fontSize: '15px' }}>
            Add lessons, assignments, and materials for your course
          </p>
          
          {/* Populate with Sample Content Button */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={handlePopulateContent}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(to right, #8b5cf6 0%, #a78bfa 100%)',
                color: WHITE,
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
              }}
            >
              🎓 Auto-Fill with Example Content
            </button>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
              Automatically add sample lessons & assignments based on course topic
            </p>
          </div>
        </div>

        {/* Message Display */}
        {uploadMessage && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: uploadMessage.includes('❌') ? '#fee2e2' : '#d1fae5',
            color: uploadMessage.includes('❌') ? '#991b1b' : '#065f46', 
            fontWeight: '500',
            border: uploadMessage.includes('❌') ? '1px solid #fca5a5' : '1px solid #86efac',
            textAlign: 'center'
          }}>
            {uploadMessage}
          </div>
        )}

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
                transition: 'all 0.3s'
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
              {/* Add Lesson Form */}
              <form onSubmit={handleAddLesson} style={{ 
                marginBottom: '30px', 
                padding: '25px', 
                border: `2px solid ${BORDER_ORANGE}`, 
                borderRadius: '10px', 
                backgroundColor: LIGHT_ORANGE 
              }}>
                <h3 style={{ marginBottom: '20px', color: DARK_ORANGE }}>➕ Add New Lesson</h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#9a3412' }}>
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                    placeholder="e.g., Introduction to Variables"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${BORDER_ORANGE}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#9a3412' }}>
                    Lesson Content *
                  </label>
                  <textarea
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                    placeholder="Write detailed lesson content here..."
                    required
                    rows="6"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${BORDER_ORANGE}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: `linear-gradient(to right, ${ORANGE} 0%, #fb923c 100%)`,
                    color: WHITE,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}
                >
                  Add Lesson
                </button>
              </form>

              {/* Lessons List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: DARK_ORANGE }}>
                  📚 All Lessons ({lessons.length})
                </h3>
                {lessons.length > 0 && (
                  <button
                    onClick={() => navigate(`/lessons/${courseId}`)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(to right, #10b981 0%, #059669 100%)',
                      color: WHITE,
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    👁️ View Lessons
                  </button>
                )}
              </div>
              {lessons.length === 0 ? (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#888', 
                  padding: '40px', 
                  backgroundColor: LIGHT_ORANGE, 
                  borderRadius: '8px' 
                }}>
                  No lessons added yet. Create your first lesson above!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {lessons.map((lesson, index) => {
                    // Handle both object and string formats
                    const lessonId = typeof lesson === 'string' ? lesson : lesson._id;
                    const lessonTitle = typeof lesson === 'string' ? `Lesson ID: ${lesson}` : (lesson.title || '(No title)');
                    const lessonContent = typeof lesson === 'string' ? 'Lesson details not available' : (lesson.content || '(No content)');
                    
                    return (
                      <div key={lessonId || index} style={{
                        padding: '20px',
                        backgroundColor: WHITE,
                        border: `2px solid ${BORDER_ORANGE}`,
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'start', 
                          marginBottom: '10px' 
                        }}>
                          <h4 style={{ margin: 0, color: ORANGE, fontSize: '18px' }}>
                            Lesson {index + 1}: {lessonTitle}
                          </h4>
                          <button
                            onClick={() => {
                              console.log('Deleting lesson:', lessonId);
                              handleDeleteLesson(lessonId);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc2626',
                              color: WHITE,
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                        <p style={{ margin: 0, color: '#666', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          {lessonContent}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div>
              {/* Add Assignment Form */}
              <form onSubmit={handleAddAssignment} style={{ 
                marginBottom: '30px', 
                padding: '25px', 
                border: `2px solid ${BORDER_ORANGE}`, 
                borderRadius: '10px', 
                backgroundColor: LIGHT_ORANGE 
              }}>
                <h3 style={{ marginBottom: '20px', color: DARK_ORANGE }}>➕ Add New Assignment</h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#9a3412' }}>
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="e.g., Python Basics Quiz"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${BORDER_ORANGE}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#9a3412' }}>
                    Description *
                  </label>
                  <textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Describe the assignment..."
                    required
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${BORDER_ORANGE}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#9a3412' }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${BORDER_ORANGE}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#9a3412' }}>
                      Max Score
                    </label>
                    <input
                      type="number"
                      value={newAssignment.maxScore}
                      onChange={(e) => setNewAssignment({...newAssignment, maxScore: e.target.value})}
                      placeholder="100"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${BORDER_ORANGE}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: `linear-gradient(to right, ${ORANGE} 0%, #fb923c 100%)`,
                    color: WHITE,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}
                >
                  Add Assignment
                </button>
              </form>

              {/* Assignments List */}
              <h3 style={{ marginBottom: '20px', color: DARK_ORANGE }}>
                📝 All Assignments ({assignments.length})
              </h3>
              {assignments.length === 0 ? (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#888', 
                  padding: '40px', 
                  backgroundColor: LIGHT_ORANGE, 
                  borderRadius: '8px' 
                }}>
                  No assignments created yet. Add your first assignment above!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {assignments.map((assignment, index) => (
                    <div key={assignment._id || index} style={{
                      padding: '20px',
                      backgroundColor: WHITE,
                      border: `2px solid ${BORDER_ORANGE}`,
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'start', 
                        marginBottom: '10px' 
                      }}>
                        <h4 style={{ margin: 0, color: ORANGE }}>{assignment.title}</h4>
                        <button
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc2626',
                            color: WHITE,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <p style={{ margin: '0 0 10px 0', color: '#666' }}>{assignment.description}</p>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#888' }}>
                        {assignment.dueDate && (
                          <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        )}
                        <span>🎯 Max Score: {assignment.maxScore}</span>
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
              {/* Upload Form */}
              <form onSubmit={handleFileUpload} style={{ 
                marginBottom: '30px', 
                padding: '25px', 
                border: `2px solid ${BORDER_ORANGE}`, 
                borderRadius: '10px', 
                backgroundColor: LIGHT_ORANGE 
              }}>
                <h3 style={{ marginBottom: '15px', color: DARK_ORANGE }}>📤 Upload New Material (PDF/PPT)</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept=".pdf,.ppt,.pptx"
                    style={{ 
                      flexGrow: 1, 
                      padding: '10px',
                      border: `1px solid ${BORDER_ORANGE}`,
                      borderRadius: '6px',
                      backgroundColor: WHITE
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={uploading || !file || !fileType} 
                    style={{ 
                      padding: '12px 24px',
                      background: uploading || !file || !fileType ? '#ccc' : `linear-gradient(to right, ${ORANGE} 0%, #fb923c 100%)`,
                      color: WHITE,
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: uploading || !file || !fileType ? 'not-allowed' : 'pointer',
                      fontSize: '15px'
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>

              {/* Materials List */}
              <h3 style={{ marginBottom: '20px', color: DARK_ORANGE }}>
                📄 Current Course Materials ({course.materials?.length || 0})
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
                  {course.materials.map((material, index) => (
                    <div key={material._id || index} style={{ 
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
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: material.fileType === 'pdf' ? '#dc2626' : ORANGE, 
                          fontSize: '14px' 
                        }}>
                          {material.fileType?.toUpperCase()}:
                        </span>
                        <span style={{ marginLeft: '10px', color: '#333' }}>
                          {material.originalName}
                        </span>
                        <a 
                          href={`http://localhost:5000${material.filePath}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            marginLeft: '15px', 
                            color: ORANGE, 
                            textDecoration: 'underline', 
                            fontSize: '14px' 
                          }}
                        >
                          View File
                        </a>
                      </div>
                      <button 
                        onClick={() => handleDeleteMaterial(material._id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc2626',
                          color: WHITE,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
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

export default ManageCourseContent;
