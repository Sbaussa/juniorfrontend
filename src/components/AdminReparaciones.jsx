import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Search, Eye, Edit3, Package, Plus, Save, X,
  Clock, Wrench, CheckCircle, XCircle, ChevronDown,
  ArrowRight, Hash, User, Cpu, CalendarDays,
} from "lucide-react";

/* ── Constantes ── */
const ESTADOS = [
  { value: "todos",        label: "Todos",        color: null },
  { value: "pendiente",    label: "Pendiente",    color: "#ffb800" },
  { value: "diagnostico",  label: "Diagnóstico",  color: "#00d4ff" },
  { value: "cotizado",     label: "Cotizado",     color: "#ce93d8" },
  { value: "aprobado",     label: "Aprobado",     color: "#39ff14" },
  { value: "en_reparacion",label: "En Reparación",color: "#ffb74d" },
  { value: "reparado",     label: "Reparado",     color: "#69f0ae" },
  { value: "entregado",    label: "Entregado",    color: "#39ff14" },
  { value: "cancelado",    label: "Cancelado",    color: "#ff3b3b" },
];

const ESTADO_MAP = Object.fromEntries(ESTADOS.filter(e => e.value !== "todos").map(e => [e.value, e]));

const TIPO_ICONS = { consola: "🎮", computador: "💻", celular: "📱" };

/* ── Colores base ── */
const C = {
  bg0: "#080808", bg1: "#0e0e0e", bg2: "#141414", bg3: "#1a1a1a",
  border: "#1f1f1f", border2: "#2a2a2a",
  green: "#39ff14", greenD: "rgba(57,255,20,0.08)", greenG: "rgba(57,255,20,0.18)",
  txt0: "#f0f0f0", txt1: "#999", txt2: "#555",
};

/* ── Helpers ── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const fmtCOP = (v) => v != null
  ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v)
  : "—";

function Badge({ estado }) {
  const cfg = ESTADO_MAP[estado];
  if (!cfg) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      background: `${cfg.color}18`, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════ */
export default function AdminReparaciones() {
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filtro, setFiltro]       = useState("todos");
  const [busqueda, setBusqueda]   = useState("");
  const [selected, setSelected]   = useState(null);
  const [editMode, setEditMode]   = useState(false);
  const [showNew, setShowNew]     = useState(false);

  useEffect(() => { loadReparaciones(); }, [filtro]);

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
      await loadReparaciones();
      if (selected?.id === id) {
        const updated = await api.get(`/api/reparaciones/${id}`);
        setSelected(updated.data);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdatePrecio = async (id, precio) => {
    try {
      await api.put(`/api/reparaciones/${id}`, { precio });
      await loadReparaciones();
    } catch (err) { console.error(err); }
  };

  const filtered = reparaciones.filter((r) =>
    [r.codigo, r.cliente, r.modelo, r.marca].some(v =>
      v?.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  /* Contadores para el header */
  const counts = ESTADOS.slice(1).reduce((acc, e) => {
    acc[e.value] = reparaciones.filter(r => r.estado === e.value).length;
    return acc;
  }, {});

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Reparaciones</h1>
          <p style={S.subtitle}>{reparaciones.length} registros · {filtered.length} visibles</p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={14} /> Nueva reparación
        </button>
      </div>

      {/* ── Chips de estado ── */}
      <div style={S.chipRow}>
        {ESTADOS.map((e) => {
          const count = e.value === "todos" ? reparaciones.length : (counts[e.value] ?? 0);
          const active = filtro === e.value;
          return (
            <button
              key={e.value}
              onClick={() => setFiltro(e.value)}
              style={{
                ...S.chip,
                ...(active ? { ...S.chipActive, ...(e.color ? { borderColor: `${e.color}50`, color: e.color, background: `${e.color}12` } : {}) } : {}),
              }}
              className="chip"
            >
              {e.label}
              <span style={{ ...S.chipCount, ...(active && e.color ? { background: `${e.color}25`, color: e.color } : {}) }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div style={S.searchWrap}>
        <Search size={14} style={{ color: C.txt2, flexShrink: 0 }} />
        <input
          style={S.searchInput}
          placeholder="Buscar por código, cliente, marca o modelo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button style={S.clearBtn} onClick={() => setBusqueda("")}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      {loading ? (
        <div style={S.loadingWrap}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Código", "Cliente", "Equipo", "Estado", "Precio", "Fecha", ""].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rep) => (
                <tr key={rep.id} style={S.tr} className="table-row">
                  <td style={S.td}>
                    <span style={S.codigo}>
                      <Hash size={10} style={{ marginRight: 2, opacity: 0.5 }} />
                      {rep.codigo}
                    </span>
                  </td>
                  <td style={S.td}>
                    <div style={S.clienteCell}>
                      <div style={S.clienteName}>{rep.cliente}</div>
                      <div style={S.clienteSub}>{rep.telefono || rep.email}</div>
                    </div>
                  </td>
                  <td style={S.td}>
                    <div style={S.equipoCell}>
                      <span style={S.tipoIcon}>{TIPO_ICONS[rep.tipoEquipo] ?? "🔧"}</span>
                      <div>
                        <div style={S.equipoName}>{rep.marca} {rep.modelo}</div>
                        <div style={S.equipoSub}>{rep.tipoEquipo}</div>
                      </div>
                    </div>
                  </td>
                  <td style={S.td}><Badge estado={rep.estado} /></td>
                  <td style={S.td}>
                    <span style={S.precio}>{fmtCOP(rep.precio)}</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.fecha}>{fmtDate(rep.createdAt)}</span>
                  </td>
                  <td style={S.td}>
                    <div style={S.acciones}>
                      <button
                        style={S.iconBtn}
                        title="Ver detalle"
                        className="icon-btn"
                        onClick={() => { setSelected(rep); setEditMode(false); }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        style={S.iconBtn}
                        title="Editar"
                        className="icon-btn"
                        onClick={() => { setSelected(rep); setEditMode(true); }}
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={S.emptyState}>
              <Package size={36} color={C.border2} />
              <p style={{ color: C.txt2, fontSize: 12, marginTop: 10 }}>
                {busqueda ? `Sin resultados para "${busqueda}"` : "No hay reparaciones aún"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {selected && (
        <ModalDetalle
          rep={selected}
          editMode={editMode}
          onClose={() => { setSelected(null); setEditMode(false); }}
          onUpdateEstado={handleUpdateEstado}
          onUpdatePrecio={handleUpdatePrecio}
          onRefresh={loadReparaciones}
        />
      )}
      {showNew && (
        <ModalNueva
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); loadReparaciones(); }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   MODAL DETALLE / EDITAR
════════════════════════════════════════ */
function ModalDetalle({ rep, editMode, onClose, onUpdateEstado, onUpdatePrecio, onRefresh }) {
  const [nuevoEstado, setNuevoEstado] = useState(rep.estado);
  const [notas, setNotas]             = useState("");
  const [precio, setPrecio]           = useState(rep.precio ?? "");
  const [saving, setSaving]           = useState(false);

  const handleSaveEstado = async () => {
    if (nuevoEstado === rep.estado) return;
    setSaving(true);
    await onUpdateEstado(rep.id, nuevoEstado, notas);
    setSaving(false);
    onClose();
  };

  const handleSavePrecio = async () => {
    setSaving(true);
    await onUpdatePrecio(rep.id, parseFloat(precio));
    onRefresh();
    setSaving(false);
  };

  return (
    <div style={M.overlay} onClick={onClose}>
      <div style={M.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={M.modalHeader}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={M.codigoTitle}>{rep.codigo}</span>
              <Badge estado={rep.estado} />
            </div>
            <span style={{ fontSize: 11, color: C.txt2 }}>
              {TIPO_ICONS[rep.tipoEquipo]} {rep.tipoEquipo} · {rep.marca} {rep.modelo}
            </span>
          </div>
          <button style={M.closeBtn} onClick={onClose} className="close-btn"><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={M.body}>

          {/* Info row */}
          <div style={M.infoGrid}>
            <InfoSection title="Cliente">
              <InfoRow label="Nombre"   value={rep.cliente} />
              <InfoRow label="Email"    value={rep.email} />
              <InfoRow label="Teléfono" value={rep.telefono || "—"} />
            </InfoSection>
            <InfoSection title="Equipo">
              <InfoRow label="Tipo"   value={`${TIPO_ICONS[rep.tipoEquipo]} ${rep.tipoEquipo}`} />
              <InfoRow label="Marca"  value={rep.marca} />
              <InfoRow label="Modelo" value={rep.modelo} />
            </InfoSection>
            <InfoSection title="Económico">
              <InfoRow label="Precio"  value={fmtCOP(rep.precio)} highlight />
              <InfoRow label="Ingreso" value={fmtDate(rep.createdAt)} />
            </InfoSection>
          </div>

          {/* Problema */}
          <InfoSection title="Descripción del problema">
            <p style={{ fontSize: 12, color: C.txt1, margin: 0, lineHeight: 1.6 }}>{rep.descripcionProblema}</p>
          </InfoSection>

          {rep.diagnostico && (
            <InfoSection title="Diagnóstico">
              <p style={{ fontSize: 12, color: C.txt1, margin: 0, lineHeight: 1.6 }}>{rep.diagnostico}</p>
            </InfoSection>
          )}

          {/* Edición */}
          {editMode && (
            <InfoSection title="Editar">
              <div style={M.editBlock}>
                <label style={M.label}>Nuevo precio (COP)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={M.input}
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="0"
                  />
                  <button style={M.btnSm} onClick={handleSavePrecio} disabled={saving} className="btn-sm">
                    <Save size={12} /> Guardar precio
                  </button>
                </div>
              </div>

              <div style={M.editBlock}>
                <label style={M.label}>Cambiar estado</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ position: "relative" }}>
                    <select
                      style={M.select}
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                    >
                      {ESTADOS.filter(e => e.value !== "todos").map(e => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    style={{ ...M.input, flex: 1 }}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Notas del cambio (opcional)"
                  />
                  <button
                    style={{ ...M.btnSm, opacity: nuevoEstado === rep.estado ? 0.4 : 1 }}
                    onClick={handleSaveEstado}
                    disabled={saving || nuevoEstado === rep.estado}
                    className="btn-sm"
                  >
                    <ArrowRight size={12} /> Actualizar
                  </button>
                </div>
              </div>
            </InfoSection>
          )}

          {/* Historial */}
          {rep.historial?.length > 0 && (
            <InfoSection title={`Historial (${rep.historial.length})`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {rep.historial.map((h, i) => (
                  <div key={i} style={M.historialRow}>
                    <span style={{ color: C.txt2, fontSize: 11 }}>{h.estadoAnterior}</span>
                    <ArrowRight size={10} color={C.green} style={{ flexShrink: 0 }} />
                    <Badge estado={h.estadoNuevo} />
                    {h.notas && <span style={{ color: C.txt2, fontSize: 11, flex: 1 }}>— {h.notas}</span>}
                    <span style={{ color: C.txt2, fontSize: 10, marginLeft: "auto", whiteSpace: "nowrap" }}>
                      {fmtDate(h.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </InfoSection>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: C.txt2, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 11, color: C.txt2 }}>{label}</span>
      <span style={{ fontSize: 12, color: highlight ? C.green : C.txt1, fontWeight: highlight ? 700 : 400 }}>{value}</span>
    </div>
  );
}

/* ════════════════════════════════════════
   MODAL NUEVA REPARACIÓN
════════════════════════════════════════ */
function ModalNueva({ onClose, onCreated }) {
  const [form, setForm] = useState({
    cliente: "", email: "", telefono: "",
    tipoEquipo: "consola", marca: "", modelo: "",
    descripcionProblema: "", precio: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/reparaciones", {
        ...form,
        precio: form.precio ? parseFloat(form.precio) : null,
      });
      onCreated();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div style={M.overlay} onClick={onClose}>
      <div style={{ ...M.modal, maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div style={M.modalHeader}>
          <span style={M.codigoTitle}>Nueva Reparación</span>
          <button style={M.closeBtn} onClick={onClose} className="close-btn"><X size={16} /></button>
        </div>

        <div style={M.body}>
          <form onSubmit={handleSubmit}>
            <InfoSection title="Datos del cliente">
              <div style={M.formRow}>
                <FormField label="Nombre completo" required>
                  <input style={M.input} value={form.cliente} onChange={e => set("cliente", e.target.value)} required placeholder="Ej. Juan Pérez" />
                </FormField>
                <FormField label="Teléfono">
                  <input style={M.input} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="Ej. 300 000 0000" />
                </FormField>
              </div>
              <FormField label="Correo electrónico" required>
                <input style={M.input} type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="correo@ejemplo.com" />
              </FormField>
            </InfoSection>

            <InfoSection title="Equipo">
              <div style={M.formRow}>
                <FormField label="Tipo">
                  <select style={M.select} value={form.tipoEquipo} onChange={e => set("tipoEquipo", e.target.value)}>
                    <option value="consola">🎮 Consola</option>
                    <option value="computador">💻 Computador</option>
                    <option value="celular">📱 Celular</option>
                  </select>
                </FormField>
                <FormField label="Marca" required>
                  <input style={M.input} value={form.marca} onChange={e => set("marca", e.target.value)} required placeholder="Ej. Sony" />
                </FormField>
                <FormField label="Modelo" required>
                  <input style={M.input} value={form.modelo} onChange={e => set("modelo", e.target.value)} required placeholder="Ej. PS5" />
                </FormField>
              </div>
            </InfoSection>

            <InfoSection title="Problema">
              <FormField label="Descripción" required>
                <textarea
                  style={{ ...M.input, minHeight: 80, resize: "vertical" }}
                  value={form.descripcionProblema}
                  onChange={e => set("descripcionProblema", e.target.value)}
                  required
                  placeholder="Describe el problema del equipo..."
                />
              </FormField>
              <FormField label="Precio estimado (COP, opcional)">
                <input style={{ ...M.input, maxWidth: 200 }} type="number" value={form.precio} onChange={e => set("precio", e.target.value)} placeholder="0" />
              </FormField>
            </InfoSection>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
              <button type="button" style={M.btnGhost} onClick={onClose} className="btn-ghost">Cancelar</button>
              <button type="submit" style={M.btnPrimary} disabled={saving} className="btn-primary-modal">
                <Save size={13} /> {saving ? "Guardando..." : "Crear reparación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={{ ...M.label, display: "block", marginBottom: 5 }}>
        {label}{required && <span style={{ color: C.green }}>*</span>}
      </label>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════
   ESTILOS
════════════════════════════════════════ */
const S = {
  page: { padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16, minHeight: "100vh", background: C.bg0 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: 900, color: C.txt0, margin: 0, fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 },
  subtitle: { fontSize: 11, color: C.txt2, marginTop: 4 },
  btnPrimary: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 16px", background: C.green, color: "#000",
    border: "none", borderRadius: 8, cursor: "pointer",
    fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
    transition: "opacity 0.15s",
  },
  chipRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "5px 12px",
    background: "none", border: `1px solid ${C.border}`,
    borderRadius: 20, cursor: "pointer",
    fontSize: 11, color: C.txt2,
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.15s",
  },
  chipActive: { background: C.greenD, borderColor: `${C.green}40`, color: C.green },
  chipCount: {
    background: C.bg3, borderRadius: 10,
    padding: "1px 6px", fontSize: 10, color: C.txt2,
  },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 10,
    background: C.bg1, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "0 14px",
  },
  searchInput: {
    flex: 1, background: "none", border: "none", outline: "none",
    padding: "10px 0", fontSize: 12, color: C.txt0,
    fontFamily: "'JetBrains Mono', monospace",
  },
  clearBtn: { background: "none", border: "none", cursor: "pointer", color: C.txt2, display: "flex", padding: 0 },
  tableWrap: { background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 16px", textAlign: "left",
    fontSize: 9, color: C.txt2, letterSpacing: 1.5,
    textTransform: "uppercase", fontWeight: 700,
    borderBottom: `1px solid ${C.border}`,
    background: C.bg2,
  },
  tr: { borderBottom: `1px solid ${C.border}`, transition: "background 0.1s" },
  td: { padding: "12px 16px", fontSize: 12, color: C.txt1 },
  codigo: { display: "flex", alignItems: "center", fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: 0.5 },
  clienteCell: { display: "flex", flexDirection: "column", gap: 2 },
  clienteName: { fontSize: 12, color: C.txt0, fontWeight: 600 },
  clienteSub: { fontSize: 10, color: C.txt2 },
  equipoCell: { display: "flex", alignItems: "center", gap: 8 },
  tipoIcon: { fontSize: 16, lineHeight: 1 },
  equipoName: { fontSize: 12, color: C.txt0 },
  equipoSub: { fontSize: 10, color: C.txt2, textTransform: "capitalize" },
  precio: { fontSize: 12, color: C.txt0, fontWeight: 600 },
  fecha: { fontSize: 10, color: C.txt2 },
  acciones: { display: "flex", gap: 4 },
  iconBtn: {
    width: 30, height: 30,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "none", border: `1px solid ${C.border}`,
    borderRadius: 6, cursor: "pointer", color: C.txt2,
    transition: "all 0.15s",
  },
  loadingWrap: { display: "flex", justifyContent: "center", padding: 60 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "50px 20px" },
};

const M = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: C.bg1,
    border: `1px solid ${C.border2}`,
    borderRadius: 12,
    width: "100%", maxWidth: 700,
    maxHeight: "90vh",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "20px 24px",
    borderBottom: `1px solid ${C.border}`,
    background: C.bg2,
    flexShrink: 0,
  },
  codigoTitle: {
    fontSize: 16, fontWeight: 900, color: C.green,
    fontFamily: "'Orbitron', sans-serif", letterSpacing: 1,
  },
  closeBtn: {
    background: "none", border: `1px solid ${C.border}`,
    borderRadius: 6, cursor: "pointer", color: C.txt2,
    width: 30, height: 30,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", flexShrink: 0,
  },
  body: { padding: "20px 24px", overflowY: "auto", flex: 1 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 },
  editBlock: { marginBottom: 16 },
  label: { fontSize: 10, color: C.txt2, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontWeight: 700 },
  input: {
    width: "100%", padding: "9px 12px",
    background: C.bg2, border: `1px solid ${C.border2}`,
    borderRadius: 6, color: C.txt0,
    fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
    outline: "none", boxSizing: "border-box",
  },
  select: {
    padding: "9px 12px", background: C.bg2,
    border: `1px solid ${C.border2}`, borderRadius: 6,
    color: C.txt0, fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none", cursor: "pointer",
    minWidth: 140,
  },
  btnSm: {
    display: "flex", alignItems: "center", gap: 5,
    padding: "9px 14px", background: C.green, color: "#000",
    border: "none", borderRadius: 6, cursor: "pointer",
    fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: "nowrap", flexShrink: 0,
  },
  historialRow: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 12px",
    background: C.bg2, borderRadius: 6, fontSize: 12,
    flexWrap: "wrap",
  },
  formRow: { display: "flex", gap: 10, marginBottom: 10 },
  btnGhost: {
    padding: "9px 16px", background: "none",
    border: `1px solid ${C.border2}`, borderRadius: 8,
    color: C.txt2, fontSize: 12, cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
  },
  btnPrimary: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 18px", background: C.green, color: "#000",
    border: "none", borderRadius: 8, cursor: "pointer",
    fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  * { box-sizing: border-box; }
  .btn-primary:hover { opacity: 0.85; }
  .chip:hover { border-color: #2a2a2a; color: #ccc; }
  .table-row:hover { background: #111 !important; }
  .icon-btn:hover { background: #1a1a1a !important; border-color: #333 !important; color: #ccc !important; }
  .close-btn:hover { border-color: #ff3b3b; color: #ff3b3b; }
  .btn-sm:hover { opacity: 0.85; }
  .btn-ghost:hover { border-color: #333; color: #ccc; }
  .btn-primary-modal:hover { opacity: 0.85; }
  input:focus, textarea:focus, select:focus { border-color: rgba(57,255,20,0.4) !important; box-shadow: 0 0 0 2px rgba(57,255,20,0.08); }
  .spinner {
    width: 24px; height: 24px;
    border: 2px solid #1a1a1a;
    border-top-color: #39ff14;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
`;