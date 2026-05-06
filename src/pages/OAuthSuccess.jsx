//→ URLのtokenを受け取る
//→ localStorageに保存する
//→ /users/me でユーザー情報を取得する
//→ App.jsx に user を渡す
//→ navigate("/") でメイン画面へ移動する

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginUser } from "../api/authApi";

function OAuthSuccess({ onLoginSuccess }) {
  const navigate = useNavigate();
  const isRequestSent = useRef(false);

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      if (isRequestSent.current) return;
      isRequestSent.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");

        console.log("OAuthSuccess token:", tokenFromUrl);

        if (!tokenFromUrl) {
          throw new Error("token がありません");
        }

        // URLから受け取った token を保存
        localStorage.setItem("token", tokenFromUrl);

        // token を使ってログインユーザー情報を取得
        const loginUser = await getLoginUser();
        console.log("loginUser:", loginUser);

        const user =
          loginUser.data?.user ??
          loginUser.data ??
          loginUser.user ??
          loginUser;

        // App.jsx に user 情報を渡す
        onLoginSuccess(user);

        // メイン画面へ移動
        navigate("/", { replace: true });
      } catch (error) {
        console.error("OAuthログイン処理エラー:", error);

        localStorage.removeItem("token");
        navigate("/", { replace: true });
      }
    };

    handleOAuthSuccess();
  }, [navigate, onLoginSuccess]);

  return <p>Googleログイン処理中...</p>;
}

export default OAuthSuccess;