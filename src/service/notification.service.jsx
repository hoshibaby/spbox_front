// src/service/notification.service.js
import api from './axios';

// 알림 개수 조회: GET /api/notifications/unread-count?userId=...
const getUnreadCount = (userId) => {
  return api.get('/api/notifications/unread-count', {
    params: { userId },          // ← 여기로 PK(Long)만 넣어주면 됨
  });
};

// 알림 목록 조회: GET /api/notifications?userId=...
const getNotifications = (userId) => {
  return api.get('/api/notifications', {
    params: { userId },
  });
};

// 알림 읽음 처리: POST /api/notifications/{id}/read?userId=...
const markAsRead = (notificationId, userId) => {
  return api.post(`/api/notifications/${notificationId}/read`, null, {
    params: { userId },
  });
};

const notificationService = {
  getUnreadCount,
  getNotifications,
  markAsRead,
};

export default notificationService;
