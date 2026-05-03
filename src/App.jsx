import { useEffect, useState } from "react";
import {
  getEpisodes,
  getEpisodeById,
  createEpisode,
  updateEpisode,
  createQuestion,
  deleteEpisode,
} from "./api/episodesApi";
import EpisodeList from "./components/EpisodeList";
import EpisodeForm from "./components/EpisodeForm";
import EpisodeDetail from "./components/EpisodeDetail";

function App() {
  // 現在表示している画面を管理する
  // list: 一覧画面
  // form: 入力フォーム画面
  // detail: 詳細画面
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
  const [answers, setAnswers] = useState(Array(defaultQuestions.length).fill(""));

  // DBに保存された質問IDを管理する
  const [questionIds, setQuestionIds] = useState([]);

  // 追加する質問の入力値を管理する
  const [newQuestion, setNewQuestion] = useState("");

  // APIから取得したエピソード一覧を保存する
  const [episodes, setEpisodes] = useState([]);

  // 詳細画面で表示するエピソードを保存する
  const [detailEpisode, setDetailEpisode] = useState(null);

  // 編集中のエピソードIDを保存する
  // null の場合は新規作成
  const [editId, setEditId] = useState(null);

  // アプリが最初に表示されたときに、APIからエピソード一覧を取得する
  useEffect(() => {
    const fetchEpisodes = async () => {
      const data = await getEpisodes();

      // APIの返り値が配列なら、そのまま保存する
      if (Array.isArray(data)) {
        setEpisodes(data);
      } else {
        // APIの返り値が { data: [...] } の形なら data.data を保存する
        setEpisodes(data.data ?? []);
      }
    };

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
    // バックエンドに送るデータ
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
      await createEpisode(episodeData);

      const data = await getEpisodes();

      if (Array.isArray(data)) {
        setEpisodes(data);
      } else {
        setEpisodes(data.data ?? []);
      }
    }

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
    // 選択したエピソードの詳細をAPIから取得する
    const data = await getEpisodeById(episode.id);

    // APIから返ってきた質問データを取得する
    // なければ空配列にする
    const questionList = data.questions ?? [];

    // 詳細画面で使いやすい形にデータを整える
    setDetailEpisode({
      id: data.id,
      date: data.date,
      title: data.title,
      content: data.content ?? "",
      emotion: data.emotion,
      emotionIntensity: data.emotionIntensity,

      // DBから来た questions をそのまま渡す
      questions: questionList,
    });

    // 詳細画面に切り替える
    setScreen("detail");
  };

  // 編集ボタンを押したときの処理
  const handleEdit = async (episode) => {
    // 一覧データには詳細 content が入っていないので、詳細APIから取得する
    const data = await getEpisodeById(episode.id);

    // 編集対象のIDを保存
    setEditId(data.id);

    // 日付をフォームに入れる
    // date があれば date を使う
    // eventDate のような形式で来た場合は、先頭10文字だけ使う
    setDate(data.date ?? data.eventDate?.slice(0, 10) ?? "");

    // タイトルをフォームに入れる
    setTitle(data.title ?? "");

    // 詳細をフォームに入れる
    setDetail(data.content ?? "");

    // 感情をフォームに入れる
    setEmotion(data.emotion ?? "happy");

    // 強度をフォームに入れる
    setStrength(data.emotionIntensity ?? data.emotionScore ?? 5);

    // 質問・回答は今回は編集対象にしない
    setAnswers(Array(questions.length).fill(""));

    // 入力フォーム画面に切り替える
    setScreen("form");
  };

  // 削除ボタンを押したときの処理
  const handleDelete = async (id) => {
    await deleteEpisode(id);

    const data = await getEpisodes();

    if (Array.isArray(data)) {
      setEpisodes(data);
    } else {
      setEpisodes(data.data ?? []);
    }
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
    <EpisodeList
      episodes={episodes}
      onNew={handleNew}
      onDetail={handleDetail}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

export default App;