
function EpisodeForm({ 
    // 編集中のエピソード
    editId, 
    // 入力値
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
    // 深堀質問
    questions,
    //　質問への回答
    answers, 
    setAnswers, 
    // 保存・更新ボタンを押したときに実行する関数
    onSave,
    // 戻る ボタンを押したときに実行する関数
    onBack }) {

        return (
            <div>
                {/* 一覧画面に戻るためのボタン */}
                <button onClick={onBack}>戻る</button>

                <h1>{editId === null ? "エピソード入力" : "エピソード編集"}</h1>
            
                {/* 入力値を受け取るフォーム */}
                <span>日付</span>
                <br />
                <input 
                 type="date"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                />
                <br />

                <span>タイトル</span>
                <br />
                <input
                 type="text"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                />
                <br />

                <span>詳細</span>
                <br />
                <input 
                 type="text"
                 value={detail}
                 onChange={(e) => setDetail(e.target.value)}
                />
                <br />

                <span>感情</span>
                <br />
                    <button 
                     type="button"
                     onClick={() => setEmotion("positive")}>
                        😊
                     </button>
                    <button 
                     type="button"
                     onClick={() => setEmotion("negative")}>
                        😢
                     </button>
                <br />
                
                <span>強度: {strength}</span>
                <br />
                <input
                 type="range"
                 value={strength}
                 min="1"
                 max="10"
                 onChange={(e) => setStrength(e.target.value)}
                />
                <br />

                <p>深堀質問</p>
                {questions.map((q, index) => (
                <div key={index}>
                    <p>{q}</p>
                    <input
                    type="text"
                    placeholder="回答を入力"
                    value={answers[index]}
                    onChange={(e) => {
                    // answers配列を直接変更せずコピーを作る
                    const newAnswers = [...answers];
                    // 今入力された質問番号の回答だけを更新する
                    newAnswers[index] = e.target.value;
                    // 更新した配列を state に保存する
                    setAnswers(newAnswers);
                    }} />
                </div>
                ))}

                <br />

                {/* 保存・更新ボタン */}
                <button onClick={onSave}>
                    {editId === null ? "保存" : "更新"}
                </button>
            </div>
        );
}

export default EpisodeForm;