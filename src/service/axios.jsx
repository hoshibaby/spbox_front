import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080",
});

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
