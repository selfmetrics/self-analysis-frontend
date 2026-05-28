import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// APIリクエストで共通して使うヘッダーを作成する。
const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 面接質問一覧を取得する。
export const getInterviewQuestions = async () => {
  const response = await axios.get(`${API_BASE_URL}/interview-questions`, {
    headers: getHeaders(),
  });

  return response.data;
};

// 指定した面接質問の詳細を取得する。
export const getInterviewQuestionDetail = async (questionId) => {
  const response = await axios.get(
    `${API_BASE_URL}/interview-questions/${questionId}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// 指定した面接質問の回答を更新する。
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
