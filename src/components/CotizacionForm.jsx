
import { useState } from "react";
import api from "../utils/api";
import { Send, CheckCircle } from "lucide-react";

export default function CotizacionForm() {
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "",
    tipoEquipo: "consola", marca: "", modelo: "", descripcion: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/cotizaciones", form);
      setSuccess(true);
      setForm({ nombre: "", email: "", telefono: "", tipoEquipo: "consola", marca: "", modelo: "", descripcion: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar la cotización");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="cotizacion-success">
        <CheckCircle size={48} />
        <h3>¡Cotización Enviada!</h3>
        <p>Hemos recibido tu solicitud. Te contactaremos pronto con el presupuesto.</p>
        <button className="btn btn-secondary" onClick={() => setSuccess(false)}>
          Enviar otra cotización
        </button>
      </div>
    );
  }

  return (
    <section id="cotizar" className="cotizacion-section">
      <div className="container">
        <div className="cotizacion-wrapper">
          <div className="cotizacion-info">
            <span className="section-badge">Cotización Gratis</span>
            <h2 className="section-title">Solicita tu <span className="text-neon">cotización</span></h2>
            <p className="cotizacion-desc">
              Completa el formulario con los datos de tu equipo y te enviaremos 
              un presupuesto sin compromiso. Diagnóstico gratuito incluido.
            </p>
            <div className="cotizacion-benefits">
              <div className="benefit-item"> Respuesta en menos de 24 horas</div>
              <div className="benefit-item">🔍 Diagnóstico sin costo</div>
              <div className="benefit-item">️ Garantía en reparaciones</div>
              <div className="benefit-item">💰 Precios competitivos</div>
            </div>
          </div>

          <form className="cotizacion-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input className="form-input" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+57 300 000 0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de equipo</label>
                <select className="form-select" name="tipoEquipo" value={form.tipoEquipo} onChange={handleChange}>
                  <option value="consola">🎮 Consola</option>
                  <option value="computador"> Computador</option>
                  <option value="celular">📱 Celular</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Marca</label>
                <input className="form-input" name="marca" value={form.marca} onChange={handleChange} required placeholder="Ej: Sony, HP, Samsung" />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo</label>
                <input className="form-input" name="modelo" value={form.modelo} onChange={handleChange} required placeholder="Ej: PS5, Pavilion, Galaxy S24" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción del problema</label>
              <textarea className="form-textarea" name="descripcion" value={form.descripcion} onChange={handleChange} required placeholder="Describe el problema de tu equipo con el mayor detalle posible..." />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              <Send size={18} />
              {loading ? "Enviando..." : "Enviar Cotización"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .cotizacion-section { padding: 80px 0; }
        .cotizacion-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        .cotizacion-info { position: sticky; top: 100px; }
        .cotizacion-desc {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.7;
          margin: 16px 0 24px;
        }
        .cotizacion-benefits {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .benefit-item {
          padding: 12px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 14px;
          color: var(--text-secondary);
        }
        .cotizacion-form {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 32px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .btn-full { width: 100%; margin-top: 8px; }
        .form-error {
          background: rgba(255, 59, 59, 0.1);
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 16px;
          font-size: 13px;
        }
        .cotizacion-success {
          text-align: center;
          padding: 60px 24px;
          animation: slideUp 0.5s ease-out;
        }
        .cotizacion-success svg {
          color: var(--neon-green);
          margin-bottom: 16px;
        }
        .cotizacion-success h3 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .cotizacion-success p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
        @media (max-width: 768px) {
          .cotizacion-wrapper { grid-template-columns: 1fr; }
          .cotizacion-info { position: static; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
