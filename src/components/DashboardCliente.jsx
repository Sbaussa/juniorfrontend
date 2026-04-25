
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import api from "../utils/api";
import { Package, Clock, CheckCircle, AlertCircle, Eye, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardCliente() {
  const { user, logout } = useContext(AuthContext);
  const [reparaciones, setReparaciones] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReparacion, setSelectedReparacion] = useState(null);

  useEffect(() => {
    loadReparaciones();
    loadCotizaciones();
  }, []);

  const loadReparaciones = async () => {
    try {
      const res = await api.get("/api/reparaciones/mis-reparaciones");
      setReparaciones(res.data);
    } catch (err) { console.error(err); }
  };

  const loadCotizaciones = async () => {
    try {
      const res = await api.get("/api/cotizaciones/mis-cotizaciones");
      setCotizaciones(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const estadoConfig = {
    pendiente: { label: "Pendiente", color: "#ffb800", icon: <Clock size={16} /> },
    diagnostico: { label: "En Diagnóstico", color: "#00d4ff", icon: <AlertCircle size={16} /> },
    cotizado: { label: "Cotizado", color: "#ce93d8", icon: <Package size={16} /> },
    aprobado: { label: "Aprobado", color: "#39ff14", icon: <CheckCircle size={16} /> },
    en_reparacion: { label: "En Reparación", color: "#ffb74d", icon: <Clock size={16} /> },
    reparado: { label: "Reparado", color: "#69f0ae", icon: <CheckCircle size={16} /> },
    entregado: { label: "Entregado", color: "#39ff14", icon: <CheckCircle size={16} /> },
    cancelado: { label: "Cancelado", color: "#ff3b3b", icon: <AlertCircle size={16} /> },
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (selectedReparacion) {
    return (
      <div className="reparacion-detail">
        <button className="btn btn-ghost back-btn" onClick={() => setSelectedReparacion(null)}>
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="detail-header">
          <h2>{selectedReparacion.codigo}</h2>
          <span
            className="badge"
            style={{ background: `${estadoConfig[selectedReparacion.estado]?.color}22`, color: estadoConfig[selectedReparacion.estado]?.color }}
          >
            <span className="badge-dot"></span>
            {estadoConfig[selectedReparacion.estado]?.label}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h4>Información del Equipo</h4>
            <div className="detail-row">
              <span>Tipo:</span>
              <span style={{ textTransform: "capitalize" }}>{selectedReparacion.tipoEquipo}</span>
            </div>
            <div className="detail-row">
              <span>Marca:</span>
              <span>{selectedReparacion.marca}</span>
            </div>
            <div className="detail-row">
              <span>Modelo:</span>
              <span>{selectedReparacion.modelo}</span>
            </div>
            <div className="detail-row">
              <span>Problema:</span>
              <span>{selectedReparacion.descripcionProblema}</span>
            </div>
            {selectedReparacion.diagnostico && (
              <div className="detail-row">
                <span>Diagnóstico:</span>
                <span>{selectedReparacion.diagnostico}</span>
              </div>
            )}
            {selectedReparacion.precio && (
              <div className="detail-row precio-row">
                <span>Precio:</span>
                <span className="precio-text">${selectedReparacion.precio.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="detail-card">
            <h4>Historial de Estados</h4>
            <div className="historial-timeline">
              {selectedReparacion.historial?.map((h, i) => (
                <div key={i} className="historial-item">
                  <div className="historial-dot" style={{ background: estadoConfig[h.estadoNuevo]?.color }}></div>
                  <div className="historial-content">
                    <div className="historial-state">
                      <span className="historial-old">{h.estadoAnterior}</span>
                      <span className="historial-arrow">→</span>
                      <span className="historial-new">{h.estadoNuevo}</span>
                    </div>
                    {h.notas && <p className="historial-notas">{h.notas}</p>}
                    <span className="historial-date">{formatDate(h.createdAt)}</span>
                    <span className="historial-author">por {h.creadoPor}</span>
                  </div>
                </div>
              ))}
              {(!selectedReparacion.historial || selectedReparacion.historial.length === 0) && (
                <p style={{ color: "var(--text-muted)" }}>Sin historial aún</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-cliente">
      <div className="dashboard-header">
        <div>
          <h1>Bienvenido, {user?.nombre}</h1>
          <p className="dashboard-subtitle">Gestiona tus reparaciones y cotizaciones</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/" className="btn btn-ghost">
            <Home size={16} /> Inicio
          </Link>
          <button className="btn btn-danger btn-sm" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card-mini">
          <Package size={20} />
          <div>
            <span className="stat-num">{reparaciones.length}</span>
            <span className="stat-label-mini">Reparaciones</span>
          </div>
        </div>
        <div className="stat-card-mini">
          <Clock size={20} />
          <div>
            <span className="stat-num">{reparaciones.filter(r => !["entregado", "cancelado"].includes(r.estado)).length}</span>
            <span className="stat-label-mini">En Proceso</span>
          </div>
        </div>
        <div className="stat-card-mini">
          <CheckCircle size={20} />
          <div>
            <span className="stat-num">{cotizaciones.length}</span>
            <span className="stat-label-mini">Cotizaciones</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h3 className="section-heading">
            <Package size={20} />
            Mis Reparaciones
          </h3>
          {reparaciones.length === 0 ? (
            <div className="empty-state">
              <Package size={48} style={{ color: "var(--text-muted)" }} />
              <p>No tienes reparaciones aún</p>
            </div>
          ) : (
            <div className="reparaciones-list">
              {reparaciones.map((rep) => (
                <div key={rep.id} className="reparacion-card" onClick={() => setSelectedReparacion(rep)}>
                  <div className="reparacion-header">
                    <span className="reparacion-code">{rep.codigo}</span>
                    <span
                      className="badge"
                      style={{ background: `${estadoConfig[rep.estado]?.color}22`, color: estadoConfig[rep.estado]?.color }}
                    >
                      <span className="badge-dot"></span>
                      {estadoConfig[rep.estado]?.label}
                    </span>
                  </div>
                  <div className="reparacion-body">
                    <div>
                      <strong>{rep.marca} {rep.modelo}</strong>
                      <span className="reparacion-type">{rep.tipoEquipo}</span>
                    </div>
                    <p className="reparacion-problem">{rep.descripcionProblema}</p>
                  </div>
                  <div className="reparacion-footer">
                    <span className="reparacion-date">{formatDate(rep.createdAt)}</span>
                    <span className="view-btn"><Eye size={16} /> Ver detalle</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h3 className="section-heading">
            <Clock size={20} />
            Mis Cotizaciones
          </h3>
          {cotizaciones.length === 0 ? (
            <div className="empty-state">
              <Clock size={48} style={{ color: "var(--text-muted)" }} />
              <p>No tienes cotizaciones aún</p>
            </div>
          ) : (
            <div className="cotizaciones-list">
              {cotizaciones.map((cot) => (
                <div key={cot.id} className="cotizacion-card">
                  <div className="cotizacion-header">
                    <span className="cotizacion-code">{cot.codigo}</span>
                    <span className={`badge badge-${cot.estado}`}>
                      <span className="badge-dot"></span>
                      {cot.estado}
                    </span>
                  </div>
                  <div className="cotizacion-body">
                    <strong>{cot.marca} {cot.modelo}</strong>
                    <span className="cotizacion-type">{cot.tipoEquipo}</span>
                  </div>
                  {cot.precioEstimado && (
                    <div className="cotizacion-precio">
                      Presupuesto: <strong>${cot.precioEstimado.toLocaleString()}</strong>
                    </div>
                  )}
                  {cot.notasAdmin && <p className="cotizacion-notas">{cot.notasAdmin}</p>}
                  <span className="cotizacion-date">{formatDate(cot.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .dashboard-cliente {
          min-height: 100vh;
          padding: 90px 24px 40px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .dashboard-header h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .dashboard-subtitle {
          color: var(--text-secondary);
          font-size: 15px;
        }
        .dashboard-actions {
          display: flex;
          gap: 12px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card-mini {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-card-mini svg { color: var(--neon-green); }
        .stat-num {
          font-family: 'Orbitron', sans-serif;
          font-size: 24px;
          font-weight: 800;
          display: block;
        }
        .stat-label-mini {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .dashboard-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .dashboard-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .section-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          margin-bottom: 20px;
          color: var(--neon-green);
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }
        .empty-state p { margin-top: 12px; }
        .reparaciones-list, .cotizaciones-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .reparacion-card, .cotizacion-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px;
          cursor: pointer;
          transition: var(--transition);
        }
        .reparacion-card:hover, .cotizacion-card:hover {
          border-color: var(--neon-green-dim);
        }
        .reparacion-header, .cotizacion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .reparacion-code, .cotizacion-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: var(--neon-green);
        }
        .reparacion-body, .cotizacion-body {
          margin-bottom: 8px;
        }
        .reparacion-body strong, .cotizacion-body strong {
          display: block;
          font-size: 14px;
        }
        .reparacion-type, .cotizacion-type {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: capitalize;
        }
        .reparacion-problem {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .reparacion-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .reparacion-date, .cotizacion-date {
          font-size: 12px;
          color: var(--text-muted);
        }
        .view-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--neon-green);
        }
        .cotizacion-precio {
          font-size: 14px;
          margin: 8px 0;
        }
        .cotizacion-precio strong { color: var(--neon-green); }
        .cotizacion-notas {
          font-size: 13px;
          color: var(--text-secondary);
          background: var(--bg-primary);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          margin: 8px 0;
        }

        /* Detail view */
        .reparacion-detail {
          min-height: 100vh;
          padding: 90px 24px 40px;
          max-width: 900px;
          margin: 0 auto;
        }
        .back-btn { margin-bottom: 24px; }
        .detail-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .detail-header h2 {
          font-family: 'JetBrains Mono', monospace;
          color: var(--neon-green);
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .detail-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .detail-card h4 {
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
          color: var(--neon-green);
          margin-bottom: 16px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
        }
        .detail-row span:first-child { color: var(--text-secondary); }
        .precio-row span:last-child {
          color: var(--neon-green);
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
        }
        .historial-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .historial-item {
          display: flex;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .historial-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }
        .historial-content { flex: 1; }
        .historial-state {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          margin-bottom: 4px;
        }
        .historial-old { color: var(--text-muted); }
        .historial-arrow { color: var(--neon-green); margin: 0 4px; }
        .historial-new { color: var(--text-primary); font-weight: 600; }
        .historial-notas {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 4px 0;
        }
        .historial-date, .historial-author {
          font-size: 11px;
          color: var(--text-muted);
        }
        .historial-author { margin-left: 8px; }
        @media (max-width: 768px) {
          .dashboard-sections, .detail-grid { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
