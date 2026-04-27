import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Search, X, Eye, Package, Hash, ChevronDown,
  ArrowRight, FileText, Wrench,
} from "lucide-react";

/* ─── Constantes ─── */
const ESTADOS = [
  { v: "todos",      l: "Todos",      c: null },
  { v: "pendiente",  l: "Pendiente",  c: "#ffb800" },
  { v: "revisada",   l: "Revisada",   c: "#00d4ff" },
  { v: "aprobada",   l: "Aprobada",   c: "#39ff14" },
  { v: "rechazada",  l: "Rechazada",  c: "#ff3b3b" },
];
const EMAP  = Object.fromEntries(ESTADOS.filter(e => e.v !== "todos").map(e => [e.v, e]));
const TIPOS = { consola: "🎮", computador: "💻", celular: "📱" };

const fmtDate = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const fmtFull = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Badge({ estado }) {
  const e = EMAP[estado] ?? { l: estado, c: "#888" };
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
export default function AdminCotizaciones() {
  const [cots, setCots]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, [filtro]);

  const load = async () => {
    setLoading(true);
    try {
      const q = filtro !== "todos" ? `?estado=${filtro}` : "";
      const res = await api.get(`/api/cotizaciones${q}`);
      setCots(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateEstado = async (id, estado, extras = {}) => {
    try {
      await api.put(`/api/cotizaciones/${id}`, { estado, ...extras });
      await load();
      // Actualizar el selected si está abierto
      if (selected?.id === id) {
        setCots(prev => {
          const updated = prev.find(c => c.id === id);
          if (updated) setSelected({ ...updated, estado, ...extras });
          return prev;
        });
      }
    } catch (e) { console.error(e); }
  };

  const convertirAReparacion = async (id) => {
    try {
      await api.post(`/api/cotizaciones/${id}/convertir`);
      await load();
      setSelected(null);
      alert("✅ Reparación creada exitosamente desde la cotización.");
    } catch (e) {
      console.error(e);
      alert("Error al convertir la cotización.");
    }
  };

  const counts = ESTADOS.slice(1).reduce((a, e) => {
    a[e.v] = cots.filter(c => c.estado === e.v).length;
    return a;
  }, {});

  const filtered = cots.filter(c =>
    [c.nombre, c.email, c.marca, c.modelo, c.codigo].some(v =>
      v?.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="ac-desktop"><DesktopView {...{ filtered, loading, counts, cots, filtro, busqueda, setFiltro, setBusqueda, setSelected, selected, updateEstado, convertirAReparacion, load }} /></div>
      <div className="ac-mobile"><MobileView  {...{ filtered, loading, counts, cots, filtro, busqueda, setFiltro, setBusqueda, setSelected, selected, updateEstado, convertirAReparacion, load }} /></div>
    </>
  );
}

/* ════════ DESKTOP ════════ */
function DesktopView({ filtered, loading, counts, cots, filtro, busqueda, setFiltro, setBusqueda, setSelected, selected, updateEstado, convertirAReparacion }) {
  return (
    <div className="ac-page-dt">
      <div className="ac-head">
        <div>
          <h1 className="ac-title">Cotizaciones</h1>
          <p className="ac-subtitle">{cots.length} solicitudes · {filtered.length} visibles</p>
        </div>
      </div>

      <div className="ac-chips">
        {ESTADOS.map(e => {
          const on = filtro === e.v;
          const cnt = e.v === "todos" ? cots.length : (counts[e.v] ?? 0);
          return (
            <button key={e.v} onClick={() => setFiltro(e.v)}
              className={`ac-chip${on ? " active" : ""}`}
              style={on && e.c ? { background: `${e.c}12`, borderColor: `${e.c}45`, color: e.c } : {}}>
              {e.l}
              <span className="ac-chip-cnt" style={on && e.c ? { background: `${e.c}22`, color: e.c } : {}}>{cnt}</span>
            </button>
          );
        })}
      </div>

      <div className="ac-search">
        <Search size={14} color="#666" />
        <input className="ac-search-input" placeholder="Buscar por nombre, email, código, marca..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        {busqueda && <button className="ac-clear" onClick={() => setBusqueda("")}><X size={12} color="#666" /></button>}
      </div>

      {loading ? <div className="ac-loading"><div className="ac-spinner" /></div> : (
        <div className="ac-table-wrap">
          <table className="ac-table">
            <thead>
              <tr>
                {["Código", "Cliente", "Equipo", "Estado", "Fecha", ""].map(h => (
                  <th key={h} className="ac-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="ac-tr" onClick={() => setSelected(c)}>
                  <td className="ac-td"><span className="ac-num"><Hash size={9} color="#666" style={{ marginRight: 2 }} />{c.codigo}</span></td>
                  <td className="ac-td">
                    <div className="ac-cliente-cell">
                      <strong className="ac-cliente-name">{c.nombre}</strong>
                      <span className="ac-cliente-sub">{c.telefono || c.email}</span>
                    </div>
                  </td>
                  <td className="ac-td">
                    <div className="ac-equipo-cell">
                      <span style={{ fontSize: 17, lineHeight: 1 }}>{TIPOS[c.tipoEquipo] ?? "🔧"}</span>
                      <div>
                        <div className="ac-equipo-name">{c.marca} {c.modelo}</div>
                        <div className="ac-equipo-sub">{c.tipoEquipo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ac-td"><Badge estado={c.estado ?? "pendiente"} /></td>
                  <td className="ac-td"><span className="ac-fecha">{fmtFull(c.createdAt)}</span></td>
                  <td className="ac-td">
                    <button className="ac-icon-btn" onClick={e => { e.stopPropagation(); setSelected(c); }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="ac-empty">
              <FileText size={36} color="#222" />
              <p className="ac-empty-txt">{busqueda ? `Sin resultados para "${busqueda}"` : "No hay cotizaciones aún"}</p>
            </div>
          )}
        </div>
      )}

      {selected && <DesktopModal cot={selected} onClose={() => setSelected(null)} onUpdate={updateEstado} onConvertir={convertirAReparacion} />}
    </div>
  );
}

/* ════════ MOBILE ════════ */
function MobileView({ filtered, loading, counts, cots, filtro, busqueda, setFiltro, setBusqueda, setSelected, selected, updateEstado, convertirAReparacion }) {
  return (
    <div className="ac-page-mb">
      <div className="ac-head">
        <div>
          <h1 className="ac-title">Cotizaciones</h1>
          <span className="ac-count-mb">{filtered.length} de {cots.length}</span>
        </div>
      </div>

      <div className="ac-search">
        <Search size={15} color="#666" />
        <input className="ac-search-input" placeholder="Buscar nombre, código, marca..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        {busqueda && <button className="ac-clear" onClick={() => setBusqueda("")}><X size={13} color="#666" /></button>}
      </div>

      <div className="ac-chips-mb">
        {ESTADOS.map(e => {
          const on = filtro === e.v;
          const cnt = e.v === "todos" ? cots.length : (counts[e.v] ?? 0);
          return (
            <button key={e.v} onClick={() => setFiltro(e.v)}
              className={`ac-chip${on ? " active" : ""}`}
              style={on && e.c ? { background: `${e.c}12`, borderColor: `${e.c}45`, color: e.c } : {}}>
              {e.l}
              <span className="ac-chip-cnt" style={on && e.c ? { background: `${e.c}22`, color: e.c } : {}}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {loading ? <div className="ac-loading"><div className="ac-spinner" /></div> : filtered.length === 0 ? (
        <div className="ac-empty">
          <FileText size={36} color="#1a1a1a" />
          <span className="ac-empty-txt">{busqueda ? "Sin resultados" : "No hay cotizaciones"}</span>
        </div>
      ) : (
        <div className="ac-card-list">
          {filtered.map(c => <CotCard key={c.id} cot={c} onView={() => setSelected(c)} />)}
        </div>
      )}

      {selected && <MobileSheet cot={selected} onClose={() => setSelected(null)} onUpdate={updateEstado} onConvertir={convertirAReparacion} />}
    </div>
  );
}

/* ─── Card móvil ─── */
function CotCard({ cot, onView }) {
  return (
    <div className="ac-card" onClick={onView}>
      <div className="ac-card-top">
        <div className="ac-card-left">
          <span style={{ fontSize: 22, lineHeight: 1 }}>{TIPOS[cot.tipoEquipo] ?? "🔧"}</span>
          <div>
            <div className="ac-card-equipo">{cot.marca} {cot.modelo}</div>
            <div className="ac-card-tipo">{cot.tipoEquipo}</div>
          </div>
        </div>
        <Badge estado={cot.estado ?? "pendiente"} />
      </div>
      <div className="ac-card-mid">
        <div className="ac-card-nombre">{cot.nombre}</div>
        <div className="ac-card-contact">{cot.telefono || cot.email}</div>
      </div>
      <div className="ac-card-bot">
        <span className="ac-card-fecha">{fmtDate(cot.createdAt)}</span>
        <span className="ac-card-id"><Hash size={9} style={{ marginRight: 1 }} />{cot.codigo}</span>
      </div>
    </div>
  );
}

/* ════════ DESKTOP MODAL ════════ */
function DesktopModal({ cot, onClose, onUpdate, onConvertir }) {
  const [estado, setEstado]     = useState(cot.estado ?? "pendiente");
  const [precio, setPrecio]     = useState(cot.precioEstimado ?? "");
  const [notas, setNotas]       = useState(cot.notasAdmin ?? "");
  const [saving, setSaving]     = useState(false);
  const [converting, setConverting] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(cot.id, estado, {
      precioEstimado: precio !== "" ? parseFloat(precio) : null,
      notasAdmin: notas || null,
    });
    setSaving(false);
    onClose();
  };

  const handleConvertir = async () => {
    if (!confirm("¿Convertir esta cotización en una reparación?")) return;
    setConverting(true);
    await onConvertir(cot.id);
    setConverting(false);
  };

  return (
    <div className="ac-overlay" onClick={onClose}>
      <div className="ac-modal" onClick={e => e.stopPropagation()}>
        <div className="ac-modal-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="ac-modal-title">{cot.codigo}</span>
              <Badge estado={cot.estado ?? "pendiente"} />
            </div>
            <span className="ac-modal-sub">{TIPOS[cot.tipoEquipo]} {cot.marca} {cot.modelo}</span>
          </div>
          <button className="ac-head-btn" onClick={onClose}><X size={14} color="#666" /></button>
        </div>

        <div className="ac-modal-body">
          <div className="ac-modal-grid3">
            <InfoBlock title="Cliente">
              <InfoRow label="Nombre"   value={cot.nombre} />
              <InfoRow label="Email"    value={cot.email} />
              <InfoRow label="Teléfono" value={cot.telefono || "—"} />
            </InfoBlock>
            <InfoBlock title="Equipo">
              <InfoRow label="Tipo"   value={`${TIPOS[cot.tipoEquipo] ?? "🔧"} ${cot.tipoEquipo}`} />
              <InfoRow label="Marca"  value={cot.marca} />
              <InfoRow label="Modelo" value={cot.modelo} />
            </InfoBlock>
            <InfoBlock title="Registro">
              <InfoRow label="Código" value={cot.codigo} />
              <InfoRow label="Fecha"  value={fmtFull(cot.createdAt)} />
              <InfoRow label="Estado" value={cot.estado ?? "pendiente"} />
            </InfoBlock>
          </div>

          <InfoBlock title="Descripción del problema">
            <p className="ac-desc">{cot.descripcion}</p>
          </InfoBlock>

          <InfoBlock title="Gestionar">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label className="ac-edit-label">Estado</label>
                <select className="ac-select" value={estado} onChange={e => setEstado(e.target.value)}>
                  {ESTADOS.filter(e => e.v !== "todos").map(e => (
                    <option key={e.v} value={e.v}>{e.l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ac-edit-label">Precio estimado (COP)</label>
                <input className="ac-input" type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0" />
              </div>
            </div>
            <label className="ac-edit-label">Notas para el cliente</label>
            <textarea className="ac-input ac-textarea" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones, diagnóstico preliminar..." />
          </InfoBlock>

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", paddingTop: 8 }}>
            <button className="ac-btn-convertir" onClick={handleConvertir} disabled={converting || cot.estado === "aprobada"}>
              <Wrench size={13} />
              {converting ? "Convirtiendo..." : "Crear reparación"}
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ac-btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="ac-btn-primary" onClick={save} disabled={saving}>
                <ArrowRight size={13} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════ MOBILE SHEET ════════ */
function MobileSheet({ cot, onClose, onUpdate, onConvertir }) {
  const [estado, setEstado]     = useState(cot.estado ?? "pendiente");
  const [precio, setPrecio]     = useState(cot.precioEstimado ?? "");
  const [notas, setNotas]       = useState(cot.notasAdmin ?? "");
  const [saving, setSaving]     = useState(false);
  const [converting, setConverting] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(cot.id, estado, {
      precioEstimado: precio !== "" ? parseFloat(precio) : null,
      notasAdmin: notas || null,
    });
    setSaving(false);
    onClose();
  };

  const handleConvertir = async () => {
    if (!confirm("¿Convertir esta cotización en una reparación?")) return;
    setConverting(true);
    await onConvertir(cot.id);
    setConverting(false);
  };

  return (
    <div className="ac-bs-overlay" onClick={onClose}>
      <div className="ac-bs-sheet" onClick={e => e.stopPropagation()}>
        <div className="ac-bs-handle" />
        <div className="ac-bs-head">
          <div>
            <div className="ac-modal-title">{cot.codigo}</div>
            <div className="ac-modal-sub">{TIPOS[cot.tipoEquipo]} {cot.marca} {cot.modelo}</div>
          </div>
          <button className="ac-head-btn" onClick={onClose}><X size={14} color="#666" /></button>
        </div>
        <Badge estado={cot.estado ?? "pendiente"} />

        <div className="ac-bs-body">
          <MSection title="Cliente">
            <MRow label="Nombre"   value={cot.nombre} />
            <MRow label="Email"    value={cot.email} />
            <MRow label="Teléfono" value={cot.telefono || "—"} />
            <MRow label="Fecha"    value={fmtDate(cot.createdAt)} />
          </MSection>

          <MSection title="Equipo">
            <MRow label="Tipo"   value={`${TIPOS[cot.tipoEquipo] ?? "🔧"} ${cot.tipoEquipo}`} />
            <MRow label="Marca"  value={cot.marca} />
            <MRow label="Modelo" value={cot.modelo} />
          </MSection>

          <MSection title="Descripción">
            <p style={{ fontSize: 12, color: "#777", lineHeight: 1.7 }}>{cot.descripcion}</p>
          </MSection>

          <MSection title="Gestionar">
            <label className="ac-edit-label">Estado</label>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <select className="ac-select ac-select-full" value={estado} onChange={e => setEstado(e.target.value)}>
                {ESTADOS.filter(e => e.v !== "todos").map(e => (
                  <option key={e.v} value={e.v}>{e.l}</option>
                ))}
              </select>
              <ChevronDown size={14} color="#666" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <label className="ac-edit-label">Precio estimado (COP)</label>
            <input className="ac-input" style={{ marginBottom: 10 }} type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0" />
            <label className="ac-edit-label">Notas para el cliente</label>
            <textarea className="ac-input ac-textarea" style={{ marginBottom: 12 }} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones, diagnóstico..." />

            <button className="ac-big-btn" onClick={save} disabled={saving}>
              <ArrowRight size={15} color="#000" /> {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            {cot.estado !== "aprobada" && (
              <button className="ac-btn-convertir-mb" onClick={handleConvertir} disabled={converting}>
                <Wrench size={15} /> {converting ? "Convirtiendo..." : "Crear reparación desde esta cotización"}
              </button>
            )}
          </MSection>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function InfoBlock({ title, children }) {
  return <div style={{ marginBottom: 18 }}><div className="ac-block-title">{title}</div>{children}</div>;
}
function InfoRow({ label, value }) {
  return (
    <div className="ac-info-row">
      <span className="ac-info-label">{label}</span>
      <span className="ac-info-value">{value}</span>
    </div>
  );
}
function MSection({ title, children }) {
  return <div style={{ marginBottom: 18 }}><div className="ac-block-title">{title}</div>{children}</div>;
}
function MRow({ label, value }) {
  return (
    <div className="ac-info-row">
      <span className="ac-info-label">{label}</span>
      <span className="ac-info-value">{value}</span>
    </div>
  );
}

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

.ac-desktop { display: block; }
.ac-mobile  { display: none; }
@media (max-width: 767px) { .ac-desktop { display: none; } .ac-mobile { display: block; } }

.ac-page-dt { padding: 28px 32px; display: flex; flex-direction: column; gap: 16px; min-height: 100vh; }
.ac-page-mb { padding: 20px 14px 0; display: flex; flex-direction: column; gap: 14px; }
.ac-head { display: flex; align-items: center; justify-content: space-between; }
.ac-title { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; color: #efefef; letter-spacing: 1px; margin: 0; }
@media (max-width: 767px) { .ac-title { font-size: 22px; } }
.ac-subtitle  { font-size: 11px; color: #666; margin-top: 4px; }
.ac-count-mb  { font-size: 10px; color: #666; display: block; margin-top: 3px; }

.ac-chips    { display: flex; gap: 6px; flex-wrap: wrap; }
.ac-chips-mb { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px; }
.ac-chips-mb::-webkit-scrollbar { display: none; }
.ac-chip { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; background: none; border: 1px solid #1e1e1e; color: #666; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: 'JetBrains Mono', monospace; transition: all 0.15s; }
.ac-chip:hover { border-color: #2a2a2a; color: #888; }
.ac-chip.active { background: rgba(57,255,20,0.1); border-color: rgba(57,255,20,0.35); color: #39ff14; }
.ac-chip-cnt { background: #141414; border-radius: 10px; padding: 1px 6px; font-size: 10px; color: #555; font-weight: 700; }

.ac-search { display: flex; align-items: center; gap: 10px; background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 10px; padding: 0 14px; }
@media (max-width: 767px) { .ac-search { border-radius: 12px; height: 44px; } }
.ac-search-input { flex: 1; background: none; border: none; outline: none; padding: 10px 0; font-size: 13px; color: #ccc; font-family: 'JetBrains Mono', monospace; }
.ac-clear { background: none; border: none; cursor: pointer; display: flex; padding: 4px; }

.ac-table-wrap { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 10px; overflow: hidden; }
.ac-table { width: 100%; border-collapse: collapse; }
.ac-th { padding: 10px 16px; text-align: left; font-size: 9px; color: #666; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; }
.ac-tr { border-bottom: 1px solid #111; cursor: pointer; transition: background 0.1s; }
.ac-tr:hover { background: #0f0f0f; }
.ac-td { padding: 12px 16px; font-size: 12px; color: #888; }
.ac-num { display: flex; align-items: center; font-size: 11px; color: #666; font-weight: 700; }
.ac-cliente-cell { display: flex; flex-direction: column; gap: 2px; }
.ac-cliente-name { font-size: 12px; color: #eee; font-weight: 600; }
.ac-cliente-sub  { font-size: 10px; color: #666; }
.ac-equipo-cell  { display: flex; align-items: center; gap: 8px; }
.ac-equipo-name  { font-size: 12px; color: #eee; }
.ac-equipo-sub   { font-size: 10px; color: #666; text-transform: capitalize; }
.ac-fecha  { font-size: 10px; color: #666; }
.ac-icon-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid #1e1e1e; border-radius: 6px; cursor: pointer; color: #555; transition: all 0.15s; }
.ac-icon-btn:hover { background: #141414; color: #888; border-color: #2a2a2a; }

.ac-card-list { display: flex; flex-direction: column; gap: 10px; padding-bottom: 16px; }
.ac-card { background: #0d0d0d; border-radius: 16px; border: 1px solid #1e1e1e; padding: 14px 14px 11px; cursor: pointer; }
.ac-card:active { background: #0f0f0f; }
.ac-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.ac-card-left { display: flex; align-items: center; gap: 10px; }
.ac-card-equipo { font-size: 13px; color: #ddd; font-weight: 700; }
.ac-card-tipo   { font-size: 10px; color: #666; text-transform: capitalize; margin-top: 2px; }
.ac-card-mid    { padding-bottom: 10px; border-bottom: 1px solid #1a1a1a; margin-bottom: 10px; }
.ac-card-nombre  { font-size: 12px; color: #999; margin-bottom: 2px; }
.ac-card-contact { font-size: 10px; color: #666; }
.ac-card-bot { display: flex; align-items: center; justify-content: space-between; }
.ac-card-fecha { font-size: 10px; color: #666; }
.ac-card-id    { display: flex; align-items: center; font-size: 10px; color: #555; font-weight: 700; }

.ac-loading { display: flex; justify-content: center; padding: 60px; }
.ac-empty   { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 50px 20px; }
.ac-empty-txt { font-size: 12px; color: #555; }
.ac-spinner { width: 26px; height: 26px; border: 2px solid #1a1a1a; border-top-color: #39ff14; border-radius: 50%; animation: ac-spin 0.65s linear infinite; }
@keyframes ac-spin { to { transform: rotate(360deg); } }

.ac-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.ac-modal { background: #0e0e0e; border: 1px solid #2a2a2a; border-radius: 12px; width: 100%; max-width: 700px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
.ac-modal-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; flex-shrink: 0; gap: 12px; }
.ac-modal-title { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 900; color: #39ff14; letter-spacing: 1px; }
.ac-modal-sub   { font-size: 11px; color: #666; margin-top: 3px; }
.ac-modal-body  { padding: 20px 24px; overflow-y: auto; flex: 1; }
.ac-modal-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.ac-desc { font-size: 13px; color: #777; line-height: 1.7; margin: 0; }
.ac-head-btn { width: 34px; height: 34px; border-radius: 9px; background: #141414; border: 1px solid #1e1e1e; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.ac-head-btn:hover { border-color: #2a2a2a; }

.ac-bs-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(3px); display: flex; align-items: flex-end; z-index: 200; }
.ac-bs-sheet { width: 100%; background: #0e0e0e; border-top: 1px solid #1e1e1e; border-radius: 22px 22px 0 0; max-height: 90dvh; display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom, 16px); }
.ac-bs-handle { width: 36px; height: 4px; border-radius: 2px; background: #1e1e1e; margin: 12px auto 4px; flex-shrink: 0; }
.ac-bs-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 18px 14px; border-bottom: 1px solid #1a1a1a; flex-shrink: 0; gap: 12px; }
.ac-bs-body { overflow-y: auto; padding: 16px 18px; flex: 1; }

.ac-block-title { font-size: 9px; color: #666; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 10px; }
.ac-info-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #111; }
.ac-info-label { font-size: 11px; color: #666; }
.ac-info-value { font-size: 12px; color: #ccc; max-width: 60%; text-align: right; word-break: break-all; }
.ac-edit-label { font-size: 9px; color: #666; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 6px; }
.ac-input { width: 100%; padding: 10px 13px; background: #131313; border: 1px solid #1e1e1e; border-radius: 9px; color: #ddd; font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none; }
.ac-input:focus { border-color: rgba(57,255,20,0.35); box-shadow: 0 0 0 3px rgba(57,255,20,0.06); }
.ac-textarea { min-height: 70px; resize: none; margin-top: 0; }
.ac-select { padding: 10px 13px; background: #131313; border: 1px solid #1e1e1e; border-radius: 9px; color: #ddd; font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none; cursor: pointer; appearance: none; width: 100%; }
.ac-select:focus { border-color: rgba(57,255,20,0.35); }
.ac-select-full { width: 100%; }
.ac-btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; background: #39ff14; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; color: #000; font-family: 'JetBrains Mono', monospace; }
.ac-btn-primary:hover { opacity: 0.85; }
.ac-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.ac-btn-ghost { padding: 10px 16px; background: none; border: 1px solid #1e1e1e; border-radius: 8px; color: #666; font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace; }
.ac-btn-ghost:hover { border-color: #2a2a2a; color: #888; }
.ac-btn-convertir { display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; background: rgba(57,255,20,0.08); border: 1px solid rgba(57,255,20,0.25); border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; color: #39ff14; font-family: 'JetBrains Mono', monospace; }
.ac-btn-convertir:hover { background: rgba(57,255,20,0.15); }
.ac-btn-convertir:disabled { opacity: 0.4; cursor: not-allowed; }
.ac-big-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: #39ff14; border: none; border-radius: 12px; color: #000; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'JetBrains Mono', monospace; margin-bottom: 10px; }
.ac-big-btn:active { transform: scale(0.97); opacity: 0.85; }
.ac-btn-convertir-mb { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; background: rgba(57,255,20,0.08); border: 1px solid rgba(57,255,20,0.25); border-radius: 12px; color: #39ff14; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'JetBrains Mono', monospace; }
.ac-btn-convertir-mb:disabled { opacity: 0.4; }

::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 4px; }
`;
