import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("AUTH USER:", user);
    if (!user) {
      setStudent(null);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
console.log("USER SNAP:", userSnap.exists(), userSnap.data());
    if (userSnap.exists()) {
      setStudent(userSnap.data());
    }
  });

  return () => unsubscribe();
}, []);
const handleLogout = async () => {
  await signOut(auth);
  navigate("/login");
};
const cardStyle = {
  minHeight: "120px",
  border: "none",
  borderRadius: "20px",
  background: "#ffffff",
  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.10)",
  fontSize: "18px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
WebkitTapHighlightColor: "transparent",
transform: "scale(1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  color: "#1E3A8A",
};
 return (
  <div
    dir="rtl"
    style={{
      minHeight: "100vh",
      background: "#F4F7FC",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#2563EB",
            fontSize: "36px",
textAlign: "center",
          }}
        >
          💙 Noteera
        </h1>

        {student ? (
          <>
            <h2 style={{ marginBottom: "10px" }}>
              هلا {student.name} 👋
            </h2>

            <p style={{ margin: "6px 0", color: "#475569" }}>
              🎓 {student.university}
            </p>

            <p style={{ margin: "6px 0", color: "#475569" }}>
              📚 المرحلة: {student.stage}
            </p>

            <p style={{ margin: "6px 0", color: "#475569" }}>
              📖 المادة: {student.subject}
            </p>
          </>
        ) : (
          <p>جاري تحميل بياناتك...</p>
        )}
      </div>

      {student && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "14px",
          }}
        >
          <button
            onClick={() => navigate("/scan")}
            onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.97)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
            style={cardStyle}
          >
            📷
            <span>Noteera Scan</span>
          </button>

          <button
            onClick={() => navigate("/design")}
            onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.97)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
            style={cardStyle}
          >
            🎨
            <span>تصميم الغلاف</span>
          </button>

          <button
            onClick={() => navigate("/ai")}
            onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.97)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
            style={cardStyle}
          >
            💙
            <span>مساعد Noteera</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.97)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
            style={cardStyle}
          >
            👤
            <span>الملف الشخصي</span>
          </button>

          <button
  onClick={() => navigate("/store")}
  onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.97)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
  style={{
    ...cardStyle,
gridColumn: "1 / -1",
minHeight: "100px",
  }}
>
            🛒
            <span>المتجر</span>
          </button>
        </div>
      )}

      <button
        onClick={handleLogout}
        onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.98)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "14px",
          border: "none",
          borderRadius: "14px",
          background: "#E2E8F0",
          color: "#334155",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        🚪 تسجيل الخروج
      </button>
      <div
 style={{
  marginTop: "22px",
  padding: "18px 12px 8px",
  borderTop: "1px solid #D8E0EB",
  textAlign: "center",
  color: "#64748B",
  fontSize: "13px",
  lineHeight: "1.9",
}}
>
  <div>© 2026 Noteera. جميع الحقوق محفوظة.</div>
  <div>تطوير وإدارة: Ahmed Fadhil</div>
  <div>
  Instagram:{" "}
  <a
    href="https://www.instagram.com/Note_era26/"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: "#2563EB",
      textDecoration: "none",
      fontWeight: "bold",
    }}
  >
    @Note_era26
  </a>
</div>
</div>
    </div>
  </div>
);
}

export default Home;