// src/service/message.service.js
import api from './axios';

// 내 메시지 목록: GET /api/me/messages?userId=&page=&size=
const getMyMessages = (userPk, page = 0, size = 10) => {
  return api.get('/api/me/messages', {
    params: { userId: userPk, page, size },
  });
};

// 답변 게시판용: GET /api/me/messages/answered?userId=&page=&size=
const getMyAnsweredMessages = (userPk, page = 0, size = 10) => {
  return api.get('/api/me/messages/answered', {
    params: { userId: userPk, page, size },
  });
};


// 새 메시지 보내기
// dto: { boxUrlKey, content }
// userPk: 로그인 한 사람 PK (없으면 null 넣어도 됨)
const sendMessage = (dto, userPk) => {
  return api.post('/api/message', dto, {
    params: userPk ? { userId: userPk } : {},   // 쿼리스트링에 userId 붙이기
  });
};

// 메시지 상세: GET /api/me/messages/{id}?userId=...
const getMessageDetail = (id, userPk) => {
  return api.get(`/api/me/messages/${id}`, {
    params: { userId: userPk },
  });
};

// 메시지 수정: PUT /api/me/messages/{id}
// body: { userId, content }
const updateMessage = (id, userPk, content) => {
  const dto = {
    userId: userPk,
    content: content,
  };
  return api.put(`/api/me/messages/${id}`, dto);
};

// 원본 메시지 삭제: DELETE /api/me/messages/{id}?userId=...
const deleteMessage = (id, userPk) => {
  return api.delete(`/api/me/messages/${id}`, {
    params: { userId: userPk },
  });
};

// 답장: PATCH /api/me/messages/{id}/reply?userId=...
// 컨트롤러에서 @RequestBody String replyContent 사용
const replyMessage = (id, userPk, replyContent) => {
  return api.patch(`/api/me/messages/${id}/reply`, replyContent, {
    params: { userId: userPk },
    headers: { 'Content-Type': 'text/plain' },
  });
};

// 숨김: PATCH /api/me/messages/{id}/hide?userId=...
const hideMessage = (id, userPk) => {
  return api.patch(`/api/me/messages/${id}/hide`, null, {
    params: { userId: userPk },
  });
};

// 블랙리스트: POST /api/me/messages/{id}/blacklist?userId=...
const blacklistByMessage = (id, userPk) => {
  return api.post(`/api/me/messages/${id}/blacklist`, null, {
    params: { userId: userPk },
  });
};

// 한 번에 export
const messageService = {
  getMyMessages,
  getMyAnsweredMessages,
  sendMessage,
  getMessageDetail,
  replyMessage,
  hideMessage,
  blacklistByMessage,
  updateMessage,
  deleteMessage, 
};

export default messageService;
