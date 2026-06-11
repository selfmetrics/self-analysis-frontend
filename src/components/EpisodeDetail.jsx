function EpisodeDetail({ episode, onBack }) {
  if (!episode) {
    return <p>エピソードが選択されていません。</p>;
  }

  const questions = episode.questions || [];
  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return String(date).slice(0, 10);
  };

  return (
    <div>
      <button onClick={onBack}>戻る</button>

      <h1>日付: {formatDate(episode.date)}</h1>
      <p>タイトル: {episode.title}</p>
      <p>内容: {episode.content}</p>
      <p>感情: {episode.emotion}</p>
      <p>強さ: {episode.emotionIntensity}</p>

      <h2>深堀質問と回答</h2>

      {questions.length === 0 ? (
        <p>深堀質問と回答がありません。</p>
      ) : (
        questions.map((question, index) => (
          <div key={question.id ?? index}>
            <p>質問: {question.question}</p>
            <p>回答: {question.answer || "未回答"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default EpisodeDetail;
