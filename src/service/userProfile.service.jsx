// src/service/profile.service.js
import api from "./axios";

// 내 프로필 조회
function getMyProfile(userId) {
  return api.get("/api/me/profile", {
    params: { userId },   // ?userId=1
  });
}

// 내 프로필 수정 (부분 업데이트 가능)
function updateMyProfile(userId, payload) {
  return api.patch("/api/me/profile", payload, {
    params: { userId },
  });
}

const profileService = {
  getMyProfile,
  updateMyProfile,
};

export default profileService;
