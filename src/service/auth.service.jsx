// src/service/auth.service.js
import api from "./axios";

// 로그인
const login = (userId, password) => {
  // POST http://localhost:8080/api/auth/login
  return api.post("/api/auth/login", { userId, password });
};

// 회원가입
const signup = (data) => {
  // data: { userId, email, nickname, password }
  // POST http://localhost:8080/api/auth/signup
  return api.post("/api/auth/signup", data);
};

// ✅ 아이디 찾기 (이메일 → userId)
const findIdByEmail = (email) => {
  // POST http://localhost:8080/api/auth/find-id
  // 응답: { userId: "찾은아이디" } 예상
  return api.post("/api/auth/find-id", { email });
};

// ✅ 비밀번호 찾기 (재설정 메일 발송 요청)
const requestPasswordReset = (userId, email) => {
  // POST http://localhost:8080/api/auth/find-password
  return api.post("/api/auth/find-password", { userId, email });
};

const authService = {
  login,
  signup,
  findIdByEmail,
  requestPasswordReset,
};

export default authService;
