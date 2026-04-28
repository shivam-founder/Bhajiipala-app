import { useState, useEffect } from "react";

const SUPABASE_URL = "https://hagikhxjxfhgmqmzjoyn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2lraHhqeGZoZ21xbXpqb3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTEwODIsImV4cCI6MjA4NTg2NzA4Mn0.5Nv1heVAYNHvgVoUSmF7vXrBVCMIcO_EqAh0Zcb0jxg";

// ── Supabase fetch helper ──────────────────────────────────
const sb = async (path, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const genOrderCode = () => "BP" + Math.random().toString(36).substr(2, 5).toUpperCase();

// ── STYLES ────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --green:#1a6b3a;--green-light:#2d9653;--green-pale:#e8f5ec;
  --orange:#f47c20;--orange-pale:#fff3e8;
  --cream:#faf8f3;--ink:#1a1a1a;--muted:#6b7280;--border:#e5e7eb;
  --white:#fff;--red:#dc2626;
  --shadow:0 2px 12px rgba(0,0,0,.08);--shadow-lg:0 8px 32px rgba(0,0,0,.12);
}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink)}
.topbar{background:var(--green);color:#fff;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 16px rgba(26,107,58,.3)}
.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;letter-spacing:-.5px;display:flex;align-items:center;gap:8px;cursor:pointer}
.logo span{color:var(--orange)}
.topbar-actions{display:flex;align-items:center;gap:12px}
.cart-btn{background:var(--orange);color:#fff;border:none;border-radius:24px;padding:8px 16px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s}
.cart-btn:hover{background:#e06810;transform:translateY(-1px)}
.cart-badge{background:#fff;color:var(--orange);border-radius:50%;width:20px;height:20px;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center}
.auth-btn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:20px;padding:7px 16px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .2s}
.auth-btn:hover{background:rgba(255,255,255,.25)}
.hero{background:linear-gradient(135deg,var(--green) 0%,#0f4a27 100%);color:#fff;padding:56px 24px 48px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
.hero-tag{display:inline-block;background:rgba(244,124,32,.25);border:1px solid rgba(244,124,32,.5);color:#fbbf6e;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:500;letter-spacing:.5px;margin-bottom:16px;text-transform:uppercase}
.hero h1{font-family:'Syne',sans-serif;font-size:clamp(28px,5vw,48px);font-weight:800;line-height:1.1;margin-bottom:12px}
.hero h1 span{color:var(--orange)}
.hero p{font-size:16px;opacity:.8;margin-bottom:28px;font-weight:300}
.hero-badges{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.hero-badge{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:6px 14px;font-size:13px;display:flex;align-items:center;gap:6px}
.main{max-width:1100px;margin:0 auto;padding:32px 16px 80px}
.filter-bar{display:flex;gap:8px;margin-bottom:28px;flex-wrap:wrap;align-items:center}
.filter-chip{border:1.5px solid var(--border);background:#fff;border-radius:20px;padding:7px 16px;font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;color:var(--muted);font-weight:500}
.filter-chip:hover{border-color:var(--green);color:var(--green)}
.filter-chip.active{background:var(--green);border-color:var(--green);color:#fff}
.section-label{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:20px;color:var(--ink)}
.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:40px}
.product-card{background:#fff;border-radius:16px;padding:20px 16px 16px;border:1.5px solid var(--border);transition:all .25s;position:relative}
.product-card:hover{border-color:var(--green-light);box-shadow:var(--shadow-lg);transform:translateY(-2px)}
.product-emoji{font-size:40px;text-align:center;margin-bottom:12px;display:block}
.product-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:2px}
.product-name-hi{font-size:12px;color:var(--muted);margin-bottom:8px}
.product-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.product-price{font-size:18px;font-weight:700;color:var(--green)}
.product-unit{font-size:11px;color:var(--muted)}
.trending-badge{position:absolute;top:10px;right:10px;background:var(--orange-pale);color:var(--orange);border-radius:8px;padding:2px 7px;font-size:10px;font-weight:600}
.add-btn{width:100%;background:var(--green-pale);color:var(--green);border:1.5px solid var(--green-pale);border-radius:10px;padding:9px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}
.add-btn:hover{background:var(--green);color:#fff;border-color:var(--green)}
.qty-control{display:flex;align-items:center;gap:8px;justify-content:center;background:var(--green);border-radius:10px;padding:6px}
.qty-btn{background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:6px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s}
.qty-btn:hover{background:rgba(255,255,255,.35)}
.qty-count{color:#fff;font-weight:700;font-size:15px;min-width:20px;text-align:center}
.out-badge{width:100%;background:#f3f4f6;color:var(--muted);border:1.5px solid var(--border);border-radius:10px;padding:9px;font-size:12px;text-align:center;font-weight:500}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;backdrop-filter:blur(2px);animation:fadeIn .2s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.cart-drawer{position:fixed;right:0;top:0;bottom:0;width:min(420px,100vw);background:#fff;z-index:201;display:flex;flex-direction:column;animation:slideIn .28s ease;box-shadow:-8px 0 40px rgba(0,0,0,.15)}
.drawer-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.drawer-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700}
.close-btn{background:var(--border);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center}
.cart-items{flex:1;overflow-y:auto;padding:16px 24px}
.cart-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.cart-item-info{flex:1}
.cart-item-name{font-size:14px;font-weight:600;margin-bottom:2px}
.cart-item-price{font-size:13px;color:var(--green);font-weight:600}
.cart-qty-btn{background:var(--green-pale);border:none;color:var(--green);width:26px;height:26px;border-radius:6px;font-size:16px;cursor:pointer;font-weight:700}
.cart-footer{padding:20px 24px;border-top:1px solid var(--border);background:var(--cream)}
.cart-total-row{display:flex;justify-content:space-between;font-size:18px;font-weight:700;margin-bottom:16px}
.checkout-btn{width:100%;background:var(--green);color:#fff;border:none;border-radius:12px;padding:14px;font-family:'Syne',sans-serif;font-size:16px;font-weight:700;cursor:pointer;transition:all .2s}
.checkout-btn:hover{background:var(--green-light);transform:translateY(-1px)}
.modal-wrap{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
.modal{background:#fff;border-radius:20px;width:100%;max-width:440px;padding:32px;animation:slideUp .3s ease;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.modal-logo{text-align:center;font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--green);margin-bottom:8px}
.modal-logo span{color:var(--orange)}
.modal-sub{text-align:center;color:var(--muted);font-size:14px;margin-bottom:28px}
.field{margin-bottom:16px}
.field label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.field input,.field select{width:100%;border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;font-family:'DM Sans',sans-serif;font-size:15px;outline:none;transition:border-color .2s;background:var(--cream);color:var(--ink)}
.field input:focus,.field select:focus{border-color:var(--green);background:#fff}
.submit-btn{width:100%;background:var(--green);color:#fff;border:none;border-radius:12px;padding:14px;font-family:'Syne',sans-serif;font-size:16px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:8px}
.submit-btn:hover{background:var(--green-light)}
.submit-btn:disabled{opacity:.6;cursor:not-allowed}
.error-msg{background:#fef2f2;border:1px solid #fecaca;color:var(--red);border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px}
.checkout-wrap{max-width:600px;margin:0 auto;padding:32px 16px 80px}
.checkout-wrap h2{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;margin-bottom:24px}
.checkout-section{background:#fff;border-radius:16px;padding:24px;margin-bottom:20px;border:1.5px solid var(--border)}
.checkout-section-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:16px;color:var(--green);text-transform:uppercase;letter-spacing:.5px}
.place-order-btn{width:100%;background:linear-gradient(135deg,var(--green),var(--green-light));color:#fff;border:none;border-radius:14px;padding:16px;font-family:'Syne',sans-serif;font-size:18px;font-weight:800;cursor:pointer;transition:all .2s;box-shadow:0 4px 20px rgba(26,107,58,.3)}
.place-order-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(26,107,58,.4)}
.place-order-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.success-wrap{max-width:480px;margin:60px auto;text-align:center;padding:0 20px}
.success-icon{font-size:72px;margin-bottom:20px;animation:bounce .6s ease}
@keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
.success-wrap h2{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;margin-bottom:12px;color:var(--green)}
.order-id-box{background:var(--green-pale);color:var(--green);border-radius:8px;padding:6px 14px;font-size:14px;font-weight:700;display:inline-block;margin-bottom:20px}
.continue-btn{background:var(--green);color:#fff;border:none;border-radius:12px;padding:13px 28px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px}
.loading{text-align:center;padding:60px 20px;color:var(--muted);font-size:16px}
.spin{display:inline-block;animation:spin 1s linear infinite;font-size:32px;margin-bottom:12px}
@keyframes spin{to{transform:rotate(360deg)}}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:12px 22px;border-radius:24px;font-size:14px;z-index:999;animation:slideUp .3s ease;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.25)}
@media(max-width:600px){.product-grid{grid-template-columns:repeat(2,1fr);gap:10px}}
`;

const CATEGORIES = ["All", "Vegetables", "Leafy Greens", "Herbs"];

// ── COMPONENTS ────────────────────────────────────────────
function Toast({ msg }) {
  return <div className="toast">{msg}</div>;
}

function Loading() {
  return (
    <div className="loading">
      <div className="spin">🥬</div>
      <div>Loading fresh picks...</div>
    </div>
  );
}

function ProductCard({ p, qty, onAdd, onInc, onDec }) {
  return (
    <div className="product-card">
      {p.trending && <div className="trending-badge">🔥 Hot</div>}
      <span className="product-emoji">{p.img}</span>
      <div className="product-name">{p.name}</div>
      <div className="product-name-hi">{p.name_hi}</div>
      <div className="product-meta">
        <span className="product-price">₹{p.price}</span>
        <span className="product-unit">{p.unit}</span>
      </div>
      {p.stock === 0 ? (
        <div className="out-badge">Out of Stock</div>
      ) : qty === 0 ? (
        <button className="add-btn" onClick={() => onAdd(p)}>+ Add</button>
      ) : (
        <div className="qty-control">
          <button className="qty-btn" onClick={() => onDec(p.id)}>−</button>
          <span className="qty-count">{qty}</span>
          <button className="qty-btn" onClick={() => onInc(p.id)}>+</button>
        </div>
      )}
    </div>
  );
}

function CartDrawer({ cart, onClose, onInc, onDec, onCheckout }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 200 ? 0 : 20;
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="drawer-header">
          <div className="drawer-title">🛒 Cart ({cart.length})</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🥬</div>
              <div style={{ fontWeight: 600 }}>Cart is empty</div>
            </div>
          ) : cart.map(item => (
            <div className="cart-item" key={item.id}>
              <span style={{ fontSize: 28 }}>{item.img}</span>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">₹{item.price * item.qty}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="cart-qty-btn" onClick={() => onDec(item.id)}>−</button>
                <span style={{ fontWeight: 700, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                <button className="cart-qty-btn" onClick={() => onInc(item.id)}>+</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
              <span>Subtotal</span><span>₹{subtotal}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
              <span>Delivery</span><span>{delivery === 0 ? "🎉 Free!" : `₹${delivery}`}</span>
            </div>
            {delivery > 0 && <div style={{ fontSize: 11, color: "var(--orange)", marginBottom: 10 }}>Add ₹{200 - subtotal} more for free delivery</div>}
            <div className="cart-total-row"><span>Total</span><span>₹{subtotal + delivery}</span></div>
            <button className="checkout-btn" onClick={onCheckout}>Proceed to Checkout →</button>
          </div>
        )}
      </div>
    </>
  );
}

function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.phone || form.phone.length < 10) { setError("Enter a valid 10-digit phone number."); return; }
    if (mode === "signup" && !form.name) { setError("Enter your name."); return; }
    onLogin({ name: form.name || "Customer", phone: form.phone });
    onClose();
  };

  return (
    <div className="modal-wrap" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-logo">Bhajii<span>Pala</span> 🥬</div>
        <div className="modal-sub">{mode === "login" ? "Login to place your order" : "Create your account"}</div>
        {error && <div className="error-msg">{error}</div>}
        {mode === "signup" && (
          <div className="field"><label>Full Name</label><input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        )}
        <div className="field"><label>Phone Number</label><input placeholder="10-digit mobile number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
        <button className="submit-btn" onClick={handleSubmit}>{mode === "login" ? "Continue →" : "Create Account →"}</button>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
          {mode === "login" ? <>New? <button style={{ background: "none", border: "none", color: "var(--green)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }} onClick={() => { setMode("signup"); setError(""); }}>Sign up</button></> : <>Have account? <button style={{ background: "none", border: "none", color: "var(--green)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }} onClick={() => { setMode("login"); setError(""); }}>Login</button></>}
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ cart, user, onBack, onOrderPlaced }) {
  const [address, setAddress] = useState("");
  const [slot, setSlot] = useState("Morning (7AM–10AM)");
  const [loading, setLoading] = useState(false);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 200 ? 0 : 20;
  const total = subtotal + delivery;

  const placeOrder = async () => {
    if (!address.trim()) { alert("Please enter delivery address!"); return; }
    setLoading(true);
    try {
      const code = genOrderCode();
      const items = cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, img: i.img }));

      // Insert order
      await sb("orders", {
        method: "POST",
        body: JSON.stringify({
          order_code: code,
          customer_name: user.name,
          customer_phone: user.phone,
          address,
          slot,
          items,
          subtotal,
          delivery_charge: delivery,
          total,
          status: "Processing",
        }),
      });

      // Upsert customer
      await sb("customers?on_conflict=phone", {
        method: "POST",
        prefer: "resolution=merge-duplicates",
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          total_orders: 1,
          total_spent: total,
        }),
      });

      onOrderPlaced(code);
    } catch (e) {
      alert("Order failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-wrap">
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)", fontWeigh
