// src/service/message.service.js
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080/api",
});

// 내 메시지 목록: GET /api/me/messages?userId=...
const getMyMessages = (userId, page = 0, size = 10) => {
  return client.get(`/me/messages`, {
    params: { userId, page, size },
  });
};

// 메시지 상세: GET /api/me/messages/{id}?userId=...
const getMessageDetail = (id, userId) => {
  return client.get(`/me/messages/${id}`, {
    params: { userId },
  });
};

// 답장: PATCH /api/me/messages/{id}/reply?userId=...
// 컨트롤러가 @RequestBody String replyContent 이라서
// axios에서 text/plain 으로 보내주는 게 제일 깔끔해.
const replyMessage = (id, userId, replyContent) => {
  return client.patch(`/me/messages/${id}/reply`, replyContent, {
    params: { userId },
    headers: { "Content-Type": "text/plain" },
  });
};

// 숨김: PATCH /api/me/messages/{id}/hide?userId=...
const hideMessage = (id, userId) => {
  return client.patch(`/me/messages/${id}/hide`, null, {
    params: { userId },
  });
};

// 블랙리스트: POST /api/me/messages/{id}/blacklist?userId=...
const blacklistByMessage = (id, userId) => {
  return client.post(`/me/messages/${id}/blacklist`, null, {
    params: { userId },
  });
};

const messageService = {
  getMyMessages,
  getMessageDetail,
  replyMessage,
  hideMessage,
  blacklistByMessage,
};

export default messageService;
