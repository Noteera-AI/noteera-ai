import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [stage, setStage] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !university ||
      !stage 
    ) {
      setMessage("❌ رجاءً كمّل كل الحقول");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        university,
        stage,
        notebooks: [],
        subscription: {
    plan: "free",
    status: "active",
  },
        createdAt: new Date(),
      });

      setMessage("✅ تم إنشاء الحساب بنجاح");

      setTimeout(() => {
        navigate("/");
      }, 1200);
   } catch (error) {
  console.error(error);
  alert("خطأ التسجيل:\n" + error.code + "\n" + error.message);
  setMessage("❌ " + error.message);
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
        maxWidth: "440px",
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
          fontSize: "34px",
        }}
      >
        Noteera 💙
      </h1>

      <h2
        style={{
          textAlign: "center",
          margin: "0 0 22px",
          color: "#1E293B",
          fontSize: "24px",
        }}
      >
        إنشاء حساب
      </h2>

      {[
        ["الاسم الكامل", name, setName, "text"],
        ["البريد الإلكتروني", email, setEmail, "email"],
        ["كلمة المرور", password, setPassword, "password"],
        ["الجامعة أو المعهد", university, setUniversity, "text"],
        ["المرحلة", stage, setStage, "text"],
        
      ].map(([placeholder, value, setter, type]) => (
        <input
          key={placeholder}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setter(e.target.value)}
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
      ))}

      <button
        onClick={handleRegister}
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
          marginTop: "4px",
          marginBottom: "12px",
        }}
      >
        إنشاء الحساب
      </button>

      <button
        onClick={() => navigate("/login")}
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
        عندي حساب بالفعل
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

export default Register;