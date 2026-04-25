import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Junior Technical Service" className="navbar-logo-img" />
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${mobileOpen ? "open" : ""}`}>
          <a href="#servicios" className="nav-link" onClick={() => setMobileOpen(false)}>
            Servicios
          </a>
          <a href="#cotizar" className="nav-link" onClick={() => setMobileOpen(false)}>
            Cotizar
          </a>
          <a href="#buscar" className="nav-link" onClick={() => setMobileOpen(false)}>
            Buscar Reparación
          </a>

          {user ? (
            <div className="nav-auth">
              <span className="nav-user">
                <User size={16} />
                {user.nombre}
              </span>
              {user.rol === "admin" && (
                <Link to="/admin" className="btn btn-secondary btn-sm" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { logout(); navigate("/"); setMobileOpen(false); }}
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>
                Ingresar
              </Link>
              <Link to="/registro" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
        }
        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .navbar-logo-img {
          height: 100px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(57,255,20,0.4));
        }
        .navbar-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--neon-green);
          cursor: pointer;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          transition: var(--transition);
        }
        .nav-link:hover {
          color: var(--neon-green);
          background: var(--neon-green-soft);
        }
        .nav-auth {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 16px;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 13px;
          margin-right: 8px;
        }
        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }
        @media (max-width: 768px) {
          .navbar-toggle { display: block; }
          .navbar-links {
            display: none;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            flex-direction: column;
            padding: 16px;
            gap: 4px;
          }
          .navbar-links.open { display: flex; }
          .nav-auth { flex-direction: column; width: 100%; }
          .nav-auth .btn-sm { width: 100%; }
          .navbar-logo-img { height: 36px; }
        }
      `}</style>
    </nav>
  );
}