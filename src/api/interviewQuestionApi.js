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

// 面接質問一覧取得
export const getInterviewQuestions = async () => {
  const response = await axios.get(`${API_BASE_URL}/interview-questions`, {
    headers: getHeaders(),
  });

  return response.data;
};

// 面接質問詳細取得
export const getInterviewQuestionDetail = async (questionId) => {
  const response = await axios.get(
    `${API_BASE_URL}/interview-questions/${questionId}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// 面接質問作成
export const createInterviewQuestion = async (questionData) => {
  const response = await axios.post(
    `${API_BASE_URL}/interview-questions`,
    questionData,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// 面接質問の回答修正
export const updateInterviewQuestionAnswer = async (questionId, answerData) => {
  const response = await axios.patch(
    `${API_BASE_URL}/interview-questions/${questionId}`,
    answerData,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// 面接質問削除
export const deleteInterviewQuestion = async (questionId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/interview-questions/${questionId}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};