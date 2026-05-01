import { useState } from "react";
import EpisodeList from "./components/EpisodeList";
import EpisodeForm from "./components/EpisodeForm";

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

  // 編集中のエピソードID
  const [editId, setEditId] = useState(null);



  const resetForm = () => {
    setEditId(null);
    setDate("");
    setTitle("");
    setDetail("");
    setEmotion("positive");
    setStrength(5);
    setAnswers(Array(questions.length).fill(""));
  };

  const handleNew = () => {
    resetForm();
    setScreen("form");
  };

  const handleSave = () => {
    const newEpisode = {
      id: editId === null ? Date.now() : editId,
      date,
      title,
      detail,
      emotion,
      strength,
      questions,
      answers,
    };

    if (editId === null) {
      setEpisodes([...episodes, newEpisode]);
    } else {
      const updatedEpisodes = episodes.map((episode) =>
        episode.id === editId ? newEpisode : episode
      );
      setEpisodes(updatedEpisodes);
    }

    resetForm();
    setScreen("list");
  };

  const handleSelect = (episode) => {
    setSelectedEpisode(episode);
    setScreen("detail");
  };

  const handleEdit = (episode) => {
    setEditId(episode.id);
    setDate(episode.date);
    setTitle(episode.title);
    setDetail(episode.detail);
    setEmotion(episode.emotion);
    setStrength(episode.strength);
    setAnswers(episode.answers);
    setScreen("form");
  };

  const handleDelete = (id) => {
    const newEpisodes = episodes.filter((episode) => episode.id !== id);
    setEpisodes(newEpisodes);
  };

  // 入力フォーム
  if (screen === "form") {
    return (
      <EpisodeForm
        editId={editId}
        date={date}
        setDate={setDate}
        title={title}
        setTitle={setTitle}
        detail={detail}
        setDetail={setDetail}
        emotion={emotion}
        setEmotion={setEmotion}
        strength={strength}
        setStrength={setStrength}
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}
        onSave={handleSave}
        onBack={() => setScreen("list")}
      />
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
      <EpisodeList
        episodes={episodes}
        onNew={handleNew}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

export default App;