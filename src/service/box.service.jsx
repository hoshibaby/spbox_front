// src/service/box.service.js
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080/api",
});

// 박스 헤더 가져오기: GET /api/q/{urlKey}/header
const getBoxHeader = (urlKey) => {
  return client.get(`/q/${urlKey}/header`);
};

// 공개 메시지 목록: GET /api/q/{urlKey}/messages?page=&size=
const getPublicMessages = (urlKey, page = 0, size = 10) => {
  return client.get(`/q/${urlKey}/messages`, {
    params: { page, size },
  });
};

const boxService = {
  getBoxHeader,
  getPublicMessages,
};

export default boxService;
