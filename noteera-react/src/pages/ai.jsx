import { useState } from "react";

const AI = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
const [image, setImage] = useState(null);
const [loading, setLoading] = useState(false);
 const askAI = async () => {
  setLoading(true);
  setAnswer("");

  try {
    const formData = new FormData();

    formData.append("question", question);

    if (image) {
      formData.append("image", image);
    }

    const res = await fetch("http://192.168.100.226:5000/ask", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAnswer(data.answer);
  } catch (error) {
    console.error(error);
    setAnswer("حدث خطأ");
  } finally {
    setLoading(false);
  }
};

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#F4F7FC",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "30px",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "700px",
        background: "#fff",
        borderRadius: "25px",
        padding: "30px",
        boxShadow: "0 10px 30px rgba(0,0,0,.1)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#2563EB",
        }}
      >
        🤖 مساعد Noteera
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#555",
          marginBottom: "30px",
        }}
      >
     
اسألني أي سؤال، أو أرسل صورة،
وأنا أساعدك خطوة بخطوة.
      </p>

      <textarea
  rows="5"
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  placeholder="اكتب سؤالك هنا ..."
  style={{
    width: "100%",
    borderRadius: "15px",
    padding: "15px",
    border: "1px solid #ddd",
    fontSize: "16px",
  }}
/>

<input
  type="file"
  accept="image/*"
  onChange={(e) => setImage(e.target.files[0])}
  style={{ marginBottom: "15px" }}
/>

{image && (
  <div
    style={{
      marginBottom: "20px",
      textAlign: "center",
    }}
  >
    <img
      src={URL.createObjectURL(image)}
      alt="preview"
      style={{
        maxWidth: "100%",
        maxHeight: "250px",
        borderRadius: "15px",
      }}
    />
  </div>
)}
      <br />
      <br />

      <button
  onClick={askAI}
  disabled={loading}
  style={{
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "15px",
    background: "#2563EB",
    color: "#fff",
    fontSize: "18px",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
  }}
>
  {loading ? "⏳ جاري التحليل..." : "✨ اشرح"}
</button>

      <hr
        style={{
          margin: "30px 0",
        }}
      />

      <h3>📖 الشرح</h3>

      <div
  style={{
    background: "#F8FAFC",
    borderRadius: "20px",
    padding: "25px",
    minHeight: "180px",
    whiteSpace: "pre-wrap",
    lineHeight: "2",
    fontSize: "18px",
    direction: "rtl",
    textAlign: "right",
    boxShadow: "0 5px 15px rgba(0,0,0,.08)",
  }}
>
  {answer ? (
    answer
  ) : (
    <div
      style={{
        color: "#888",
        textAlign: "center",
        marginTop: "50px",
      }}
    >
      📖 سيظهر الشرح هنا...
    </div>
  )}
</div>
    </div>
  </div>
);
};

export default AI;