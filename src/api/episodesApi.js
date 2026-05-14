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

const getResponseBody = (response) => {
  return response.data.data ?? response.data;
};

const toEpisode = (body) => {
  if (Array.isArray(body)) {
    return { questions: body };
  }

  const episode = body?.data ?? body?.episode ?? body;

  return {
    ...episode,
    id: episode?.id ?? null,
    questions: episode?.questions ?? episode?.question ?? [],
  };
};

// エピソード一覧
const getEpisodes = async () => {
  const response = await axios.get(`${API_BASE_URL}/episodes`, {
    headers: getHeaders(),
  });

  logResponse(response);
  return getResponseBody(response);
};

// エピソード詳細
const getEpisodeById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/episodes/${id}`, {
    headers: getHeaders(),
  });

  logResponse(response);
  return getResponseBody(response);
};

// 基本質問生成
// DBにある基本質問を取得・生成するAPI
// 基本質問生成
const createBasicQuestions = async () => {
  const response = await axios.post(
    `${API_BASE_URL}/episodes`,
    {
      type: "default",
    },
    {
      headers: getHeaders(),
    }
  );

  logResponse(response);
  const body = getResponseBody(response);
  return toEpisode(body);
};

// エピソード + 質問 + 回答を一括保存
const completeEpisode = async (episodeData) => {
  const response = await axios.post(
    `${API_BASE_URL}/episodes/complete`,
    episodeData,
    {
      headers: getHeaders(),
    }
  );

  logResponse(response);
  return getResponseBody(response);
};

// エピソード編集
const updateEpisode = async (id, episodeData) => {
  const response = await axios.patch(
    `${API_BASE_URL}/episodes/${id}`,
    episodeData,
    {
      headers: getHeaders(),
    }
  );

  logResponse(response);
  return getResponseBody(response);
};

// 質問の回答編集
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
  return getResponseBody(response);
};

// エピソード削除
const deleteEpisode = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/episodes/${id}`, {
    headers: getHeaders(),
  });

  logResponse(response);
  return getResponseBody(response);
};

export {
  getEpisodes,
  getEpisodeById,
  createBasicQuestions,
  completeEpisode,
  updateEpisode,
  createQuestion,
  deleteEpisode,
};
