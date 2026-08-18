import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        setSubscription(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        const userSnap = await getDoc(
          doc(db, "users", currentUser.uid)
        );

        if (userSnap.exists()) {
          const data = userSnap.data();

          const sub = data.subscription || {
            plan: "free",
            status: "active",
          };

          if (sub.plan === "plus" && sub.expiresAt) {
            const expiresAt = sub.expiresAt.toDate();

            if (expiresAt <= new Date()) {
              setSubscription({
                plan: "free",
                status: "expired",
              });
            } else {
              setSubscription(sub);
            }
          } else {
            setSubscription(sub);
          }
        } else {
          setSubscription({
            plan: "free",
            status: "active",
          });
        }
      } catch (error) {
        console.error("Subscription load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [currentUser]);

  const handleSubscribe = async () => {
    try {
      const user = currentUser;

      if (!user) {
        alert("سجل دخولك أولًا");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(
        "https://noteera-ai-346i.vercel.app/create-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            userId: user.uid,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل إنشاء الاشتراك");
      }

      console.log("Subscription response:", data);
      alert(data.message);

      setSubscription({
        plan: "plus",
        status: "active",
      });
    } catch (error) {
      console.error("Subscription error:", error);
      alert("صار خطأ بالاتصال بالسيرفر");
    }
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
          ⭐ Noteera Plus
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748B",
            fontSize: "16px",
          }}
        >
          اشتراك شهري يساعدك تستفيد أكثر من Noteera
        </p>

        <div
          style={{
            background: "#EEF4FF",
            borderRadius: "20px",
            padding: "22px",
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: "#1E3A8A",
            }}
          >
            5,900 د.ع
          </div>

          <div
            style={{
              color: "#64748B",marginTop: "6px",
            }}
          >
            شهريًا
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            lineHeight: "2.2",
            color: "#334155",
            fontSize: "16px",
          }}
        >
          <div>✅ استخدام أوسع لمساعد Noteera</div>
          <div>✅ رفع الصور وملفات PDF</div>
          <div>✅ دفاتر متعددة للمواد</div>
          <div>✅ حفظ وتنظيم محتوى الدراسة</div>
        </div>

        <button
          type="button"
          onClick={
            loading || subscription?.plan === "plus"
              ? undefined
              : handleSubscribe
          }
          disabled={loading || subscription?.plan === "plus"}
          style={{
            width: "100%",
            marginTop: "28px",
            padding: "15px",
            border: "none",
            borderRadius: "14px",
            background:
              loading || subscription?.plan === "plus"
                ? "#94A3B8"
                : "#2563EB",
            color: "#fff",
            fontSize: "17px",
            fontWeight: "bold",
            cursor:
              loading || subscription?.plan === "plus"
                ? "default"
                : "pointer",
          }}
        >
          {loading
            ? "جاري التحقق..."
            : subscription?.plan === "plus"
            ? "✅ أنت مشترك في Noteera Plus"
            : "اشترك الآن"}
        </button>
      </div>
    </div>
  );
}

export default Subscription;