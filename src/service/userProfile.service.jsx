// src/service/userProfile.service.js  (파일명은 네 프로젝트에 맞춰)
import api from "./axios";

// ✅ 토큰 기반: userId 파라미터 없이 호출
const getMyProfile = () => api.get("/api/me/profile");
const updateMyProfile = (payload) => api.patch("/api/me/profile", payload);

export default { getMyProfile, updateMyProfile };
