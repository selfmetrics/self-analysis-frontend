import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getEpisodes,
  getEpisodeById,
  createBasicQuestions,
  completeEpisode,
  updateEpisode,
  updateQuestionAnswer,
  createQuestion,
  deleteQuestion,
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

  const buildAnswerData = () => {
    return questions
      .map((question, index) => {
        if (question.id == null) {
          return null;
        }

        return {
          questionId: question.id,
          answer: answers[index] ?? "",
        };
      })
      .filter((item) => item !== null);
  };

  const buildNewQuestionData = () => {
    return questions
      .map((question, index) => {
        if (typeof question !== "string") {
          return null;
        }

        return {
          question: question.trim(),
          answer: answers[index] ?? "",
        };
      })
      .filter((item) => item !== null && item.question !== "");
  };

  const fetchEpisodes = async () => {
    try {
      setEpisodes(await getEpisodes());
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
      const questionList = episode.questions;

      setDraftEpisodeId(episode.id);
      setQuestions(questionList);
      setAnswers(Array(questionList.length).fill(""));

      setScreen("form");
    } catch (error) {
      console.error("基本質問取得エラー:", error);
      alert("基本質問の取得に失敗しました。ブラウザのコンソールを確認してください。");

      setDraftEpisodeId(null);
      setQuestions([]);
      setAnswers([]);
      setScreen("form");
    }
  };

  const handleSave = async () => {
    const answerData = buildAnswerData();

    const episodeData = {
      date: date,
      title: title,
      content: detail,
      emotion: emotion,
      emotionIntensity: Number(strength),
      answers: answerData,
    };

    try {
      if (editId === null) {
        const savedEpisode = await completeEpisode(episodeData);
        const savedEpisodeId = savedEpisode.episodeId ?? savedEpisode.id;

        await Promise.all(
          buildNewQuestionData().map(async (item) => {
            const createdQuestion = await createQuestion(
              savedEpisodeId,
              item.question
            );

            if (item.answer.trim() !== "") {
              await updateQuestionAnswer(
                savedEpisodeId,
                createdQuestion.id,
                item.answer
              );
            }
          })
        );
      } else {
        await updateEpisode(editId, episodeData);
        await Promise.all(
          answerData
            .filter((item) => item.answer.trim() !== "")
            .map((item) =>
              updateQuestionAnswer(editId, item.questionId, item.answer)
            )
        );
      }

      await fetchEpisodes();

      resetForm();
      setScreen("list");
    } catch (error) {
      console.error("保存エラー:", error);
      console.error("保存エラー詳細:", error.response?.data);
      alert("エピソードの保存に失敗しました。ブラウザのコンソールを確認してください。");
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

        setQuestions((currentQuestions) => [
          ...currentQuestions,
          createdQuestion,
        ]);
        setAnswers((currentAnswers) => [
          ...currentAnswers,
          createdQuestion.answer,
        ]);
      } else {
        setQuestions((currentQuestions) => [...currentQuestions, newQuestion]);
        setAnswers((currentAnswers) => [...currentAnswers, ""]);
      }

      setNewQuestion("");
    } catch (error) {
      console.error("質問追加エラー:", error);
      alert("質問の追加に失敗しました。ブラウザのコンソールを確認してください。");
    }
  };

  const handleDeleteQuestion = async (index) => {
    const targetQuestion = questions[index];

    if (!window.confirm("この質問を削除しますか？")) {
      return;
    }

    try {
      if (editId !== null && typeof targetQuestion === "object") {
        await deleteQuestion(targetQuestion.id);
      }

      setQuestions((currentQuestions) =>
        currentQuestions.filter((_, questionIndex) => questionIndex !== index)
      );
      setAnswers((currentAnswers) =>
        currentAnswers.filter((_, answerIndex) => answerIndex !== index)
      );
    } catch (error) {
      console.error("質問削除エラー:", error);
      console.error("質問削除エラー詳細:", error.response?.data);
      alert("質問の削除に失敗しました。追加した質問だけ削除できます。");
    }
  };

  const handleDetail = async (episode) => {
    try {
      const data = await getEpisodeById(episode.id);

      setDetailEpisode({
        id: data.id,
        date: data.date,
        title: data.title,
        content: data.content ?? "",
        emotion: data.emotion,
        emotionIntensity: data.emotionIntensity,
        questions: data.questions,
      });

      setScreen("detail");
    } catch (error) {
      console.error("詳細取得エラー:", error);
    }
  };

  const handleEdit = async (episode) => {
    try {
      const data = await getEpisodeById(episode.id);

      setEditId(data.id);
      setDraftEpisodeId(null);

      setDate(data.date?.slice(0, 10) ?? "");
      setTitle(data.title ?? "");
      setDetail(data.content ?? "");
      setEmotion(data.emotion ?? "happy");
      setStrength(data.emotionIntensity ?? 5);

      setQuestions(data.questions);
      setAnswers(
        data.questions.map((question) => question.answer ?? "")
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
    handleDeleteQuestion,
    handleDetail,
    handleEdit,
    handleDelete,
    handleLogout,

    goList,
    goInterviewQuestions,
  };
}

export default useEpisodePage;
