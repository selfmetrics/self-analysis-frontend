
function EpisodeDetail({episode, onBack}) {
    return (
        <div>
            <button onClick={onBack}>戻る</button>
            <h1>日付: {episode.date}</h1>
            <p>タイトル: {episode.title}</p>
            <p>詳細: {episode.detail}</p>
            <p>感情: {episode.emotion}</p>
            <p>強度: {episode.strength}</p>

            <h2>深堀質問と回答</h2>
            {episode.questions.map((q, index) => (
                <div key={index}>
                    <p>{q}</p>
                    <p>{episode.answers[index]}</p>
                </div>
            ))}
        </div>
    );
}

export default EpisodeDetail;