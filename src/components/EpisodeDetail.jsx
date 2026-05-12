function EpisodeDetail({ episode, onBack }) {
  if (!episode) {
    return <p>エピソードが選択されていません</p>;
  }

  const questions = episode.questions ?? [];

  // 同じ質問IDが重複している場合、回答があるものを優先して残す
  const uniqueQuestions = questions.reduce((result, current) => {
    const existingIndex = result.findIndex((q) => q.id === current.id);

    if (existingIndex === -1) {
      result.push(current);
      return result;
    }

    const existingAnswer = result[existingIndex].answer;
    const currentAnswer = current.answer;

    if (!existingAnswer && currentAnswer) {
      result[existingIndex] = current;
    }

    return result;
  }, []);

  return (
    <div>
      <button onClick={onBack}>戻る</button>

      <h1>日付: {episode.date?.slice(0, 10)}</h1>
      <p>タイトル: {episode.title}</p>
      <p>詳細: {episode.content ?? episode.detail}</p>
      <p>感情: {episode.emotion}</p>
      <p>強度: {episode.emotionIntensity ?? episode.strength}</p>

      <h2>深堀質問と回答</h2>

      {uniqueQuestions.length === 0 ? (
        <p>質問と回答がありません</p>
      ) : (
        uniqueQuestions.map((q) => (
          <div key={q.id}>
            <p>質問: {q.question}</p>
            <p>回答: {q.answer || "未回答"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default EpisodeDetail;