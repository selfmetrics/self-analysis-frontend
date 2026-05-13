function EpisodeList({
  episodes = [],
  onNew,
  onDetail,
  onEdit,
  onDelete,
  onInterviewQuestions,
}) {
  return (
    <div>
      <h1>自己分析ノート</h1>

      <button onClick={onInterviewQuestions}>
        面接質問管理へ
      </button>

      <button onClick={onNew}>
        新規エピソード
      </button>

      <h1>エピソード一覧</h1>

      {!Array.isArray(episodes) ? (
        <p>エピソードを取得できませんでした</p>
      ) : episodes.length === 0 ? (
        <p>エピソードがありません</p>
      ) : (
        [...episodes]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((episode) => (
            <div key={episode.id}>
              <h3 onClick={() => onDetail(episode)}>
                {episode.emotion === "happy" ? "😊" : "😢"}
                {episode.emotionIntensity}
                <br />
                {episode.title}
              </h3>

              <p>{episode.date}</p>

              <button onClick={() => onEdit(episode)}>
                編集
              </button>

              <button onClick={() => onDelete(episode.id)}>
                削除
              </button>
            </div>
          ))
      )}
    </div>
  );
}

export default EpisodeList;