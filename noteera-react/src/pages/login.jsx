import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/");
  } catch (error) {
    setMessage("❌ البريد الإلكتروني أو كلمة المرور غير صحيحة، وإذا ما عندك حساب اضغط إنشاء حساب");
  }
};

  return (
  <div
    dir="rtl"
    style={{
      minHeight: "100vh",
      background: "#F4F7FC",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        background: "#ffffff",
        borderRadius: "24px",
        padding: "28px 22px",
        boxShadow: "0 10px 30px rgba(37, 99, 235, 0.10)",
      }}
    >
      <h1
        style={{
          margin: "0 0 10px",
          textAlign: "center",
          color: "#2563EB",
          fontSize: "36px",
        }}
      >
        Noteera 💙
      </h1>

      <h2
        style={{
          textAlign: "center",
          margin: "0 0 24px",
          color: "#1E293B",
          fontSize: "24px",
        }}
      >
        تسجيل الدخول
      </h2>

      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px",
          marginBottom: "12px",
          border: "1px solid #CBD5E1",
          borderRadius: "14px",
          fontSize: "16px",
          outline: "none",
        }}
      />

      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px",
          marginBottom: "16px",
          border: "1px solid #CBD5E1",
          borderRadius: "14px",
          fontSize: "16px",
          outline: "none",
        }}
      />

      <button
        onClick={login}
        style={{
          width: "100%",
          padding: "14px",
          border: "none",
          borderRadius: "14px",
          background: "#2563EB",
          color: "#fff",
          fontSize: "17px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        تسجيل الدخول
      </button>

      <button
        onClick={() => navigate("/register")}
        style={{
          width: "100%",
          padding: "14px",
          border: "1px solid #CBD5E1",
          borderRadius: "14px",
          background: "#F8FAFC",
          color: "#334155",
          fontSize: "17px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        إنشاء حساب
      </button>

      {message && (
        <p
          style={{
            marginTop: "16px",
            textAlign: "center",
            color: "#DC2626",
          }}
        >
          {message}
        </p>
      )}
    </div>
  </div>
);
};

export default Login;