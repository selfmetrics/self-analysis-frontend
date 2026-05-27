import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// APIリクエストで共通して使うヘッダーを作る。
// ログイン済みの場合は、Authorizationヘッダーにトークンを入れる。
const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// DBに保存されている面接質問一覧を取得する。
export const getInterviewQuestions = async () => {
  const response = await axios.get(`${API_BASE_URL}/interview-questions`, {
    headers: getHeaders(),
  });

  return response.data;
};

// 指定した面接質問の詳細を取得する。
// 一覧APIに回答が含まれない場合でも、詳細APIから回答を取得できる。
export const getInterviewQuestionDetail = async (questionId) => {
  const response = await axios.get(
    `${API_BASE_URL}/interview-questions/${questionId}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// 指定した面接質問に回答を保存する。
export const updateInterviewQuestionAnswer = async (questionId, questionData) => {
  const response = await axios.patch(
    `${API_BASE_URL}/interview-questions/${questionId}`,
    questionData,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};
