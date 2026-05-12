import { useEffect, useState } from "react";

import EpisodeList from "../components/EpisodeList";
import EpisodeForm from "../components/EpisodeForm";
import EpisodeDetail from "../components/EpisodeDetail";

import {
  getEpisodes,
  getEpisodeById,
  getBasicQuestions,
  createCompleteEpisode,
  updateEpisode,
  createQuestion,
  updateAnswer,
  deleteEpisode,
} from "../api/episodesApi";

const getData = (response) => {
  const body = response.data ?? response;
  return body.data ?? body;
};

const getQuestionId = (question) => {
  if (typeof question === "string") {
    return null;
  }

  return question.id ?? question.questionId ?? question.question_id ?? null;
};

function EpisodePage({ user, onLogout }) {
  const [screen, setScreen] = useState("list");

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [emotion, setEmotion] = useState("happy");
  const [strength, setStrength] = useState(5);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  const [episodes, setEpisodes] = useState([]);
  const [detailEpisode, setDetailEpisode] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchEpisodes = async () => {
    try {
      const response = await getEpisodes();
      const data = getData(response);

      const episodeList = Array.isArray(data)
        ? data
        : Array.isArray(data.episodes)
        ? data.episodes
        : [];

      setEpisodes(episodeList);
    } catch (error) {
      console.error("エピソード一覧取得エラー:", error);
      setEpisodes([]);
    }
  };

  const fetchBasicQuestions = async () => {
    try {
      const response = await getBasicQuestions();

      console.log("基本質問APIレスポンス:", response);

      const data = getData(response);
      const questionList = data.question ?? data.questions ?? [];

      setQuestions(questionList);
      setAnswers(Array(questionList.length).fill(""));
    } catch (error) {
      console.error("基本質問取得エラー:", error);
      console.error("バックエンドエラー内容:", error.response?.data);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const resetForm = () => {
    setEditId(null);

    setDate("");
    setTitle("");
    setDetail("");
    setEmotion("happy");
    setStrength(5);

    setQuestions([]);
    setAnswers([]);
    setNewQuestion("");
  };

  const handleNew = async () => {
    resetForm();

    // ここでは質問だけ取得する
    // DBに episode は作成しない
    await fetchBasicQuestions();

    setScreen("form");
  };

  const handleSave = async () => {
  const normalAnswers = questions
    .map((question, index) => {
      const questionId = getQuestionId(question);
      const answer = answers[index] ?? "";

      return {
        questionId,
        answer,
      };
    })
    .filter((item) => {
      return (
        item.questionId !== null &&
        item.questionId !== undefined &&
        item.answer.trim() !== ""
      );
    });

  const episodeData = {
    date,
    title,
    content: detail,
    emotion,
    emotionIntensity: Number(strength),
    answers: normalAnswers,
  };

  console.log("送信データ:", episodeData);
  console.log("送信データJSON:", JSON.stringify(episodeData, null, 2));

  try {
    if (editId === null) {
      await createCompleteEpisode(episodeData);
    } else {
      await updateEpisode(editId, episodeData);

      await Promise.all(
        normalAnswers.map((item) =>
          updateAnswer(editId, item.questionId, item.answer)
        )
      );
    }

    await fetchEpisodes();

    resetForm();
    setScreen("list");
  } catch (error) {
    console.error("エピソード保存エラー:", error);
    console.error("バックエンドエラー内容:", error.response?.data);
    console.error("HTTPステータス:", error.response?.status);
  }
};

const handleAddQuestion = async () => {
  const text = newQuestion.trim();

  if (text === "") {
    return;
  }

  // 新規作成中は、まだ episodeId がないので質問追加しない
  if (editId === null) {
    alert("追加質問は、エピソードを保存した後に編集画面から追加してください。");
    return;
  }

  try {
    const response = await createQuestion(editId, text);

    console.log("質問追加APIレスポンス:", response);

    const createdQuestion = getData(response);

    setQuestions([...questions, createdQuestion]);
    setAnswers([...answers, createdQuestion.answer ?? ""]);
    setNewQuestion("");
  } catch (error) {
    console.error("質問追加エラー:", error);
    console.error("バックエンドエラー内容:", error.response?.data);
  }
};

  const handleDetail = async (episode) => {
    try {
      const response = await getEpisodeById(episode.id);
      const data = getData(response);

      const questionList = data.questions ?? [];

      setDetailEpisode({
        id: data.id,
        date: data.date,
        title: data.title,
        content: data.content ?? "",
        emotion: data.emotion,
        emotionIntensity: data.emotionIntensity,
        questions: questionList,
      });

      setScreen("detail");
    } catch (error) {
      console.error("エピソード詳細取得エラー:", error);
    }
  };

  const handleEdit = async (episode) => {
    try {
      const response = await getEpisodeById(episode.id);
      const data = getData(response);

      const questionList = data.questions ?? [];

      setEditId(data.id);

      setDate(data.date?.slice(0, 10) ?? data.eventDate?.slice(0, 10) ?? "");
      setTitle(data.title ?? "");
      setDetail(data.content ?? "");
      setEmotion(data.emotion ?? "happy");
      setStrength(data.emotionIntensity ?? data.emotionScore ?? 5);

      setQuestions(questionList);

      setAnswers(
        questionList.map((question) => {
          if (typeof question === "string") {
            return "";
          }

          return question.answer ?? "";
        })
      );

      setNewQuestion("");
      setScreen("form");
    } catch (error) {
      console.error("エピソード編集データ取得エラー:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEpisode(id);
      await fetchEpisodes();
    } catch (error) {
      console.error("エピソード削除エラー:", error);
    }
  };

  const handleLogout = async () => {
    await onLogout();

    setEpisodes([]);
    setScreen("list");
    resetForm();
  };

  if (screen === "form") {
    return (
      <EpisodeForm
        editId={editId}
        date={date}
        setDate={setDate}
        title={title}
        setTitle={setTitle}
        detail={detail}
        setDetail={setDetail}
        emotion={emotion}
        setEmotion={setEmotion}
        strength={strength}
        setStrength={setStrength}
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        onAddQuestion={handleAddQuestion}
        onSave={handleSave}
        onBack={() => {
          resetForm();
          setScreen("list");
        }}
      />
    );
  }

  if (screen === "detail") {
    return (
      <EpisodeDetail
        episode={detailEpisode}
        onBack={() => setScreen("list")}
      />
    );
  }

  return (
    <div>
      <p>
        ようこそ、{user?.nickname ?? user?.email ?? "ゲスト"}さん！
      </p>

      <button onClick={handleLogout}>ログアウト</button>

      <EpisodeList
        episodes={episodes}
        onNew={handleNew}
        onDetail={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default EpisodePage;