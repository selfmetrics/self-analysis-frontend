import React, { useState } from "react";

function App() {
  // 画面切り替え用
  const [screen, setScreen] = useState("list");

  // 入力欄
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [emotion, setEmotion] = useState("positive");
  const [strength, setStrength] = useState(5);
  
  // 質問集
  const questions = [
    "その時、どんな感情を感じた？",
    "その出来事から何を学んだ？",
    "その経験は今の自分にどう影響している？",
  ];

  // 質問への回答
  const [answers, setAnswers] = useState(Array(questions.length).fill("")); 

  // 保存されたエピソード一覧
  const [episodes, setEpisodes] = useState([]);

  // エピソード詳細
  const [selectedEpisode, setSelectedEpisode] = useState(null);


  // 入力フォーム
  if (screen === "form") {
    return (
      <div>
        <h1>エピソード入力</h1>

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
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />

        <span>詳細</span>
        <br />
        <input
          type="text"
          placeholder="詳細"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <br />

        <span>感情</span>
        <br />
        <button onClick={() => setEmotion("positive")}>
          ポジティブ😊
        </button>
        <button onClick={() => setEmotion("negative")}>
          ネガティブ😢
        </button>

        <p>強度: {strength}</p>
        <input
          type="range"
          min="1"
          max="10"
          value={strength}
          onChange={(e) => setStrength(e.target.value)}
        />

        <p>深堀質問</p>
        {questions.map((q, index) => (
          <div key={index}>
            <p>{q}</p>
            <input
             type="text"
             placeholder="回答を入力"
             value={answers[index]}
             onChange={(e) => {
               const newAnswers = [...answers];
               newAnswers[index] = e.target.value;
               setAnswers(newAnswers);
             }} />
          </div>
        ))}
        <br />
        <button onClick={() => {
          setEpisodes([...episodes,
             { 
              id: Date.now(),
              date,
              title,
              detail,
              emotion,
              strength,
              questions,
              answers
            }
          ]);
          setDate("");
          setTitle("");
          setDetail("");
          setEmotion("positive");
          setStrength(5);
          setAnswers(Array(questions.length).fill(""));
          setScreen("list");
        }}>保存</button>
      </div>
    )
  };

  // 詳細画面
  if (screen === "detail") {
    return (
      <div>
        <button onClick={() => setScreen("list")}>戻る</button>
      
        <h1>{selectedEpisode.title}</h1>
        <p>日付:{selectedEpisode.date}</p>
        <p>詳細:{selectedEpisode.detail}</p>
        <p>感情:{selectedEpisode.emotion}</p>
        <p>強度:{selectedEpisode.strength}</p>

        <h2>深堀質問</h2>
        {selectedEpisode.questions.map((q, index) => (
          <div key={index}>
            <p>{q}</p>
            <p>{selectedEpisode.answers[index]}</p>
          </div>
        ))}
      </div>
    );
  }

  // 一覧画面
    return (
       <div>
      <h1>自己分析ノート</h1>
      <button onClick={() => setScreen("form")}>新規エピソード</button>

      <h1>エピソード一覧</h1>
      {episodes.length === 0 ? (
         <p>エピソードがありません</p>
      ) : (
        [...episodes]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((episode) => (
            <div key={episode.id}>
              <h3 
                onClick={() => {
                  setSelectedEpisode(episode);
                  setScreen("detail");
                }}>
              {episode.emotion === "positive" ? "😊" : "😢"}
              {episode.strength} 
              <br />
              {episode.title}
              </h3>
              <p>{episode.date}</p>
              <button onClick={() => {
                const newEpisodes = episodes.filter((item) => item.id !== episode.id);
                setEpisodes(newEpisodes);
              }}>削除</button>
            </div>
          ))
      )}
      </div>
    );
  };

export default App;