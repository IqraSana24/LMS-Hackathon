// src/components/StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
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
      navigate('/student-login');
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
            👤
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
            Published
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

            {/* Registration Number */}
            {userData.registrationNumber && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Registration Number</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.registrationNumber}
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

            {/* Gender */}
            {userData.gender && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Gender</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.gender}
                </span>
              </div>
            )}

            {/* Date of Birth */}
            {userData.dateOfBirth && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Date of Birth</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.dateOfBirth}
                </span>
              </div>
            )}

            {/* Tag */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '15px 0',
              borderBottom: `1px solid ${BORDER_ORANGE}`
            }}>
              <span style={{ color: '#666', fontSize: '15px' }}>Tag</span>
              <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                {userData.tag || '-'}
              </span>
            </div>

            {/* Additional Fields - Student ID */}
            {userData.studentId && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: `1px solid ${BORDER_ORANGE}`
              }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Student ID</span>
                <span style={{ color: '#333', fontWeight: '500', fontSize: '15px' }}>
                  {userData.studentId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
