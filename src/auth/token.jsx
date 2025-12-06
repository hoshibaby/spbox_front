// src/auth/token.js
const TOKEN_KEY = "accessToken";

// 저장
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// 가져오기
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// 삭제
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
