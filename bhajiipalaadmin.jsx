import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://hagikhxjxfhgmqmzjoyn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2lraHhqeGZoZ21xbXpqb3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTEwODIsImV4cCI6MjA4NTg2NzA4Mn0.5Nv1heVAYNHvgVoUSmF7vXrBVCMIcO_EqAh0Zcb0jxg";

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
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  const t = await res.text();
  return t ? JSON.parse(t) : null;
};

const STATUS_COLORS = {
  Delivered: { bg: "#0d2b1a", text: "#4ade80", dot: "#22c55e" },
  "Out for Delivery": { bg: "#1a2540", text: "#60a5fa", dot: "#3b82f6" },
  Processing: { bg: "#2b1d0a", text: "#fb923c", dot: "#f97316" },
  Cancelled: { bg: "#2b0f0f", text: "#f87171", dot: "#ef4444" },
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "orders", label: "Orders", icon: "📋" },
  { id: "products", label: "Products", icon: "🥬" },
  { id: "customers", label: "Customers", icon: "👥" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const S = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0f10;--surface:#141618;--surface2:#1c1f22;--surface3:#242830;
  --border:#2a2d32;--border2:#353940;
  --green:#22c55e;--green-dim:#16a34a;--green-glow:rgba(34,197,94,.15);
  --orange:#f97316;--blue:#3b82f6;--red:#ef4444;
  --text:#f0f2f4;--text2:#8b9099;--text3:#555c66;
  --mono:'JetBrains Mono',monospace;
}
html,body{height:100%;font-family:'Cabinet Grotesk',sans-serif;background:var(--bg);color:var(--text)}
.shell{display:flex;height:100vh;overflow:hidden}
.sidebar{width:220px;min-width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:10}
.sidebar-logo{padding:24px 20px 20px;border-bottom:1px solid var(--border);margin-bottom:8px}
.logo-text{font-size:18px;font-weight:800;letter-spacing:-.5px}
.logo-text span{color:var(--green)}
.logo-sub{font-size:10px;color:var(--text3);font-family:var(--mono);letter-spacing:1px;text-transform:uppercase;margin-top:2px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;margin:1px 8px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;color:var(--text2);transition:all .15s;position:relative}
.nav-item:hover{background:var(--surface2);color:var(--text)}
.nav-item.active{background:var(--green-glow);color:var(--green)}
.nav-item.active::before{content:'';position:absolute;left:0;top:6px;bottom:6px;width:3px;background:var(--green);border-radius:0 3px 3px 0;margin-left:-8px}
.nav-badge{margin-left:auto;background:var(--orange);color:#fff;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
.sidebar-footer{margin-top:auto;padding:16px 20px;border-top:1px solid var(--border)}
.admin-avatar{width:32px;height:32px;background:linear-gradient(135deg,var(--green-dim),var(--green));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff}
.main-area{flex:1;overflow-y:auto;background:var(--bg)}
.topbar{padding:16px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface);position:sticky;top:0;z-index:5}
.page-title{font-size:18px;font-weight:700}
.live-dot{width:7px;height:7px;background:var(--green);border-radius:50%;display:inline-block;margin-right:6px;box-shadow:0 0 8px var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.content{padding:24px 28px 48px}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;animation:fadeUp .4s ease both}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.stat-label{font-size:11px;color:var(--text3);font-family:var(--mono);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.stat-value{font-size:26px;font-weight:800;letter-spacing:-.5px}
.stat-green{color:var(--green)}
.stat-sub{font-size:12px;color:var(--text2);margin-top:6px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px}
.table-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;animation:fadeUp .4s .3s ease both;margin-bottom:24px}
table{width:100%;border-collapse:collapse}
thead{background:var(--surface2)}
th{padding:12px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);font-family:var(--mono);border-bottom:1px solid var(--border)}
td{padding:13px 16px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text2);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--surface2)}
.mono{font-family:var(--mono);font-size:12px}
.bold{font-weight:700;color:var(--text)}
.status-pill{display:inline-flex;align-items:center;gap:5px;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;font-family:var(--mono)}
.status-dot{width:5px;height:5px;border-radius:50%}
.toggle{width:36px;height:20px;background:var(--surface3);border-radius:10px;position:relative;cursor:pointer;border:1px solid var(--border2);transition:background .2s}
.toggle.on{background:var(--green-dim);border-color:var(--green-dim)}
.toggle-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left .2s}
.toggle.on .toggle-knob{left:18px}
.action-btn{background:var(--surface3);border:1px solid var(--border2);color:var(--text2);border-radius:6px;padding:5px 10px;font-size:11px;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;transition:all .15s}
.action-btn:hover{background:var(--border2);color:var(--text)}
.action-btn.danger:hover{background:rgba(239,68,68,.15);color:var(--red);border-color:var(--red)}
.action-btn.primary{background:var(--green-glow);color:var(--green);border-color:var(--green-dim)}
.action-btn.primary:hover{background:rgba(34,197,94,.25)}
.search-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.search-input{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 14px;font-size:13px;color:var(--text);font-family:'Cabinet Grotesk',sans-serif;outline:none;transition:border-color .2s}
.search-input::placeholder{color:var(--text3)}
.search-input:focus{border-color:var(--green-dim)}
.filter-select{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:13px;color:var(--text);font-family:'Cabinet Grotesk',sans-serif;outline:none;cursor:pointer}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px)}
.modal{background:var(--surface);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:480px;padding:28px;animation:slideUp .25s ease;box-shadow:0 20px 60px rgba(0,0,0,.5)}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-title{font-size:16px;font-weight:800;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between}
.modal-close{background:var(--surface3);border:none;color:var(--text2);width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:14px}
.modal-row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;gap:12px}
.modal-row:last-child{border-bottom:none}
.modal-key{color:var(--text3);white-space:nowrap}
.modal-val{font-weight:600;color:var(--text);text-align:right}
.modal-section{margin-bottom:16px}
.modal-section-title{font-size:11px;font-family:var(--mono);color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.product-form{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:22px;margin-bottom:24px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-field{display:flex;flex-direction:column;gap:6px}
.form-label{font-size:11px;font-family:var(--mono);color:var(--text3);text-transform:uppercase;letter-spacing:.5px}
.form-input{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:13px;color:var(--text);font-family:'Cabinet Grotesk',sans-serif;outline:none;transition:border-color .2s}
.form-input:focus{border-color:var(--green-dim)}
.form-select{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:13px;color:var(--text);font-family:'Cabinet Grotesk',sans-serif;outline:none;cursor:pointer}
.btn-primary{background:var(--green-dim);color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;transition:all .2s}
.btn-primary:hover{background:var(--green)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:var(--surface3);color:var(--text2);border:1px solid var(--border);border-radius:8px;padding:10px 20px;font-size:13px;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif}
.stock-bar{height:4px;background:var(--surface3);border-radius:2px;margin-top:4px;overflow:hidden}
.stock-fill{height:100%;border-radius:2px;transition:width .3s}
.loading-row td{text-align:center;padding:40px;color:var(--text3);font-family:var(--mono)}
.toast{position:fixed;bottom:24px;right:24px;background:var(--surface2);border:1px solid var(--green-dim);color:var(--green);padding:12px 18px;border-radius:10px;font-size:13px;font-weight:600;z-index:999;animation:slideUp .3s ease;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.settings-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:22px}
.settings-title{font-size:13px;font-weight:700;margin-bottom:16px}
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--text2)}
.settings-row:last-child{border-bottom:none}
.refresh-btn{background:var(--surface3);border:1px solid var(--border);color:var(--text2);border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;transition:all .15s}
.refresh-btn:hover{color:var(--text);border-color:var(--border2)}
@media(max-width:900px){
  .sidebar{width:60px;min-width:60px}
  .nav-item span:not(.nav-icon){display:none}
  .sidebar-logo,.admin-name,.admin-role{display:none}
  .stats-row{grid-template-columns:repeat(2,1fr)}
  .two-col{grid-template-columns:1fr}
  .settings-grid{grid-template-columns:1fr}
  .form-grid{grid-template-columns:1fr}
}
`;

// ── HELPERS ────────────────────────────────────────────────
function StatusPill({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Processing;
  return (
    <span className="status-pill" style={{ background: c.bg, color: c.text }}>
      <span className="status-dot" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function Toggle({ on, onChange }) {
  return <div className={`toggle ${on ? "on" : ""}`} onClick={onChange}><div className="toggle-knob" /></div>;
}

function StockBar({ stock }) {
  const pct = Math.min(100, (stock / 60) * 100);
  const color = stock === 0 ? "#ef4444" : stock < 10 ? "#f97316" : "#22c55e";
  return (
    <div style={{ minWidth: 80 }}>
      <div style={{ fontSize: 12, fontFamily: "var(--mono)", color, fontWeight: 600 }}>{stock === 0 ? "OUT" : stock}</div>
      <div className="stock-bar"><div className="stock-fill" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

// ── PAGES ──────────────────────────────────────────────────
function Dashboard({ orders, products, customers }) {
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter(o => o.created_at?.startsWith(today));
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const lowStock = products.filter(p => p.stock < 10);
  const pending = orders.filter(o => o.status === "Processing");

  return (
    <>
      <div className="stats-row">
        {[
          { label: "Revenue Today", value: `₹${todayRevenue}`, sub: `${todayOrders.length} orders today` },
          { label: "Total Orders", value: orders.length, sub: `${pending.length} pending` },
          { label: "Customers", value: customers.length, sub: "Registered" },
          { label: "Low Stock", value: lowStock.length, sub: "Items need restock" },
        ].map((s, i) => (
          <div className="stat-card" key={s.label} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value stat-green">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="table-card">
          <div style={{ padding: "16px 16px 0 16px", marginBottom: 8, fontWeight: 700, fontSize: 14 }}>Recent Orders</div>
          <table>
            <thead><tr><th>Code</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {orders.slice(0, 6).map(o => (
                <tr key={o.id}>
                  <td className="mono" style={{ color: "var(--green)" }}>#{o.order_code}</td>
                  <td className="bold">{o.customer_name?.split(" ")[0]}</td>
                  <td style={{ fontWeight: 700, color: "var(--text)" }}>₹{o.total}</td>
                  <td><StatusPill status={o.status} /></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text3)", padding: 24 }}>No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-card">
          <div style={{ padding: "16px 16px 0 16px", marginBottom: 8, fontWeight: 700, fontSize: 14 }}>🚨 Low Stock</div>
          <table>
            <thead><tr><th>Product</th><th>Stock</th><th>Price</th></tr></thead>
            <tbody>
              {lowStock.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--text3)", padding: 24 }}>All items well-stocked ✓</td></tr>}
              {lowStock.map(p => (
                <tr key={p.id}>
                  <td><span style={{ marginRight: 6 }}>{p.img}</span><span className="bold">{p.name}</span></td>
                  <td><span style={{ color: p.stock === 0 ? "var(--red)" : "var(--orange)", fontWeight: 700, fontFamily: "var(--mono)" }}>{p.stock === 0 ? "OUT" : p.stock}</span></td>
                  <td style={{ color: "var(--text2)" }}>₹{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Orders({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sb("orders?select=*&order=created_at.desc");
      setOrders(data || []);
    } catch (e) { showToast("Error: " + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await sb(`orders?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
      setSelected(s => s ? { ...s, status } : s);
      showToast(`Status → ${status}`);
    } catch (e) { showToast("Update failed: " + e.message); }
  };

  const filtered = orders.filter(o => {
    const ms = o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order_code?.includes(search);
    const mf = filter === "All" || o.status === filter;
    return ms && mf;
  });

  return (
    <>
      <div className="search-bar">
        <input className="search-input" placeholder="Search by name or order code..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          {["All", "Processing", "Out for Delivery", "Delivered", "Cancelled"].map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="refresh-btn" onClick={fetchOrders}>↻ Refresh</button>
      </div>
      <div className="table-card">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Slot</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr className="loading-row"><td colSpan={8}>Loading orders...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>No orders found</td></tr>}
            {filtered.map(o => (
              <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setSelected(o)}>
                <td className="mono" style={{ color: "var(--green)" }}>#{o.order_code}</td>
                <td className="bold">{o.customer_name}</td>
                <td className="mono" style={{ fontSize: 11 }}>{o.customer_phone}</td>
                <td style={{ fontSize: 12, color: "var(--text3)" }}>{o.slot?.split(" ")[0]}</td>
                <td>{o.items?.length} items</td>
                <td style={{ fontWeight: 700, color: "var(--text)" }}>₹{o.total}</td>
                <td onClick={e => e.stopPropagation()}><StatusPill status={o.status} /></td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {o.status === "Processing" && <button className="action-btn primary" onClick={() => updateStatus(o.id, "Out for Delivery")}>Dispatch</button>}
                    {o.status === "Out for Delivery" && <button className="action-btn primary" onClick={() => updateStatus(o.id, "Delivered")}>✓ Done</button>}
                    {!["Delivered", "Cancelled"].includes(o.status) && <button className="action-btn danger" onClick={() => updateStatus(o.id, "Cancelled")}>Cancel</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-title">
              <span>Order <span style={{ color: "var(--green)", fontFamily: "var(--mono)" }}>#{selected.order_code}</span></span>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-section">
              <div className="modal-section-title">Customer</div>
              {[["Name", selected.customer_name], ["Phone", selected.customer_phone], ["Address", selected.address], ["Slot", selected.slot], ["Date", selected.created_at?.split("T")[0]]].map(([k, v]) => (
                <div className="modal-row" key
