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
  questions = [],

  // 質問への回答
  answers = [],
  setAnswers,

  // 追加質問
  newQuestion,
  setNewQuestion,
  onAddQuestion,
  onDeleteQuestion,

  // 保存・更新ボタンを押したときに実行する関数
  onSave,

  // 戻るボタンを押したときに実行する関数
  onBack,
}) {
  // DBから来た質問が「文字列」でも「オブジェクト」でも表示できるようにする
  const getQuestionText = (q) => {
    if (typeof q === "string") {
      return q;
    }

    return (
      q.question ??
      q.content ??
      q.text ??
      q.body ??
      q.questionText ??
      q.question_text ??
      ""
    );
  };

  // key用
  const getQuestionKey = (q, index) => {
    if (typeof q === "object" && q !== null) {
      return `question-${q.id ?? q.questionId ?? q.question_id ?? index}-${index}`;
    }

    return `new-question-${index}`;
  };

  return (
    <div>
      {/* 一覧画面に戻るためのボタン */}
      <button type="button" onClick={onBack}>
        戻る
      </button>

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
      <button type="button" onClick={() => setEmotion("happy")}>
        😊
      </button>
      <button type="button" onClick={() => setEmotion("sad")}>
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
        <div key={getQuestionKey(q, index)}>
          <p>{getQuestionText(q)}</p>

          <input
            type="text"
            placeholder="回答を入力"
            value={answers[index] ?? ""}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[index] = e.target.value;
              setAnswers(newAnswers);
            }}
          />

          <button type="button" onClick={() => onDeleteQuestion(index)}>
            削除
          </button>
        </div>
      ))}

      <br />

      <p>質問追加</p>
      <input
        type="text"
        placeholder="追加する質問を入力"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
      />

      <button type="button" onClick={onAddQuestion}>
        質問追加
      </button>

      <br />
      <br />

      {/* 保存・更新ボタン */}
      <button type="button" onClick={onSave}>
        {editId === null ? "保存" : "更新"}
      </button>
    </div>
  );
}

export default EpisodeForm;
