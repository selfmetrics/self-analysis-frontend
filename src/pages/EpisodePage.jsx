import { useEffect, useState } from "react";

import EpisodeList from "../components/EpisodeList";
import EpisodeForm from "../components/EpisodeForm";
import EpisodeDetail from "../components/EpisodeDetail";

import {
  getEpisodes,
  getEpisodeById,
  updateEpisode,
  createQuestion,
  deleteEpisode,
} from "../api/episodesApi";

function EpisodePage({ user, onLogout }) {
  // 現在表示している画面を管理する
  const [screen, setScreen] = useState("list");

  // フォームの入力値を管理する
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [emotion, setEmotion] = useState("happy");
  const [strength, setStrength] = useState(5);

  // 初期表示用の基本質問
  const defaultQuestions = [
    "その時、どんな感情を感じた？",
    "その出来事から何を学んだ？",
    "その経験は今の自分にどう影響している？",
  ];

  // 深掘り質問の内容を管理する
  const [questions, setQuestions] = useState(defaultQuestions);

  // 深掘り質問に対する回答を管理する
  const [answers, setAnswers] = useState(
    Array(defaultQuestions.length).fill("")
  );

  // DBに保存された質問IDを管理する
  const [questionIds, setQuestionIds] = useState([]);

  // 追加する質問の入力値を管理する
  const [newQuestion, setNewQuestion] = useState("");

  // APIから取得したエピソード一覧を保存する
  const [episodes, setEpisodes] = useState([]);

  // 詳細画面で表示するエピソードを保存する
  const [detailEpisode, setDetailEpisode] = useState(null);

  // 編集中のエピソードIDを保存する
  const [editId, setEditId] = useState(null);

  // エピソード一覧を取得する共通処理
  const fetchEpisodes = async () => {
    try {
      const data = await getEpisodes();

      if (Array.isArray(data)) {
        setEpisodes(data);
      } else {
        setEpisodes(data.data ?? []);
      }
    } catch (error) {
      console.error("エピソード一覧取得エラー:", error);
      setEpisodes([]);
    }
  };

  // EpisodePage が表示されたらエピソード一覧を取得する
  useEffect(() => {
    fetchEpisodes();
  }, []);

  // フォームの入力内容を初期状態に戻す
  const resetForm = () => {
    setEditId(null);
    setDate("");
    setTitle("");
    setDetail("");
    setEmotion("happy");
    setStrength(5);

    setQuestions(defaultQuestions);
    setAnswers(Array(defaultQuestions.length).fill(""));
    setQuestionIds([]);
    setNewQuestion("");
  };

  // 「新規エピソード」ボタンを押したときの処理
  const handleNew = () => {
    resetForm();
    setScreen("form");
  };

  // 「保存」ボタンを押したときの処理
  const handleSave = async () => {
    const episodeData = {
      date: date,
      title: title,
      content: detail,
      emotion: emotion,
      emotionIntensity: Number(strength),
      answers: questions.map((question, index) => ({
        question: question,
        answer: answers[index] || "",
      })),
    };

    console.log("送信データ:", episodeData);

    if (editId === null) {
      await createQuestion(episodeData);
    } else {
      await updateEpisode(editId, episodeData);
    }

    await fetchEpisodes();

    resetForm();
    setScreen("list");
  };

  // 新たに質問を追加する処理
  const handleAddQuestion = async () => {
    if (newQuestion.trim() === "") {
      return;
    }

    if (editId !== null) {
      const createdQuestion = await createQuestion(editId, newQuestion);

      setQuestionIds([...questionIds, createdQuestion.id]);
      setQuestions([...questions, createdQuestion.question]);
      setAnswers([...answers, createdQuestion.answer ?? ""]);
    } else {
      setQuestions([...questions, newQuestion]);
      setAnswers([...answers, ""]);
    }

    setNewQuestion("");
  };

  // 一覧のエピソードをクリックしたときの処理
  const handleDetail = async (episode) => {
    const response = await getEpisodeById(episode.id);

    const data = response.data ?? response;

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
  };

  // 編集ボタンを押したときの処理
  const handleEdit = async (episode) => {
    const response = await getEpisodeById(episode.id);

    const data = response.data ?? response;

    setEditId(data.id);

    setDate(data.date?.slice(0, 10) ?? data.eventDate?.slice(0, 10) ?? "");
    setTitle(data.title ?? "");
    setDetail(data.content ?? "");
    setEmotion(data.emotion ?? "happy");
    setStrength(data.emotionIntensity ?? data.emotionScore ?? 5);

    setAnswers(Array(questions.length).fill(""));

    setScreen("form");
  };

  // 削除ボタンを押したときの処理
  const handleDelete = async (id) => {
    await deleteEpisode(id);
    await fetchEpisodes();
  };

  // ログアウトボタンを押したときの処理
  const handleLogout = async () => {
    await onLogout();

    setEpisodes([]);
    setScreen("list");
    resetForm();
  };

  // フォーム画面
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
        onBack={() => setScreen("list")}
      />
    );
  }

  // 詳細画面
  if (screen === "detail") {
    return (
      <EpisodeDetail
        episode={detailEpisode}
        onBack={() => setScreen("list")}
      />
    );
  }

  // 一覧画面
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