import { useContext, useState } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wrench, FileText, Users, Settings, LogOut,
  Package, Clock, CheckCircle, TrendingUp, ChevronRight, Bell,
} from "lucide-react";
import AdminReparaciones from "./AdminReparaciones";
import AdminCotizaciones from "./AdminCotizaciones";
import AdminClientes     from "./AdminClientes";

const TABS = [
  { id: "dashboard",     label: "Dashboard",    shortLabel: "Inicio",   Icon: LayoutDashboard },
  { id: "reparaciones",  label: "Reparaciones",  shortLabel: "Taller",   Icon: Wrench },
  { id: "cotizaciones",  label: "Cotizaciones",  shortLabel: "Cotiz.",   Icon: FileText },
  { id: "clientes",      label: "Clientes",      shortLabel: "Clientes", Icon: Users },
  { id: "configuracion", label: "Configuración", shortLabel: "Config",   Icon: Settings },
];

export default function AdminPanel() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [active, setActive] = useState("reparaciones");
  const handleLogout = () => { logout(); navigate("/"); };

  const content = (
    <>
      {active === "reparaciones"  && <AdminReparaciones />}
      {active === "cotizaciones"  && <AdminCotizaciones />}
      {active === "clientes"      && <AdminClientes />}
      {active === "dashboard"     && <DashboardView user={user} />}
      {active === "configuracion" && <ConfigView user={user} onLogout={handleLogout} />}
    </>
  );

  return (
    <div className="ap-root">
      <style>{CSS}</style>

      {/* ═══════════════ DESKTOP ═══════════════ */}
      <div className="ap-desktop">
        <aside className="ap-sidebar">
          <Link to="/" className="ap-logo">
            <div className="ap-logo-icon"><Wrench size={13} color="#000" strokeWidth={2.5} /></div>
            <div>
              <div className="ap-logo-name">JUNIOR</div>
              <div className="ap-logo-sub">TECHNICAL SERVICE</div>
            </div>
            <span className="ap-admin-badge">ADMIN</span>
          </Link>

          <nav className="ap-nav">
            <div className="ap-nav-section-label">MENÚ</div>
            {TABS.map(({ id, label, Icon }) => {
              const on = active === id;
              return (
                <button key={id} onClick={() => setActive(id)}
                  className={`ap-nav-item${on ? " active" : ""}`}>
                  <span className={`ap-nav-icon${on ? " active" : ""}`}><Icon size={15} /></span>
                  <span className="ap-nav-label">{label}</span>
                  {on && <ChevronRight size={12} className="ap-nav-arrow" />}
                </button>
              );
            })}
          </nav>

          <div className="ap-sidebar-footer">
            <div className="ap-user-card">
              <div className="ap-avatar-sm">{user?.nombre?.charAt(0)?.toUpperCase()}</div>
              <div className="ap-user-info">
                <div className="ap-user-name">{user?.nombre}</div>
                <div className="ap-user-email">{user?.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="ap-logout-btn">
              <LogOut size={14} /><span>Cerrar sesión</span>
            </button>
          </div>
        </aside>
        <main className="ap-main">{content}</main>
      </div>

      {/* ═══════════════ MOBILE ═══════════════ */}
      <div className="ap-mobile">
        <header className="ap-topbar">
          <Link to="/" className="ap-logo-mobile">
            <div className="ap-logo-icon-sm"><Wrench size={12} color="#000" strokeWidth={2.5} /></div>
            <div>
              <div className="ap-logo-name">JUNIOR</div>
              <div className="ap-logo-sub">Technical Service</div>
            </div>
          </Link>
          <div className="ap-topbar-right">
            <button className="ap-icon-pill"><Bell size={16} color="#555" /></button>
            <button className="ap-avatar-btn" onClick={handleLogout} title="Cerrar sesión">
              <span className="ap-avatar-letter">{user?.nombre?.charAt(0)?.toUpperCase()}</span>
            </button>
          </div>
        </header>
        <main className="ap-main-mobile">{content}</main>
        <nav className="ap-bottom-nav">
          {TABS.map(({ id, shortLabel, Icon }) => {
            const on = active === id;
            return (
              <button key={id} className="ap-tab-btn" onClick={() => setActive(id)}>
                <div className={`ap-tab-pill${on ? " active" : ""}`}>
                  <Icon size={19} color={on ? "#000" : "#444"} strokeWidth={on ? 2.5 : 1.8} />
                </div>
                <span className={`ap-tab-label${on ? " active" : ""}`}>{shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
function DashboardView({ user }) {
  const stats = [
    { label: "Pendientes",  value: "—", color: "#ffb800", Icon: Clock },
    { label: "En proceso",  value: "—", color: "#00d4ff", Icon: Wrench },
    { label: "Completadas", value: "—", color: "#39ff14", Icon: CheckCircle },
    { label: "Total mes",   value: "—", color: "#ce93d8", Icon: Package },
  ];
  return (
    <div className="ap-view">
      <div className="ap-view-head">
        <div>
          <div className="ap-greet-sub">Bienvenido de nuevo,</div>
          <h1 className="ap-page-title">{user?.nombre?.split(" ")[0] ?? "Admin"}</h1>
        </div>
        <span className="ap-admin-badge">ADMIN</span>
      </div>
      <div className="ap-stats-grid">
        {stats.map(s => (
          <div key={s.label} className="ap-stat-card" style={{ borderColor: `${s.color}22` }}>
            <div className="ap-stat-top">
              <div className="ap-stat-icon" style={{ background: `${s.color}18` }}>
                <s.Icon size={14} color={s.color} />
              </div>
              <span className="ap-stat-num" style={{ color: s.color }}>{s.value}</span>
            </div>
            <div className="ap-stat-lbl">{s.label}</div>
            <div className="ap-stat-track" style={{ background: `${s.color}15` }}>
              <div style={{ width: "40%", height: "100%", background: s.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="ap-section-card">
        <div className="ap-section-head">
          <span className="ap-section-title">Actividad reciente</span>
          <TrendingUp size={14} color="#39ff14" />
        </div>
        <div className="ap-empty">
          <Package size={28} color="#1e1e1e" />
          <span className="ap-empty-txt">Usa las secciones del menú para gestionar el taller</span>
        </div>
      </div>
    </div>
  );
}

function ConfigView({ user, onLogout }) {
  return (
    <div className="ap-view">
      <div className="ap-view-head"><h1 className="ap-page-title">Cuenta</h1></div>
      <div className="ap-section-card">
        <div className="ap-profile-row">
          <div className="ap-big-avatar">{user?.nombre?.charAt(0)?.toUpperCase()}</div>
          <div>
            <div className="ap-profile-name">{user?.nombre}</div>
            <div className="ap-profile-email">{user?.email}</div>
            <span className="ap-admin-badge">ADMIN</span>
          </div>
        </div>
      </div>
      <button className="ap-danger-row" onClick={onLogout}>
        <LogOut size={16} color="#ff3b3b" />
        <span className="ap-danger-txt">Cerrar sesión</span>
        <ChevronRight size={14} color="#ff3b3b" style={{ marginLeft: "auto" }} />
      </button>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body { background: #080808; font-family: 'JetBrains Mono', monospace; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
* { scrollbar-width: thin; scrollbar-color: #222 transparent; }

.ap-desktop { display: flex; }
.ap-mobile  { display: none; }
@media (max-width: 767px) { .ap-desktop { display: none; } .ap-mobile { display: flex; flex-direction: column; min-height: 100dvh; } }

.ap-root { min-height: 100dvh; background: #080808; }
.ap-desktop { min-height: 100vh; }

.ap-sidebar { width: 220px; min-width: 220px; background: #0d0d0d; border-right: 1px solid #1e1e1e; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.ap-logo { display: flex; align-items: center; gap: 10px; padding: 18px 16px; border-bottom: 1px solid #1e1e1e; text-decoration: none; }
.ap-logo-icon { width: 30px; height: 30px; border-radius: 8px; background: #39ff14; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ap-logo-name { font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 900; color: #39ff14; letter-spacing: 2.5px; line-height: 1; }
.ap-logo-sub  { font-size: 7px; color: #555; letter-spacing: 1.5px; margin-top: 2px; }
.ap-admin-badge { font-size: 9px; font-weight: 700; color: #39ff14; background: rgba(57,255,20,0.1); border: 1px solid rgba(57,255,20,0.25); border-radius: 5px; padding: 4px 7px; letter-spacing: 1px; white-space: nowrap; }
.ap-nav { flex: 1; padding: 16px 10px; overflow-y: auto; }
.ap-nav-section-label { font-size: 9px; color: #555; letter-spacing: 2px; padding: 0 6px; margin-bottom: 8px; font-weight: 700; }
.ap-nav-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 8px; background: none; border: none; cursor: pointer; color: #666; margin-bottom: 2px; transition: all 0.15s; text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.ap-nav-item:hover { background: #141414; color: #888; }
.ap-nav-item.active { background: rgba(57,255,20,0.08); border: 1px solid rgba(57,255,20,0.18); color: #39ff14; }
.ap-nav-icon { width: 26px; height: 26px; border-radius: 6px; background: #141414; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ap-nav-icon.active { background: rgba(57,255,20,0.15); color: #39ff14; }
.ap-nav-label { flex: 1; }
.ap-nav-arrow { color: #39ff14; }
.ap-sidebar-footer { padding: 12px 10px; border-top: 1px solid #1a1a1a; }
.ap-user-card { display: flex; align-items: center; gap: 10px; padding: 10px 8px; background: #131313; border-radius: 8px; margin-bottom: 6px; }
.ap-avatar-sm { width: 30px; height: 30px; border-radius: 50%; background: #39ff14; color: #000; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; font-family: 'Orbitron', sans-serif; flex-shrink: 0; }
.ap-user-info { min-width: 0; }
.ap-user-name  { font-size: 11px; color: #eee; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-user-email { font-size: 9px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-logout-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px; background: none; border: none; border-radius: 8px; cursor: pointer; color: #666; font-size: 11px; font-family: 'JetBrains Mono', monospace; transition: color 0.15s; }
.ap-logout-btn:hover { color: #ff3b3b; }
.ap-main { flex: 1; overflow-y: auto; }

.ap-topbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; background: #0d0d0d; border-bottom: 1px solid #1e1e1e; position: sticky; top: 0; z-index: 50; flex-shrink: 0; }
.ap-logo-mobile { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.ap-logo-icon-sm { width: 32px; height: 32px; border-radius: 9px; background: #39ff14; display: flex; align-items: center; justify-content: center; }
.ap-topbar-right { display: flex; gap: 8px; align-items: center; }
.ap-icon-pill { width: 36px; height: 36px; border-radius: 50%; background: #131313; border: 1px solid #1e1e1e; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.ap-avatar-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(57,255,20,0.12); border: 1px solid rgba(57,255,20,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.ap-avatar-letter { font-size: 13px; font-weight: 900; color: #39ff14; font-family: 'Orbitron', sans-serif; }
.ap-main-mobile { flex: 1; overflow-y: auto; padding-bottom: 90px; }
.ap-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: #0d0d0d; border-top: 1px solid #1e1e1e; padding: 10px 6px 22px; z-index: 100; }
.ap-tab-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; padding: 2px 0; }
.ap-tab-pill { width: 44px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.ap-tab-pill.active { background: #39ff14; }
.ap-tab-label { font-size: 9px; letter-spacing: 0.4px; font-weight: 700; color: #555; }
.ap-tab-label.active { color: #39ff14; }

.ap-view { padding: 28px 32px; }
@media (max-width: 767px) { .ap-view { padding: 20px 16px; } }
.ap-view-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
.ap-greet-sub  { font-size: 11px; color: #666; margin-bottom: 4px; }
.ap-page-title { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 900; color: #efefef; letter-spacing: 0.5px; }
.ap-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
@media (max-width: 767px) { .ap-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
.ap-stat-card { background: #0d0d0d; border-radius: 14px; border: 1px solid #1e1e1e; padding: 14px 13px 11px; }
.ap-stat-top  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.ap-stat-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.ap-stat-num  { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 900; }
.ap-stat-lbl  { font-size: 9px; color: #666; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 700; margin-bottom: 9px; }
.ap-stat-track { height: 3px; border-radius: 2px; overflow: hidden; }
.ap-section-card { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
.ap-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.ap-section-title { font-size: 10px; color: #666; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; }
.ap-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 30px 0; }
.ap-empty-txt { font-size: 11px; color: #555; text-align: center; }
.ap-profile-row { display: flex; align-items: center; gap: 14px; }
.ap-big-avatar { width: 56px; height: 56px; border-radius: 50%; background: #39ff14; color: #000; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; font-family: 'Orbitron', sans-serif; flex-shrink: 0; }
.ap-profile-name  { font-size: 14px; color: #efefef; font-weight: 700; margin-bottom: 3px; }
.ap-profile-email { font-size: 11px; color: #555; margin-bottom: 6px; }
.ap-danger-row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 16px; background: rgba(255,59,59,0.06); border: 1px solid rgba(255,59,59,0.15); border-radius: 14px; cursor: pointer; margin-top: 4px; }
.ap-danger-row:hover { background: rgba(255,59,59,0.1); }
.ap-danger-txt { font-size: 13px; color: #ff3b3b; font-weight: 700; }
`;