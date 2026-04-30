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
  

  // 保存されたエピソード一覧
  const [episodes, setEpisodes] = useState([]);


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
        <br />
        <button onClick={() => {
          setEpisodes([...episodes, { date, title, detail, emotion }]);
          setDate("");
          setTitle("");
          setDetail("");
          setEmotion("");
        }}>保存</button>
      </div>
    )
  };
  
  return(
    <div>
      <h1>自己分析ノート</h1>
      <button onClick={() => setScreen("form")}>新規エピソード</button>
    </div>
  )

    
};
export default App;