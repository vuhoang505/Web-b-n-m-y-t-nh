import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // ✅ đúng rồi
  headers: {
    "Content-Type": "application/json", // ❌ bạn đang để "application/JSON" (viết hoa -> sai chuẩn)
  },
  withCredentials: true, // nếu BE có session/cookie thì để true, còn API thuần JWT có thể bỏ
});

// 🧭 Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Nếu bạn dùng JWT token, thêm đoạn này để gửi Authorization Header:
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚙️ Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (error) => {
    if (!error.response) throw error;
    const { config, status, data } = error.response;

    const URLs = [
      "/api/v1/users/signup",
      "/api/v1/users/login",
      "/api/v1/users/verify",
      "/api/v1/users/forgotPassword",
      "/api/v1/users/changeState",
      "/api/v1/users/logout",
      "/api/v1/users/verifyResetPass",
      "/api/v1/users/me",
      "/api/v1/users/resetPassword/:token",
      "/api/v1/users/updateMe",
      "/api/v1/users/createAddress",
      "/api/v1/users/me/address",
      "/api/v1/users/deleteAddress",
      "/api/v1/users/updateAddress",
      "/api/v1/users/updateMyPassword",
      "/api/v1/users/setDefaultAddress",
      "/api/v1/products",
      "/api/v1/reviews",
      "/api/v1/products/:id/reviews",
      "/api/v1/reviews/:id",
      "/api/v1/orders",
      "/api/v1/users/userLoginWith",
      "/api/v1/comments",
      "/api/v1/products/:id/comments?query",
      "/api/v1/comments/:id",
      "/api/v1/comments/setLike/:id",
    ];

    if (
      (URLs.includes(config.url) && status === 500) ||
      [400, 401, 403, 404].includes(status)
    ) {
      throw new Error(data.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
