// ReactのHookを読み込む
// useState: 画面の状態を管理する
// useEffect: 画面が表示された時などに処理を実行する
import { useEffect, useState } from "react";

// ページ遷移を行うためのHook
import { useNavigate } from "react-router-dom";

// エピソード関連のAPI関数を読み込む
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

const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

// EpisodePageで使う処理やstateをまとめたカスタムHook
function useEpisodePage({ onLogout }) {
  // 他のページへ移動するために使う
  const navigate = useNavigate();

  // 現在表示している画面を管理する
  // list: 一覧画面
  // form: 入力・編集画面
  // detail: 詳細画面
  const [screen, setScreen] = useState("list");

  // エピソード入力フォームの値を管理するstate
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [emotion, setEmotion] = useState("happy");
  const [strength, setStrength] = useState(5);

  // 深堀質問の一覧を管理する
  const [questions, setQuestions] = useState([]);

  // 各質問に対する回答を管理する
  // questionsのindexとanswersのindexを対応させている
  const [answers, setAnswers] = useState([]);

  // 新規作成時に、基本質問を作った段階の仮エピソードIDを保存する
  const [draftEpisodeId, setDraftEpisodeId] = useState(null);

  // ユーザーが新しく追加する質問の入力値
  const [newQuestion, setNewQuestion] = useState("");

  // エピソード一覧を管理する
  const [episodes, setEpisodes] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  // 詳細画面で表示するエピソード情報
  const [detailEpisode, setDetailEpisode] = useState(null);

  // 編集中のエピソードID
  // null の場合は「新規作成」
  // IDが入っている場合は「編集」
  const [editId, setEditId] = useState(null);

  // 既にDBに存在している質問への回答データを作る
  const buildAnswerData = () => {
    return questions
      .map((question, index) => {
        // question.id がない場合はDB上の質問ではないため送信しない
        if (question.id == null) {
          return null;
        }

        // APIに送る回答データの形に整える
        return {
          questionId: question.id,
          answer: answers[index] ?? "",
        };
      })
      // null を取り除く
      .filter((item) => item !== null);
  };

  // まだDBに保存されていない新規質問データを作る
  const buildNewQuestionData = () => {
    return questions
      .map((question, index) => {
        // 文字列の質問だけを「新しく追加された質問」として扱う
        if (typeof question !== "string") {
          return null;
        }

        return {
          question: question.trim(),
          answer: answers[index] ?? "",
        };
      })
      // null と空文字の質問を取り除く
      .filter((item) => item !== null && item.question !== "");
  };

  const getMonthRange = (month) => {
    if (!month) {
      return {};
    }

    const [year, monthNumber] = month.split("-").map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();

    return {
      startDate: `${month}-01`,
      endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
    };
  };

  // エピソード一覧を取得する処理
  const fetchEpisodes = async () => {
    try {
      // APIからエピソード一覧を取得してstateに保存する
      setEpisodes(await getEpisodes(getMonthRange(selectedMonth)));
    } catch (error) {
      console.error("エピソード一覧取得エラー:", error);

      // 取得に失敗した場合は空配列にする
      setEpisodes([]);
    }
  };

  // このHookが最初に使われた時に、エピソード一覧を取得する
  useEffect(() => {
    fetchEpisodes();
  }, [selectedMonth]);

  // 入力フォームを初期状態に戻す処理
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

  // 「新規エピソード」ボタンを押した時の処理
  const handleNew = async () => {
    // まずフォームを空にする
    resetForm();

    try {
      // バックエンドで基本質問を作成・取得する
      const episode = await createBasicQuestions();

      // 作成された基本質問一覧を取り出す
      const questionList = episode.questions;

      // 仮エピソードIDを保存する
      setDraftEpisodeId(episode.id);

      // 質問一覧をstateに保存する
      setQuestions(questionList);

      // 質問数と同じ数だけ、空の回答欄を作る
      setAnswers(Array(questionList.length).fill(""));

      // 入力フォーム画面に切り替える
      setScreen("form");
    } catch (error) {
      console.error("基本質問取得エラー:", error);
      alert("基本質問の取得に失敗しました。ブラウザのコンソールを確認してください。");

      // 失敗した場合でもフォームは開く
      setDraftEpisodeId(null);
      setQuestions([]);
      setAnswers([]);
      setScreen("form");
    }
  };

  // 保存ボタンを押した時の処理
  const handleSave = async () => {
    // 既存質問に対する回答データを作る
    const answerData = buildAnswerData();
    const enteredAnswerData = answerData.filter(
      (item) => item.answer.trim() !== ""
    );

    // APIに送るエピソードデータを作る
    const episodeData = {
      date: date,
      title: title,
      content: detail,
      emotion: emotion,
      emotionIntensity: Number(strength),
      answers: enteredAnswerData,
    };

    try {
      // editId が null の場合は新規作成
      if (editId === null) {
        // エピソードを完成・保存する
        const savedEpisode = await completeEpisode(episodeData);

        // 保存後に返ってきたエピソードIDを取得する
        const savedEpisodeId = savedEpisode.episodeId ?? savedEpisode.id;

        // 新しく追加した質問があれば、1つずつDBに保存する
        await Promise.all(
          buildNewQuestionData().map(async (item) => {
            const createdQuestion = await createQuestion(
              savedEpisodeId,
              item.question
            );

            // 新規質問に回答も入力されている場合は、回答も保存する
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
        // editId がある場合は既存エピソードの更新
        await updateEpisode(editId, episodeData);

        // 回答が入力されているものだけ更新する
        await Promise.all(
          enteredAnswerData.map((item) =>
            updateQuestionAnswer(editId, item.questionId, item.answer)
          )
        );
      }

      // 保存後、一覧を再取得する
      await fetchEpisodes();

      // フォームを初期化する
      resetForm();

      // 一覧画面へ戻る
      setScreen("list");
    } catch (error) {
      console.error("保存エラー:", error);
      console.error("保存エラー詳細:", error.response?.data);
      alert("エピソードの保存に失敗しました。ブラウザのコンソールを確認してください。");
    }
  };

  // 質問追加ボタンを押した時の処理
  const handleAddQuestion = async () => {
    // 入力欄が空なら何もしない
    if (newQuestion.trim() === "") {
      return;
    }

    try {
      // 編集中なら editId、新規作成中なら draftEpisodeId を使う
      const targetEpisodeId = editId ?? draftEpisodeId;

      // 保存済みまたは仮作成済みのエピソードIDがある場合
      if (targetEpisodeId != null) {
        // DBに質問を追加する
        const createdQuestion = await createQuestion(targetEpisodeId, newQuestion);

        // 画面上の質問一覧にも追加する
        setQuestions((currentQuestions) => [
          ...currentQuestions,
          createdQuestion,
        ]);

        // 回答欄も1つ追加する
        setAnswers((currentAnswers) => [
          ...currentAnswers,
          createdQuestion.answer,
        ]);
      } else {
        // エピソードIDがまだない場合は、画面上だけに質問を追加する
        setQuestions((currentQuestions) => [...currentQuestions, newQuestion]);

        // 回答欄も空で追加する
        setAnswers((currentAnswers) => [...currentAnswers, ""]);
      }

      // 質問入力欄を空にする
      setNewQuestion("");
    } catch (error) {
      console.error("質問追加エラー:", error);
      alert("質問の追加に失敗しました。ブラウザのコンソールを確認してください。");
    }
  };

  // 質問削除ボタンを押した時の処理
  const handleDeleteQuestion = async (index) => {
    // 削除対象の質問を取得する
    const targetQuestion = questions[index];

    // 削除確認ダイアログを表示する
    if (!window.confirm("この質問を削除しますか？")) {
      return;
    }

    try {
      // 編集中かつDBに存在する質問の場合は、DBから削除する
      if (editId !== null && typeof targetQuestion === "object") {
        await deleteQuestion(targetQuestion.id);
      }

      // 画面上の質問一覧から削除する
      setQuestions((currentQuestions) =>
        currentQuestions.filter((_, questionIndex) => questionIndex !== index)
      );

      // 質問に対応する回答も削除する
      setAnswers((currentAnswers) =>
        currentAnswers.filter((_, answerIndex) => answerIndex !== index)
      );
    } catch (error) {
      console.error("質問削除エラー:", error);
      console.error("質問削除エラー詳細:", error.response?.data);
      alert("質問の削除に失敗しました。追加した質問だけ削除できます。");
    }
  };

  // エピソード詳細ボタンを押した時の処理
  const handleDetail = async (episode) => {
    try {
      // 選択したエピソードの詳細情報をAPIから取得する
      const data = await getEpisodeById(episode.id);

      // 詳細画面に表示するデータをstateに保存する
      setDetailEpisode({
        id: data.id,
        date: data.date,
        title: data.title,
        content: data.content ?? "",
        emotion: data.emotion,
        emotionIntensity: data.emotionIntensity,
        questions: data.questions,
      });

      // 詳細画面へ切り替える
      setScreen("detail");
    } catch (error) {
      console.error("詳細取得エラー:", error);
    }
  };

  // 編集ボタンを押した時の処理
  const handleEdit = async (episode) => {
    try {
      // 編集対象のエピソード詳細をAPIから取得する
      const data = await getEpisodeById(episode.id);

      // 編集中のIDを保存する
      setEditId(data.id);

      // 編集時は仮エピソードIDを使わない
      setDraftEpisodeId(null);

      // 取得したデータをフォームにセットする
      setDate(data.date?.slice(0, 10) ?? "");
      setTitle(data.title ?? "");
      setDetail(data.content ?? "");
      setEmotion(data.emotion ?? "happy");
      setStrength(data.emotionIntensity ?? 5);

      // 質問一覧をセットする
      setQuestions(data.questions);

      // 各質問の回答をフォームにセットする
      setAnswers(
        data.questions.map((question) => question.answer ?? "")
      );

      // 入力フォーム画面へ切り替える
      setScreen("form");
    } catch (error) {
      console.error("編集データ取得エラー:", error);
    }
  };

  // エピソード削除ボタンを押した時の処理
  const handleDelete = async (id) => {
    try {
      // 指定したIDのエピソードを削除する
      await deleteEpisode(id);

      // 削除後、一覧を再取得する
      await fetchEpisodes();
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  // ログアウトボタンを押した時の処理
  const handleLogout = async () => {
    // App側から渡されたログアウト処理を実行する
    await onLogout();

    // ログアウト後、画面状態をリセットする
    setEpisodes([]);
    setScreen("list");
    resetForm();
  };

  // 一覧画面へ戻る処理
  const goList = () => {
    setScreen("list");
  };

  // 面接質問ページへ移動する処理
  const goInterviewQuestions = () => {
    navigate("/interview-questions");
  };

  // EpisodePage.jsx などで使えるように、stateと関数を返す
  const getEpisodeDate = (episode) => {
    return episode.date ?? episode.eventDate ?? "";
  };

  const filteredEpisodes =
    selectedMonth === ""
      ? episodes
      : episodes.filter((episode) => {
          return String(getEpisodeDate(episode)).slice(0, 7) === selectedMonth;
        });

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

    episodes: filteredEpisodes,
    selectedMonth,
    setSelectedMonth,
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
