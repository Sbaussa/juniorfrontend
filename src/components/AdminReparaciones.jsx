import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Search, X, Plus, Eye, Edit3, Save, Package,
  ArrowRight, Hash, ChevronDown, Check,
} from "lucide-react";

/* ─── Constantes ─── */
const ESTADOS = [
  { v: "todos",         l: "Todos",          c: null },
  { v: "pendiente",     l: "Pendiente",      c: "#ffb800" },
  { v: "diagnostico",   l: "Diagnóstico",    c: "#00d4ff" },
  { v: "cotizado",      l: "Cotizado",        c: "#ce93d8" },
  { v: "aprobado",      l: "Aprobado",        c: "#39ff14" },
  { v: "en_reparacion", l: "En Reparación",   c: "#ff8c42" },
  { v: "reparado",      l: "Reparado",        c: "#69f0ae" },
  { v: "entregado",     l: "Entregado",       c: "#39ff14" },
  { v: "cancelado",     l: "Cancelado",       c: "#ff3b3b" },
];
const EMAP  = Object.fromEntries(ESTADOS.filter(e => e.v !== "todos").map(e => [e.v, e]));
const TIPOS = { consola: "🎮", computador: "💻", celular: "📱" };

const fmtDate = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const fmtFull = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtCOP  = (v) => v != null
  ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v)
  : "—";

/* ─── Badge ─── */
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

/* ════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════ */
export default function AdminReparaciones() {
  const [reps, setReps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showNew, setShowNew]   = useState(false);

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

  const sharedProps = { selected, editMode, showNew, filtered, loading, counts, reps, filtro, busqueda };
  const handlers = {
    setFiltro, setBusqueda, setSelected, setEditMode, setShowNew,
    updateEstado, updatePrecio, load,
  };

  return (
    <>
      <style>{CSS}</style>
      {/* Desktop */}
      <div className="ar-desktop">
        <DesktopView {...sharedProps} {...handlers} />
      </div>
      {/* Mobile */}
      <div className="ar-mobile">
        <MobileView {...sharedProps} {...handlers} />
      </div>
    </>
  );
}

/* ════════════════════════════════════
   DESKTOP — tabla clásica
════════════════════════════════════ */
function DesktopView({
  filtered, loading, counts, reps, filtro, busqueda,
  setFiltro, setBusqueda, setSelected, setEditMode, setShowNew,
  selected, editMode, showNew, updateEstado, updatePrecio, load,
}) {
  return (
    <div className="ar-page-dt">
      {/* Header */}
      <div className="ar-head-dt">
        <div>
          <h1 className="ar-title-dt">Reparaciones</h1>
          <p className="ar-subtitle-dt">{reps.length} registros · {filtered.length} visibles</p>
        </div>
        <button className="ar-btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={14} /> Nueva reparación
        </button>
      </div>

      {/* Chips */}
      <div className="ar-chips-dt">
        {ESTADOS.map(e => {
          const on = filtro === e.v;
          const cnt = e.v === "todos" ? reps.length : (counts[e.v] ?? 0);
          return (
            <button
              key={e.v}
              onClick={() => setFiltro(e.v)}
              className={`ar-chip${on ? " active" : ""}`}
              style={on && e.c ? { background: `${e.c}12`, borderColor: `${e.c}45`, color: e.c } : {}}
            >
              {e.l}
              <span className={`ar-chip-cnt${on ? " active" : ""}`}
                style={on && e.c ? { background: `${e.c}22`, color: e.c } : {}}>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="ar-search-dt">
        <Search size={14} color="#333" />
        <input
          className="ar-search-input"
          placeholder="Buscar por código, cliente, marca o modelo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className="ar-clear-btn" onClick={() => setBusqueda("")}>
            <X size={12} color="#444" />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="ar-loading"><div className="ar-spinner" /></div>
      ) : (
        <div className="ar-table-wrap">
          <table className="ar-table">
            <thead>
              <tr>
                {["Código", "Cliente", "Equipo", "Estado", "Precio", "Fecha", ""].map(h => (
                  <th key={h} className="ar-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(rep => (
                <tr key={rep.id} className="ar-tr" onClick={() => { setSelected(rep); setEditMode(false); }}>
                  <td className="ar-td">
                    <span className="ar-codigo">
                      <Hash size={9} color="#2a2a2a" style={{ marginRight: 2 }} />{rep.codigo}
                    </span>
                  </td>
                  <td className="ar-td">
                    <div className="ar-cliente-cell">
                      <strong className="ar-cliente-name">{rep.cliente}</strong>
                      <span className="ar-cliente-sub">{rep.telefono || rep.email}</span>
                    </div>
                  </td>
                  <td className="ar-td">
                    <div className="ar-equipo-cell">
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{TIPOS[rep.tipoEquipo] ?? "🔧"}</span>
                      <div>
                        <div className="ar-equipo-name">{rep.marca} {rep.modelo}</div>
                        <div className="ar-equipo-sub">{rep.tipoEquipo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ar-td"><Badge estado={rep.estado} /></td>
                  <td className="ar-td"><span className="ar-precio">{fmtCOP(rep.precio)}</span></td>
                  <td className="ar-td"><span className="ar-fecha">{fmtFull(rep.createdAt)}</span></td>
                  <td className="ar-td">
                    <div className="ar-actions">
                      <button className="ar-icon-btn" title="Ver" onClick={e => { e.stopPropagation(); setSelected(rep); setEditMode(false); }}>
                        <Eye size={14} />
                      </button>
                      <button className="ar-icon-btn" title="Editar" onClick={e => { e.stopPropagation(); setSelected(rep); setEditMode(true); }}>
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="ar-empty-dt">
              <Package size={36} color="#1a1a1a" />
              <p className="ar-empty-txt">{busqueda ? `Sin resultados para "${busqueda}"` : "No hay reparaciones"}</p>
            </div>
          )}
        </div>
      )}

      {/* Modales desktop */}
      {selected && (
        <DesktopModal
          rep={selected} editMode={editMode}
          onClose={() => { setSelected(null); setEditMode(false); }}
          onUpdateEstado={updateEstado} onUpdatePrecio={updatePrecio}
          onRefresh={load} onToggleEdit={() => setEditMode(m => !m)}
        />
      )}
      {showNew && (
        <DesktopNewModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />
      )}
    </div>
  );
}

/* ════════════════════════════════════
   MOBILE — cards + bottom sheets
════════════════════════════════════ */
function MobileView({
  filtered, loading, counts, reps, filtro, busqueda,
  setFiltro, setBusqueda, setSelected, setEditMode, setShowNew,
  selected, editMode, showNew, updateEstado, updatePrecio, load,
}) {
  return (
    <div className="ar-page-mb">
      {/* Header */}
      <div className="ar-head-mb">
        <div>
          <h1 className="ar-title-mb">Reparaciones</h1>
          <span className="ar-count-mb">{filtered.length} de {reps.length}</span>
        </div>
        <button className="ar-fab" onClick={() => setShowNew(true)}>
          <Plus size={18} color="#000" strokeWidth={2.5} />
        </button>
      </div>

      {/* Search */}
      <div className="ar-search-mb">
        <Search size={15} color="#333" />
        <input
          className="ar-search-input"
          placeholder="Buscar cliente, código, modelo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className="ar-clear-btn" onClick={() => setBusqueda("")}>
            <X size={13} color="#444" />
          </button>
        )}
      </div>

      {/* Chips scroll */}
      <div className="ar-chips-mb">
        {ESTADOS.map(e => {
          const on = filtro === e.v;
          const cnt = e.v === "todos" ? reps.length : (counts[e.v] ?? 0);
          return (
            <button
              key={e.v}
              onClick={() => setFiltro(e.v)}
              className={`ar-chip${on ? " active" : ""}`}
              style={on && e.c ? { background: `${e.c}12`, borderColor: `${e.c}45`, color: e.c } : {}}
            >
              {e.l}
              <span className={`ar-chip-cnt${on ? " active" : ""}`}
                style={on && e.c ? { background: `${e.c}22`, color: e.c } : {}}>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="ar-loading"><div className="ar-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="ar-empty-mb">
          <Package size={36} color="#1a1a1a" />
          <span className="ar-empty-txt">{busqueda ? `Sin resultados` : "No hay reparaciones"}</span>
        </div>
      ) : (
        <div className="ar-card-list">
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

      {/* Bottom sheets */}
      {selected && (
        <BottomSheet
          rep={selected} editMode={editMode}
          onClose={() => { setSelected(null); setEditMode(false); }}
          onUpdateEstado={updateEstado} onUpdatePrecio={updatePrecio}
          onRefresh={load} onToggleEdit={() => setEditMode(m => !m)}
        />
      )}
      {showNew && (
        <NewBottomSheet onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />
      )}
    </div>
  );
}

/* ─── Card móvil ─── */
function RepCard({ rep, onView, onEdit }) {
  return (
    <div className="ar-rep-card" onClick={onView}>
      <div className="ar-rc-top">
        <div className="ar-rc-left">
          <span style={{ fontSize: 22, lineHeight: 1 }}>{TIPOS[rep.tipoEquipo] ?? "🔧"}</span>
          <div>
            <div className="ar-rc-codigo"><Hash size={9} color="#2a2a2a" style={{ marginRight: 1 }} />{rep.codigo}</div>
            <div className="ar-rc-equipo">{rep.marca} {rep.modelo}</div>
          </div>
        </div>
        <Badge estado={rep.estado} />
      </div>
      <div className="ar-rc-mid">
        <div className="ar-rc-cliente">{rep.cliente}</div>
        <div className="ar-rc-tel">{rep.telefono || rep.email}</div>
      </div>
      <div className="ar-rc-bot">
        <span className="ar-rc-fecha">{fmtDate(rep.createdAt)}</span>
        <div className="ar-rc-actions">
          <span className="ar-rc-precio">{fmtCOP(rep.precio)}</span>
          <button className="ar-rc-edit-btn" onClick={e => { e.stopPropagation(); onEdit(); }}>
            <Edit3 size={13} color="#555" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   DESKTOP MODAL — centrado
════════════════════════════════════ */
function DesktopModal({ rep, editMode, onClose, onUpdateEstado, onUpdatePrecio, onRefresh, onToggleEdit }) {
  const [nuevoEstado, setNuevoEstado] = useState(rep.estado);
  const [notas, setNotas]             = useState("");
  const [precio, setPrecio]           = useState(rep.precio ?? "");
  const [saving, setSaving]           = useState(false);

  const saveEstado = async () => {
    if (nuevoEstado === rep.estado) return;
    setSaving(true);
    await onUpdateEstado(rep.id, nuevoEstado, notas);
    setSaving(false); onClose();
  };
  const savePrecio = async () => {
    setSaving(true);
    await onUpdatePrecio(rep.id, parseFloat(precio));
    onRefresh(); setSaving(false);
  };

  return (
    <div className="ar-overlay" onClick={onClose}>
      <div className="ar-modal-dt" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ar-modal-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="ar-modal-codigo">{rep.codigo}</span>
              <Badge estado={rep.estado} />
            </div>
            <span className="ar-modal-sub">{TIPOS[rep.tipoEquipo]} {rep.marca} {rep.modelo}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`ar-head-btn${editMode ? " on" : ""}`} onClick={onToggleEdit}>
              <Edit3 size={14} color={editMode ? "#000" : "#555"} />
            </button>
            <button className="ar-head-btn" onClick={onClose}><X size={14} color="#555" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="ar-modal-body">
          <div className="ar-modal-grid3">
            <InfoBlock title="Cliente">
              <InfoRow label="Nombre" value={rep.cliente} />
              <InfoRow label="Email" value={rep.email} />
              <InfoRow label="Teléfono" value={rep.telefono || "—"} />
            </InfoBlock>
            <InfoBlock title="Equipo">
              <InfoRow label="Tipo" value={`${TIPOS[rep.tipoEquipo]} ${rep.tipoEquipo}`} />
              <InfoRow label="Marca" value={rep.marca} />
              <InfoRow label="Modelo" value={rep.modelo} />
            </InfoBlock>
            <InfoBlock title="Económico">
              <InfoRow label="Precio" value={fmtCOP(rep.precio)} green />
              <InfoRow label="Ingreso" value={fmtFull(rep.createdAt)} />
            </InfoBlock>
          </div>

          <InfoBlock title="Descripción del problema">
            <p className="ar-modal-desc">{rep.descripcionProblema}</p>
          </InfoBlock>
          {rep.diagnostico && (
            <InfoBlock title="Diagnóstico">
              <p className="ar-modal-desc">{rep.diagnostico}</p>
            </InfoBlock>
          )}

          {editMode && (
            <InfoBlock title="Editar">
              <div className="ar-edit-block">
                <label className="ar-edit-label">Precio (COP)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="ar-input" style={{ maxWidth: 160 }} type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0" />
                  <button className="ar-save-btn-sm" onClick={savePrecio} disabled={saving}><Save size={13} color="#000" /></button>
                </div>
              </div>
              <div className="ar-edit-block">
                <label className="ar-edit-label">Cambiar estado</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select className="ar-select" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                    {ESTADOS.filter(e => e.v !== "todos").map(e => <option key={e.v} value={e.v}>{e.l}</option>)}
                  </select>
                  <input className="ar-input" style={{ flex: 1 }} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Notas (opcional)" />
                  <button className="ar-btn-primary" onClick={saveEstado} disabled={saving || nuevoEstado === rep.estado} style={{ opacity: nuevoEstado === rep.estado ? 0.4 : 1 }}>
                    <ArrowRight size={13} /> Actualizar
                  </button>
                </div>
              </div>
            </InfoBlock>
          )}

          {rep.historial?.length > 0 && (
            <InfoBlock title={`Historial · ${rep.historial.length}`}>
              {rep.historial.map((h, i) => (
                <div key={i} className="ar-hist-row">
                  <span className="ar-hist-from">{h.estadoAnterior}</span>
                  <ArrowRight size={10} color="#39ff14" />
                  <Badge estado={h.estadoNuevo} />
                  {h.notas && <span style={{ color: "#2a2a2a", fontSize: 11 }}>— {h.notas}</span>}
                  <span className="ar-hist-date">{fmtDate(h.createdAt)}</span>
                </div>
              ))}
            </InfoBlock>
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopNewModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ cliente: "", email: "", telefono: "", tipoEquipo: "consola", marca: "", modelo: "", descripcionProblema: "", precio: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/api/reparaciones", { ...form, precio: form.precio ? parseFloat(form.precio) : null });
      onCreated();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="ar-overlay" onClick={onClose}>
      <div className="ar-modal-dt" onClick={e => e.stopPropagation()}>
        <div className="ar-modal-head">
          <span className="ar-modal-codigo">Nueva Reparación</span>
          <button className="ar-head-btn" onClick={onClose}><X size={14} color="#555" /></button>
        </div>
        <div className="ar-modal-body">
          <form onSubmit={submit}>
            <InfoBlock title="Cliente">
              <div className="ar-form-row2">
                <FormField label="Nombre *"><input className="ar-input" value={form.cliente} onChange={e => set("cliente", e.target.value)} required placeholder="Juan Pérez" /></FormField>
                <FormField label="Teléfono"><input className="ar-input" value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="300 000 0000" /></FormField>
              </div>
              <FormField label="Email *"><input className="ar-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="correo@ejemplo.com" /></FormField>
            </InfoBlock>
            <InfoBlock title="Equipo">
              <div className="ar-form-row3">
                <FormField label="Tipo">
                  <select className="ar-select" value={form.tipoEquipo} onChange={e => set("tipoEquipo", e.target.value)}>
                    <option value="consola">🎮 Consola</option>
                    <option value="computador">💻 Computador</option>
                    <option value="celular">📱 Celular</option>
                  </select>
                </FormField>
                <FormField label="Marca *"><input className="ar-input" value={form.marca} onChange={e => set("marca", e.target.value)} required placeholder="Sony" /></FormField>
                <FormField label="Modelo *"><input className="ar-input" value={form.modelo} onChange={e => set("modelo", e.target.value)} required placeholder="PS5" /></FormField>
              </div>
            </InfoBlock>
            <InfoBlock title="Problema">
              <FormField label="Descripción *">
                <textarea className="ar-input ar-textarea" value={form.descripcionProblema} onChange={e => set("descripcionProblema", e.target.value)} required placeholder="Describe el fallo..." />
              </FormField>
              <FormField label="Precio estimado (COP)">
                <input className="ar-input" style={{ maxWidth: 200 }} type="number" value={form.precio} onChange={e => set("precio", e.target.value)} placeholder="0" />
              </FormField>
            </InfoBlock>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
              <button type="button" className="ar-btn-ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="ar-btn-primary" disabled={saving}><Save size={13} />{saving ? "Guardando..." : "Crear reparación"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MOBILE BOTTOM SHEETS
════════════════════════════════════ */
function BottomSheet({ rep, editMode, onClose, onUpdateEstado, onUpdatePrecio, onRefresh, onToggleEdit }) {
  const [nuevoEstado, setNuevoEstado] = useState(rep.estado);
  const [notas, setNotas]             = useState("");
  const [precio, setPrecio]           = useState(rep.precio ?? "");
  const [saving, setSaving]           = useState(false);

  const saveEstado = async () => {
    if (nuevoEstado === rep.estado) return;
    setSaving(true);
    await onUpdateEstado(rep.id, nuevoEstado, notas);
    setSaving(false); onClose();
  };
  const savePrecio = async () => {
    setSaving(true);
    await onUpdatePrecio(rep.id, parseFloat(precio));
    onRefresh(); setSaving(false);
  };

  return (
    <div className="ar-bs-overlay" onClick={onClose}>
      <div className="ar-bs-sheet" onClick={e => e.stopPropagation()}>
        <div className="ar-bs-handle" />
        <div className="ar-bs-head">
          <div>
            <div className="ar-bs-codigo">{rep.codigo}</div>
            <div className="ar-bs-sub">{TIPOS[rep.tipoEquipo]} {rep.marca} {rep.modelo}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`ar-head-btn${editMode ? " on" : ""}`} onClick={onToggleEdit}>
              <Edit3 size={14} color={editMode ? "#000" : "#555"} />
            </button>
            <button className="ar-head-btn" onClick={onClose}><X size={14} color="#555" /></button>
          </div>
        </div>
        <Badge estado={rep.estado} />

        <div className="ar-bs-body">
          <MSection title="Cliente">
            <MRow label="Nombre"   value={rep.cliente} />
            <MRow label="Email"    value={rep.email} />
            <MRow label="Teléfono" value={rep.telefono || "—"} />
          </MSection>
          <MSection title="Servicio">
            <MRow label="Precio"  value={fmtCOP(rep.precio)} green />
            <MRow label="Ingreso" value={fmtDate(rep.createdAt)} />
          </MSection>
          <MSection title="Problema">
            <p className="ar-bs-desc">{rep.descripcionProblema}</p>
          </MSection>
          {rep.diagnostico && <MSection title="Diagnóstico"><p className="ar-bs-desc">{rep.diagnostico}</p></MSection>}

          {editMode && (
            <MSection title="Editar">
              <label className="ar-edit-label">Precio (COP)</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input className="ar-input" type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0" />
                <button className="ar-save-icon-btn" onClick={savePrecio} disabled={saving}><Save size={14} color="#000" /></button>
              </div>
              <label className="ar-edit-label">Cambiar estado</label>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <select className="ar-select ar-select-full" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                  {ESTADOS.filter(e => e.v !== "todos").map(e => <option key={e.v} value={e.v}>{e.l}</option>)}
                </select>
                <ChevronDown size={14} color="#444" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
              <input className="ar-input" style={{ marginBottom: 10 }} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Notas (opcional)" />
              <button className="ar-big-btn" onClick={saveEstado} disabled={saving || nuevoEstado === rep.estado} style={{ opacity: nuevoEstado === rep.estado ? 0.4 : 1 }}>
                <ArrowRight size={15} color="#000" /> Actualizar estado
              </button>
            </MSection>
          )}

          {rep.historial?.length > 0 && (
            <MSection title={`Historial · ${rep.historial.length}`}>
              {rep.historial.map((h, i) => (
                <div key={i} className="ar-hist-row-mb">
                  <span className="ar-hist-from">{h.estadoAnterior}</span>
                  <ArrowRight size={10} color="#39ff14" />
                  <Badge estado={h.estadoNuevo} />
                  <span className="ar-hist-date">{fmtDate(h.createdAt)}</span>
                </div>
              ))}
            </MSection>
          )}
        </div>
      </div>
    </div>
  );
}

function NewBottomSheet({ onClose, onCreated }) {
  const [form, setForm] = useState({ cliente: "", email: "", telefono: "", tipoEquipo: "consola", marca: "", modelo: "", descripcionProblema: "", precio: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/api/reparaciones", { ...form, precio: form.precio ? parseFloat(form.precio) : null });
      onCreated();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="ar-bs-overlay" onClick={onClose}>
      <div className="ar-bs-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "92dvh" }}>
        <div className="ar-bs-handle" />
        <div className="ar-bs-head">
          <div className="ar-bs-codigo">Nueva Reparación</div>
          <button className="ar-head-btn" onClick={onClose}><X size={14} color="#555" /></button>
        </div>
        <div className="ar-bs-body">
          <form onSubmit={submit}>
            <MSection title="Cliente">
              <label className="ar-edit-label">Nombre *</label>
              <input className="ar-input" style={{ marginBottom: 8 }} value={form.cliente} onChange={e => set("cliente", e.target.value)} required placeholder="Juan Pérez" />
              <label className="ar-edit-label">Email *</label>
              <input className="ar-input" style={{ marginBottom: 8 }} type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="correo@ejemplo.com" />
              <label className="ar-edit-label">Teléfono</label>
              <input className="ar-input" value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="300 000 0000" />
            </MSection>
            <MSection title="Equipo">
              <label className="ar-edit-label">Tipo</label>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <select className="ar-select ar-select-full" value={form.tipoEquipo} onChange={e => set("tipoEquipo", e.target.value)}>
                  <option value="consola">🎮 Consola</option>
                  <option value="computador">💻 Computador</option>
                  <option value="celular">📱 Celular</option>
                </select>
                <ChevronDown size={14} color="#444" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
              <label className="ar-edit-label">Marca *</label>
              <input className="ar-input" style={{ marginBottom: 8 }} value={form.marca} onChange={e => set("marca", e.target.value)} required placeholder="Sony, Xbox, HP..." />
              <label className="ar-edit-label">Modelo *</label>
              <input className="ar-input" value={form.modelo} onChange={e => set("modelo", e.target.value)} required placeholder="PS5, Series X..." />
            </MSection>
            <MSection title="Problema">
              <label className="ar-edit-label">Descripción *</label>
              <textarea className="ar-input ar-textarea" style={{ marginBottom: 8 }} value={form.descripcionProblema} onChange={e => set("descripcionProblema", e.target.value)} required placeholder="Describe el fallo..." />
              <label className="ar-edit-label">Precio estimado (COP)</label>
              <input className="ar-input" type="number" value={form.precio} onChange={e => set("precio", e.target.value)} placeholder="0" />
            </MSection>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="ar-ghost-btn-mb" onClick={onClose}>Cancelar</button>
              <button type="submit" className="ar-big-btn" style={{ flex: 1 }} disabled={saving}>
                <Check size={15} color="#000" />{saving ? "Guardando..." : "Crear reparación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-helpers ─── */
function InfoBlock({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="ar-block-title">{title}</div>
      {children}
    </div>
  );
}
function InfoRow({ label, value, green }) {
  return (
    <div className="ar-info-row">
      <span className="ar-info-label">{label}</span>
      <span className="ar-info-value" style={{ color: green ? "#39ff14" : "#ccc", fontWeight: green ? 700 : 400 }}>{value}</span>
    </div>
  );
}
function FormField({ label, children }) {
  return (
    <div style={{ flex: 1, minWidth: 0, marginBottom: 10 }}>
      <label className="ar-edit-label" style={{ display: "block", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}
function MSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="ar-block-title">{title}</div>
      {children}
    </div>
  );
}
function MRow({ label, value, green }) {
  return (
    <div className="ar-info-row">
      <span className="ar-info-label">{label}</span>
      <span className="ar-info-value" style={{ color: green ? "#39ff14" : "#ccc", fontWeight: green ? 700 : 400 }}>{value}</span>
    </div>
  );
}

/* ════════════════════════════════════
   CSS COMPARTIDO
════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body { background: #080808; font-family: 'JetBrains Mono', monospace; }

/* ── Responsive visibility ── */
.ar-desktop { display: block; }
.ar-mobile  { display: none; }
@media (max-width: 767px) {
  .ar-desktop { display: none; }
  .ar-mobile  { display: block; }
}

/* ══════ DESKTOP PAGE ══════ */
.ar-page-dt { padding: 28px 32px; display: flex; flex-direction: column; gap: 16px; min-height: 100vh; }
.ar-head-dt { display: flex; align-items: center; justify-content: space-between; }
.ar-title-dt { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; color: #efefef; letter-spacing: 1px; }
.ar-subtitle-dt { font-size: 11px; color: #2a2a2a; margin-top: 4px; }

.ar-chips-dt { display: flex; gap: 6px; flex-wrap: wrap; }
.ar-search-dt { display: flex; align-items: center; gap: 10; background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 8px; padding: 0 14px; }

.ar-table-wrap { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 10px; overflow: hidden; }
.ar-table { width: 100%; border-collapse: collapse; }
.ar-th { padding: 10px 16px; text-align: left; font-size: 9px; color: #2a2a2a; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; }
.ar-tr { border-bottom: 1px solid #111; cursor: pointer; transition: background 0.1s; }
.ar-tr:hover { background: #0f0f0f; }
.ar-td { padding: 12px 16px; font-size: 12px; color: #888; }
.ar-codigo { display: flex; align-items: center; font-size: 11px; color: #39ff14; font-weight: 700; letter-spacing: 0.5px; }
.ar-cliente-cell { display: flex; flex-direction: column; gap: 2px; }
.ar-cliente-name { font-size: 12px; color: #eee; font-weight: 600; }
.ar-cliente-sub  { font-size: 10px; color: #2a2a2a; }
.ar-equipo-cell  { display: flex; align-items: center; gap: 8px; }
.ar-equipo-name  { font-size: 12px; color: #eee; }
.ar-equipo-sub   { font-size: 10px; color: #2a2a2a; text-transform: capitalize; }
.ar-precio { font-size: 12px; color: #eee; font-weight: 600; }
.ar-fecha  { font-size: 10px; color: #2a2a2a; }
.ar-actions { display: flex; gap: 4px; }
.ar-icon-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid #1e1e1e; border-radius: 6px; cursor: pointer; color: #444; transition: all 0.15s; }
.ar-icon-btn:hover { background: #141414; color: #888; border-color: #2a2a2a; }
.ar-empty-dt { display: flex; flex-direction: column; align-items: center; padding: 50px 20px; gap: 10px; }
.ar-loading  { display: flex; justify-content: center; padding: 60px; }

/* ══════ MOBILE PAGE ══════ */
.ar-page-mb { padding: 20px 14px 0; display: flex; flex-direction: column; gap: 14px; }
.ar-head-mb { display: flex; align-items: center; justify-content: space-between; }
.ar-title-mb { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 900; color: #efefef; letter-spacing: 0.5px; }
.ar-count-mb { font-size: 10px; color: #2a2a2a; display: block; margin-top: 3px; }
.ar-fab { width: 44px; height: 44px; border-radius: 14px; background: #39ff14; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.ar-fab:active { transform: scale(0.92); opacity: 0.8; }
.ar-search-mb { display: flex; align-items: center; gap: 10; background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 12px; padding: 0 14px; height: 44px; }
.ar-chips-mb { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px; }
.ar-chips-mb::-webkit-scrollbar { display: none; }
.ar-empty-mb { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 0; }

/* Card */
.ar-rep-card { background: #0d0d0d; border-radius: 16px; border: 1px solid #1e1e1e; padding: 14px 14px 11px; cursor: pointer; }
.ar-rep-card:active { background: #0f0f0f; }
.ar-card-list { display: flex; flex-direction: column; gap: 10px; padding-bottom: 16px; }
.ar-rc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.ar-rc-left { display: flex; align-items: center; gap: 10px; }
.ar-rc-codigo { display: flex; align-items: center; font-size: 10px; color: #2a2a2a; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; }
.ar-rc-equipo { font-size: 13px; color: #ddd; font-weight: 700; }
.ar-rc-mid { padding-bottom: 10px; border-bottom: 1px solid #1a1a1a; margin-bottom: 10px; }
.ar-rc-cliente { font-size: 12px; color: #888; margin-bottom: 2px; }
.ar-rc-tel { font-size: 10px; color: #2a2a2a; }
.ar-rc-bot { display: flex; align-items: center; justify-content: space-between; }
.ar-rc-fecha { font-size: 10px; color: #222; }
.ar-rc-actions { display: flex; align-items: center; gap: 8px; }
.ar-rc-precio { font-size: 12px; color: #444; font-weight: 600; }
.ar-rc-edit-btn { width: 32px; height: 32px; border-radius: 9px; background: #131313; border: 1px solid #1e1e1e; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.ar-rc-edit-btn:active { transform: scale(0.9); }

/* Bottom sheet */
.ar-bs-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(3px); display: flex; align-items: flex-end; z-index: 200; }
.ar-bs-sheet { width: 100%; background: #0e0e0e; border-top: 1px solid #1e1e1e; border-radius: 22px 22px 0 0; max-height: 86dvh; display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom, 16px); }
.ar-bs-handle { width: 36px; height: 4px; border-radius: 2px; background: #1e1e1e; margin: 12px auto 4px; flex-shrink: 0; }
.ar-bs-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 18px 14px; border-bottom: 1px solid #1a1a1a; flex-shrink: 0; gap: 12px; }
.ar-bs-codigo { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 900; color: #39ff14; letter-spacing: 0.5px; }
.ar-bs-sub { font-size: 11px; color: #2a2a2a; margin-top: 3px; }
.ar-bs-body { overflow-y: auto; padding: 16px 18px; flex: 1; }
.ar-bs-desc { font-size: 12px; color: #444; line-height: 1.7; }

/* Desktop modal overlay */
.ar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.ar-modal-dt { background: #0e0e0e; border: 1px solid #2a2a2a; border-radius: 12px; width: 100%; max-width: 700px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
.ar-modal-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; flex-shrink: 0; gap: 12px; }
.ar-modal-codigo { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 900; color: #39ff14; letter-spacing: 1px; }
.ar-modal-sub { font-size: 11px; color: #2a2a2a; margin-top: 3px; }
.ar-modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.ar-modal-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.ar-modal-desc { font-size: 12px; color: #444; line-height: 1.7; }

/* Shared elements */
.ar-search-input { flex: 1; background: none; border: none; outline: none; padding: 10px 0; font-size: 13px; color: #ccc; font-family: 'JetBrains Mono', monospace; }
.ar-clear-btn { background: none; border: none; cursor: pointer; display: flex; padding: 4px; }
.ar-chip { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; background: none; border: 1px solid #1e1e1e; color: #2a2a2a; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: 'JetBrains Mono', monospace; transition: all 0.15s; }
.ar-chip:hover { border-color: #2a2a2a; color: #555; }
.ar-chip.active { background: rgba(57,255,20,0.1); border-color: rgba(57,255,20,0.35); color: #39ff14; }
.ar-chip-cnt { background: #141414; border-radius: 10px; padding: 1px 6px; font-size: 10px; color: #2a2a2a; font-weight: 700; }
.ar-chip-cnt.active { background: rgba(57,255,20,0.18); color: #39ff14; }
.ar-empty-txt { font-size: 12px; color: #1e1e1e; }
.ar-head-btn { width: 34px; height: 34px; border-radius: 9px; background: #141414; border: 1px solid #1e1e1e; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.ar-head-btn.on { background: #39ff14; border-color: #39ff14; }
.ar-head-btn:hover { border-color: #2a2a2a; }
.ar-edit-block { margin-bottom: 16px; }
.ar-edit-label { font-size: 9px; color: #2a2a2a; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 6px; }
.ar-input { width: 100%; padding: 10px 13px; background: #131313; border: 1px solid #1e1e1e; border-radius: 9px; color: #ddd; font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none; }
.ar-input:focus { border-color: rgba(57,255,20,0.35); box-shadow: 0 0 0 3px rgba(57,255,20,0.06); }
.ar-textarea { min-height: 80px; resize: vertical; }
.ar-select { padding: 10px 13px; background: #131313; border: 1px solid #1e1e1e; border-radius: 9px; color: #ddd; font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none; cursor: pointer; appearance: none; }
.ar-select:focus { border-color: rgba(57,255,20,0.35); }
.ar-select-full { width: 100%; }
.ar-block-title { font-size: 9px; color: #2a2a2a; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 10px; }
.ar-info-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #111; }
.ar-info-label { font-size: 11px; color: #2a2a2a; }
.ar-info-value { font-size: 12px; max-width: 60%; text-align: right; word-break: break-all; }
.ar-hist-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 10px; background: #0a0a0a; border-radius: 8px; margin-bottom: 6px; }
.ar-hist-row-mb { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 10px; background: #0d0d0d; border-radius: 8px; margin-bottom: 6px; }
.ar-hist-from { font-size: 10px; color: #2a2a2a; }
.ar-hist-date { font-size: 10px; color: #1e1e1e; margin-left: auto; }
.ar-form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ar-form-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.ar-btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; background: #39ff14; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; color: #000; font-family: 'JetBrains Mono', monospace; }
.ar-btn-primary:hover { opacity: 0.85; }
.ar-btn-ghost { padding: 9px 16px; background: none; border: 1px solid #1e1e1e; border-radius: 8px; color: #333; font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace; }
.ar-btn-ghost:hover { border-color: #2a2a2a; color: #666; }
.ar-save-btn-sm { width: 40px; height: 40px; flex-shrink: 0; border-radius: 8px; background: #39ff14; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.ar-save-icon-btn { width: 46px; height: 46px; flex-shrink: 0; border-radius: 10px; background: #39ff14; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.ar-save-icon-btn:active { transform: scale(0.93); }
.ar-big-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: #39ff14; border: none; border-radius: 12px; color: #000; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'JetBrains Mono', monospace; }
.ar-big-btn:active { transform: scale(0.97); opacity: 0.85; }
.ar-ghost-btn-mb { padding: 14px 18px; background: none; border: 1px solid #1e1e1e; border-radius: 12px; color: #333; font-size: 13px; cursor: pointer; font-family: 'JetBrains Mono', monospace; }
.ar-spinner { width: 26px; height: 26px; border: 2px solid #1a1a1a; border-top-color: #39ff14; border-radius: 50%; animation: spin 0.65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 4px; }
`;