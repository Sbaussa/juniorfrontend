import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../App";
import api from "../utils/api";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Gamepad2 } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", form);
      login(res.data.user, res.data.token);
      if (res.data.user.rol === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="grid-overlay"></div>
        <div className="glow-effect"></div>
      </div>
      
      <Link to="/" className="auth-back">
        <span>←</span> Volver al inicio
      </Link>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <Gamepad2 size={32} />
              </div>
              <div className="logo-texts">
                <h1 className="logo-main">JUNIOR</h1>
                <span className="logo-sub">TECHNICAL SERVICE</span>
              </div>
            </div>
          </div>

          <div className="login-content">
            <h2 className="login-title">Iniciar Sesión</h2>
            <p className="login-subtitle">Accede a tu panel de control</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">
                  <Mail size={14} />
                  Email
                </label>
                <div className="input-wrapper">
                  <input 
                    className="form-input" 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    required 
                    placeholder="tu@email.com" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} />
                  Contraseña
                </label>
                <div className="input-wrapper">
                  <input 
                    className="form-input" 
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button 
                className="btn-login" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>o</span>
            </div>

            <p className="login-footer">
              ¿No tienes cuenta? <Link to="/registro" className="register-link">Regístrate</Link>
            </p>

            <div className="demo-credentials">
              <div className="demo-title">🔑 Credenciales de prueba:</div>
              <div className="demo-item">
                <span className="demo-label">Admin:</span>
                <code>admin@tallertech.com</code> / <code>admin123</code>
              </div>
              <div className="demo-item">
                <span className="demo-label">Cliente:</span>
                <code>jorge@demo.com</code> / <code>cliente123</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          background: #0a0a0a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }
        
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .glow-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(57, 255, 20, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .auth-back {
          position: fixed;
          top: 24px;
          left: 24px;
          color: #666;
          text-decoration: none;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
          z-index: 10;
        }
        
        .auth-back:hover {
          color: #39ff14;
        }
        
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .login-card {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid #2a2a2a;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .login-header {
          padding: 40px 32px 24px;
          text-align: center;
          border-bottom: 1px solid #2a2a2a;
        }
        
        .logo-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        
        .logo-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #39ff14 0%, #2ecc0f 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0a;
          box-shadow: 0 0 30px rgba(57, 255, 20, 0.4);
        }
        
        .logo-texts {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .logo-main {
          font-family: 'Orbitron', monospace;
          font-size: 32px;
          font-weight: 900;
          color: #39ff14;
          text-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
          letter-spacing: 2px;
          margin: 0;
          line-height: 1;
        }
        
        .logo-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #666;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-top: 4px;
        }
        
        .login-content {
          padding: 32px;
        }
        
        .login-title {
          font-family: 'Orbitron', monospace;
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin: 0 0 8px;
        }
        
        .login-subtitle {
          color: #a0a0a0;
          text-align: center;
          font-size: 14px;
          margin: 0 0 32px;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #a0a0a0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .form-label svg {
          color: #39ff14;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .form-input {
          width: 100%;
          padding: 14px 16px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          transition: all 0.3s;
          outline: none;
        }
        
        .form-input:focus {
          border-color: #39ff14;
          box-shadow: 0 0 0 3px rgba(57, 255, 20, 0.1);
        }
        
        .form-input::placeholder {
          color: #666;
        }
        
        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s;
        }
        
        .toggle-password:hover {
          color: #39ff14;
        }
        
        .error-message {
          background: rgba(255, 59, 59, 0.1);
          border: 1px solid #ff3b3b;
          color: #ff3b3b;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-login {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, #39ff14 0%, #2ecc0f 100%);
          border: none;
          border-radius: 10px;
          color: #0a0a0a;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
        }
        
        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(57, 255, 20, 0.4);
        }
        
        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(10, 10, 10, 0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .login-divider {
          position: relative;
          text-align: center;
          margin: 24px 0;
        }
        
        .login-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #2a2a2a, transparent);
        }
        
        .login-divider span {
          background: rgba(26, 26, 26, 0.8);
          padding: 0 16px;
          color: #666;
          font-size: 12px;
          position: relative;
        }
        
        .login-footer {
          text-align: center;
          color: #a0a0a0;
          font-size: 14px;
        }
        
        .register-link {
          color: #39ff14;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .register-link:hover {
          text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
        }
        
        .demo-credentials {
          margin-top: 24px;
          padding: 20px;
          background: rgba(57, 255, 20, 0.05);
          border: 1px solid rgba(57, 255, 20, 0.2);
          border-radius: 12px;
        }
        
        .demo-title {
          font-size: 12px;
          font-weight: 600;
          color: #39ff14;
          margin-bottom: 12px;
          text-align: center;
        }
        
        .demo-item {
          font-size: 12px;
          color: #a0a0a0;
          margin-bottom: 8px;
          text-align: center;
        }
        
        .demo-item:last-child {
          margin-bottom: 0;
        }
        
        .demo-label {
          color: #39ff14;
          font-weight: 600;
          margin-right: 4px;
        }
        
        .demo-item code {
          background: rgba(10, 10, 10, 0.6);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #fff;
        }
        
        @media (max-width: 480px) {
          .login-card {
            border-radius: 16px;
          }
          
          .login-header,
          .login-content {
            padding: 24px;
          }
          
          .logo-main {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}