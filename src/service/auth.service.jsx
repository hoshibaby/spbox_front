// src/service/auth.service.js
import api from "./axios";

// 로그인 (객체로 통일)
const login = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("login은 login({ userId, password }) 형태로 호출해야 합니다.");
  }
  return api.post("/api/auth/login", data, {
    headers: { "Content-Type": "application/json" },
  });
};

// 회원가입
const signup = (data) => {
  return api.post("/api/auth/signup", data);
};

// 아이디 찾기
const findIdByEmail = (email) => {
  return api.post("/api/auth/find-id", { email });
};

// 비밀번호 찾기
const requestPasswordReset = (userId, email) => {
  return api.post("/api/auth/find-password", { userId, email });
};

// ✅ 중복확인
const checkUserId = (userId) => {
  return api.get("/api/auth/check-userid", { params: { userId } });
};

const checkEmail = (email) => {
  return api.get("/api/auth/check-email", { params: { email } });
};

const authService = {
  login,
  signup,
  findIdByEmail,
  requestPasswordReset,
  checkUserId,
  checkEmail,
};

export default authService;
