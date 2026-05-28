import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getInterviewQuestions,
  getInterviewQuestionDetail,
  updateInterviewQuestionAnswer,
} from "../api/interviewQuestionApi";

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

// 詳細APIのレスポンスから質問オブジェクトだけ取り出す。
const extractQuestion = (body) => {
  const data = body?.data ?? body;
  return data?.question && typeof data.question === "object" ? data.question : data;
};

// 詳細APIの値で一覧APIの値を補完する。undefined/null で元の値を消さない。
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

// 質問ID
const getQuestionId = (question) => question.questionId;

// 質問
const getQuestionText = (question) => question.question;

// 回答
const getAnswerText = (question) => {
  return question.answer ?? "";
};

function InterviewQuestionPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [answeringId, setAnsweringId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // 一覧APIだけで回答が取れない場合があるので、詳細APIで各質問の回答を補完する。
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

  // 画面を開いたときにDBから質問一覧を照会する。
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

  // 入力した回答をDBに保存する。
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
        <p>未回答の質問には回答できます。回答済みの質問は回答内容を表示します。</p>
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

            {isAnswered ? (
              <p>
                <strong>回答: </strong>
                {savedAnswer}
              </p>
            ) : isAnswering ? (
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
