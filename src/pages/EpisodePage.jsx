// エピソード一覧を表示するコンポーネント
import EpisodeList from "../components/EpisodeList";

// エピソードの新規作成・編集フォームを表示するコンポーネント
import EpisodeForm from "../components/EpisodeForm";

// エピソード詳細画面を表示するコンポーネント
import EpisodeDetail from "../components/EpisodeDetail";

// エピソード画面で使う state や処理をまとめたカスタムHook
import useEpisodePage from "../hooks/useEpisodePage";

// エピソード画面全体を管理するコンポーネント
// user: ログイン中のユーザー情報
// onLogout: App.jsx から渡されたログアウト処理
function EpisodePage({ user, onLogout }) {
  // useEpisodePage から、画面表示に必要な state と関数を受け取る
  const {
    // 現在表示している画面
    // list: 一覧画面
    // form: 入力・編集画面
    // detail: 詳細画面
    screen,

    // エピソード入力フォームの値
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

    // 深掘り質問と回答
    questions,
    answers,
    setAnswers,

    // 新しく追加する質問の入力値
    newQuestion,
    setNewQuestion,

    // エピソード一覧
    episodes,

    // 月ごとの絞り込みに使う値
    selectedMonth,
    setSelectedMonth,

    // 詳細画面で表示するエピソード
    detailEpisode,

    // 編集中のエピソードID
    // null の場合は新規作成
    editId,

    // 各ボタン操作で実行される処理
    handleNew,
    handleSave,
    handleAddQuestion,
    handleDeleteQuestion,
    handleDetail,
    handleEdit,
    handleDelete,
    handleLogout,

    // 画面移動用の処理
    goList,
    goInterviewQuestions,
  } = useEpisodePage({ onLogout });

  // screen が "form" の場合は、入力・編集フォームを表示する
  if (screen === "form") {
    return (
      <EpisodeForm
        // 編集中のIDを渡す
        editId={editId}

        // フォームの入力値と更新関数を渡す
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

        // 質問と回答のデータを渡す
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}

        // 新規質問の入力値と更新関数を渡す
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}

        // 質問追加ボタンを押した時の処理
        onAddQuestion={handleAddQuestion}

        // 質問削除ボタンを押した時の処理
        onDeleteQuestion={handleDeleteQuestion}

        // 保存ボタンを押した時の処理
        onSave={handleSave}

        // 戻るボタンを押した時の処理
        onBack={goList}
      />
    );
  }

  // screen が "detail" の場合は、詳細画面を表示する
  if (screen === "detail") {
    return (
      <EpisodeDetail
        // 詳細表示するエピソードを渡す
        episode={detailEpisode}

        // 戻るボタンを押した時の処理
        onBack={goList}
      />
    );
  }

  // screen が "list" の場合は、一覧画面を表示する
  return (
    <div>
      {/* ログイン中ユーザーの名前を表示する */}
      {/* nickname があれば nickname、なければ email、それもなければ ゲスト を表示する */}
      <p>
        ようこそ、{user?.nickname ?? user?.email ?? "ゲスト"}さん！
      </p>

      {/* ログアウトボタン */}
      <button type="button" onClick={handleLogout}>
        ログアウト
      </button>

      {/* エピソード一覧コンポーネント */}
      <EpisodeList
        // エピソード一覧データ
        episodes={episodes}

        // 月ごとの絞り込み用データ
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}

        // 新規作成ボタンを押した時の処理
        onNew={handleNew}

        // 詳細ボタンを押した時の処理
        onDetail={handleDetail}

        // 編集ボタンを押した時の処理
        onEdit={handleEdit}

        // 削除ボタンを押した時の処理
        onDelete={handleDelete}

        // 面接質問ページへ移動する処理
        onInterviewQuestions={goInterviewQuestions}
      />
    </div>
  );
}

export default EpisodePage;