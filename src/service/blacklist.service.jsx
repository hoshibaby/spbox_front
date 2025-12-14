import api from "./axios";

const getMyBlacklist = (userId) => {
  return api.get("/api/settings/blacklist", { params: { userId } });
};

const unblockUser = (userId, blockedUserId) => {
  return api.delete("/api/settings/blacklist", { params: { userId, blockedUserId } });
};

export default { getMyBlacklist, unblockUser };
