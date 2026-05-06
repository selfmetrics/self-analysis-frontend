
import { loginWithGoogle } from "../api/authApi";

function Login() {

    return (
        <div>
            <h2>ログイン</h2>

            <button onClick={loginWithGoogle}>
                Googleアカウントでログイン
            </button>
        </div>
    );
}

export default Login;