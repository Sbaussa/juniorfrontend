import { useContext, useState } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wrench, FileText, Users, Settings, LogOut,
  Package, Clock, CheckCircle, TrendingUp, ChevronRight, Bell,
} from "lucide-react";
import AdminReparaciones from "./AdminReparaciones";

const TABS = [
  { id: "dashboard",     label: "Inicio",      Icon: LayoutDashboard },
  { id: "reparaciones",  label: "Taller",       Icon: Wrench },
  { id: "cotizaciones",  label: "Cotiz.",        Icon: FileText },
  { id: "clientes",      label: "Clientes",     Icon: Users },
  { id: "configuracion", label: "Config",       Icon: Settings },
];

export default function AdminPanel() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [active, setActive] = useState("reparaciones");

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* TOP BAR */}
      <header style={S.topBar}>
        <Link to="/" style={S.brand}>
          <div style={S.brandIcon}><Wrench size={12} color="#000" strokeWidth={2.5} /></div>
          <div>
            <div style={S.brandName}>JUNIOR</div>
            <div style={S.brandSub}>Technical Service</div>
          </div>
        </Link>
        <div style={S.topRight}>
          <button style={S.iconBtn} className="tap-btn">
            <Bell size={16} color="#555" />
          </button>
          <button style={S.avatarBtn} onClick={handleLogout} className="tap-btn" title="Cerrar sesión">
            <span style={S.avatarLetter}>{user?.nombre?.charAt(0)?.toUpperCase()}</span>
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main style={S.main}>
        {active === "reparaciones"   && <AdminReparaciones />}
        {active === "dashboard"      && <DashboardView user={user} />}
        {active === "cotizaciones"   && <Placeholder title="Cotizaciones" Icon={FileText} />}
        {active === "clientes"       && <Placeholder title="Clientes" Icon={Users} />}
        {active === "configuracion"  && <ConfigView user={user} onLogout={handleLogout} />}
      </main>

      {/* BOTTOM NAV */}
      <nav style={S.bottomNav}>
        {TABS.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button key={id} style={S.tabBtn} onClick={() => setActive(id)} className="tab-btn">
              <div style={{ ...S.tabPill, ...(on ? S.tabPillOn : {}) }}>
                <Icon size={19} color={on ? "#000" : "#444"} strokeWidth={on ? 2.5 : 1.8} />
              </div>
              <span style={{ ...S.tabLabel, color: on ? "#39ff14" : "#3a3a3a" }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ─────────────────────────────
   DASHBOARD
───────────────────────────── */
function DashboardView({ user }) {
  const stats = [
    { label: "Pendientes",  value: "0", color: "#ffb800", Icon: Clock },
    { label: "En proceso",  value: "1", color: "#00d4ff", Icon: Wrench },
    { label: "Completadas", value: "5", color: "#39ff14", Icon: CheckCircle },
    { label: "Total mes",   value: "6", color: "#ce93d8", Icon: Package },
  ];

  return (
    <div style={S.view}>
      <div style={S.greeting}>
        <div>
          <div style={S.greetSub}>Bienvenido de nuevo,</div>
          <div style={S.greetName}>{user?.nombre?.split(" ")[0] ?? "Admin"}</div>
        </div>
        <span style={S.adminPill}>ADMIN</span>
      </div>

      <div style={S.grid2}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...S.statCard, borderColor: `${s.color}22` }} className="tap-btn">
            <div style={S.statRow}>
              <div style={{ ...S.statIcon, background: `${s.color}18` }}>
                <s.Icon size={14} color={s.color} />
              </div>
              <span style={{ ...S.statNum, color: s.color }}>{s.value}</span>
            </div>
            <div style={S.statLbl}>{s.label}</div>
            <div style={{ ...S.statBar, background: `${s.color}15` }}>
              <div style={{ width: "55%", height: "100%", background: s.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.cardHead}>
          <span style={S.cardTitle}>Actividad reciente</span>
          <TrendingUp size={14} color="#39ff14" />
        </div>
        <div style={S.empty}>
          <Package size={28} color="#1e1e1e" />
          <span style={S.emptyTxt}>Sin actividad registrada</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   CONFIG
───────────────────────────── */
function ConfigView({ user, onLogout }) {
  return (
    <div style={S.view}>
      <div style={S.greeting}>
        <div style={S.greetName}>Cuenta</div>
      </div>

      <div style={S.card}>
        <div style={S.profileRow}>
          <div style={S.bigAvatar}>{user?.nombre?.charAt(0)?.toUpperCase()}</div>
          <div>
            <div style={S.profileName}>{user?.nombre}</div>
            <div style={S.profileEmail}>{user?.email}</div>
            <span style={S.adminPill}>ADMIN</span>
          </div>
        </div>
      </div>

      <button style={S.dangerRow} onClick={onLogout} className="danger-row">
        <LogOut size={16} color="#ff3b3b" />
        <span style={S.dangerTxt}>Cerrar sesión</span>
        <ChevronRight size={14} color="#ff3b3b" style={{ marginLeft: "auto" }} />
      </button>
    </div>
  );
}

function Placeholder({ title, Icon }) {
  return (
    <div style={S.view}>
      <div style={S.greeting}>
        <div style={S.greetName}>{title}</div>
      </div>
      <div style={S.empty}>
        <Icon size={36} color="#1a1a1a" />
        <span style={S.emptyTxt}>Próximamente disponible</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   TOKENS
───────────────────────────── */
const G = "#39ff14";
const BG0 = "#080808";
const BG1 = "#0d0d0d";
const BG2 = "#131313";
const BR  = "#1e1e1e";

const S = {
  root: {
    display: "flex", flexDirection: "column",
    minHeight: "100dvh", background: BG0,
    fontFamily: "'JetBrains Mono', monospace",
    maxWidth: 480, margin: "0 auto",
  },
  topBar: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    background: BG1, borderBottom: `1px solid ${BR}`,
    position: "sticky", top: 0, zIndex: 50, flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  brandIcon: {
    width: 32, height: 32, borderRadius: 9, background: G,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: {
    fontSize: 13, fontWeight: 900, color: G,
    letterSpacing: 2.5, lineHeight: 1,
    fontFamily: "'Orbitron', sans-serif",
  },
  brandSub: { fontSize: 8, color: "#2e2e2e", letterSpacing: 1.5, marginTop: 2 },
  topRight: { display: "flex", gap: 8, alignItems: "center" },
  iconBtn: {
    width: 36, height: 36, borderRadius: "50%",
    background: BG2, border: `1px solid ${BR}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  avatarBtn: {
    width: 36, height: 36, borderRadius: "50%",
    background: `${G}15`, border: `1px solid ${G}35`,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  avatarLetter: { fontSize: 13, fontWeight: 900, color: G, fontFamily: "'Orbitron', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 90 },
  bottomNav: {
    display: "flex",
    position: "fixed", bottom: 0,
    left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480,
    background: BG1, borderTop: `1px solid ${BR}`,
    padding: "10px 6px 22px",
    zIndex: 100,
  },
  tabBtn: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4,
    background: "none", border: "none", cursor: "pointer",
    padding: "2px 0",
  },
  tabPill: {
    width: 44, height: 32, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s, transform 0.15s",
  },
  tabPillOn: { background: G },
  tabLabel: { fontSize: 9, letterSpacing: 0.4, transition: "color 0.2s", fontWeight: 700 },

  /* Shared view */
  view: { padding: "20px 16px" },
  greeting: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 20,
  },
  greetSub: { fontSize: 11, color: "#333", marginBottom: 4 },
  greetName: {
    fontSize: 24, fontWeight: 900, color: "#efefef",
    fontFamily: "'Orbitron', sans-serif", letterSpacing: 0.5,
  },
  adminPill: {
    fontSize: 9, fontWeight: 700, color: G,
    background: `${G}12`, border: `1px solid ${G}28`,
    borderRadius: 6, padding: "5px 8px", letterSpacing: 1,
    whiteSpace: "nowrap", alignSelf: "flex-start",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  statCard: {
    background: BG1, borderRadius: 16, border: `1px solid ${BR}`,
    padding: "14px 13px 11px",
  },
  statRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  statIcon: { width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  statNum:  { fontSize: 28, fontWeight: 900, fontFamily: "'Orbitron', sans-serif" },
  statLbl:  { fontSize: 9, color: "#333", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 9, fontWeight: 700 },
  statBar:  { height: 3, borderRadius: 2, overflow: "hidden" },
  card: {
    background: BG1, borderRadius: 16,
    border: `1px solid ${BR}`, padding: "16px",
    marginBottom: 12,
  },
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  cardTitle: { fontSize: 10, color: "#333", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0" },
  emptyTxt: { fontSize: 11, color: "#222" },

  profileRow: { display: "flex", alignItems: "center", gap: 14 },
  bigAvatar: {
    width: 56, height: 56, borderRadius: "50%",
    background: G, color: "#000",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 900, fontFamily: "'Orbitron', sans-serif", flexShrink: 0,
  },
  profileName:  { fontSize: 14, color: "#efefef", fontWeight: 700, marginBottom: 3 },
  profileEmail: { fontSize: 11, color: "#333", marginBottom: 6 },

  dangerRow: {
    display: "flex", alignItems: "center", gap: 12,
    width: "100%", padding: "16px",
    background: "rgba(255,59,59,0.06)",
    border: "1px solid rgba(255,59,59,0.15)",
    borderRadius: 14, cursor: "pointer", marginTop: 4,
  },
  dangerTxt: { fontSize: 13, color: "#ff3b3b", fontWeight: 700 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { background: #080808; overscroll-behavior: none; }
  .tap-btn:active  { opacity: 0.65; transform: scale(0.94); }
  .danger-row:active { opacity: 0.7; }
  .tab-btn:active div { transform: scale(0.9); }
  ::-webkit-scrollbar { display: none; }
  input, textarea, select { outline: none; }
`;