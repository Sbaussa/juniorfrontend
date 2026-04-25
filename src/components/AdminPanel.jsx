import { useContext, useState } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wrench, FileText, Users, Settings, LogOut,
  Package, Clock, CheckCircle, XCircle, Eye, Edit3, Plus, Search
} from "lucide-react";
import AdminReparaciones from "./AdminReparaciones";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "reparaciones", label: "Reparaciones", icon: <Wrench size={18} /> },
  { id: "cotizaciones", label: "Cotizaciones", icon: <FileText size={18} /> },
  { id: "clientes", label: "Clientes", icon: <Users size={18} /> },
  { id: "configuracion", label: "Configuración", icon: <Settings size={18} /> },
];

export default function AdminPanel() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("reparaciones");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link to="/" className="sidebar-logo-link">
            <span className="logo-text">JUNIOR</span>
            <span className="logo-sub">TECHNICAL SERVICE</span>
          </Link>
          <span className="sidebar-badge">ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeMenu === item.id ? "active" : ""}`}
              onClick={() => setActiveMenu(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.nombre?.charAt(0)}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.nombre}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar-item" onClick={handleLogout}>
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        {activeMenu === "reparaciones" && <AdminReparaciones />}
        {activeMenu === "dashboard" && <DashboardStats />}
        {activeMenu === "cotizaciones" && <AdminCotizaciones />}
        {activeMenu === "clientes" && <AdminClientes />}
        {activeMenu === "configuracion" && <AdminConfig />}
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .sidebar-logo {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sidebar-logo-link {
          text-decoration: none;
        }
        .sidebar-logo .logo-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 18px;
          font-weight: 900;
          color: var(--neon-green);
          text-shadow: 0 0 10px var(--neon-green-glow);
        }
        .sidebar-logo .logo-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 7px;
          color: var(--text-muted);
          letter-spacing: 2px;
          display: block;
        }
        .sidebar-badge {
          padding: 4px 10px;
          background: var(--neon-green-soft);
          border: 1px solid rgba(57, 255, 20, 0.3);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          color: var(--neon-green);
          letter-spacing: 1px;
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 8px;
        }
        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--neon-green);
          color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: 'Orbitron', sans-serif;
        }
        .sidebar-user-info {
          display: flex;
          flex-direction: column;
        }
        .sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .sidebar-user-email {
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

function DashboardStats() {
  return (
    <div className="dashboard-view">
      <h1 className="page-title">Dashboard</h1>
      <div className="stats-grid">
        <StatCard number="0" label="Pendientes" color="#ffb800" icon={<Clock size={20} />} />
        <StatCard number="1" label="En Proceso" color="#00d4ff" icon={<Wrench size={20} />} />
        <StatCard number="5" label="Completadas" color="#39ff14" icon={<CheckCircle size={20} />} />
        <StatCard number="6" label="Total" color="#ffffff" icon={<Package size={20} />} />
      </div>
    </div>
  );
}

function StatCard({ number, label, color, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <div className="stat-number" style={{ color }}>{number}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function AdminCotizaciones() {
  return (
    <div>
      <h1 className="page-title">Cotizaciones</h1>
      <p style={{ color: "var(--text-secondary)" }}>Módulo de cotizaciones pendiente de implementar</p>
    </div>
  );
}

function AdminClientes() {
  return (
    <div>
      <h1 className="page-title">Clientes</h1>
      <p style={{ color: "var(--text-secondary)" }}>Módulo de clientes pendiente de implementar</p>
    </div>
  );
}

function AdminConfig() {
  return (
    <div>
      <h1 className="page-title">Configuración</h1>
      <p style={{ color: "var(--text-secondary)" }}>Configuración del sistema pendiente de implementar</p>
    </div>
  );
}
