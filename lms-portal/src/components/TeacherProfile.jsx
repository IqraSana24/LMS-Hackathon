// src/components/TeacherProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // Orange Theme Colors
  const ORANGE = '#f97316';
  const LIGHT_ORANGE = '#fff7ed';
  const DARK_ORANGE = '#ea580c';
  const BORDER_ORANGE = '#fed7aa';
  const WHITE = '#ffffff';

  useEffect(() => {
    // Load user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.name) {
      navigate('/');
      return;
    }
    setUserData(user);
  }, [navigate]);

  if (!userData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: LIGHT_ORANGE }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: LIGHT_ORANGE,
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: WHITE,
        borderRadius: '15px',
        padding: '40px',
        boxShadow: '0 8px 20px rgba(249, 115, 22, 0.15)'
      }}>
        {/* Back Button */}
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

        {/* Profile Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            backgroundColor: '#fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '60px',
            position: 'relative'
          }}>
            👨‍🏫
            {/* Camera Icon for Upload */}
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '35px',
              height: '35px',
              backgroundColor: ORANGE,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: `3px solid ${WHITE}`
            }}>
              <span style={{ fontSize: '18px' }}>📷</span>
            </div>
          </div>

          {/* User Name */}
          <h2 style={{ 
            margin: '0 0 10px 0', 
            color: '#333',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            {userData.name}
          </h2>

          {/* Status Badge */}
          <div style={{
            display: 'inline-block',
            padding: '6px 20px',
            backgroundColor: LIGHT_ORANGE,
            color: ORANGE,
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Teacher
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '4px',
          backgroundColor: LIGHT_ORANGE,
          borderRadius: '2px',
          margin: '30px 0'
        }}></div>

        {/* Personal Information Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px',
              fontWeight: '600',
              color: '#333'
            }}>
              Personal Information
            </h3>
            <button style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: ORANGE,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span>✏️</span> Edit
            </button>
          </div>

          {/* Information Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Name */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '15px 0',
              borderBottom: `1px solid ${BORDER_ORANGE}`
            }}>
              <span style={{ color: '#666', fontSize: '15px' }}>Name</span>
              <span style={{ color: '#333', fontWeight: '500', fontSize: '15px', textAlign: 'right' }}>
                {userData.name}
              </span>
            </div>

            {/* Employee ID */}
            {userData.employeeId && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Employee ID</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.employeeId}
                </span>
              </div>
            )}

            {/* User ID */}
            {userData._id && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>User ID</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData._id}
                </span>
              </div>
            )}

            {/* Email */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '15px 0',
              borderBottom: `1px solid ${BORDER_ORANGE}`
            }}>
              <span style={{ color: '#666', fontSize: '15px' }}>Email</span>
              <span style={{ 
                color: '#333', 
                fontWeight: '500', 
                fontSize: '15px',
                textAlign: 'right',
                maxWidth: '60%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {userData.email}
              </span>
            </div>

            {/* Phone */}
            {userData.phone && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Phone</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.phone}
                </span>
              </div>
            )}

            {/* Department */}
            {userData.department && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Department</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.department}
                </span>
              </div>
            )}

            {/* Role */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '15px 0',
              borderBottom: `1px solid ${BORDER_ORANGE}`
            }}>
              <span style={{ color: '#666', fontSize: '15px' }}>Role</span>
              <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                {userData.role || 'Teacher'}
              </span>
            </div>

            {/* Specialization */}
            {userData.specialization && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Specialization</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.specialization}
                </span>
              </div>
            )}

            {/* Date of Joining */}
            {userData.dateOfJoining && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Date of Joining</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.dateOfJoining}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
