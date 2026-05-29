function EpisodeList({
  // エピソード一覧
  episodes = [],

  // 月検索の値
  selectedMonth,
  setSelectedMonth,

  // ボタンを押した時に実行する処理
  onNew,
  onDetail,
  onEdit,
  onDelete,
  onInterviewQuestions,
}) {
  // 日付を YYYY-MM-DD の形に整える
  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return String(date).slice(0, 10);
  };

  // エピソードの日付を取得する
  const getEpisodeDate = (episode) => {
    return episode.date ?? episode.eventDate ?? "";
  };

  return (
    <div>
      <h1>自己分析ノート</h1>

      {/* 面接質問管理画面へ移動するボタン */}
      <button onClick={onInterviewQuestions}>
        面接質問管理へ
      </button>

      {/* 新規エピソード作成ボタン */}
      <button onClick={onNew}>
        新規エピソード
      </button>

      <h1>エピソード一覧</h1>

      {/* 月でエピソードを検索する部分 */}
      <div>
        <label htmlFor="episode-month">月で検索</label>
        <input
          id="episode-month"
          type="month"
          value={selectedMonth ?? ""}
          onChange={(event) => setSelectedMonth(event.target.value)}
        />

        {/* 月検索を解除するボタン */}
        <button type="button" onClick={() => setSelectedMonth("")}>
          解除
        </button>
      </div>

      {/* episodes が配列でない場合 */}
      {!Array.isArray(episodes) ? (
        <p>エピソードを取得できませんでした</p>

      // エピソードが0件の場合
      ) : episodes.length === 0 ? (
        <p>エピソードがありません</p>

      // エピソードがある場合
      ) : (
        [...episodes]
          // 日付が新しい順に並べる
          .sort((a, b) => new Date(getEpisodeDate(b)) - new Date(getEpisodeDate(a)))

          // エピソードを1件ずつ表示する
          .map((episode) => (
            <div key={episode.id}>
              {/* タイトルをクリックすると詳細画面へ移動 */}
              <h3 onClick={() => onDetail(episode)}>
                {episode.emotion === "happy" ? "😊" : "😢"}
                {episode.emotionIntensity}
                <br />
                {episode.title}
              </h3>

              {/* エピソードの日付 */}
              <p>{formatDate(getEpisodeDate(episode))}</p>

              {/* 編集ボタン */}
              <button onClick={() => onEdit(episode)}>
                編集
              </button>

              {/* 削除ボタン */}
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