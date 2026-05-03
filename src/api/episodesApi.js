const getToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// エピソード一覧
const getEpisodes = async () => {
  const response = await fetch("/api/episodes", {
    method: "GET",
    headers: getHeaders(),
  });

  return await response.json();
};

// エピソード詳細
const getEpisodeById = async (id) => {
  const response = await fetch(`/api/episodes/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return await response.json();
};

// エピソード + 質問 + 回答を一括保存
const createEpisode = async (episodeData) => {
  const response = await fetch("/api/episodes/complete", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(episodeData),
  });

  const text = await response.text();

  console.log("作成APIステータス:", response.status);
  console.log("作成APIレスポンス:", text);

  return text ? JSON.parse(text) : null;
};

// エピソード編集
const updateEpisode = async (id, episodeData) => {
  const response = await fetch(`/api/episodes/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(episodeData),
  });

  return await response.json();
};

// 質問の回答編集
const updateAnswer = async (questionId, answer) => {
  const response = await fetch(`/api/questions/${questionId}/answer`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({
      answer: answer,
    }),
  });

  return await response.json();
};

// 質問追加
const createQuestion = async (episodeId, question) => {
  const response = await fetch(`/api/episodes/${episodeId}/questions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      question: question,
    }),
  });

  return await response.json();
};

// エピソード削除
const deleteEpisode = async (id) => {
  const response = await fetch(`/api/episodes/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return await response.json();
};

export {
  getEpisodes,
  getEpisodeById,
  createEpisode,
  updateEpisode,
  updateAnswer,
  createQuestion,
  deleteEpisode,
};