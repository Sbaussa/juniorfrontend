
import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Search, Filter, Eye, Edit3, CheckCircle, XCircle,
  Clock, AlertCircle, Package, Plus, Save
} from "lucide-react";

const ESTADOS = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "cotizado", label: "Cotizado" },
  { value: "aprobado", label: "Aprobado" },
  { value: "en_reparacion", label: "En Reparación" },
  { value: "reparado", label: "Reparado" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", color: "#ffb800", bg: "rgba(255,184,0,0.15)" },
  diagnostico: { label: "Diagnóstico", color: "#00d4ff", bg: "rgba(0,212,255,0.15)" },
  cotizado: { label: "Cotizado", color: "#ce93d8", bg: "rgba(206,147,216,0.15)" },
  aprobado: { label: "Aprobado", color: "#39ff14", bg: "rgba(57,255,20,0.15)" },
  en_reparacion: { label: "En Reparación", color: "#ffb74d", bg: "rgba(255,183,77,0.15)" },
  reparado: { label: "Reparado", color: "#69f0ae", bg: "rgba(105,240,174,0.15)" },
  entregado: { label: "Entregado", color: "#39ff14", bg: "rgba(57,255,20,0.2)" },
  cancelado: { label: "Cancelado", color: "#ff3b3b", bg: "rgba(255,59,59,0.15)" },
};

export default function AdminReparaciones() {
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadReparaciones();
  }, [filtro]);

  const loadReparaciones = async () => {
    setLoading(true);
    try {
      const params = filtro !== "todos" ? `?estado=${filtro}` : "";
      const res = await api.get(`/api/reparaciones${params}`);
      setReparaciones(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleUpdateEstado = async (id, nuevoEstado, notas) => {
    try {
      await api.put(`/api/reparaciones/${id}/estado`, { estado: nuevoEstado, notas });
      loadReparaciones();
      if (selected && selected.id === id) {
        const updated = await api.get(`/api/reparaciones/${id}`);
        setSelected(updated.data);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdatePrecio = async (id, precio) => {
    try {
      await api.put(`/api/reparaciones/${id}`, { precio });
      loadReparaciones();
    } catch (err) { console.error(err); }
  };

  const filteredReparaciones = reparaciones.filter((r) =>
    r.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.modelo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="admin-reparaciones">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Reparaciones</h1>
          <p className="page-subtitle">Gestiona todas las reparaciones del taller</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditMode(false); setShowModal(true); }}>
          <Plus size={18} /> Nueva Reparación
        </button>
      </div>

      <div className="admin-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            className="form-input"
            placeholder="Buscar por código, cliente o modelo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              className={`filter-tab ${filtro === e.value ? "active" : ""}`}
              onClick={() => setFiltro(e.value)}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReparaciones.map((rep) => {
                const config = ESTADO_CONFIG[rep.estado];
                return (
                  <tr key={rep.id} className="table-row">
                    <td>
                      <span className="codigo-text">{rep.codigo}</span>
                    </td>
                    <td>
                      <div className="cliente-cell">
                        <strong>{rep.cliente}</strong>
                        <span>{rep.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="equipo-cell">
                        <span className="equipo-type">{rep.tipoEquipo}</span>
                        <span>{rep.marca} {rep.modelo}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: config?.bg, color: config?.color }}
                      >
                        <span className="badge-dot"></span>
                        {config?.label}
                      </span>
                    </td>
                    <td className="fecha-cell">{formatDate(rep.createdAt)}</td>
                    <td>
                      <div className="acciones-cell">
                        <button className="btn-icon" onClick={() => { setSelected(rep); setEditMode(false); }}>
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => { setSelected(rep); setEditMode(true); }}>
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredReparaciones.length === 0 && (
            <div className="empty-table">
              <Package size={48} style={{ color: "var(--text-muted)" }} />
              <p>No hay reparaciones {filtro !== "todos" ? "con este estado" : ""}</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalle/edición */}
      {selected && (
        <ReparacionModal
          reparacion={selected}
          editMode={editMode}
          onClose={() => { setSelected(null); setEditMode(false); }}
          onUpdateEstado={handleUpdateEstado}
          onUpdatePrecio={handleUpdatePrecio}
          onRefresh={loadReparaciones}
        />
      )}

      {/* Modal nueva reparación */}
      {showModal && !editMode && (
        <NuevaReparacionModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); loadReparaciones(); }}
        />
      )}
    </div>
  );
}

function ReparacionModal({ reparacion, editMode, onClose, onUpdateEstado, onUpdatePrecio, onRefresh }) {
  const [nuevoEstado, setNuevoEstado] = useState(reparacion.estado);
  const [notas, setNotas] = useState("");
  const [precio, setPrecio] = useState(reparacion.precio || "");

  const config = ESTADO_CONFIG[reparacion.estado];

  const handleSaveEstado = () => {
    if (nuevoEstado !== reparacion.estado) {
      onUpdateEstado(reparacion.id, nuevoEstado, notas);
      onClose();
    }
  };

  const handleSavePrecio = () => {
    onUpdatePrecio(reparacion.id, parseFloat(precio));
    onRefresh();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{reparacion.codigo}</h2>
            <span
              className="badge"
              style={{ background: config?.bg, color: config?.color }}
            >
              <span className="badge-dot"></span>
              {config?.label}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}></button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-section">
              <h4>Información del Cliente</h4>
              <p><strong>{reparacion.cliente}</strong></p>
              <p style={{ color: "var(--text-secondary)" }}>{reparacion.email}</p>
              <p style={{ color: "var(--text-secondary)" }}>{reparacion.telefono}</p>
            </div>
            <div className="modal-section">
              <h4>Equipo</h4>
              <p><strong>{reparacion.marca} {reparacion.modelo}</strong></p>
              <p style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{reparacion.tipoEquipo}</p>
            </div>
          </div>

          <div className="modal-section">
            <h4>Descripción del Problema</h4>
            <p style={{ color: "var(--text-secondary)" }}>{reparacion.descripcionProblema}</p>
          </div>

          {reparacion.diagnostico && (
            <div className="modal-section">
              <h4>Diagnóstico</h4>
              <p style={{ color: "var(--text-secondary)" }}>{reparacion.diagnostico}</p>
            </div>
          )}

          {editMode && (
            <div className="modal-edit-section">
              <h4>Editar Precio</h4>
              <div className="precio-edit">
                <input
                  className="form-input"
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="Precio"
                />
                <button className="btn btn-primary" onClick={handleSavePrecio}>
                  <Save size={16} /> Guardar
                </button>
              </div>

              <h4>Cambiar Estado</h4>
              <div className="estado-edit">
                <select
                  className="form-select"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  {ESTADOS.filter(e => e.value !== "todos").map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
                <input
                  className="form-input"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Notas del cambio (opcional)"
                />
                <button className="btn btn-primary" onClick={handleSaveEstado}>
                  <Save size={16} /> Actualizar Estado
                </button>
              </div>
            </div>
          )}

          <div className="modal-section">
            <h4>Historial</h4>
            <div className="historial-list">
              {reparacion.historial?.map((h, i) => (
                <div key={i} className="historial-row">
                  <span style={{ color: "var(--text-muted)" }}>{h.estadoAnterior}</span>
                  <span style={{ color: "var(--neon-green)" }}>→</span>
                  <strong>{h.estadoNuevo}</strong>
                  {h.notas && <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>— {h.notas}</span>}
                  <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: "auto" }}>
                    {new Date(h.createdAt).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .modal-lg { max-width: 700px; }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .modal-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 20px;
          color: var(--neon-green);
          margin-bottom: 4px;
        }
        .modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
        }
        .modal-close:hover { color: var(--text-primary); }
        .modal-body { max-height: 60vh; overflow-y: auto; }
        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .modal-section { margin-bottom: 20px; }
        .modal-section h4 {
          font-family: 'Orbitron', sans-serif;
          font-size: 13px;
          color: var(--neon-green);
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .modal-section p { margin: 4px 0; font-size: 14px; }
        .modal-edit-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 20px;
        }
        .precio-edit, .estado-edit {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .precio-edit input { width: 150px; }
        .historial-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .historial-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

function NuevaReparacionModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    cliente: "", email: "", telefono: "",
    tipoEquipo: "consola", marca: "", modelo: "",
    descripcionProblema: "", precio: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/reparaciones", {
        ...form,
        precio: form.precio ? parseFloat(form.precio) : null,
      });
      onCreated();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nueva Reparación</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cliente</label>
              <input className="form-input" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Equipo</label>
              <select className="form-select" value={form.tipoEquipo} onChange={(e) => setForm({ ...form, tipoEquipo: e.target.value })}>
                <option value="consola">🎮 Consola</option>
                <option value="computador">💻 Computador</option>
                <option value="celular"> Celular</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input className="form-input" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input className="form-input" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción del Problema</label>
            <textarea className="form-textarea" value={form.descripcionProblema} onChange={(e) => setForm({ ...form, descripcionProblema: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Precio (opcional)</label>
            <input className="form-input" type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Save size={16} /> Crear Reparación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
