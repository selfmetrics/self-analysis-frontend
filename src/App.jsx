import { useCallback, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getLoginUser } from "./api/authApi";
import Login from "./components/Login";
import OAuthSuccess from "./pages/OAuthSuccess";
import EpisodePage from "./pages/EpisodePage";
import InterviewQuestionPage from "./pages/InterviewQuestionPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // アプリ起動時にログイン状態を確認する
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          return;
        }

        // getLoginUser() は user だけ返す前提
        const loginUser = await getLoginUser();

        console.log("App checkLogin loginUser:", loginUser);

        setUser(loginUser);
      } catch (error) {
        console.error("ログイン確認エラー:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // OAuthSuccess.jsx からログインユーザーを受け取る
  const handleOAuthLoginSuccess = useCallback((loginUser) => {
    console.log("Appが受け取ったuser:", loginUser);

    setUser(loginUser);
    setLoading(false);
  }, []);

  // ログアウト処理
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  if (loading) {
    return <p>ログイン確認中...</p>;
  }

  console.log("現在のAppのuser:", user);

  return (
    <Routes>
  <Route
    path="/oauth/success"
    element={<OAuthSuccess onLoginSuccess={handleOAuthLoginSuccess} />}
  />

  <Route
    path="/interview-questions"
    element={
      user ? (
        <InterviewQuestionPage />
      ) : (
        <Login />
      )
    }
  />

  <Route
    path="/*"
    element={
      user ? (
        <EpisodePage user={user} onLogout={handleLogout} />
      ) : (
        <Login />
      )
    }
  />
</Routes>
  );
}

export default App;