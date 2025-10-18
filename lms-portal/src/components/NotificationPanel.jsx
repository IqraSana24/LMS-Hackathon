import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ isOpen, onClose, studentId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Orange theme colors
  const ORANGE = '#f97316';
  const LIGHT_ORANGE = '#fff7ed';
  const DARK_ORANGE = '#ea580c';
  const BORDER_ORANGE = '#fed7aa';
  const WHITE = '#ffffff';

  useEffect(() => {
    if (isOpen && studentId) {
      fetchNotifications();
    }
  }, [isOpen, studentId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${studentId}/notifications`);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:5000/api/students/${studentId}/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/students/${studentId}/notifications/read-all`);
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.courseId) {
      onClose();
      navigate(`/student/course/${notification.courseId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment_deadline':
        return '⏰';
      case 'new_course':
        return '📚';
      case 'course_update':
        return '📝';
      default:
        return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999
        }}
      />

      {/* Notification Panel */}
      <div
        style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          width: '400px',
          maxHeight: '600px',
          backgroundColor: WHITE,
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: `2px solid ${BORDER_ORANGE}`,
            backgroundColor: LIGHT_ORANGE,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: DARK_ORANGE, fontSize: '18px' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{ fontSize: '12px', color: '#666' }}>
                {unreadCount} unread
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '6px 12px',
                backgroundColor: ORANGE,
                color: WHITE,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '15px',
                    backgroundColor: notification.isRead ? WHITE : LIGHT_ORANGE,
                    border: `1px solid ${BORDER_ORANGE}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: ORANGE,
                        borderRadius: '50%'
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ fontSize: '24px' }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: '0 0 5px 0',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: DARK_ORANGE
                        }}
                      >
                        {notification.title}
                      </h4>
                      <p
                        style={{
                          margin: '0 0 8px 0',
                          fontSize: '13px',
                          color: '#666',
                          lineHeight: '1.4'
                        }}
                      >
                        {notification.message}
                      </p>
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
