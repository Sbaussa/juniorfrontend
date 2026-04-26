import { Gamepad2, Cpu, Smartphone, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="public/logo.png" alt="Junior Technical Service" className="footer-logo-img" />
            </div>
            <p className="footer-desc">
              Especialistas en reparación de consolas, computadores y celulares. 
              Servicio técnico profesional con garantía.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Servicios</h4>
            <ul className="footer-list">
              <li><Gamepad2 size={14} /> Reparación de Consolas</li>
              <li><Cpu size={14} /> Reparación de Computadores</li>
              <li><Smartphone size={14} /> Reparación de Celulares</li>
              <li>Diagnóstico Gratuito</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Contacto</h4>
            <ul className="footer-list">
              <li><Phone size={14} /> +57 301 7505646</li>
              <li><Mail size={14} /> juniortechnicalservices@gmail.com</li>
              <li><MapPin size={14} /> Calle 50 #43 - 12  CC Parque Central L. 151-2 #123</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Horario</h4>
            <ul className="footer-list">
              <li>Lunes - Sábado: 8:30am - 6:30pm</li>
              <li>Domingos: Cerrado</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Baussa - Todos los derechos reservados.</p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 48px 0 24px;
          margin-top: 80px;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-logo {
          margin-bottom: 16px;
        }
        .footer-logo-img {
          width: 160px;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(57,255,20,0.35));
        }
        .footer-desc {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }
        .footer-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--neon-green);
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .footer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </footer>
  );
}