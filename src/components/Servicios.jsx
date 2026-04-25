import { Gamepad2, Cpu, Smartphone, Wrench, Search, Shield } from "lucide-react";

export default function Servicios() {
  const servicios = [
    {
      icon: <Gamepad2 size={28} />,
      title: "Consolas",
      desc: "PlayStation, Xbox, Nintendo Switch. Reparamos todo tipo de fallas.",
      items: ["Joystick drift", "No enciende", "Sobrecalentamiento", "Lector de discos", "HDMI"]
    },
    {
      icon: <Cpu size={28} />,
      title: "Computadores",
      desc: "Laptops y PCs de escritorio. Diagnóstico y reparación completa.",
      items: ["Pantalla rota", "Virus/Malware", "Upgrade SSD/RAM", "Fuente de poder", "Teclado"]
    },
    {
      icon: <Smartphone size={28} />,
      title: "Celulares",
      desc: "iPhone, Samsung, Xiaomi y más. Reparación express.",
      items: ["Pantalla rota", "Batería", "Puerto de carga", "Cámara", "Software"]
    },
  ];

  const procesos = [
    { icon: <Search size={24} />, title: "1. Diagnóstico", desc: "Evaluamos tu equipo gratis" },
    { icon: <Wrench size={24} />, title: "2. Cotización", desc: "Te enviamos el presupuesto" },
    { icon: <Shield size={24} />, title: "3. Reparación", desc: "Reparamos con garantía" },
  ];

  return (
    <section id="servicios" className="servicios">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Nuestros Servicios</span>
          <h2 className="section-title">¿Qué podemos <span className="text-neon">reparar</span> por ti?</h2>
        </div>

        <div className="servicios-grid">
          {servicios.map((s, i) => (
            <div key={i} className="servicio-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="servicio-icon">{s.icon}</div>
              <h3 className="servicio-title">{s.title}</h3>
              <p className="servicio-desc">{s.desc}</p>
              <ul className="servicio-list">
                {s.items.map((item, j) => (
                  <li key={j}>✓ {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="proceso-section">
          <h3 className="proceso-title">¿Cómo funciona?</h3>
          <div className="proceso-grid">
            {procesos.map((p, i) => (
              <div key={i} className="proceso-card">
                <div className="proceso-icon">{p.icon}</div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .servicios {
          padding: 80px 0;
          position: relative;
        }
        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .section-badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--neon-green-soft);
          border: 1px solid rgba(57, 255, 20, 0.2);
          border-radius: 20px;
          color: var(--neon-green);
          font-size: 12px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 36px;
          font-weight: 800;
        }
        .servicios-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 64px;
        }
        .servicio-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 32px;
          transition: var(--transition);
          animation: slideUp 0.6s ease-out both;
        }
        .servicio-card:hover {
          border-color: var(--neon-green-dim);
          box-shadow: var(--shadow-neon);
          transform: translateY(-4px);
        }
        .servicio-icon {
          width: 56px;
          height: 56px;
          background: var(--neon-green-soft);
          border: 1px solid rgba(57, 255, 20, 0.2);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--neon-green);
          margin-bottom: 20px;
        }
        .servicio-title {
          font-size: 20px;
          margin-bottom: 8px;
        }
        .servicio-desc {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 16px;
        }
        .servicio-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .servicio-list li {
          color: var(--text-secondary);
          font-size: 13px;
        }
        .servicio-list li::before {
          content: "✓";
          color: var(--neon-green);
          margin-right: 8px;
          font-weight: 700;
        }
        .proceso-section {
          text-align: center;
        }
        .proceso-title {
          font-size: 24px;
          margin-bottom: 32px;
        }
        .proceso-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .proceso-card {
          padding: 24px;
        }
        .proceso-icon {
          width: 64px;
          height: 64px;
          background: var(--neon-green-soft);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--neon-green);
          margin: 0 auto 16px;
        }
        .proceso-card h4 {
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .proceso-card p {
          color: var(--text-secondary);
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .servicios-grid, .proceso-grid { grid-template-columns: 1fr; }
          .section-title { font-size: 28px; }
        }
      `}</style>
    </section>
  );
}
