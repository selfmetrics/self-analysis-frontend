import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginUser } from "../api/authApi";

// getLoginUser() の返し方が fetch / axios / user単体 どれでも対応できるようにする
const extractUser = (response) => {
  return (
    response?.data?.data ??
    response?.data?.user ??
    response?.user ??
    response?.data ??
    response ??
    null
  );
};

function OAuthSuccess({ onLoginSuccess }) {
  const navigate = useNavigate();
  const isRequestSent = useRef(false);

  useEffect(() => {
    const login = async () => {
      if (isRequestSent.current) return;
      isRequestSent.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          throw new Error("token がありません");
        }

        localStorage.setItem("token", token);

        const response = await getLoginUser();
        const userData = extractUser(response);

        console.log("OAuthSuccess response:", response);
        console.log("OAuthSuccess userData:", userData);

        if (!userData) {
          throw new Error("ユーザー情報を取得できませんでした");
        }

        onLoginSuccess(userData);

        navigate("/", { replace: true });
      } catch (error) {
        console.error("OAuthログイン処理エラー:", error);
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      }
    };

    login();
  }, [navigate, onLoginSuccess]);

  return <p>ログイン処理中...</p>;
}

export default OAuthSuccess;