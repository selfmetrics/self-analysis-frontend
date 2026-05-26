import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// APIリクエストに共通に使用するヘッダを作成
//　ログイントークンがある場合は、Authorizationヘッダーに一緒に入れる
const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};


// DBに保存されたインタビュー質問のリストを照会
export const getInterviewQuestions = async () => {
  const response = await axios.get(`${API_BASE_URL}/interview-questions`, {
    headers: getHeaders(),
  });

  return response.data;
};
