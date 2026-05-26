import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getInterviewQuestions } from "../api/interviewQuestionApi";

// APIレスポンスの形が少し違っても、質問配列だけ取り出せるようにする。
const extractQuestions = (body) => {
  const data = body?.data ?? body;

  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.questions ??
    data?.question ??
    data?.interviewQuestions ??
    data?.interview_questions ??
    []
  );
};

// 質問IDのキー名がAPI側で変わっても表示できるようにする。
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

// 質問本文として使えそうな値を取り出す。
const getQuestionText = (question) => {
  return (
    question.question ??
    question.content ??
    question.text ??
    question.title ??
    ""
  );
};

// 回答として使えそうな値を取り出す。
const getAnswerText = (question) => {
  return question.answer ?? question.answerText ?? question.answer_text ?? "";
};

function InterviewQuestionPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // DBから面接質問一覧を取得して、画面表示用のstateに保存する。
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getInterviewQuestions();
      setQuestions(extractQuestions(response));
    } catch (error) {
      console.error("面接質問一覧の取得に失敗しました:", error);
      setQuestions([]);
      setErrorMessage("面接質問を取得できませんでした。");
    } finally {
      setLoading(false);
    }
  }, []);

  // 画面を開いたときに一度だけDBから質問一覧を照会する。
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <main>
      <button type="button" onClick={() => navigate("/")}>
        戻る
      </button>

      <header>
        <h1>面接質問一覧</h1>
        <p>DBに保存されている面接質問を照会します。</p>
      </header>

      {loading && <p>読み込み中...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!loading && questions.length === 0 && !errorMessage && (
        <p>登録された面接質問はありません。</p>
      )}

      {questions.map((question, index) => {
        const questionId = getQuestionId(question);
        const questionText = getQuestionText(question);
        const answerText = getAnswerText(question);

        return (
          <article key={questionId ?? index}>
            <p>
              <strong>No. </strong>
              {questionId ?? "-"}
            </p>
            <h2>{questionText || "質問内容なし"}</h2>
            <p>
              <strong>回答: </strong>
              {answerText || "未回答"}
            </p>
            <p>
              <strong>作成日時: </strong>
              {question.createdAt ?? "-"}
            </p>
          </article>
        );
      })}
    </main>
  );
}

export default InterviewQuestionPage;
