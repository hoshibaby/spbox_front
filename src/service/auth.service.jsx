// src/service/auth.service.js
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080/api/auth",
});

const login = (userId, password) => {
  return client.post("/login", { userId, password });
};

const signup = (data) => {
  // { userId, email, password, passwordCheck, nickname }
  return client.post("/signup", data);
};

const authService = { login, signup };

export default authService;
