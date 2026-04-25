
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../App";
import api from "../utils/api";
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Registro() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", password: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back">← Volver al inicio</Link>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="logo-text">JUNIOR</span>
            <span className="logo-sub">TECHNICAL SERVICE</span>
          </div>
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Regístrate para rastrear tus reparaciones</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <div className="input-icon">
                <User size={18} />
                <input className="form-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Tu nombre" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon">
                <Mail size={18} />
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="tu@email.com" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <div className="input-icon">
                <Phone size={18} />
                <input className="form-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+57 300 000 0000" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-icon">
                <Lock size={18} />
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              Crear Cuenta
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footer">
            ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--bg-primary);
        }
        .auth-back {
          position: fixed;
          top: 24px;
          left: 24px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          transition: var(--transition);
        }
        .auth-back:hover { color: var(--neon-green); }
        .auth-container { width: 100%; max-width: 440px; }
        .auth-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 40px 32px;
          animation: slideUp 0.5s ease-out;
        }
        .auth-logo {
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-logo .logo-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 28px;
          font-weight: 900;
          color: var(--neon-green);
          text-shadow: 0 0 10px var(--neon-green-glow);
        }
        .auth-logo .logo-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 3px;
          display: block;
        }
        .auth-title {
          text-align: center;
          font-size: 24px;
          margin-bottom: 4px;
        }
        .auth-subtitle {
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 28px;
        }
        .input-icon {
          display: flex;
          align-items: center;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0 12px;
          transition: var(--transition);
        }
        .input-icon:focus-within {
          border-color: var(--neon-green);
          box-shadow: 0 0 0 3px var(--neon-green-soft);
        }
        .input-icon svg { color: var(--text-muted); flex-shrink: 0; }
        .input-icon input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
        }
        .input-icon input:focus { box-shadow: none; }
        .input-icon-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }
        .input-icon-btn:hover { color: var(--neon-green); }
        .auth-error {
          background: rgba(255, 59, 59, 0.1);
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 16px;
          font-size: 13px;
          text-align: center;
        }
        .btn-full { width: 100%; }
        .btn-lg { padding: 14px 28px; font-size: 15px; }
        .auth-footer {
          text-align: center;
          margin-top: 24px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        .auth-link {
          color: var(--neon-green);
          text-decoration: none;
          font-weight: 600;
        }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
