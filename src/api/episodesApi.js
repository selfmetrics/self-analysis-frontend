const API_BASE_URL = "http://localhost:3000";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const parseResponse = async (response) => {
  const text = await response.text();

  console.log("APIステータス:", response.status);
  console.log("APIレスポンス:", text);

  if (!text) return null;

  return JSON.parse(text);
};

// エピソード一覧
const getEpisodes = async () => {
  const response = await fetch(`${API_BASE_URL}/episodes`, {
    method: "GET",
    headers: getHeaders(),
  });

  return await parseResponse(response);
};

// エピソード詳細
const getEpisodeById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/episodes/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return await parseResponse(response);
};

// 基本質問生成
const createBasicQuestions = async () => {
  const response = await fetch(`${API_BASE_URL}/episodes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "default",
    }),
  });

  return await parseResponse(response);
};

// エピソード + 質問 + 回答を一括保存
const completeEpisode = async (id, episodeData) => {
  const response = await fetch(`${API_BASE_URL}/episodes/${id}/complete`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(episodeData),
  });

  return await parseResponse(response);
};

// エピソード編集
const updateEpisode = async (id, episodeData) => {
  const response = await fetch(`${API_BASE_URL}/episodes/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(episodeData),
  });

  return await parseResponse(response);
};

// 質問の回答編集
const updateAnswer = async (episodeId, questionId, answer) => {
  const response = await fetch(
    `${API_BASE_URL}/episodes/${episodeId}/questions/${questionId}/answer`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        answer,
      }),
    }
  );

  return await parseResponse(response);
};

// 質問追加
const createQuestion = async (episodeId, question) => {
  const response = await fetch(`${API_BASE_URL}/episodes/${episodeId}/questions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      question,
    }),
  });

  return await parseResponse(response);
};

// エピソード削除
const deleteEpisode = async (id) => {
  const response = await fetch(`${API_BASE_URL}/episodes/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return await parseResponse(response);
};

export {
  getEpisodes,
  getEpisodeById,
  createBasicQuestions,
  completeEpisode,
  updateEpisode,
  updateAnswer,
  createQuestion,
  deleteEpisode,
};