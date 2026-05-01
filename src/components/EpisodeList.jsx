function EpisodeList({ episodes, onNew, onSelect, onEdit, onDelete }) {
    return (
        <div>
            <h1>自己分析ノート</h1>
            <button onClick={onNew}>新規エピソード</button>

            <h1>エピソード一覧</h1>

            {episodes.length === 0 ? (
                <p>エピソードがありません</p>
            ) : (
                [...episodes]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((episode) => (
                        <div key={episode.id}>
                            <h3 onClick={() => onSelect(episode)}>
                                {episode.emotion === "positive" ? "😊" : "😢"}
                                {episode.strength}
                                <br />
                                {episode.title}
                            </h3>
                            <p>{episode.date}</p>

                            <button onClick={() => onEdit(episode)}>編集</button>
                            <button onClick={() => onDelete(episode.id)}>削除</button>
                        </div>
                    ))
                )}
        </div>
    );
}

export default EpisodeList;