import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 認証トークンがある場合は、全てのエピソードAPIに付与する
// ログイン後のAPI通信では Authorization ヘッダーが必要になる
const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    // token が存在する場合だけ Authorization を追加する
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API通信の結果を確認するためのログ出力
const logResponse = (response) => {
  console.log("APIステータス:", response.status);
  console.log("APIレスポンス:", response.data);
};

// バックエンド共通レスポンス { success, message, data } から本体だけ取り出す
const getResponseBody = (response) => {
  return response.data.data;
};

// 新規作成APIは question で配列を返すため、画面が使う questions にそろえる
const toEpisode = (body) => {
  return {
    ...body,
    questions: body.questions ?? body.question ?? [],
  };
};

// 質問追加APIは answer を返さないため、追加直後の回答欄用に空文字を補う
const toQuestion = (body) => {
  return {
    ...body,
    answer: body.answer ?? "",
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
  return toEpisode(getResponseBody(response));
};

// 基本質問生成
// DBにある基本質問を取得・生成するAPI
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
// エピソード本体の更新APIでは回答が保存されないため、回答は専用APIで更新する
const updateQuestionAnswer = async (episodeId, questionId, answer) => {
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
  return toQuestion(getResponseBody(response));
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
  return toQuestion(getResponseBody(response));
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
  updateQuestionAnswer,
  createQuestion,
  deleteEpisode,
};
