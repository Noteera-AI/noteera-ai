import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

const Design = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [selectedNotebook, setSelectedNotebook] = useState("");
  const [coverType, setCoverType] = useState("");
const [studentImage, setStudentImage] = useState("");
const [hasSavedCover, setHasSavedCover] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setStudent(userSnap.data());
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
        }}
      >
        جاري تحميل البيانات...
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
          maxWidth: "520px",
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
          🎨 تصميم غلاف الدفتر
        </h1>

        <p
          style={{
            fontWeight: "bold",
            color: "#334155",
          }}
        >
          اختر نوع الغلاف
        </p>

        <label
          style={{
            display: "block",
            marginBottom: "12px",
          }}
        >
          <input
            type="radio"
            name="cover"
            value="without-image"
            checked={coverType === "without-image"}
            onChange={(e) => setCoverType(e.target.value)}
          />
          {" "}غلاف بدون صورة
        </label>

        <label
          style={{
            display: "block",
            marginBottom: "20px",
          }}
        >
          <input
            type="radio"
            name="cover"
            value="with-image"
            checked={coverType === "with-image"}
            onChange={(e) => setCoverType(e.target.value)}
          />
          {" "}غلاف مع صورة
        </label>
{coverType === "with-image" && (
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

reader.onloadend = () => {
  setStudentImage(reader.result);
};

reader.readAsDataURL(file);
    }}
    style={{
      width: "100%",
      marginBottom: "18px",
    }}
  />
)}
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "18px",
            lineHeight: "2",
          }}
        >
          <div>
            <strong>اسم الطالب:</strong> {student.name}
          </div>

          <div>
            <strong>الجامعة / المعهد:</strong> {student.university}
          </div>

          <div>
            <strong>المرحلة:</strong> {student.stage}
          </div>
        </div>

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            color: "#334155",
          }}
        >
          اختر الدفتر / المادة
        </label>

        <select
          value={selectedNotebook}
        onChange={async (e) => {
  const notebook = e.target.value;
  setSelectedNotebook(notebook);

  if (!notebook || !auth.currentUser) return;

  const coverRef = doc(
    db,
    "users",
    auth.currentUser.uid,
    "covers",
    notebook
  );

  const coverSnap = await getDoc(coverRef);

  if (coverSnap.exists()) {
    const savedCover = coverSnap.data();

    setCoverType(savedCover.coverType || "");
    setStudentImage(savedCover.studentImage || "");
    setHasSavedCover(true);
  } else {
    setCoverType("");
    setStudentImage("");
    setHasSavedCover(false);
  }
}}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            border: "1px solid #CBD5E1",
            borderRadius: "14px",
            fontSize: "16px",
            marginBottom: "18px",
            background: "#fff",
          }}
        >
          <option value="">اختر المادة</option>

          {(student.notebooks || []).map((notebook) => (
            <option key={notebook} value={notebook}>
              {notebook}
            </option>))}
        </select>
{hasSavedCover && (
  <div
    style={{
      marginBottom: "14px",
      padding: "12px",
      borderRadius: "12px",
      background: "#ECFDF5",
      color: "#166534",
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    ✅ يوجد غلاف محفوظ لهذه المادة
  </div>
)}
        <button
          type="button"
         onClick={() => {
  if (!coverType) {
    alert("اختر نوع الغلاف");
    return;
  }

  if (!selectedNotebook) {
    alert("اختر المادة");
    return;
  }

  navigate("/preview", {
    state: {
      name: student.name,
      school: student.university,
      grade: student.stage,
      subject: selectedNotebook,
      coverType,
      showInfo: true,
      background: "",
      educationType: "institute",
studentImage,    },
  });
}}
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
          }}
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default Design;