// src/service/auth.service.js
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080/api/auth",
});

// 로그인
const login = (userId, password) => {
  return client.post("/login", { userId, password });
};

// 회원가입
const signup = (data) => {
  // data: { userId, email, password, passwordCheck, nickname }
  return client.post("/signup", data);
};

// ✅ 아이디 찾기 (이메일 → userId)
const findIdByEmail = (email) => {
  // 백엔드에서 /api/auth/find-id 로 받는다고 가정
  // 응답: { userId: "찾은아이디" } 형태 기대
  return client.post("/find-id", { email });
};

// ✅ 비밀번호 찾기 (재설정 메일 발송 요청)
const requestPasswordReset = (userId, email) => {
  // 백엔드에서 /api/auth/find-password 로 받는다고 가정
  // 응답: 200 OK 면 성공 처리
  return client.post("/find-password", { userId, email });
};

const authService = {
  login,
  signup,
  findIdByEmail,
  requestPasswordReset,
};

export default authService;
