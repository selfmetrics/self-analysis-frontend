import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { getLoginUser, logout } from "./api/authApi";

import Login from "./components/Login";
import OAuthSuccess from "./pages/OAuthSuccess";
import EpisodePage from "./pages/EpisodePage";

function App() {
  // ログインユーザーの情報を管理する
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

        const loginUser = await getLoginUser();
        console.log("loginUser:", loginUser);

        const userData =
          loginUser.data?.user ??
          loginUser.data ??
          loginUser.user ??
          loginUser;

        setUser(userData);
      } catch (error) {
        console.error("ログインユーザー取得エラー:", error);

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // ログアウト処理
  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  // ログイン後、OAuthSuccess から呼ばれる処理
  const handleOAuthLoginSuccess = (loginUser) => {
    setUser(loginUser);
  };

  if (loading) {
    return <p>ログイン確認中...</p>;
  }

  return (
    <Routes>
      <Route
        path="/oauth/success"
        element={
          <OAuthSuccess
            onLoginSuccess={handleOAuthLoginSuccess}
          />
        }
      />

      <Route
        path="/*"
        element={
          !user ? (
            <Login />
          ) : (
            <EpisodePage
              user={user}
              onLogout={handleLogout}
            />
          )
        }
      />
    </Routes>
  );
}

export default App;