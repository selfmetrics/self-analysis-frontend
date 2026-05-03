import { useEffect, useState } from "react";
import { getEpisodes, getEpisodeById } from "./api/episodesApi";
import EpisodeList from "./components/EpisodeList";
import EpisodeForm from "./components/EpisodeForm";
import EpisodeDetail from "./components/EpisodeDetail";

function App() {
  // 画面切り替え用
  const [screen, setScreen] = useState("list");

  // 入力欄
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [emotion, setEmotion] = useState("positive");
  const [strength, setStrength] = useState(5);
  
  // 質問集
  const questions = [
    "その時、どんな感情を感じた？",
    "その出来事から何を学んだ？",
    "その経験は今の自分にどう影響している？",
  ];

  // 質問への回答
  const [answers, setAnswers] = useState(Array(questions.length).fill("")); 

  // 保存されたエピソード一覧
  const [episodes, setEpisodes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // エピソード詳細
  const [detailEpisode, setDetailEpisode] = useState(null);

  // 編集中のエピソードID
  const [editId, setEditId] = useState(null);

  // アプリ起動時にエピソード一覧をAPIから取得する
  useEffect(() => {
  const fetchEpisodes = async () => {
    const data = await getEpisodes();
    setEpisodes(data);
  };

    fetchEpisodes();
  }, []);

  // フォームの入力内容を初期状態に戻す関数
  const resetForm = () => {
    setEditId(null);
    setDate("");
    setTitle("");
    setDetail("");
    setEmotion("positive");
    setStrength(5);
    setAnswers(Array(questions.length).fill(""));
  };

  // 新規エピソード作成ボタンを押したときの処理
  const handleNew = () => {
    // 前回の入力内容や編集状態をリセットする
    resetForm();
    // 入力フォーム画面に切り替える
    setScreen("form");
  };

  // 保存ボタンを押したときの処理
  const handleSave = () => {
    // 入力された内容を1つのエピソードデータとしてまとめる
    const newEpisode = {
      // 新規作成なら現在時刻をIDにする
      // 編集中なら元のIDをそのまま使う
      id: editId === null ? Date.now() : editId,
      date,
      title,
      detail,
      emotion,
      strength,
      questions,
      answers,
    };

    // editId が null の場合は新規追加
    if (editId === null) {
      setEpisodes([...episodes, newEpisode]);
    } else {
      // editId がある場合は編集保存
      const updatedEpisodes = episodes.map((episode) =>
        // 編集対象のIDと一致するエピソードだけ newEpisode に置き換える
        episode.id === editId ? newEpisode : episode
      );
      // 更新後のエピソード一覧を保存する
      setEpisodes(updatedEpisodes);
    }

    // 保存後、フォームをリセットする
    resetForm();
    // 一覧画面に戻る
    setScreen("list");
  };

  // 一覧からエピソードをクリックしたときの処理
  const handleDetail = async (episode) => {
    const data = await getEpisodeById(episode.id);

    setDetailEpisode({
      id: data.id,
      date: data.date,
      title: data.title,
      detail: data.content ?? "",
      emotion: data.emotion,
      strength: data.emotionIntensity,
    });
    setScreen("detail");
  };

  // 編集ボタンを押したときの処理
  const handleEdit = (episode) => {
    // 編集対象のIDを保存する
    setEditId(episode.id);
    // 選択したエピソードの内容をフォームにセットする
    setDate(episode.date);
    setTitle(episode.title);
    setDetail(episode.detail);
    setEmotion(episode.emotion);
    setStrength(episode.strength);
    setAnswers(episode.answers);
    // 入力フォーム画面に切り替える
    setScreen("form");
  };

  // 削除ボタンを押したときの処理
  const handleDelete = (id) => {
    // 削除対象のIDと一致しないエピソードだけを残す
    const newEpisodes = episodes.filter((episode) => episode.id !== id);
    // 削除後のエピソード一覧を保存する
    setEpisodes(newEpisodes);
  };

  // 入力フォーム
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
        onSave={handleSave}
        onBack={() => setScreen("list")}
      />
    )
  };

  // 詳細画面
  if (screen === "detail") {
    return (
      <EpisodeDetail
        episode={detailEpisode}
        onBack={() => setScreen("list")} 
      />
    );
  }

  if (loading) {
    return <p>読み込み中...</p>;
  } 

  if (error) {
    return <p>{error}</p>;
  }


  // 一覧画面
    return (
      <EpisodeList
        episodes={episodes}
        onNew={handleNew}
        onDetail={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

export default App;