import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid),
      
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error("Orders error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusText = (status) => {
    if (status === "pending") return "قيد المراجعة";
    if (status === "accepted") return "تم قبول الطلب";
    if (status === "delivered") return "تم التوصيل";
    if (status === "cancelled") return "ملغي";

    return status || "قيد المراجعة";
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          background: "#F4F7FC",
          padding: "30px 16px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h3 style={{ color: "#2563EB" }}>
          جاري تحميل الطلبات...
        </h3>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#F4F7FC",
        padding: "24px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#2563EB",
            fontSize: "30px",
            marginBottom: "25px",
          }}
        >
          📦 طلباتي
        </h2>

        {!currentUser ? (
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "18px",
              textAlign: "center",
            }}
          >
            سجل دخولك حتى تشوف طلباتك
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "18px",
              textAlign: "center",
              color: "#777",
            }}
          >
            ما عندك طلبات حاليًا
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "18px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <strong
                  style={{
                    color: "#1F3C88",
                    fontSize: "18px",
                  }}
                >
                  طلب #{order.id.slice(0, 6)}
                </strong>

                <span
                  style={{
                    background: "#E8F0FF",
                    color: "#1F3C88",
                    padding: "7px 10px",borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              <p>
                <strong>الاسم:</strong> {order.customerName}
              </p>

              <p>
                <strong>الهاتف:</strong> {order.phone}
              </p>

              <p>
                <strong>العنوان:</strong> {order.address}
              </p>

              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid #eee",
                }}
              >
                <strong style={{ color: "#1F3C88" }}>
                  المنتجات:
                </strong>

                {order.items?.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    style={{
                      marginTop: "8px",
                      color: "#444",
                    }}
                  >
                    • {item.name} × {item.quantity}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Orders;