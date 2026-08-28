import { useState } from "react";
import DOMPurify from "dompurify";
const Scan = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [digitalText, setDigitalText] = useState("");
const [digitalLoading, setDigitalLoading] = useState(false);
const [paperSize, setPaperSize] = useState("A4");
const isImage = image?.type?.startsWith("image/");
console.log("IMAGE STATE:", image, "IS IMAGE:", isImage, "PREVIEW:", previewUrl);
const [translatedAnswer, setTranslatedAnswer] = useState("");
const [targetLanguage, setTargetLanguage] = useState("en");
const compressImage = (file) => {
  return new Promise((resolve) => {
    if (!file?.type?.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const MAX_SIZE = 1400;

        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const compressedFile = new File(
              [blob],
              "noteera-image.jpg",
              { type: "image/jpeg" }
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          0.7
        );
      };

      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};
  const explainImage = async () => {
    if (!image) {
       
      alert("📷 صوّر الورقة أو ارفع PDF 📷 صوّر الورقة أو ارفع PDFأولاً.");
      return;
    }

    setLoading(true);
    setAnswer("");

    const compressedImage = await compressImage(image);
   

const formData = new FormData();
formData.append("file", compressedImage);
    try {
  const verifyRes = await fetch(
    `${import.meta.env.VITE_API_URL}/verify-paper`,
    {
      method: "POST",
      body: formData,
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.verified) {
    setAnswer(verifyData.message || "❌ تعذّر التحقق من الورقة.");
    return;
  }

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/ask`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  setAnswer(data.answer);
} catch (err) {
  console.error(err);
  setAnswer("❌ " + (err?.message || String(err)));
} finally {
  setLoading(false);
}
  };
  const convertToDigital = async () => {
if (!image) {
  alert("اختَر صورة أولاً");
  return;
}

setDigitalLoading(true);
setDigitalText("");

const compressedImage = await compressImage(image);

const formData = new FormData();
formData.append("file", compressedImage);

try {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/ocr`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  console.log("DIGITAL TEXT RECEIVED:", data.text);
  console.log("OCR DATA:", data);
console.log("OCR TEXT:", data.text);
  setDigitalText(data.text || "");
} catch (err) {
  console.error(err);
  setDigitalText("صار خطأ أثناء تحويل الكتابة إلى نص رقمي");
} finally {
  setDigitalLoading(false);
}
};
const readAnswer = () => {
  alert("🔊 زر القراءة اشتغل");
  if (!answer) return;

  window.speechSynthesis.cancel();

 const cleanAnswer = answer
  .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
  .replace(/\s+/g, " ")
  .trim();

const utterance = new SpeechSynthesisUtterance(cleanAnswer);

  const voices = window.speechSynthesis.getVoices();

const arabicVoice =
  voices.find((voice) => voice.lang === "ar-SA") ||
  voices.find((voice) => voice.lang === "ar-XA") ||
  voices.find((voice) => voice.lang.toLowerCase().startsWith("ar"));
  if (arabicVoice) {
    utterance.voice = arabicVoice;
    utterance.lang = arabicVoice.lang;
  } else {
    utterance.lang = "ar-SA";
  }

  utterance.rate = 0.65;
  utterance.pitch = 1;
utterance.volume = 1;
  

  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
};
const copyAnswer = async () => {
  if (!answer) return;

  await navigator.clipboard.writeText(answer);
  alert("تم نسخ الشرح 💙");
};
const translateAnswer = async () => {
  if (!answer) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: answer,
        targetLanguage: targetLanguage,
      }),
    });

    const data = await response.json();
    setTranslatedAnswer(data.translation);
  } catch (error) {
    console.error("Translation error:", error);
  }
};
const printDigitalPage = () => {
  const page = document.getElementById("digital-page");
  if (!page) return;

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html dir="rtl">
      <head>
        <title>الصفحة الرقمية من نوتيرا</title>
        <style>
          body {
            margin: 0;
            padding: 15mm;
            font-family: Arial, sans-serif;
            background: white;
          }

          .page {
            width: 100%;
            box-sizing: border-box;
            font-size: 16px;
            line-height: 1.8;
            text-align: right;
          }
        </style>
      </head>

      <body>
        <div class="page">
          ${page.innerHTML}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F7FC",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#fff",
          borderRadius: "25px",
          padding: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "red" }}>📘 Noteera Scan</h1>

        <p
          style={{
            color: "#555",
            marginBottom: "25px",
          }}
        >
          هلا بيك 🌟
          <br />
          صوّر الورقة أو ارفع PDF وخليها علينا
        </p>

        <input
  id="camera"
  type="file"
  accept="image/*"
  capture="environment"
  style={{ display: "none" }}
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setImage(file);
    setPreviewUrl(url);
    setAnswer("");
  }}
/>

        <label
          htmlFor="camera"
          style={{
            display: "inline-block",
            background: "#2563EB",
            color: "#fff",
            padding: "15px 30px",
            borderRadius: "15px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          📷 صوّر الورقة   
        </label>
<br />
<br />

<input
  id="pdfFile"
  type="file"
  accept=".pdf,application/pdf"
  style={{ display: "none" }}
  onChange={(e) => {
  const file = e.target.files?.[0];

  if (!file) {
    return;
  }

  setImage(file);
  setAnswer("");
  e.target.value = "";
}}
/>

<label
  htmlFor="pdfFile"
  style={{
    display: "inline-block",
    background: "#64748B",
    color: "#fff",
    padding: "15px 30px",
    borderRadius: "15px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  }}
>
  📄 ارفع PDF
</label>
        {image && (
  <div>
    <br />
    <br />

    {isImage ? (
      <img
        src={previewUrl}
        alt="preview"
        style={{
          width: "100%",
          borderRadius: "20px",
        }}
      />
    ) : (
      <div
        style={{
          background: "#F1F5F9",
          padding: "20px",
          borderRadius: "15px",
          color: "#334155",
          fontWeight: "bold",
        }}
      >
        📄 تم اختيار ملف PDF
        <br />
        {image.name}
      </div>
    )}

    <br />
    <br />

            <button
            type="button"
              onClick={explainImage}
              disabled={!image || loading}
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "15px",
                background: "#2563EB",
                color: "#fff",
                fontSize: "18px",
               cursor: !image || loading ? "not-allowed" : "pointer",
opacity: !image || loading ? 0.6 : 1,
              }}
            >
              {loading
                ? "⏳ جاري تحليل الملف انتظر شوية..."
                : "📘 اشرح الورقة"}
            </button>
            <br />
<br />

<button
  type="button"
  onClick={convertToDigital}
  disabled={!image || digitalLoading}
  style={{
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "15px",
    background: "#10B981",
    color: "#fff",
    fontSize: "18px",
    cursor: !image || digitalLoading ? "not-allowed" : "pointer",
    opacity: !image || digitalLoading ? 0.6 : 1,
  }}
>
  {digitalLoading
    ? "⏳ جاري تحويل الورقة..."
    : "📄 حوّلها إلى صفحة رقمية"}
</button>
</div>
)}
{digitalText && (
  <div
  id="digital-page"
    style={{
      width: "100%",
      maxWidth: "794px",
      minHeight: "1123px",
      margin: "25px auto 0",
      padding: "50px",
      background: "#fff",
      color: "#111",
      fontSize: "18px",
      lineHeight: "2",
      textAlign: "right",
      direction: "rtl",
      whiteSpace: "normal",
      boxSizing: "border-box",
      border: "1px solid #ddd",
      boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
    }}
  >
    <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
      الصفحة الرقمية من نوتيرا
    </h2>

    <div
  dangerouslySetInnerHTML={{ __html: digitalText }}
  style={{
    width: "100%",
    textAlign: "initial",
    lineHeight: "1.8",
  }}
/>
  </div>
)}
{digitalText && (
  <>
  <div style={{ marginTop: "15px", textAlign: "center" }}>
  <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
    حجم الورقة:
  </span>

  <select
    value={paperSize}
    onChange={(e) => setPaperSize(e.target.value)}
    style={{
      padding: "10px 18px",
      borderRadius: "10px",
      fontSize: "16px",
      cursor: "pointer",
    }}
  >
    <option value="A4">A4</option>
    <option value="B5">B5</option>
  </select>
</div>
  <button
    type="button"
    onClick={printDigitalPage}
    style={{
      marginTop: "15px",
      padding: "12px 25px",
      border: "none",
      borderRadius: "12px",
      background: "#2563EB",
      color: "#fff",
      fontSize: "16px",
      cursor: "pointer",
    }}
  >
    🖨️ طباعة الصفحة الرقمية
  </button>
          </>
        )}

        {answer && (
          <div
            style={{
              marginTop: "25px",
              background: "#F8FAFC",
              padding: "20px",
              borderRadius: "15px",
              textAlign: "right",
              whiteSpace: "pre-wrap",
              lineHeight: "2",
            }}
          >
            <h3 style={{ color: "#2563EB" }}>
              💙 شرح Noteera
            </h3>

            {answer}
            <div style={{ marginTop: "20px" }}>
  <select
    value={targetLanguage}
    onChange={(e) => setTargetLanguage(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "10px",
      marginLeft: "10px",
    }}
  >
    <option value="en">🇬🇧 English</option>
    <option value="ar">🇮🇶 العربية</option>
    <option value="fr">🇫🇷 Français</option>
    <option value="de">🇩🇪 Deutsch</option>
    <option value="es">🇪🇸 Español</option>
    <option value="tr">🇹🇷 Türkçe</option>
  </select>

  <button onClick={translateAnswer}>
    🌍 ترجم الشرح
  </button>
</div>
{translatedAnswer && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#EEF2FF",
      borderRadius: "12px",
      textAlign: "right",
      whiteSpace: "pre-wrap",
      lineHeight: "2",
    }}
  >
    <h3>🌍 الترجمة</h3>
    {translatedAnswer}
  </div>
)}
            <br />

<button
  onClick={copyAnswer}
  style={{
    marginTop: "15px",
    marginLeft: "10px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "12px",
    background: "#7c3aed",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  }}
>
  📋 انسخ الشرح
</button>
<button
  type="button"
  onClick={convertToDigital}
  disabled={digitalLoading}
  style={{
    marginTop: "15px",
    marginLeft: "10px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "12px",
    background: "#10B981",
    color: "#fff",
    fontSize: "16px",
    cursor: digitalLoading ? "not-allowed" : "pointer",
    opacity: digitalLoading ? 0.6 : 1,
  }}
>
  {digitalLoading
    ? "⏳ جاري تحويل الورقة..."
    : "📝 حوّلها إلى صفحة رقمية"}
</button>
<div style={{ color: "red", fontSize: "20px", marginTop: "10px" }}>
  TEST TEST TEST
</div>
{digitalText && (
  <div
    style={{
      marginTop: "20px",
      padding: "25px",
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      textAlign: "right",
      direction: "rtl",
      
     lineHeight: "1.5",
      color: "#111",
      fontSize: "18px",
    }}
  >
    <h3 style={{ marginTop: 0 }}>
      📄 الصفحة الرقمية
    </h3>

    <div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(digitalText),
  }}
/>
    <button
  type="button"
  onClick={() => window.print()}
  style={{
    marginTop: "20px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "12px",
    background: "#2563EB",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  }}
>
  🖨️ اطبع الصفحة الرقمية
</button>
  </div>
)}
<button
  type="button"
  onClick={() => {
    setImage(null);
    setAnswer("");
  }}
  style={{
    marginTop: "15px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  }}
>
  📸 جرّب ورقة ثانية
</button>
          </div>
        )}
    


<div
  style={{
    marginTop: "35px",
    paddingTop: "15px",
    borderTop: "1px solid #E2E8F0",
    textAlign: "center",
    fontSize: "13px",
    color: "#64748B",
    lineHeight: "1.8",
  }}
>
  © 2026 Noteera. جميع الحقوق محفوظة.
  <br />
  تطوير وإدارة: Ahmed Fadhil
  <br />
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
);
};

export default Scan;