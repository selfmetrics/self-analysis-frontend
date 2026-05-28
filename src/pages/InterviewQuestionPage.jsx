import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getInterviewQuestions,
  getInterviewQuestionDetail,
  updateInterviewQuestionAnswer,
} from "../api/interviewQuestionApi";

// APIレスポンスが { data: [...] } の場合に質問配列を取り出す。
const extractQuestions = (body) => {
  return Array.isArray(body?.data) ? body.data : [];
};

// 詳細APIのレスポンスから質問オブジェクトを取り出す。
const extractQuestion = (body) => {
  const data = body?.data ?? body;
  return data?.question && typeof data.question === "object" ? data.question : data;
};

// 詳細APIの値で一覧APIの質問データを補完する。
const mergeQuestion = (baseQuestion, detailQuestion) => {
  if (!detailQuestion || typeof detailQuestion !== "object") {
    return baseQuestion;
  }

  return Object.entries(detailQuestion).reduce(
    (mergedQuestion, [key, value]) => {
      if (value !== undefined && value !== null) {
        mergedQuestion[key] = value;
      }

      return mergedQuestion;
    },
    { ...baseQuestion }
  );
};

const getQuestionId = (question) => question.questionId;
const getQuestionText = (question) => question.question;
const getAnswerText = (question) => question.answer ?? "";

function InterviewQuestionPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [answeringId, setAnsweringId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const listResponse = await getInterviewQuestions();
      const questionList = extractQuestions(listResponse);

      const questionsWithAnswer = await Promise.all(
        questionList.map(async (question) => {
          const questionId = getQuestionId(question);

          if (questionId === null || getAnswerText(question).trim() !== "") {
            return question;
          }

          try {
            const detailResponse = await getInterviewQuestionDetail(questionId);
            return mergeQuestion(question, extractQuestion(detailResponse));
          } catch (error) {
            console.error("面接質問詳細の取得に失敗しました:", error);
            return question;
          }
        })
      );

      setQuestions(questionsWithAnswer);
      setAnswers(
        questionsWithAnswer.reduce((nextAnswers, question) => {
          const questionId = getQuestionId(question);

          if (questionId !== null) {
            nextAnswers[questionId] = getAnswerText(question);
          }

          return nextAnswers;
        }, {})
      );
    } catch (error) {
      console.error("面接質問一覧の取得に失敗しました:", error);
      setQuestions([]);
      setAnswers({});
      setErrorMessage("面接質問を取得できませんでした。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleStartAnswer = (question) => {
    const questionId = getQuestionId(question);

    if (questionId === null) {
      alert("質問IDを確認できませんでした。");
      return;
    }

    setAnsweringId(questionId);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
  };

  const handleSaveAnswer = async (question) => {
    const questionId = getQuestionId(question);
    const questionText = getQuestionText(question);

    if (questionId === null) {
      alert("質問IDを確認できませんでした。");
      return;
    }

    try {
      setSavingId(questionId);
      setErrorMessage("");

      await updateInterviewQuestionAnswer(questionId, {
        question: questionText,
        answer: answers[questionId] ?? "",
      });

      setAnsweringId(null);
      await fetchQuestions();
    } catch (error) {
      console.error("回答の保存に失敗しました:", error);
      setErrorMessage("回答を保存できませんでした。");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main>
      <button type="button" onClick={() => navigate("/")}>
        戻る
      </button>

      <header>
        <h1>面接質問一覧</h1>
      </header>

      {loading && <p>読み込み中...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!loading && questions.length === 0 && !errorMessage && (
        <p>登録された面接質問はありません。</p>
      )}

      {questions.map((question, index) => {
        const questionId = getQuestionId(question);
        const questionText = getQuestionText(question);
        const savedAnswer = getAnswerText(question);
        const isAnswered = savedAnswer.trim() !== "";
        const isAnswering = questionId !== null && answeringId === questionId;

        return (
          <article key={questionId ?? index}>
            <p>
              <strong>No. </strong>
              {questionId ?? "-"}
            </p>

            <h2>{questionText || "質問内容なし"}</h2>

            {isAnswering ? (
              <>
                <label htmlFor={`answer-${questionId ?? index}`}>回答</label>
                <br />
                <textarea
                  id={`answer-${questionId ?? index}`}
                  value={questionId === null ? "" : answers[questionId] ?? ""}
                  onChange={(event) =>
                    handleAnswerChange(questionId, event.target.value)
                  }
                  rows={4}
                  disabled={questionId === null}
                />
                <br />

                <button
                  type="button"
                  onClick={() => handleSaveAnswer(question)}
                  disabled={questionId === null || savingId === questionId}
                >
                  {savingId === questionId ? "保存中..." : "保存"}
                </button>
              </>
            ) : isAnswered ? (
              <>
                <p>
                  <strong>回答: </strong>
                  {savedAnswer}
                </p>
                <button type="button" onClick={() => handleStartAnswer(question)}>
                  編集する
                </button>
              </>
            ) : (
              <button type="button" onClick={() => handleStartAnswer(question)}>
                回答する
              </button>
            )}
          </article>
        );
      })}
    </main>
  );
}

export default InterviewQuestionPage;
