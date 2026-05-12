import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Googleログインページへ移動
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

// ログイン中ユーザー取得
export const getLoginUser = async () => {
  const response = await axios.get(`${API_BASE_URL}/users/me`, {
    headers: getHeaders(),
  });

  console.log("ログインユーザーAPIステータス:", response.status);
  console.log("ログインユーザーAPIレスポンス:", response.data);

  const user = response.data.data;

  if (!user) {
    throw new Error("ユーザー情報がありません");
  }

  return user;
};

// ログアウト
export const logout = async () => {
  localStorage.removeItem("token");
};