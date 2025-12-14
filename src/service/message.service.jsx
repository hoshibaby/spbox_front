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
// userPk: 로그인 한 사람 PK (없으면 null)
const sendMessage = (dto, userPk) => {
  // ✅ 로그인 유저면 params 포함, 아니면 config 자체를 생략
  if (userPk) {
    return api.post('/api/message', dto, {
      params: { userId: userPk },
    });
  }

  // ✅ 비로그인(익명) 전송
  return api.post('/api/message', dto);
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

// AI 답변 생성: POST /api/messages/{id}/ai-reply
// ✅ 토큰은 axios 인터셉터가 자동으로 붙여줌
const generateAiReply = (messageId) => {
  return api.post(`/api/messages/${messageId}/ai-reply`);
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
  generateAiReply, 
};

export default messageService;
