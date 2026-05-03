function EpisodeDetail({ episode, onBack }) {
    if (!episode) {
        return <p>エピソードが選択されていません</p>;
    }

    const questions = episode.questions || [];

    return (
        <div>
            <button onClick={onBack}>戻る</button>

            <h1>日付: {episode.date}</h1>
            <p>タイトル: {episode.title}</p>
            <p>詳細: {episode.content ?? episode.detail}</p>
            <p>感情: {episode.emotion}</p>
            <p>強度: {episode.emotionIntensity ?? episode.strength}</p>

            <h2>深堀質問と回答</h2>

            {questions.length === 0 ? (
                <p>質問と回答がありません</p>
            ) : (
                questions.map((q, index) => (
                    <div key={q.id ?? index}>
                        <p>質問: {q.question}</p>
                        <p>回答: {q.answer || "未回答"}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default EpisodeDetail;