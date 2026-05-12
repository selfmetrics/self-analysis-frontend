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

const logResponse = (response) => {
  console.log("APIステータス:", response.status);
  console.log("APIレスポンス:", response.data);
};

// エピソード一覧取得
const getEpisodes = async () => {
  const response = await axios.get(`${API_BASE_URL}/episodes`, {
    headers: getHeaders(),
  });

  logResponse(response);
  return response.data;
};

// エピソード詳細取得
const getEpisodeById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/episodes/${id}`, {
    headers: getHeaders(),
  });

  logResponse(response);
  return response.data;
};

// 基本質問だけ取得
// 新規ボタンを押した時点ではエピソードを作成しない
const getBasicQuestions = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/episodes/questions/basic`,
    {
      headers: getHeaders(),
    }
  );

  logResponse(response);
  return response.data;
};

// 新規エピソード保存
// 保存ボタンを押した時に初めてエピソードを作成する
const createCompleteEpisode = async (episodeData) => {
  const response = await axios.post(
    `${API_BASE_URL}/episodes/complete`,
    episodeData,
    {
      headers: getHeaders(),
    }
  );

  logResponse(response);
  return response.data;
};

// 既存エピソード編集
const updateEpisode = async (id, episodeData) => {
  const response = await axios.patch(
    `${API_BASE_URL}/episodes/${id}`,
    episodeData,
    {
      headers: getHeaders(),
    }
  );

  logResponse(response);
  return response.data;
};

// 質問追加
const createQuestion = async (episodeId, question) => {
  const response = await axios.post(
    `${API_BASE_URL}/episodes/${episodeId}/questions`,
    {
      question,
    },
    {
      headers: getHeaders(),
    }
  );

  logResponse(response);
  return response.data;
};

// 質問の回答編集
const updateAnswer = async (episodeId, questionId, answer) => {
  const response = await axios.patch(
    `${API_BASE_URL}/episodes/${episodeId}/questions/${questionId}/answer`,
    {
      answer,
    },
    {
      headers: getHeaders(),
    }
  );

  logResponse(response);
  return response.data;
};

// エピソード削除
const deleteEpisode = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/episodes/${id}`, {
    headers: getHeaders(),
  });

  logResponse(response);
  return response.data;
};

export {
  getEpisodes,
  getEpisodeById,
  getBasicQuestions,
  createCompleteEpisode,
  updateEpisode,
  createQuestion,
  updateAnswer,
  deleteEpisode,
};