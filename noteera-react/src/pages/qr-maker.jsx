import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrMaker() {
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQr = async () => {
      try {
        const response = await fetch(
          "https://noteera-ai.vercel.app/noteera-qr-link"
        );

        const data = await response.json();

        if (data.success && data.qrUrl) {
          setQrUrl(data.qrUrl);
        } else {
          setError("تعذّر إنشاء QR");
        }
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء إنشاء QR");
      }
    };

    loadQr();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        padding: 20,
      }}
    >
      <h2>Noteera QR</h2>

      {qrUrl && (
        <>
          <QRCodeCanvas
            value={qrUrl}
            size={320}
            level="H"
            includeMargin={true}
          />

          <p style={{ maxWidth: 500, textAlign: "center" }}>
            هذا هو QR الرسمي الحالي لـ Noteera
          </p>
        </>
      )}

      {error && <p>{error}</p>}
    </div>
  );
}