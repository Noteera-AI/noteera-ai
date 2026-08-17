import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

function Profile() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [notebooks, setNotebooks] = useState([]);
  const [newNotebook, setNewNotebook] = useState("");
  const [message, setMessage] = useState("");
const [subscription, setSubscription] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setStudent(data);
          setSubscription(
  data.subscription || {
    plan: "free",
    status: "active",
  }
);
          setNotebooks(
            Array.isArray(data.notebooks) ? data.notebooks : []
          );
        }
      } catch (error) {
        console.error(error);
        setMessage("❌ صار خطأ بتحميل البيانات");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const addNotebook = async () => {
    const notebookName = newNotebook.trim();

    if (!notebookName) {
      setMessage("اكتب اسم المادة أولًا");
      return;
    }

    if (notebooks.includes(notebookName)) {
      setMessage("هذا الدفتر موجود أصلًا");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const updatedNotebooks = [...notebooks, notebookName];

      await updateDoc(doc(db, "users", user.uid), {
        notebooks: updatedNotebooks,
      });

      setNotebooks(updatedNotebooks);
      setNewNotebook("");
      setMessage("✅ تم إضافة الدفتر");
    } catch (error) {
      console.error(error);
      setMessage("❌ صار خطأ بإضافة الدفتر");
    }
  };

  const removeNotebook = async (notebookName) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const updatedNotebooks = notebooks.filter(
        (item) => item !== notebookName
      );

      await updateDoc(doc(db, "users", user.uid), {
        notebooks: updatedNotebooks,
      });

      setNotebooks(updatedNotebooks);
      setMessage("✅ تم حذف الدفتر");
    } catch (error) {
      console.error(error);
      setMessage("❌ صار خطأ بحذف الدفتر");
    }
  };

  if (!student) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          background: "#F4F7FC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        جاري تحميل بياناتك...
      </div>
    );
  }

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
          maxWidth: "600px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(37, 99, 235, 0.10)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563EB",
            marginTop: 0,
          }}
        >
          👤 الملف الشخصي
        </h1>

        <div
          style={{
            background: "#F8FAFC",
            borderRadius: "16px",
            padding: "16px",
            lineHeight: "2",
            marginBottom: "22px",
          }}
        >
          <div>
            <strong>الاسم:</strong> {student.name}
          </div>

          <div>
            <strong>البريد:</strong> {student.email}
          </div>

          <div>
            <strong>الجامعة / المعهد:</strong> {student.university}
          </div>

          <div>
            <strong>المرحلة:</strong> {student.stage}
          </div>
        </div>

        <h2 style={{ color: "#1E3A8A" }}>
          📚 دفاتري
        </h2>
        <div>
<strong>الاشتراك:</strong>{" "}
  {subscription?.plan === "free"
    ? "مجاني"
    : subscription?.plan || "غير محدد"}
</div>
<button
  type="button"
  onClick={() => navigate("/subscription")}
  style={{
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    background: "#2563EB",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  ⭐ ترقية إلى Noteera Plus
</button>
        {notebooks.length === 0 ? (
          <p style={{ color: "#64748B" }}>
            ما عندك دفاتر مضافة بعد.
          </p>
        ) : (
          notebooks.map((notebook) => (
            <div
              key={notebook}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                background: "#EEF4FF",
                borderRadius: "14px",
                padding: "12px 14px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  color: "#1E3A8A",
                }}
              >
                📘 {notebook}
              </span>

              <button
                type="button"
                onClick={() => removeNotebook(notebook)}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  background: "#FEE2E2",
                  color: "#B91C1C",
                  cursor: "pointer",
                }}
              >
                حذف
              </button>
            </div>
          ))
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "18px",
          }}
        >
          <input
            type="text"
            placeholder="مثلاً: محاسبة"
            value={newNotebook}
            onChange={(e) => setNewNotebook(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "13px",
              border: "1px solid #CBD5E1",
              borderRadius: "12px",
              fontSize: "16px",
            }}
          />

          <button
            type="button"
            onClick={addNotebook}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "13px 16px",
              background: "#2563EB",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            + إضافة
          </button>
        </div>

        {message && (
          <p
            style={{
              textAlign: "center",
              marginTop: "15px",
              color: "#475569",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            marginTop: "22px",
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background: "#E2E8F0",
            color: "#334155",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ← الرجوع للرئيسية
        </button>
      </div>
    </div>
  );
}

export default Profile;