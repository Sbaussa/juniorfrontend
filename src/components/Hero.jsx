import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Award } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-grid-overlay"></div>
        <div className="hero-glow"></div>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <Zap size={14} />
          Servicio Técnico Especializado
        </div>

        <h1 className="hero-title">
          Reparamos tu equipo con <span className="text-neon">precisión</span> y <span className="text-neon">garantía</span>
        </h1>

        <p className="hero-description">
          Especialistas en consolas, computadores y celulares. Diagnóstico gratuito 
          y cotizaciones instantáneas. Tu equipo en las mejores manos.
        </p>

        <div className="hero-buttons">
          <Link to="/registro" className="btn btn-primary btn-lg">
            Crear Cuenta Gratis
            <ArrowRight size={18} />
          </Link>
          <a href="#cotizar" className="btn btn-secondary btn-lg">
            Solicitar Cotización
          </a>
        </div>

        <div className="hero-features">
          <div className="hero-feature">
            <Shield size={20} />
            <span>Garantía en todas las reparaciones</span>
          </div>
          <div className="hero-feature">
            <Award size={20} />
            <span>Técnicos certificados</span>
          </div>
          <div className="hero-feature">
            <Zap size={20} />
            <span>Diagnóstico en 24h</span>
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 80px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(57, 255, 20, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .hero-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(57, 255, 20, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          text-align: center;
          animation: slideUp 0.8s ease-out;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: var(--neon-green-soft);
          border: 1px solid rgba(57, 255, 20, 0.2);
          border-radius: 30px;
          color: var(--neon-green);
          font-size: 13px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: 52px;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -1px;
        }
        .hero-description {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 36px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .btn-lg {
          padding: 16px 32px;
          font-size: 15px;
        }
        .hero-features {
          display: flex;
          gap: 32px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        .hero-feature svg {
          color: var(--neon-green);
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 32px; }
          .hero-description { font-size: 16px; }
          .hero-buttons { flex-direction: column; align-items: center; }
          .hero-features { flex-direction: column; gap: 16px; }
        }
      `}</style>
    </section>
  );
}
