import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getInterviewQuestions,
  createInterviewQuestion,
  updateInterviewQuestionAnswer,
  deleteInterviewQuestion,
} from "../api/interviewQuestionApi";

function InterviewQuestionPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const extractQuestions = (body) => {
    const data = body.data ?? body;

    return (
      data.questions ??
      data.question ??
      data.interviewQuestions ??
      data.interview_questions ??
      []
    );
  };

  const getQuestionId = (question) => {
    return (
      question.id ??
      question.questionId ??
      question.question_id ??
      question.interviewQuestionId ??
      question.interview_question_id ??
      null
    );
  };

  const getQuestionText = (question) => {
    return (
      question.question ??
      question.content ??
      question.text ??
      question.title ??
      ""
    );
  };

  const getAnswerText = (question) => {
    return (
      question.answer ??
      question.answerText ??
      question.answer_text ??
      ""
    );
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const response = await getInterviewQuestions();
      console.log("面接質問一覧APIレスポンス:", response);

      const questionList = extractQuestions(response);
      setQuestions(questionList);
    } catch (error) {
      console.error("面接質問一覧取得エラー:", error);
      alert("面接質問一覧の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreateQuestion = async () => {
    if (newQuestion.trim() === "") {
      alert("質問を入力してください。");
      return;
    }

    try {
      const questionData = {
        question: newQuestion,
        answer: newAnswer,
      };

      await createInterviewQuestion(questionData);

      setNewQuestion("");
      setNewAnswer("");

      await fetchQuestions();
    } catch (error) {
      console.error("面接質問作成エラー:", error);
      alert("面接質問の作成に失敗しました。");
    }
  };

  const handleStartEdit = (question) => {
    const questionId = getQuestionId(question);

    if (questionId === null) {
      alert("質問IDが取得できません。");
      return;
    }

    setEditingId(questionId);
    setEditingAnswer(getAnswerText(question));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAnswer("");
  };

  const handleUpdateAnswer = async (questionId) => {
    if (questionId === null) {
      alert("質問IDが取得できません。");
      return;
    }

    try {
      const answerData = {
        answer: editingAnswer,
      };

      await updateInterviewQuestionAnswer(questionId, answerData);

      setEditingId(null);
      setEditingAnswer("");

      await fetchQuestions();
    } catch (error) {
      console.error("面接質問回答修正エラー:", error);
      alert("回答の修正に失敗しました。");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (questionId === null) {
      alert("質問IDが取得できません。");
      return;
    }

    const confirmDelete = window.confirm("この面接質問を削除しますか？");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteInterviewQuestion(questionId);
      await fetchQuestions();
    } catch (error) {
      console.error("面接質問削除エラー:", error);
      alert("面接質問の削除に失敗しました。");
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>自己分析ノートへ戻る</button>

      <h1>面接質問管理</h1>

      <section>
        <h2>新規面接質問追加</h2>

        <div>
          <label>質問</label>
          <br />

          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="例：自己紹介をしてください。"
          />
        </div>

        <div>
          <label>回答</label>
          <br />

          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="回答例を入力してください。"
            rows={4}
          />
        </div>

        <button onClick={handleCreateQuestion}>追加</button>
      </section>

      <hr />

      <section>
        <h2>面接質問一覧</h2>

        {loading && <p>読み込み中...</p>}

        {!loading && questions.length === 0 && (
          <p>面接質問がありません。</p>
        )}

        {questions.map((question, index) => {
          const questionId = getQuestionId(question);
          const questionText = getQuestionText(question);
          const answerText = getAnswerText(question);

          return (
            <div key={questionId ?? index}>
              <h3>{questionText}</h3>

              {editingId === questionId ? (
                <>
                  <textarea
                    value={editingAnswer}
                    onChange={(e) => setEditingAnswer(e.target.value)}
                    rows={5}
                  />

                  <br />

                  <button onClick={() => handleUpdateAnswer(questionId)}>
                    保存
                  </button>

                  <button onClick={handleCancelEdit}>
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <p>
                    <strong>回答：</strong>
                  </p>

                  <p>{answerText || "回答がまだ登録されていません。"}</p>

                  <button onClick={() => handleStartEdit(question)}>
                    回答を編集
                  </button>

                  <button onClick={() => handleDeleteQuestion(questionId)}>
                    削除
                  </button>
                </>
              )}

              <hr />
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default InterviewQuestionPage;