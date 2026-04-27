import { useContext, useState } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wrench, FileText, Users, Settings, LogOut,
  Package, Clock, CheckCircle, TrendingUp, ChevronRight,
} from "lucide-react";
import AdminReparaciones from "./AdminReparaciones";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "reparaciones", label: "Reparaciones", icon: Wrench },
  { id: "cotizaciones", label: "Cotizaciones", icon: FileText },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export default function AdminPanel() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("reparaciones");

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div style={styles.layout}>
      <style>{globalStyles}</style>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <Link to="/" style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <Wrench size={14} color="#000" />
          </div>
          <div>
            <div style={styles.logoText}>JUNIOR</div>
            <div style={styles.logoSub}>TECHNICAL SERVICE</div>
          </div>
          <span style={styles.adminBadge}>ADMIN</span>
        </Link>

        {/* Nav */}
        <nav style={styles.nav}>
          <div style={styles.navLabel}>MENÚ</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
                className="nav-item"
              >
                <span style={{ ...styles.navIcon, ...(active ? styles.navIconActive : {}) }}>
                  <Icon size={15} />
                </span>
                <span style={styles.navLabel2}>{item.label}</span>
                {active && <ChevronRight size={12} style={{ marginLeft: "auto", color: "#39ff14" }} />}
              </button>
            );
          })}
        </nav>

        {/* Footer user */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userCard}>
            <div style={styles.avatar}>{user?.nombre?.charAt(0)?.toUpperCase()}</div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user?.nombre}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} className="logout-btn">
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {activeMenu === "reparaciones" && <AdminReparaciones />}
        {activeMenu === "dashboard"    && <DashboardStats />}
        {activeMenu === "cotizaciones" && <Placeholder title="Cotizaciones" />}
        {activeMenu === "clientes"     && <Placeholder title="Clientes" />}
        {activeMenu === "configuracion" && <Placeholder title="Configuración" />}
      </main>
    </div>
  );
}

/* ── Dashboard ── */
function DashboardStats() {
  const stats = [
    { label: "Pendientes",   value: "0",  change: "+0%",  color: "#ffb800", icon: Clock },
    { label: "En Proceso",   value: "1",  change: "+1",   color: "#00d4ff", icon: Wrench },
    { label: "Completadas",  value: "5",  change: "+5",   color: "#39ff14", icon: CheckCircle },
    { label: "Total",        value: "6",  change: "mes",  color: "#ce93d8", icon: Package },
  ];

  return (
    <div style={styles.view}>
      <PageHeader title="Dashboard" subtitle="Resumen general del taller" />
      <div style={styles.statsGrid}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={styles.statCard} className="stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ ...styles.statIconWrap, background: `${s.color}18`, color: s.color }}>
                  <Icon size={18} />
                </div>
                <span style={{ ...styles.statChange, color: s.color }}>{s.change}</span>
              </div>
              <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={{ ...styles.statBar, background: `${s.color}22` }}>
                <div style={{ ...styles.statBarFill, background: s.color, width: `${Math.random() * 60 + 20}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.recentSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Actividad reciente</span>
          <TrendingUp size={14} color="#39ff14" />
        </div>
        <div style={styles.emptyState}>
          <Package size={32} color="#333" />
          <p style={{ color: "#444", marginTop: 8, fontSize: 13 }}>Sin actividad aún</p>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div style={styles.view}>
      <PageHeader title={title} subtitle="Módulo en desarrollo" />
      <div style={styles.emptyState}>
        <Package size={40} color="#222" />
        <p style={{ color: "#333", marginTop: 12, fontSize: 13 }}>Próximamente disponible</p>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div style={styles.pageHeader}>
      <h1 style={styles.pageTitle}>{title}</h1>
      {subtitle && <p style={styles.pageSubtitle}>{subtitle}</p>}
    </div>
  );
}

/* ── Styles ── */
const C = {
  bg0:    "#080808",
  bg1:    "#0e0e0e",
  bg2:    "#141414",
  bg3:    "#1a1a1a",
  border: "#1f1f1f",
  border2:"#2a2a2a",
  green:  "#39ff14",
  greenD: "rgba(57,255,20,0.08)",
  greenG: "rgba(57,255,20,0.18)",
  txt0:   "#f0f0f0",
  txt1:   "#999",
  txt2:   "#555",
};

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: C.bg0,
    fontFamily: "'JetBrains Mono', monospace",
  },
  sidebar: {
    width: 220,
    minWidth: 220,
    background: C.bg1,
    borderRight: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "18px 16px",
    borderBottom: `1px solid ${C.border}`,
    textDecoration: "none",
  },
  logoIcon: {
    width: 28, height: 28,
    background: C.green,
    borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontSize: 12, fontWeight: 900,
    color: C.green, letterSpacing: 2,
    lineHeight: 1,
    fontFamily: "'Orbitron', sans-serif",
  },
  logoSub: {
    fontSize: 7, color: C.txt2,
    letterSpacing: 1.5, marginTop: 2,
  },
  adminBadge: {
    marginLeft: "auto",
    fontSize: 8, fontWeight: 700,
    color: C.green,
    background: C.greenD,
    border: `1px solid ${C.greenG}`,
    borderRadius: 4,
    padding: "2px 6px",
    letterSpacing: 1,
  },
  nav: { flex: 1, padding: "16px 10px", overflowY: "auto" },
  navLabel: {
    fontSize: 9, color: C.txt2,
    letterSpacing: 2, padding: "0 6px",
    marginBottom: 8,
  },
  navLabel2: { fontSize: 12, color: "inherit" },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "9px 10px",
    background: "none", border: "none", borderRadius: 8,
    cursor: "pointer", color: C.txt1,
    marginBottom: 2,
    transition: "all 0.15s",
    textAlign: "left",
  },
  navItemActive: {
    background: C.greenD,
    border: `1px solid ${C.greenG}`,
    color: C.green,
  },
  navIcon: {
    width: 26, height: 26,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 6, background: C.bg3, flexShrink: 0,
  },
  navIconActive: { background: C.greenD, color: C.green },
  sidebarFooter: {
    padding: "12px 10px",
    borderTop: `1px solid ${C.border}`,
  },
  userCard: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 8px",
    background: C.bg2, borderRadius: 8,
    marginBottom: 6,
  },
  avatar: {
    width: 30, height: 30, borderRadius: "50%",
    background: C.green, color: "#000",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, flexShrink: 0,
    fontFamily: "'Orbitron', sans-serif",
  },
  userInfo: { minWidth: 0 },
  userName: { fontSize: 11, color: C.txt0, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { fontSize: 9, color: C.txt2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 8,
    width: "100%", padding: "8px 10px",
    background: "none", border: "none", borderRadius: 8,
    cursor: "pointer", color: C.txt2,
    fontSize: 11, transition: "color 0.15s",
  },
  main: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" },
  view: { padding: "28px 32px", flex: 1, overflowY: "auto" },
  pageHeader: { marginBottom: 24 },
  pageTitle: {
    fontSize: 20, fontWeight: 900, color: C.txt0,
    letterSpacing: 1, margin: 0,
    fontFamily: "'Orbitron', sans-serif",
  },
  pageSubtitle: { fontSize: 11, color: C.txt2, marginTop: 4, margin: 0 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12, marginBottom: 24,
  },
  statCard: {
    background: C.bg1,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "16px 18px",
    transition: "border-color 0.2s",
  },
  statIconWrap: {
    width: 36, height: 36,
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 28, fontWeight: 900, lineHeight: 1, marginBottom: 4, fontFamily: "'Orbitron', sans-serif" },
  statLabel: { fontSize: 10, color: C.txt2, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
  statChange: { fontSize: 9, fontWeight: 700 },
  statBar: { height: 2, borderRadius: 2 },
  statBarFill: { height: "100%", borderRadius: 2, transition: "width 0.5s" },
  recentSection: {
    background: C.bg1,
    border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "16px 20px",
  },
  sectionHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 11, color: C.txt1, letterSpacing: 1, textTransform: "uppercase" },
  emptyState: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "40px 20px",
  },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  .nav-item:hover { background: ${C.bg3} !important; color: ${C.txt0} !important; }
  .nav-item:hover .navIcon { background: ${C.bg2}; }
  .logout-btn:hover { color: #ff3b3b !important; }
  .stat-card:hover { border-color: ${C.border2} !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 4px; }
`;