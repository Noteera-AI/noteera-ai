import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const products = [
  { id: 1, name: "دفتر 100 ورقة", icon: "📘" },
  { id: 2, name: "قلم أزرق", icon: "🖊️" },
  { id: 3, name: "مجموعة قرطاسية", icon: "✏️" },
];

function Store() {
  const [cart, setCart] = useState(() => {
  const savedCart = localStorage.getItem("noteera-cart");
  return savedCart ? JSON.parse(savedCart) : [];
});
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sending, setSending] = useState(false);
useEffect(() => {
  localStorage.setItem("noteera-cart", JSON.stringify(cart));
}, [cart]);
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("السلة فارغة");
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      alert("كمل الاسم ورقم الهاتف والعنوان");
      return;
    }

    try {
      setSending(true);

      const user = auth.currentUser;

      await addDoc(collection(db, "orders"), {
        userId: user ? user.uid : null,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("تم إرسال طلبك بنجاح ✅");

      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      setCustomerName("");
      setPhone("");
      setAddress("");
    } catch (error) {
      console.error("Order error:", error);
      alert("صار خطأ بإرسال الطلب");
    } finally {
      setSending(false);
    }
  };

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
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              color: "#2563EB",
              fontSize: "32px",
              margin: "0 0 10px 0",
            }}
          >
            🛒 متجر Noteera
          </h2>

          <p
            style={{
              color: "#64748B",
              fontSize: "17px",
              margin: 0,
            }}
          >
            دفاتر وقرطاسية
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCart(!showCart)}
          style={{
            width: "100%",
            background: "#E8F0FF",
            color: "#1F3C88",
            padding: "15px",
            borderRadius: "14px",
            marginBottom: "20px",
            fontWeight: "bold",
            fontSize: "17px",
            border: "none",
            cursor: "pointer",}}
        >
          🛍️ السلة ({totalItems})
        </button>

        {showCart && (
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "18px",
              marginBottom: "24px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ color: "#1F3C88" }}>
              محتويات السلة
            </h3>

            {cart.length === 0 ? (
              <p style={{ color: "#777" }}>السلة فارغة</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "14px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <strong style={{ color: "#1F3C88" }}>
                        {item.icon} {item.name}
                      </strong>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          border: "none",
                          background: "#FEE2E2",
                          color: "#B91C1C",
                          padding: "8px 10px",
                          borderRadius: "9px",
                          fontWeight: "bold",
                        }}
                      >
                        حذف
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        marginTop: "12px",
                      }}
                    >
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        style={{
                          width: "38px",
                          height: "38px",
                          border: "none",
                          borderRadius: "10px",
                          background: "#2563EB",
                          color: "#fff",
                          fontSize: "20px",
                        }}
                      >
                        +
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        style={{
                          width: "38px",
                          height: "38px",
                          border: "none",
                          borderRadius: "10px",
                          background: "#E2E8F0",
                          fontSize: "20px",
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
  setShowCheckout(true);
  setShowCart(false);
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}}
                  style={{
                    width: "100%",
                    marginTop: "18px",
                    padding: "14px",
                    border: "none",
                    borderRadius: "12px",
                    background: "#16A34A",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  إكمال الطلب ✅
                </button>
              </>
            )}
          </div>
        )}

        {showCheckout && (
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "18px",
              marginBottom: "24px",boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ color: "#1F3C88" }}>
              بيانات الطلب
            </h3>

            <input
              type="text"
              placeholder="الاسم"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            />

            <input
              type="tel"
              placeholder="رقم الهاتف"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            />

            <textarea
              placeholder="العنوان بالتفصيل"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            />

            <button
              type="button"
              onClick={handleOrder}
              disabled={sending}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "12px",
                background: sending ? "#94A3B8" : "#2563EB",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {sending ? "جاري إرسال الطلب..." : "تأكيد الطلب 🛍️"}
            </button>
          </div>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "18px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "42px" }}>
              {product.icon}
            </div>

            <h3
              style={{
                color: "#1F3C88",
                fontSize: "21px",
              }}
            >
              {product.name}
            </h3>

            <p style={{ color: "#777" }}>
              السعر يحدد لاحقًا
            </p>

            <button
              type="button"
              onClick={() => addToCart(product)}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "12px",
                background: "#2563EB",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              🛒 أضف إلى السلة
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Store;