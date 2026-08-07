import { useLocation, useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          direction: "rtl",
        }}
      >
        <h2>لا توجد بيانات للمعاينة</h2>

        <button onClick={() => navigate("/design")}>
          الرجوع للتصميم
        </button>
      </div>
    );
  }

  const {
    studentImage,
    name,
    school,
    grade,
    subject,
    coverType,
    showInfo,
    background,
    educationType,
  } = state;
  console.log(studentImage);
console.log(coverType);

  const institutionLabel =
    educationType === "university"
      ? "الجامعة"
      : educationType === "institute"
      ? "المعهد"
      : "المدرسة";

  const gradeLabel =
    educationType === "school"
      ? "الصف"
      : "المرحلة";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
        direction: "rtl",
      }}
    >
      <div
        style={{
          width: 320,
          height: 450,
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.15)",
          }}
        />

        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 20,
          }}
        >
         {coverType === "with-photo" && studentImage && (
  <img
    src={studentImage}
    alt=""
    style={{
      width: 130,
      height: 160,
      objectFit: "cover",
      borderRadius: 16,
      border: "4px solid white",
      position: "absolute",
      top: 90,
      left: "50%",
      transform: "translateX(-50%)",
      boxShadow: "0 8px 20px rgba(0,0,0,.25)",
      zIndex: 2,
    }}
  />
)}

          {showInfo && (
<>
  <h1
  style={{
    color: "white",
    marginTop: 35,
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 1,
    textShadow: "0 3px 8px rgba(0,0,0,.4)",
  }}
>
  Noteera
</h1>
           <div
  style={{
    marginTop: "auto",
    marginBottom: 25,
    width: "82%",
    backdropFilter: "blur(10px)",
    background: "rgba(255,255,255,.78)",
    borderRadius: 20,
    padding: "110px 15px 20px",
    boxShadow: "0 8px 20px rgba(0,0,0,.18)",
  }}
>
              <p><strong>الاسم:</strong> {name}</p>
              <p><strong>{institutionLabel}:</strong> {school}</p>
              <p><strong>{gradeLabel}:</strong> {grade}</p>
              <p><strong>المادة:</strong> {subject}</p>
            </div>
            </>
)}
          <button
            onClick={() => navigate("/design")}
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              padding: 12,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            رجوع
          </button>
        </div>
      </div>
    </div>
  );
}