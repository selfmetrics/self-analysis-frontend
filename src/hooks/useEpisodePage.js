import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getEpisodes,
  getEpisodeById,
  createBasicQuestions,
  completeEpisode,
  updateEpisode,
  createQuestion,
  deleteEpisode,
} from "../api/episodesApi";

function useEpisodePage({ onLogout }) {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("list");

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [emotion, setEmotion] = useState("happy");
  const [strength, setStrength] = useState(5);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [draftEpisodeId, setDraftEpisodeId] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");

  const [episodes, setEpisodes] = useState([]);
  const [detailEpisode, setDetailEpisode] = useState(null);
  const [editId, setEditId] = useState(null);

  // APIレスポンスが response.data / response のどちらでも対応する
  // 一覧データを取り出す
  const extractEpisodeList = (body) => {
    const list = body;
    return Array.isArray(list) ? list : [];
  };

  // 質問一覧を取り出す
  const extractQuestions = (episode) => {
    const questionList = episode.questions ?? [];

    return Array.isArray(questionList) ? questionList : [];
  };

  // 基本質問生成APIから episodeId を取り出す
  // 質問IDを取り出す
  // 追加された質問データを取り出す
  const fetchEpisodes = async () => {
    try {
      const episodeList = extractEpisodeList(await getEpisodes());
      setEpisodes(episodeList);
    } catch (error) {
      console.error("エピソード一覧取得エラー:", error);
      setEpisodes([]);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setDraftEpisodeId(null);

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

    try {
      const episode = await createBasicQuestions();

      const episodeId = episode.id;
      const questionList = extractQuestions(episode);

      setDraftEpisodeId(episodeId);
      setQuestions(questionList);
      setAnswers(Array(questionList.length).fill(""));

      setScreen("form");
    } catch (error) {
      console.error("基本質問取得エラー:", error);

      setDraftEpisodeId(null);
      setQuestions([]);
      setAnswers([]);
      setScreen("form");
    }
  };

const handleSave = async () => {
  const episodeData = {
    date: date,
    title: title,
    content: detail,
    emotion: emotion,
    emotionIntensity: Number(strength),

    answers: questions
      .map((question, index) => ({
        questionId: question.id,
        answer: answers[index] ?? "",
      }))
      .filter((item) => item.questionId !== null),
  };

  try {
    if (editId === null) {
        await completeEpisode(episodeData);
    } else {
      await updateEpisode(editId, episodeData);
    }

    await fetchEpisodes();

    resetForm();
    setScreen("list");
  } catch (error) {
    console.error("保存エラー:", error);
    console.error("保存エラー詳細:", error.response?.data);
  }
};

  const handleAddQuestion = async () => {
    if (newQuestion.trim() === "") {
      return;
    }

    try {
      const targetEpisodeId = editId ?? draftEpisodeId;

      if (targetEpisodeId != null) {
        const createdQuestion = await createQuestion(targetEpisodeId, newQuestion);

        setQuestions([...questions, createdQuestion]);
        setAnswers([...answers, createdQuestion.answer ?? ""]);
      } else {
        setQuestions([...questions, newQuestion]);
        setAnswers([...answers, ""]);
      }

      setNewQuestion("");
    } catch (error) {
      console.error("質問追加エラー:", error);
    }
  };

  const handleDetail = async (episode) => {
    try {
      const data = await getEpisodeById(episode.id);

      const questionList = extractQuestions(data);

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
      console.error("詳細取得エラー:", error);
    }
  };

  const handleEdit = async (episode) => {
    try {
      const data = await getEpisodeById(episode.id);

      const questionList = extractQuestions(data);

      setEditId(data.id);
      setDraftEpisodeId(null);

      setDate(data.date?.slice(0, 10) ?? "");
      setTitle(data.title ?? "");
      setDetail(data.content ?? "");
      setEmotion(data.emotion ?? "happy");
      setStrength(data.emotionIntensity ?? 5);

      setQuestions(questionList);
      setAnswers(
        questionList.map((question) => question.answer ?? "")
      );

      setScreen("form");
    } catch (error) {
      console.error("編集データ取得エラー:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEpisode(id);
      await fetchEpisodes();
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  const handleLogout = async () => {
    await onLogout();

    setEpisodes([]);
    setScreen("list");
    resetForm();
  };

  const goList = () => {
    setScreen("list");
  };

  const goInterviewQuestions = () => {
    navigate("/interview-questions");
  };

  return {
    screen,

    date,
    setDate,
    title,
    setTitle,
    detail,
    setDetail,
    emotion,
    setEmotion,
    strength,
    setStrength,

    questions,
    answers,
    setAnswers,

    newQuestion,
    setNewQuestion,

    episodes,
    detailEpisode,
    editId,

    handleNew,
    handleSave,
    handleAddQuestion,
    handleDetail,
    handleEdit,
    handleDelete,
    handleLogout,

    goList,
    goInterviewQuestions,
  };
}

export default useEpisodePage;
