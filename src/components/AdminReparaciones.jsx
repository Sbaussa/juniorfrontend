import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import {
  Search, X, Plus, Eye, Edit3, Save, Package,
  ArrowRight, Hash, ChevronDown, Check,
} from "lucide-react";

/* ─────────────────────────────
   CONSTANTES
───────────────────────────── */
const ESTADOS = [
  { v: "todos",         l: "Todos",         c: null },
  { v: "pendiente",     l: "Pendiente",     c: "#ffb800" },
  { v: "diagnostico",   l: "Diagnóstico",   c: "#00d4ff" },
  { v: "cotizado",      l: "Cotizado",       c: "#ce93d8" },
  { v: "aprobado",      l: "Aprobado",       c: "#39ff14" },
  { v: "en_reparacion", l: "En Reparación",  c: "#ff8c42" },
  { v: "reparado",      l: "Reparado",       c: "#69f0ae" },
  { v: "entregado",     l: "Entregado",      c: "#39ff14" },
  { v: "cancelado",     l: "Cancelado",      c: "#ff3b3b" },
];
const EMAP = Object.fromEntries(ESTADOS.filter(e => e.v !== "todos").map(e => [e.v, e]));
const TIPOS = { consola: "🎮", computador: "💻", celular: "📱" };

const fmtDate = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const fmtCOP  = (v) => v != null
  ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v)
  : "—";

/* ─────────────────────────────
   BADGE
───────────────────────────── */
function Badge({ estado }) {
  const e = EMAP[estado];
  if (!e) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
      background: `${e.c}18`, color: e.c,
      border: `1px solid ${e.c}30`,
      fontFamily: "'JetBrains Mono', monospace",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: e.c, flexShrink: 0 }} />
      {e.l}
    </span>
  );
}

/* ─────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────── */
export default function AdminReparaciones() {
  const [reps, setReps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const chipRef = useRef(null);

  useEffect(() => { load(); }, [filtro]);

  const load = async () => {
    setLoading(true);
    try {
      const q = filtro !== "todos" ? `?estado=${filtro}` : "";
      const res = await api.get(`/api/reparaciones${q}`);
      setReps(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateEstado = async (id, estado, notas) => {
    try {
      await api.put(`/api/reparaciones/${id}/estado`, { estado, notas });
      await load();
      if (selected?.id === id) {
        const r = await api.get(`/api/reparaciones/${id}`);
        setSelected(r.data);
      }
    } catch (e) { console.error(e); }
  };

  const updatePrecio = async (id, precio) => {
    try {
      await api.put(`/api/reparaciones/${id}`, { precio });
      await load();
    } catch (e) { console.error(e); }
  };

  const counts = ESTADOS.slice(1).reduce((a, e) => {
    a[e.v] = reps.filter(r => r.estado === e.v).length;
    return a;
  }, {});

  const filtered = reps.filter(r =>
    [r.codigo, r.cliente, r.modelo, r.marca].some(v =>
      v?.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={S.pageHead}>
        <div>
          <h1 style={S.pageTitle}>Reparaciones</h1>
          <span style={S.pageCount}>{filtered.length} de {reps.length}</span>
        </div>
        <button style={S.fab} onClick={() => setShowNew(true)} className="tap-scale">
          <Plus size={18} color="#000" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Buscador ── */}
      <div style={S.searchBox}>
        <Search size={15} color="#333" />
        <input
          style={S.searchInput}
          placeholder="Buscar cliente, código, modelo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button style={S.clearBtn} onClick={() => setBusqueda("")}>
            <X size={13} color="#444" />
          </button>
        )}
      </div>

      {/* ── Chips de filtro (scroll horizontal) ── */}
      <div style={S.chipScroll} ref={chipRef}>
        {ESTADOS.map(e => {
          const on = filtro === e.v;
          const cnt = e.v === "todos" ? reps.length : (counts[e.v] ?? 0);
          return (
            <button
              key={e.v}
              onClick={() => setFiltro(e.v)}
              className="chip-btn"
              style={{
                ...S.chip,
                ...(on ? {
                  background: e.c ? `${e.c}18` : "#39ff1418",
                  borderColor: e.c ? `${e.c}50` : "#39ff1450",
                  color: e.c ?? "#39ff14",
                } : {}),
              }}
            >
              {e.l}
              <span style={{
                ...S.chipCnt,
                ...(on ? { background: e.c ? `${e.c}22` : "#39ff1422", color: e.c ?? "#39ff14" } : {}),
              }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* ── Lista de cards ── */}
      {loading ? (
        <div style={S.loadBox}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={S.emptyBox}>
          <Package size={36} color="#1a1a1a" />
          <span style={S.emptyTxt}>{busqueda ? `Sin resultados para "${busqueda}"` : "No hay reparaciones"}</span>
        </div>
      ) : (
        <div style={S.cardList}>
          {filtered.map(rep => (
            <RepCard
              key={rep.id}
              rep={rep}
              onView={() => { setSelected(rep); setEditMode(false); }}
              onEdit={() => { setSelected(rep); setEditMode(true); }}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      {selected && (
        <DetailSheet
          rep={selected}
          editMode={editMode}
          onClose={() => { setSelected(null); setEditMode(false); }}
          onUpdateEstado={updateEstado}
          onUpdatePrecio={updatePrecio}
          onRefresh={load}
          onToggleEdit={() => setEditMode(m => !m)}
        />
      )}
      {showNew && (
        <NewSheet
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────
   CARD DE REPARACIÓN
───────────────────────────── */
function RepCard({ rep, onView, onEdit }) {
  const tipo = TIPOS[rep.tipoEquipo] ?? "🔧";
  return (
    <div style={S.repCard} onClick={onView} className="rep-card">
      {/* Fila superior */}
      <div style={S.repCardTop}>
        <div style={S.repCardLeft}>
          <span style={S.tipoEmoji}>{tipo}</span>
          <div>
            <div style={S.repCodigo}>
              <Hash size={9} color="#2e2e2e" style={{ marginRight: 1 }} />
              {rep.codigo}
            </div>
            <div style={S.repEquipo}>{rep.marca} {rep.modelo}</div>
          </div>
        </div>
        <Badge estado={rep.estado} />
      </div>

      {/* Fila media */}
      <div style={S.repCardMid}>
        <div style={S.repCliente}>{rep.cliente}</div>
        <div style={S.repTelefono}>{rep.telefono || rep.email}</div>
      </div>

      {/* Fila inferior */}
      <div style={S.repCardBot}>
        <span style={S.repFecha}>{fmtDate(rep.createdAt)}</span>
        <div style={S.repActions}>
          <span style={S.repPrecio}>{fmtCOP(rep.precio)}</span>
          <button
            style={S.editBtn}
            className="tap-scale"
            onClick={e => { e.stopPropagation(); onEdit(); }}
          >
            <Edit3 size={13} color="#555" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   BOTTOM SHEET — DETALLE / EDITAR
───────────────────────────── */
function DetailSheet({ rep, editMode, onClose, onUpdateEstado, onUpdatePrecio, onRefresh, onToggleEdit }) {
  const [nuevoEstado, setNuevoEstado] = useState(rep.estado);
  const [notas, setNotas]             = useState("");
  const [precio, setPrecio]           = useState(rep.precio ?? "");
  const [saving, setSaving]           = useState(false);

  const saveEstado = async () => {
    if (nuevoEstado === rep.estado) return;
    setSaving(true);
    await onUpdateEstado(rep.id, nuevoEstado, notas);
    setSaving(false);
    onClose();
  };

  const savePrecio = async () => {
    setSaving(true);
    await onUpdatePrecio(rep.id, parseFloat(precio));
    onRefresh();
    setSaving(false);
  };

  return (
    <div style={SH.overlay} onClick={onClose}>
      <div style={SH.sheet} onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={SH.handle} />

        {/* Header */}
        <div style={SH.head}>
          <div>
            <div style={SH.codigo}>{rep.codigo}</div>
            <div style={SH.equipoLine}>
              {TIPOS[rep.tipoEquipo]} {rep.marca} {rep.modelo}
            </div>
          </div>
          <div style={SH.headRight}>
            <button
              style={{ ...SH.headBtn, ...(editMode ? SH.headBtnOn : {}) }}
              onClick={onToggleEdit}
              className="tap-scale"
            >
              <Edit3 size={14} color={editMode ? "#000" : "#555"} />
            </button>
            <button style={SH.headBtn} onClick={onClose} className="tap-scale">
              <X size={14} color="#555" />
            </button>
          </div>
        </div>

        <Badge estado={rep.estado} />

        {/* Body scrollable */}
        <div style={SH.body}>

          {/* Info rows */}
          <Section title="Cliente">
            <InfoRow label="Nombre"   value={rep.cliente} />
            <InfoRow label="Email"    value={rep.email} />
            <InfoRow label="Teléfono" value={rep.telefono || "—"} />
          </Section>

          <Section title="Servicio">
            <InfoRow label="Precio"   value={fmtCOP(rep.precio)} green />
            <InfoRow label="Ingreso"  value={fmtDate(rep.createdAt)} />
          </Section>

          <Section title="Problema">
            <p style={SH.desc}>{rep.descripcionProblema}</p>
          </Section>

          {rep.diagnostico && (
            <Section title="Diagnóstico">
              <p style={SH.desc}>{rep.diagnostico}</p>
            </Section>
          )}

          {/* Edición */}
          {editMode && (
            <Section title="Editar reparación">
              <div style={SH.editGroup}>
                <label style={SH.editLabel}>Precio (COP)</label>
                <div style={SH.editRow}>
                  <input
                    style={SH.input}
                    type="number"
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    placeholder="0"
                  />
                  <button style={SH.saveBtn} onClick={savePrecio} disabled={saving} className="tap-scale">
                    <Save size={14} color="#000" />
                  </button>
                </div>
              </div>

              <div style={SH.editGroup}>
                <label style={SH.editLabel}>Cambiar estado</label>
                <div style={{ position: "relative", marginBottom: 8 }}>
                  <select
                    style={SH.select}
                    value={nuevoEstado}
                    onChange={e => setNuevoEstado(e.target.value)}
                  >
                    {ESTADOS.filter(e => e.v !== "todos").map(e => (
                      <option key={e.v} value={e.v}>{e.l}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} color="#444" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
                <input
                  style={{ ...SH.input, marginBottom: 8 }}
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Notas del cambio (opcional)"
                />
                <button
                  style={{ ...SH.bigBtn, opacity: nuevoEstado === rep.estado || saving ? 0.4 : 1 }}
                  onClick={saveEstado}
                  disabled={nuevoEstado === rep.estado || saving}
                  className="tap-scale"
                >
                  <ArrowRight size={15} color="#000" />
                  Actualizar estado
                </button>
              </div>
            </Section>
          )}

          {/* Historial */}
          {rep.historial?.length > 0 && (
            <Section title={`Historial · ${rep.historial.length}`}>
              {rep.historial.map((h, i) => (
                <div key={i} style={SH.histRow}>
                  <span style={SH.histFrom}>{h.estadoAnterior}</span>
                  <ArrowRight size={10} color="#39ff14" />
                  <Badge estado={h.estadoNuevo} />
                  <span style={SH.histDate}>{fmtDate(h.createdAt)}</span>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   BOTTOM SHEET — NUEVA
───────────────────────────── */
function NewSheet({ onClose, onCreated }) {
  const [form, setForm] = useState({
    cliente: "", email: "", telefono: "",
    tipoEquipo: "consola", marca: "", modelo: "",
    descripcionProblema: "", precio: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
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
    <div style={SH.overlay} onClick={onClose}>
      <div style={{ ...SH.sheet, maxHeight: "92dvh" }} onClick={e => e.stopPropagation()}>
        <div style={SH.handle} />

        <div style={SH.head}>
          <div style={SH.codigo}>Nueva Reparación</div>
          <button style={SH.headBtn} onClick={onClose} className="tap-scale">
            <X size={14} color="#555" />
          </button>
        </div>

        <div style={SH.body}>
          <form onSubmit={submit}>
            <Section title="Cliente">
              <label style={SH.editLabel}>Nombre completo *</label>
              <input style={{ ...SH.input, marginBottom: 8 }} value={form.cliente} onChange={e => set("cliente", e.target.value)} required placeholder="Ej. Juan Pérez" />
              <label style={SH.editLabel}>Email *</label>
              <input style={{ ...SH.input, marginBottom: 8 }} type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="correo@ejemplo.com" />
              <label style={SH.editLabel}>Teléfono</label>
              <input style={SH.input} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="300 000 0000" />
            </Section>

            <Section title="Equipo">
              <label style={SH.editLabel}>Tipo</label>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <select style={SH.select} value={form.tipoEquipo} onChange={e => set("tipoEquipo", e.target.value)}>
                  <option value="consola">🎮 Consola</option>
                  <option value="computador">💻 Computador</option>
                  <option value="celular">📱 Celular</option>
                </select>
                <ChevronDown size={14} color="#444" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
              <label style={SH.editLabel}>Marca *</label>
              <input style={{ ...SH.input, marginBottom: 8 }} value={form.marca} onChange={e => set("marca", e.target.value)} required placeholder="Ej. Sony, Xbox, HP..." />
              <label style={SH.editLabel}>Modelo *</label>
              <input style={SH.input} value={form.modelo} onChange={e => set("modelo", e.target.value)} required placeholder="Ej. PS5, Series X..." />
            </Section>

            <Section title="Problema">
              <label style={SH.editLabel}>Descripción *</label>
              <textarea
                style={{ ...SH.input, minHeight: 88, resize: "none", marginBottom: 8 }}
                value={form.descripcionProblema}
                onChange={e => set("descripcionProblema", e.target.value)}
                required
                placeholder="Describe el fallo o daño del equipo..."
              />
              <label style={SH.editLabel}>Precio estimado (COP)</label>
              <input style={SH.input} type="number" value={form.precio} onChange={e => set("precio", e.target.value)} placeholder="0" />
            </Section>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button type="button" style={SH.ghostBtn} onClick={onClose} className="tap-scale">Cancelar</button>
              <button type="submit" style={{ ...SH.bigBtn, flex: 1 }} disabled={saving} className="tap-scale">
                <Check size={15} color="#000" />
                {saving ? "Guardando..." : "Crear reparación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   SUB-COMPONENTES
───────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={SH.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, green }) {
  return (
    <div style={SH.infoRow}>
      <span style={SH.infoLabel}>{label}</span>
      <span style={{ ...SH.infoValue, color: green ? "#39ff14" : "#ccc", fontWeight: green ? 700 : 400 }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────────
   ESTILOS PÁGINA
───────────────────────────── */
const G  = "#39ff14";
const BG0 = "#080808";
const BG1 = "#0d0d0d";
const BG2 = "#131313";
const BR  = "#1e1e1e";

const S = {
  page: { padding: "20px 14px 0", display: "flex", flexDirection: "column", gap: 14 },
  pageHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  pageTitle: { fontSize: 22, fontWeight: 900, color: "#efefef", fontFamily: "'Orbitron', sans-serif", letterSpacing: 0.5, margin: 0 },
  pageCount: { fontSize: 10, color: "#2e2e2e", marginTop: 3, display: "block" },
  fab: {
    width: 44, height: 44, borderRadius: 14,
    background: G, border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
  searchBox: {
    display: "flex", alignItems: "center", gap: 10,
    background: BG1, border: `1px solid ${BR}`,
    borderRadius: 12, padding: "0 14px", height: 44,
  },
  searchInput: {
    flex: 1, background: "none", border: "none", outline: "none",
    fontSize: 13, color: "#ccc", fontFamily: "'JetBrains Mono', monospace",
  },
  clearBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 },
  chipScroll: {
    display: "flex", gap: 7,
    overflowX: "auto", paddingBottom: 2,
  },
  chip: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "6px 12px", borderRadius: 20,
    background: "none", border: `1px solid ${BR}`,
    color: "#333", fontSize: 11, fontWeight: 700,
    cursor: "pointer", whiteSpace: "nowrap",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.15s",
  },
  chipCnt: {
    background: "#141414", borderRadius: 10,
    padding: "1px 6px", fontSize: 10, color: "#2a2a2a", fontWeight: 700,
  },
  loadBox: { display: "flex", justifyContent: "center", padding: 60 },
  emptyBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "60px 0" },
  emptyTxt: { fontSize: 12, color: "#1e1e1e" },
  cardList: { display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16 },
  repCard: {
    background: BG1, borderRadius: 16, border: `1px solid ${BR}`,
    padding: "14px 14px 11px", cursor: "pointer",
    transition: "background 0.15s",
  },
  repCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  repCardLeft: { display: "flex", alignItems: "center", gap: 10 },
  tipoEmoji: { fontSize: 22, lineHeight: 1 },
  repCodigo: { display: "flex", alignItems: "center", fontSize: 10, color: "#2e2e2e", fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 },
  repEquipo: { fontSize: 13, color: "#ddd", fontWeight: 700 },
  repCardMid: { paddingBottom: 10, borderBottom: `1px solid ${BR}`, marginBottom: 10 },
  repCliente: { fontSize: 12, color: "#999", marginBottom: 2 },
  repTelefono: { fontSize: 10, color: "#2e2e2e" },
  repCardBot: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  repFecha:   { fontSize: 10, color: "#282828" },
  repActions: { display: "flex", alignItems: "center", gap: 8 },
  repPrecio:  { fontSize: 12, color: "#555", fontWeight: 600 },
  editBtn: {
    width: 32, height: 32, borderRadius: 9,
    background: BG2, border: `1px solid ${BR}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
};

/* ─────────────────────────────
   ESTILOS SHEET
───────────────────────────── */
const SH = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(3px)",
    display: "flex", alignItems: "flex-end",
    zIndex: 200,
  },
  sheet: {
    width: "100%", maxWidth: 480,
    margin: "0 auto",
    background: "#0e0e0e",
    borderTop: `1px solid #1e1e1e`,
    borderRadius: "22px 22px 0 0",
    maxHeight: "86dvh",
    display: "flex", flexDirection: "column",
    paddingBottom: "env(safe-area-inset-bottom, 16px)",
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    background: "#222", margin: "12px auto 4px",
    flexShrink: 0,
  },
  head: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "12px 18px 14px",
    borderBottom: `1px solid #1a1a1a`,
    flexShrink: 0, gap: 12,
  },
  headRight: { display: "flex", gap: 8, flexShrink: 0 },
  headBtn: {
    width: 34, height: 34, borderRadius: 10,
    background: "#141414", border: `1px solid #1e1e1e`,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  headBtnOn: { background: "#39ff14", borderColor: "#39ff14" },
  codigo: { fontSize: 16, fontWeight: 900, color: "#39ff14", fontFamily: "'Orbitron', sans-serif", letterSpacing: 0.5 },
  equipoLine: { fontSize: 11, color: "#333", marginTop: 3 },
  body: { overflowY: "auto", padding: "16px 18px", flex: 1 },
  sectionTitle: {
    fontSize: 9, color: "#2a2a2a", letterSpacing: 2,
    textTransform: "uppercase", fontWeight: 700, marginBottom: 10,
  },
  infoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: `1px solid #111`,
  },
  infoLabel: { fontSize: 11, color: "#2e2e2e" },
  infoValue: { fontSize: 12, maxWidth: "60%", textAlign: "right", wordBreak: "break-all" },
  desc: { fontSize: 12, color: "#555", lineHeight: 1.7, margin: 0 },
  editGroup: { marginBottom: 16 },
  editLabel: { fontSize: 10, color: "#2a2a2a", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 6 },
  editRow: { display: "flex", gap: 8 },
  input: {
    width: "100%", padding: "12px 14px",
    background: "#131313", border: `1px solid #1e1e1e`,
    borderRadius: 10, color: "#ddd",
    fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
  },
  select: {
    width: "100%", padding: "12px 14px",
    background: "#131313", border: `1px solid #1e1e1e`,
    borderRadius: 10, color: "#ddd",
    fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
    outline: "none", cursor: "pointer",
    appearance: "none",
  },
  saveBtn: {
    width: 46, height: 46, flexShrink: 0, borderRadius: 10,
    background: "#39ff14", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  bigBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", padding: "14px",
    background: "#39ff14", border: "none", borderRadius: 12,
    color: "#000", fontSize: 13, fontWeight: 700,
    cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
  },
  ghostBtn: {
    padding: "14px 18px",
    background: "none", border: `1px solid #1e1e1e`,
    borderRadius: 12, color: "#333",
    fontSize: 13, cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
  },
  histRow: {
    display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8,
    padding: "8px 10px",
    background: "#0d0d0d", borderRadius: 8, marginBottom: 6,
  },
  histFrom: { fontSize: 10, color: "#2a2a2a" },
  histDate: { fontSize: 10, color: "#1e1e1e", marginLeft: "auto" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  .tap-scale:active { transform: scale(0.93) !important; opacity: 0.8; }
  .rep-card:active  { background: #0f0f0f !important; }
  .chip-btn:active  { opacity: 0.7; }
  input:focus, textarea:focus, select:focus { border-color: rgba(57,255,20,0.35) !important; box-shadow: 0 0 0 3px rgba(57,255,20,0.06); }
  .spinner {
    width: 26px; height: 26px;
    border: 2px solid #1a1a1a;
    border-top-color: #39ff14;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { display: none; }
  * { scrollbar-width: none; }
`;