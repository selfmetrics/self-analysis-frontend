import EpisodeList from "../components/EpisodeList";
import EpisodeForm from "../components/EpisodeForm";
import EpisodeDetail from "../components/EpisodeDetail";

import useEpisodePage from "../hooks/useEpisodePage";

function EpisodePage({ user, onLogout }) {
  const {
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
  } = useEpisodePage({ onLogout });

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
        onBack={goList}
      />
    );
  }

  if (screen === "detail") {
    return (
      <EpisodeDetail
        episode={detailEpisode}
        onBack={goList}
      />
    );
  }

  return (
    <div>
      <p>
        ようこそ、{user?.nickname ?? user?.email ?? "ゲスト"}さん！
      </p>

      <button type="button" onClick={handleLogout}>
        ログアウト
      </button>

      <EpisodeList
        episodes={episodes}
        onNew={handleNew}
        onDetail={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onInterviewQuestions={goInterviewQuestions}
      />
    </div>
  );
}

export default EpisodePage;