import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const verifyNoteera = async () => {
      try {
        // QR الجديد الخفيف
        if (location.pathname === "/v") {
          setStatus("success");

          setTimeout(() => {
            navigate("/");
          }, 1200);

          return;
        }

        // QR القديم
        const sig = searchParams.get("sig");

        if (!sig) {
          setStatus("invalid");
          return;
        }

        const response = await fetch(
          `https://noteera-ai.vercel.app/verify-noteera?sig=${encodeURIComponent(sig)}`
        );

        const data = await response.json();

        if (data.verified) {
          setStatus("success");

          setTimeout(() => {
            navigate("/");
          }, 1200);
        } else {
          setStatus("invalid");
        }
      } catch (error) {
        console.error("VERIFY ERROR:", error);
        setStatus("error");
      }
    };

    verifyNoteera();
  }, [location.pathname, searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        direction: "rtl",
        padding: 20,
      }}
    >
      {status === "checking" && <h2>جاري التحقق من Noteera...</h2>}

      {status === "success" && (
        <h2>✅ تم التحقق بنجاح، جاري فتح Noteera...</h2>
      )}

      {status === "invalid" && (
        <h2>❌ تعذّر التحقق من رمز Noteera</h2>
      )}

      {status === "error" && (
        <h2>حدث خطأ أثناء التحقق، حاول مرة أخرى.</h2>
      )}
    </div>
  );
}