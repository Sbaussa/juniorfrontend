import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import api from "../utils/api";
import {
  Clock, Wrench, FileText, ArrowLeft, LogOut,
  Hash, ArrowRight, ChevronRight, Home, Package,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/* ─── Config estados ─── */
const REP_ESTADOS = {
  pendiente:     { label: "Pendiente",      color: "#ffb800" },
  diagnostico:   { label: "En Diagnóstico", color: "#00d4ff" },
  cotizado:      { label: "Cotizado",        color: "#ce93d8" },
  aprobado:      { label: "Aprobado",        color: "#39ff14" },
  en_reparacion: { label: "En Reparación",   color: "#ffb74d" },
  reparado:      { label: "Reparado",        color: "#69f0ae" },
  entregado:     { label: "Entregado",       color: "#39ff14" },
  cancelado:     { label: "Cancelado",       color: "#ff3b3b" },
};
const COT_ESTADOS = {
  pendiente: { label: "Pendiente", color: "#ffb800" },
  revisada:  { label: "Revisada",  color: "#00d4ff" },
  aprobada:  { label: "Aprobada",  color: "#39ff14" },
  rechazada: { label: "Rechazada", color: "#ff3b3b" },
};
const TIPOS = { consola: "🎮", computador: "💻", celular: "📱", tablet: "📱", otro: "🔧" };
const PROGRESS_STEPS = ["pendiente", "diagnostico", "cotizado", "aprobado", "en_reparacion", "reparado", "entregado"];

const fmtDate = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const fmtFull = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtCOP  = (v) => v != null ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v) : null;

function parseFotos(raw) {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}

/* ─── Badge ─── */
function Badge({ estado, map }) {
  const cfg = map[estado] ?? { label: estado, color: "#888" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:0.4, background:`${cfg.color}18`, color:cfg.color, border:`1px solid ${cfg.color}30`, fontFamily:"'JetBrains Mono',monospace", whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.color }} />
      {cfg.label}
    </span>
  );
}

/* ─── Barra de progreso ─── */
function ProgressBar({ estado, color }) {
  if (estado === "cancelado") return (
    <div style={{ display:"flex", alignItems:"center", gap:6, margin:"10px 0 8px" }}>
      <div style={{ flex:1, height:3, borderRadius:2, background:"#ff3b3b22" }}>
        <div style={{ height:"100%", width:"100%", background:"#ff3b3b", borderRadius:2 }} />
      </div>
      <span style={{ fontSize:9, color:"#ff3b3b", fontWeight:700 }}>CANCELADO</span>
    </div>
  );
  const idx = PROGRESS_STEPS.indexOf(estado);
  const pct = idx === -1 ? 0 : Math.round(((idx + 1) / PROGRESS_STEPS.length) * 100);
  return (
    <div style={{ margin:"10px 0 8px" }}>
      <div style={{ height:3, background:"#1e1e1e", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, transition:"width 0.5s" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        <span style={{ fontSize:9, color:"#555" }}>Recibido</span>
        <span style={{ fontSize:9, color, fontWeight:700 }}>{pct}%</span>
        <span style={{ fontSize:9, color:"#555" }}>Entregado</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════ */
export default function DashboardCliente() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reparaciones, setReparaciones] = useState([]);
  const [cotizaciones, setCotizaciones]  = useState([]);
  const [loading, setLoading]            = useState(true);
  const [tab, setTab]                    = useState("reparaciones");
  const [detail, setDetail]              = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/reparaciones/mis-reparaciones").then(r => setReparaciones(r.data)).catch(() => {}),
      api.get("/api/cotizaciones/mis-cotizaciones").then(r => setCotizaciones(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#080808" }}>
      <div className="dc-spinner" />
      <style>{`
        .dc-spinner { width:28px; height:28px; border:2px solid #1a1a1a; border-top-color:#39ff14; border-radius:50%; animation:dc-spin .7s linear infinite; }
        @keyframes dc-spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* ══════════════ DESKTOP ══════════════ */}
      <div className="dc-desktop">
        {detail
          ? <DesktopDetail rep={detail} onBack={() => setDetail(null)} />
          : <DesktopMain user={user} reparaciones={reparaciones} cotizaciones={cotizaciones} tab={tab} setTab={setTab} onDetail={setDetail} onLogout={handleLogout} />
        }
      </div>

      {/* ══════════════ MOBILE ══════════════ */}
      <div className="dc-mobile">
        {detail
          ? <MobileDetail rep={detail} onBack={() => setDetail(null)} />
          : <MobileMain user={user} reparaciones={reparaciones} cotizaciones={cotizaciones} tab={tab} setTab={setTab} onDetail={setDetail} onLogout={handleLogout} />
        }
      </div>
    </>
  );
}

/* ════════════════════════════════════
   DESKTOP — MAIN
════════════════════════════════════ */
function DesktopMain({ user, reparaciones, cotizaciones, tab, setTab, onDetail, onLogout }) {
  const enProceso = reparaciones.filter(r => !["entregado","cancelado"].includes(r.estado)).length;

  return (
    <div className="dc-dt-root">
      {/* Sidebar */}
      <aside className="dc-sidebar">
        <Link to="/" className="dc-brand">
          <div className="dc-brand-icon"><Wrench size={13} color="#000" strokeWidth={2.5} /></div>
          <div>
            <div className="dc-brand-name">JUNIOR</div>
            <div className="dc-brand-sub">TECHNICAL SERVICE</div>
          </div>
        </Link>

        {/* Avatar usuario */}
        <div className="dc-user-block">
          <div className="dc-user-av">{user?.nombre?.charAt(0)?.toUpperCase()}</div>
          <div className="dc-user-info">
            <div className="dc-user-name">{user?.nombre}</div>
            <div className="dc-user-email">{user?.email}</div>
            <span className="dc-user-badge">CLIENTE</span>
          </div>
        </div>

        {/* Stats */}
        <div className="dc-sidebar-stats">
          <div className="dc-ss-card" style={{ borderColor:"#39ff1422" }}>
            <div className="dc-ss-num" style={{ color:"#39ff14" }}>{reparaciones.length}</div>
            <div className="dc-ss-lbl">Reparaciones</div>
          </div>
          <div className="dc-ss-card" style={{ borderColor:"#ffb80022" }}>
            <div className="dc-ss-num" style={{ color:"#ffb800" }}>{enProceso}</div>
            <div className="dc-ss-lbl">En proceso</div>
          </div>
          <div className="dc-ss-card" style={{ borderColor:"#00d4ff22" }}>
            <div className="dc-ss-num" style={{ color:"#00d4ff" }}>{cotizaciones.length}</div>
            <div className="dc-ss-lbl">Cotizaciones</div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="dc-sidebar-nav">
          <div className="dc-nav-label">SECCIONES</div>
          <button onClick={() => setTab("reparaciones")} className={`dc-nav-item${tab==="reparaciones"?" active":""}`}>
            <span className={`dc-nav-icon${tab==="reparaciones"?" active":""}`}><Wrench size={14} /></span>
            <span>Mis Reparaciones</span>
            {reparaciones.length > 0 && <span className="dc-nav-cnt">{reparaciones.length}</span>}
            {tab==="reparaciones" && <ChevronRight size={12} style={{ marginLeft:"auto", color:"#39ff14" }} />}
          </button>
          <button onClick={() => setTab("cotizaciones")} className={`dc-nav-item${tab==="cotizaciones"?" active":""}`}>
            <span className={`dc-nav-icon${tab==="cotizaciones"?" active":""}`}><FileText size={14} /></span>
            <span>Mis Cotizaciones</span>
            {cotizaciones.length > 0 && <span className="dc-nav-cnt">{cotizaciones.length}</span>}
            {tab==="cotizaciones" && <ChevronRight size={12} style={{ marginLeft:"auto", color:"#39ff14" }} />}
          </button>
        </nav>

        {/* Footer */}
        <div className="dc-sidebar-footer">
          <Link to="/" className="dc-foot-btn"><Home size={14} /> Inicio</Link>
          <button onClick={onLogout} className="dc-foot-btn danger"><LogOut size={14} /> Cerrar sesión</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dc-dt-main">
        <div className="dc-dt-head">
          <div>
            <div className="dc-dt-greet">Bienvenido de nuevo,</div>
            <h1 className="dc-dt-title">{user?.nombre?.split(" ")[0]}</h1>
          </div>
        </div>

        {/* Tabla reparaciones */}
        {tab === "reparaciones" && (
          reparaciones.length === 0
            ? <DesktopEmpty icon={<Wrench size={42} color="#1e1e1e" />} text="No tienes reparaciones registradas" sub="Cuando el taller registre tu equipo aparecerá aquí" />
            : (
              <div className="dc-table-wrap">
                <table className="dc-table">
                  <thead>
                    <tr>
                      {["Equipo","Estado","Progreso","Descripción","Precio","Fecha",""].map(h => (
                        <th key={h} className="dc-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reparaciones.map(rep => {
                      const cfg = REP_ESTADOS[rep.estado] ?? { color:"#888" };
                      const idx = PROGRESS_STEPS.indexOf(rep.estado);
                      const pct = rep.estado === "cancelado" ? 100 : idx === -1 ? 0 : Math.round(((idx+1)/PROGRESS_STEPS.length)*100);
                      const fotos = parseFotos(rep.fotos);
                      return (
                        <tr key={rep.id} className="dc-tr" onClick={() => onDetail(rep)}>
                          <td className="dc-td">
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <span style={{ fontSize:22, lineHeight:1 }}>{TIPOS[rep.tipoEquipo]??"🔧"}</span>
                              <div>
                                <div className="dc-td-main">{rep.marca} {rep.modelo}</div>
                                <div className="dc-td-sub">{rep.codigo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="dc-td"><Badge estado={rep.estado} map={REP_ESTADOS} /></td>
                          <td className="dc-td">
                            <div style={{ width:90 }}>
                              <div style={{ height:4, background:"#1a1a1a", borderRadius:2, overflow:"hidden", marginBottom:3 }}>
                                <div style={{ height:"100%", width:`${pct}%`, background: rep.estado==="cancelado"?"#ff3b3b":cfg.color, borderRadius:2 }} />
                              </div>
                              <div style={{ fontSize:9, color:cfg.color, fontWeight:700 }}>{pct}%</div>
                            </div>
                          </td>
                          <td className="dc-td">
                            <span className="dc-td-desc">{rep.descripcionProblema}</span>
                          </td>
                          <td className="dc-td">
                            <span style={{ fontSize:12, color:rep.precio?"#39ff14":"#555", fontWeight:rep.precio?700:400 }}>
                              {rep.precio ? fmtCOP(rep.precio) : "—"}
                            </span>
                          </td>
                          <td className="dc-td"><span className="dc-td-sub">{fmtDate(rep.createdAt)}</span></td>
                          <td className="dc-td">
                            <button className="dc-ver-btn" onClick={e => { e.stopPropagation(); onDetail(rep); }}>
                              Ver <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
        )}

        {/* Tabla cotizaciones */}
        {tab === "cotizaciones" && (
          cotizaciones.length === 0
            ? <DesktopEmpty icon={<FileText size={42} color="#1e1e1e" />} text="No tienes cotizaciones" sub="Solicita una desde la página de inicio" />
            : (
              <div className="dc-table-wrap">
                <table className="dc-table">
                  <thead>
                    <tr>
                      {["Equipo","Estado","Problema","Presupuesto","Nota del taller","Fecha"].map(h => (
                        <th key={h} className="dc-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cotizaciones.map(cot => (
                      <tr key={cot.id} className="dc-tr-plain">
                        <td className="dc-td">
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontSize:20, lineHeight:1 }}>{TIPOS[cot.tipoEquipo]??"🔧"}</span>
                            <div>
                              <div className="dc-td-main">{cot.marca} {cot.modelo}</div>
                              <div className="dc-td-sub">{cot.codigo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="dc-td"><Badge estado={cot.estado??"pendiente"} map={COT_ESTADOS} /></td>
                        <td className="dc-td"><span className="dc-td-desc">{cot.descripcion}</span></td>
                        <td className="dc-td">
                          <span style={{ fontSize:13, color:cot.precioEstimado?"#39ff14":"#555", fontWeight:700 }}>
                            {cot.precioEstimado ? fmtCOP(cot.precioEstimado) : "—"}
                          </span>
                        </td>
                        <td className="dc-td">
                          {cot.notasAdmin
                            ? <span style={{ fontSize:12, color:"#aaa", fontStyle:"italic" }}>{cot.notasAdmin}</span>
                            : <span style={{ fontSize:11, color:"#333" }}>Sin respuesta aún</span>}
                        </td>
                        <td className="dc-td"><span className="dc-td-sub">{fmtDate(cot.createdAt)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}
      </main>
    </div>
  );
}

/* ════════════════════════════════════
   DESKTOP — DETALLE
════════════════════════════════════ */
function DesktopDetail({ rep, onBack }) {
  const cfg   = REP_ESTADOS[rep.estado] ?? { label: rep.estado, color:"#888" };
  const fotos = parseFotos(rep.fotos);

  return (
    <div className="dc-dt-root">
      <aside className="dc-sidebar dc-sidebar-narrow">
        <Link to="/" className="dc-brand">
          <div className="dc-brand-icon"><Wrench size={13} color="#000" strokeWidth={2.5} /></div>
          <div>
            <div className="dc-brand-name">JUNIOR</div>
            <div className="dc-brand-sub">TECHNICAL SERVICE</div>
          </div>
        </Link>
        <button className="dc-back-dt" onClick={onBack}>
          <ArrowLeft size={15} color="#39ff14" />
          <span>Volver al dashboard</span>
        </button>
        <div className="dc-detail-mini">
          <div className="dc-dm-code">{rep.codigo}</div>
          <Badge estado={rep.estado} map={REP_ESTADOS} />
          <div className="dc-dm-equipo">{TIPOS[rep.tipoEquipo]??'🔧'} {rep.marca} {rep.modelo}</div>
          <div className="dc-dm-fecha">Ingresado el {fmtFull(rep.createdAt)}</div>
        </div>
      </aside>

      <main className="dc-dt-main">
        <div className="dc-detail-grid">
          {/* Columna izquierda */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Estado actual */}
            <div className="dc-det-card">
              <div className="dc-det-card-title">Estado actual</div>
              <ProgressBar estado={rep.estado} color={cfg.color} />
              <div style={{ fontSize:14, color:cfg.color, fontWeight:700, textAlign:"center", marginTop:6 }}>{cfg.label}</div>
            </div>

            {/* Info equipo */}
            <div className="dc-det-card">
              <div className="dc-det-card-title">Información del equipo</div>
              <DTRow label="Tipo"      val={`${TIPOS[rep.tipoEquipo]??'🔧'} ${rep.tipoEquipo}`} />
              <DTRow label="Marca"     val={rep.marca} />
              <DTRow label="Modelo"    val={rep.modelo} />
              {rep.precio != null && <DTRow label="Precio" val={fmtCOP(rep.precio)} hl />}
            </div>

            {/* Fotos */}
            {fotos.length > 0 && (
              <div className="dc-det-card">
                <div className="dc-det-card-title">Fotos ({fotos.length})</div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {fotos.map((f,i) => (
                    <img key={i} src={f} alt={`Foto ${i+1}`}
                      style={{ width:100, height:100, borderRadius:10, objectFit:"cover", border:"1px solid #2a2a2a", cursor:"zoom-in" }}
                      onClick={() => window.open(f,"_blank")}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Problema */}
            <div className="dc-det-card">
              <div className="dc-det-card-title">Problema reportado</div>
              <p style={{ fontSize:14, color:"#aaa", lineHeight:1.8, margin:0 }}>{rep.descripcionProblema}</p>
              {rep.diagnostico && (
                <>
                  <div className="dc-det-card-title" style={{ marginTop:14 }}>Diagnóstico</div>
                  <p style={{ fontSize:14, color:"#aaa", lineHeight:1.8, margin:0 }}>{rep.diagnostico}</p>
                </>
              )}
            </div>

            {/* Historial */}
            <div className="dc-det-card" style={{ flex:1 }}>
              <div className="dc-det-card-title">Historial de estados ({rep.historial?.length ?? 0})</div>
              {(rep.historial ?? []).length === 0
                ? <p style={{ fontSize:13, color:"#444" }}>Sin historial aún</p>
                : rep.historial.map((h, i) => {
                  const hc = REP_ESTADOS[h.estadoNuevo] ?? { color:"#888" };
                  return (
                    <div key={i} style={{ display:"flex", gap:14, padding:"12px 0", borderBottom:"1px solid #111" }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:hc.color, flexShrink:0, marginTop:4 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                          <span style={{ fontSize:12, color:"#555" }}>{h.estadoAnterior}</span>
                          <ArrowRight size={11} color="#39ff14" />
                          <span style={{ fontSize:12, color:"#eee", fontWeight:700 }}>{h.estadoNuevo}</span>
                        </div>
                        {h.notas && <p style={{ fontSize:13, color:"#666", margin:"3px 0" }}>{h.notas}</p>}
                        <div style={{ fontSize:11, color:"#444" }}>{fmtFull(h.createdAt)} · por {h.creadoPor}</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DesktopEmpty({ icon, text, sub }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 20px", gap:14 }}>
      {icon}
      <div style={{ fontSize:15, color:"#555", fontWeight:700 }}>{text}</div>
      {sub && <div style={{ fontSize:13, color:"#333" }}>{sub}</div>}
    </div>
  );
}
function DTRow({ label, val, hl }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #111" }}>
      <span style={{ fontSize:12, color:"#666" }}>{label}</span>
      <span style={{ fontSize:13, color:hl?"#39ff14":"#ccc", fontWeight:hl?700:400 }}>{val}</span>
    </div>
  );
}

/* ════════════════════════════════════
   MOBILE — MAIN
════════════════════════════════════ */
function MobileMain({ user, reparaciones, cotizaciones, tab, setTab, onDetail, onLogout }) {
  const enProceso = reparaciones.filter(r => !["entregado","cancelado"].includes(r.estado)).length;

  return (
    <div className="dc-mb-root">
      <header className="dc-mb-topbar">
        <Link to="/" className="dc-brand-mb">
          <div className="dc-brand-icon-mb"><Wrench size={12} color="#000" strokeWidth={2.5} /></div>
          <div>
            <div className="dc-brand-name">JUNIOR</div>
            <div className="dc-brand-sub">Technical Service</div>
          </div>
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div className="dc-mb-avatar">{user?.nombre?.charAt(0)?.toUpperCase()}</div>
          <button className="dc-mb-logout" onClick={onLogout}><LogOut size={15} color="#ff3b3b" /></button>
        </div>
      </header>

      <div className="dc-mb-greet">
        <div className="dc-mb-greet-sub">Bienvenido,</div>
        <div className="dc-mb-greet-name">{user?.nombre?.split(" ")[0]}</div>
      </div>

      <div className="dc-mb-stats">
        <MBStat label="Reparaciones" value={reparaciones.length} color="#39ff14" />
        <MBStat label="En proceso"   value={enProceso}            color="#ffb800" />
        <MBStat label="Cotizaciones" value={cotizaciones.length}  color="#00d4ff" />
      </div>

      <div className="dc-mb-tabs">
        <button className={`dc-mb-tab${tab==="reparaciones"?" active":""}`} onClick={() => setTab("reparaciones")}>
          <Wrench size={13} /> Reparaciones
          {reparaciones.length > 0 && <span className="dc-mb-tab-cnt">{reparaciones.length}</span>}
        </button>
        <button className={`dc-mb-tab${tab==="cotizaciones"?" active":""}`} onClick={() => setTab("cotizaciones")}>
          <FileText size={13} /> Cotizaciones
          {cotizaciones.length > 0 && <span className="dc-mb-tab-cnt">{cotizaciones.length}</span>}
        </button>
      </div>

      <div className="dc-mb-content">
        {tab === "reparaciones" && (
          reparaciones.length === 0
            ? <MBEmpty icon={<Wrench size={36} color="#222" />} text="No tienes reparaciones registradas" sub="Cuando el taller registre tu equipo aparecerá aquí" />
            : reparaciones.map(rep => <MBRepCard key={rep.id} rep={rep} onClick={() => onDetail(rep)} />)
        )}
        {tab === "cotizaciones" && (
          cotizaciones.length === 0
            ? <MBEmpty icon={<FileText size={36} color="#222" />} text="No tienes cotizaciones" sub="Solicita una desde la página de inicio" />
            : cotizaciones.map(cot => <MBCotCard key={cot.id} cot={cot} />)
        )}
      </div>
    </div>
  );
}

function MBStat({ label, value, color }) {
  return (
    <div className="dc-mb-stat" style={{ borderColor:`${color}22` }}>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:22, fontWeight:900, color, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:9, color:"#555", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</div>
    </div>
  );
}

function MBRepCard({ rep, onClick }) {
  const cfg = REP_ESTADOS[rep.estado] ?? { label:rep.estado, color:"#888" };
  const tipo = TIPOS[rep.tipoEquipo] ?? "🔧";
  return (
    <div className="dc-mb-card dc-tap" onClick={onClick}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22, lineHeight:1 }}>{tipo}</span>
          <div>
            <div style={{ fontSize:14, color:"#ddd", fontWeight:700 }}>{rep.marca} {rep.modelo}</div>
            <div style={{ fontSize:10, color:"#666", textTransform:"capitalize", marginTop:2 }}>{rep.tipoEquipo}</div>
          </div>
        </div>
        <Badge estado={rep.estado} map={REP_ESTADOS} />
      </div>
      <ProgressBar estado={rep.estado} color={cfg.color} />
      <p style={{ fontSize:12, color:"#777", lineHeight:1.5, margin:"0 0 8px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
        {rep.descripcionProblema}
      </p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <Hash size={9} color="#555" />
          <span style={{ fontSize:10, color:"#555", fontWeight:700 }}>{rep.codigo}</span>
          <span style={{ fontSize:10, color:"#444" }}> · {fmtDate(rep.createdAt)}</span>
        </div>
        <span style={{ display:"flex", alignItems:"center", gap:2, fontSize:11, color:"#39ff14", fontWeight:700 }}>
          Ver detalle <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}

function MBCotCard({ cot }) {
  const tipo = TIPOS[cot.tipoEquipo] ?? "🔧";
  return (
    <div className="dc-mb-card">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22, lineHeight:1 }}>{tipo}</span>
          <div>
            <div style={{ fontSize:14, color:"#ddd", fontWeight:700 }}>{cot.marca} {cot.modelo}</div>
            <div style={{ fontSize:10, color:"#666", textTransform:"capitalize", marginTop:2 }}>{cot.tipoEquipo}</div>
          </div>
        </div>
        <Badge estado={cot.estado??"pendiente"} map={COT_ESTADOS} />
      </div>
      <p style={{ fontSize:12, color:"#777", lineHeight:1.5, margin:"0 0 8px" }}>{cot.descripcion}</p>
      {cot.precioEstimado && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#0a0a0a", borderRadius:8, padding:"8px 12px", marginBottom:8 }}>
          <span style={{ color:"#888", fontSize:11 }}>Presupuesto estimado</span>
          <span style={{ color:"#39ff14", fontWeight:700, fontFamily:"'Orbitron',sans-serif" }}>{fmtCOP(cot.precioEstimado)}</span>
        </div>
      )}
      {cot.notasAdmin && (
        <div style={{ background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
          <span style={{ fontSize:9, color:"#39ff14", fontWeight:700, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:4 }}>Nota del taller</span>
          <p style={{ fontSize:12, color:"#ccc", margin:0, lineHeight:1.6 }}>{cot.notasAdmin}</p>
        </div>
      )}
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <Hash size={9} color="#555" />
        <span style={{ fontSize:10, color:"#555", fontWeight:700 }}>{cot.codigo}</span>
        <span style={{ fontSize:10, color:"#444" }}> · {fmtDate(cot.createdAt)}</span>
      </div>
    </div>
  );
}

function MBEmpty({ icon, text, sub }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"50px 20px", gap:12 }}>
      {icon}
      <div style={{ fontSize:14, color:"#555", fontWeight:700, textAlign:"center" }}>{text}</div>
      {sub && <div style={{ fontSize:12, color:"#333", textAlign:"center" }}>{sub}</div>}
    </div>
  );
}

/* ════════════════════════════════════
   MOBILE — DETALLE
════════════════════════════════════ */
function MobileDetail({ rep, onBack }) {
  const cfg   = REP_ESTADOS[rep.estado] ?? { label:rep.estado, color:"#888" };
  const fotos = parseFotos(rep.fotos);

  return (
    <div className="dc-mb-root">
      <header className="dc-mb-topbar">
        <button className="dc-mb-back dc-tap" onClick={onBack}>
          <ArrowLeft size={16} color="#39ff14" />
          <span style={{ color:"#39ff14", fontSize:13, fontWeight:700 }}>Volver</span>
        </button>
      </header>

      <div style={{ padding:"16px 16px 80px", display:"flex", flexDirection:"column", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color:"#39ff14", fontWeight:900 }}>{rep.codigo}</span>
            <Badge estado={rep.estado} map={REP_ESTADOS} />
          </div>
          <div style={{ fontSize:20, color:"#efefef", fontWeight:700, marginBottom:4 }}>
            {TIPOS[rep.tipoEquipo]??'🔧'} {rep.marca} {rep.modelo}
          </div>
          <div style={{ fontSize:11, color:"#666" }}>Ingresado el {fmtFull(rep.createdAt)}</div>
        </div>

        <div className="dc-mb-det-card">
          <div className="dc-mb-det-title">Estado actual</div>
          <ProgressBar estado={rep.estado} color={cfg.color} />
          <div style={{ fontSize:13, color:cfg.color, fontWeight:700, textAlign:"center", marginTop:4 }}>{cfg.label}</div>
        </div>

        <div className="dc-mb-det-card">
          <div className="dc-mb-det-title">Información del equipo</div>
          <MBRow label="Tipo"    val={`${TIPOS[rep.tipoEquipo]??'🔧'} ${rep.tipoEquipo}`} />
          <MBRow label="Marca"   val={rep.marca} />
          <MBRow label="Modelo"  val={rep.modelo} />
          {rep.precio != null && <MBRow label="Precio" val={fmtCOP(rep.precio)} hl />}
        </div>

        <div className="dc-mb-det-card">
          <div className="dc-mb-det-title">Problema reportado</div>
          <p style={{ fontSize:13, color:"#aaa", lineHeight:1.7, margin:0 }}>{rep.descripcionProblema}</p>
          {rep.diagnostico && <>
            <div className="dc-mb-det-title" style={{ marginTop:12 }}>Diagnóstico</div>
            <p style={{ fontSize:13, color:"#aaa", lineHeight:1.7, margin:0 }}>{rep.diagnostico}</p>
          </>}
        </div>

        {fotos.length > 0 && (
          <div className="dc-mb-det-card">
            <div className="dc-mb-det-title">Fotos ({fotos.length})</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {fotos.map((f,i) => (
                <img key={i} src={f} alt={`Foto ${i+1}`}
                  style={{ width:90, height:90, borderRadius:10, objectFit:"cover", border:"1px solid #2a2a2a" }}
                  onClick={() => window.open(f,"_blank")}
                />
              ))}
            </div>
          </div>
        )}

        <div className="dc-mb-det-card">
          <div className="dc-mb-det-title">Historial ({rep.historial?.length ?? 0})</div>
          {(rep.historial ?? []).length === 0
            ? <p style={{ fontSize:12, color:"#444" }}>Sin historial aún</p>
            : rep.historial.map((h, i) => {
              const hc = REP_ESTADOS[h.estadoNuevo] ?? { color:"#888" };
              return (
                <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:"1px solid #111" }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:hc.color, flexShrink:0, marginTop:3 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                      <span style={{ fontSize:11, color:"#555" }}>{h.estadoAnterior}</span>
                      <ArrowRight size={10} color="#39ff14" />
                      <span style={{ fontSize:11, color:"#eee", fontWeight:700 }}>{h.estadoNuevo}</span>
                    </div>
                    {h.notas && <p style={{ fontSize:12, color:"#666", margin:"2px 0" }}>{h.notas}</p>}
                    <div style={{ fontSize:10, color:"#444" }}>{fmtFull(h.createdAt)} · por {h.creadoPor}</div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

function MBRow({ label, val, hl }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"8px 0", borderBottom:"1px solid #111", gap:12 }}>
      <span style={{ fontSize:11, color:"#666", flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12, color:hl?"#39ff14":"#ccc", fontWeight:hl?700:400, textAlign:"right" }}>{val}</span>
    </div>
  );
}

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { background: #080808; font-family: 'JetBrains Mono', monospace; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }

/* ── Visibilidad responsive ── */
.dc-desktop { display: flex; min-height: 100vh; }
.dc-mobile  { display: none; }
@media (max-width: 767px) {
  .dc-desktop { display: none; }
  .dc-mobile  { display: block; }
}

/* ══════════════ DESKTOP ══════════════ */
.dc-dt-root { display: flex; min-height: 100vh; width: 100%; }

.dc-sidebar {
  width: 260px; min-width: 260px; background: #0d0d0d;
  border-right: 1px solid #1e1e1e; display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}
.dc-sidebar-narrow { width: 240px; min-width: 240px; }

.dc-brand { display: flex; align-items: center; gap: 10px; padding: 18px 16px; border-bottom: 1px solid #1e1e1e; text-decoration: none; }
.dc-brand-icon { width: 30px; height: 30px; border-radius: 8px; background: #39ff14; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dc-brand-name { font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 900; color: #39ff14; letter-spacing: 2.5px; line-height: 1; }
.dc-brand-sub  { font-size: 7px; color: #555; letter-spacing: 1.5px; margin-top: 2px; }

.dc-user-block { display: flex; align-items: center; gap: 12px; padding: 18px 16px; border-bottom: 1px solid #1e1e1e; }
.dc-user-av    { width: 42px; height: 42px; border-radius: 50%; background: rgba(57,255,20,0.12); border: 1px solid rgba(57,255,20,0.3); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 900; color: #39ff14; flex-shrink: 0; }
.dc-user-info  { min-width: 0; }
.dc-user-name  { font-size: 13px; color: #eee; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dc-user-email { font-size: 10px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.dc-user-badge { display: inline-block; margin-top: 5px; font-size: 9px; font-weight: 700; color: #39ff14; background: rgba(57,255,20,0.1); border: 1px solid rgba(57,255,20,0.25); border-radius: 4px; padding: 2px 6px; letter-spacing: 1px; }

.dc-sidebar-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; padding: 14px 16px; border-bottom: 1px solid #1e1e1e; }
.dc-ss-card  { background: #131313; border-radius: 10px; border: 1px solid #1e1e1e; padding: 10px 8px; text-align: center; }
.dc-ss-num   { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
.dc-ss-lbl   { font-size: 8px; color: #555; font-weight: 700; text-transform: uppercase; }

.dc-sidebar-nav  { padding: 14px 10px; flex: 1; }
.dc-nav-label    { font-size: 9px; color: #555; letter-spacing: 2px; padding: 0 6px; margin-bottom: 8px; font-weight: 700; }
.dc-nav-item     { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 8px; background: none; border: none; cursor: pointer; color: #666; margin-bottom: 2px; font-family: 'JetBrains Mono', monospace; font-size: 12px; text-align: left; transition: all 0.15s; }
.dc-nav-item:hover { background: #141414; color: #888; }
.dc-nav-item.active { background: rgba(57,255,20,0.08); border: 1px solid rgba(57,255,20,0.18); color: #39ff14; }
.dc-nav-icon       { width: 26px; height: 26px; border-radius: 6px; background: #141414; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dc-nav-icon.active { background: rgba(57,255,20,0.15); }
.dc-nav-cnt  { background: rgba(57,255,20,0.12); color: #39ff14; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 700; margin-left: auto; }

.dc-sidebar-footer { padding: 12px 10px; border-top: 1px solid #1a1a1a; display: flex; flex-direction: column; gap: 4px; }
.dc-foot-btn       { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; background: none; border: 1px solid #1e1e1e; border-radius: 8px; cursor: pointer; font-size: 12px; color: #666; font-family: 'JetBrains Mono', monospace; text-decoration: none; transition: all 0.15s; }
.dc-foot-btn:hover       { border-color: #2a2a2a; color: #888; }
.dc-foot-btn.danger      { color: #ff3b3b; border-color: rgba(255,59,59,0.2); }
.dc-foot-btn.danger:hover{ background: rgba(255,59,59,0.08); }

.dc-dt-main  { flex: 1; overflow-y: auto; padding: 28px 36px; }
.dc-dt-head  { margin-bottom: 24px; }
.dc-dt-greet { font-size: 12px; color: #555; margin-bottom: 5px; }
.dc-dt-title { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 900; color: #efefef; margin: 0; }

.dc-table-wrap { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 12px; overflow: hidden; }
.dc-table { width: 100%; border-collapse: collapse; }
.dc-th    { padding: 11px 18px; text-align: left; font-size: 9px; color: #555; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; }
.dc-tr    { border-bottom: 1px solid #0f0f0f; cursor: pointer; transition: background 0.1s; }
.dc-tr:hover { background: #0f0f0f; }
.dc-tr-plain { border-bottom: 1px solid #0f0f0f; }
.dc-td       { padding: 14px 18px; font-size: 12px; color: #888; }
.dc-td-main  { font-size: 13px; color: #eee; font-weight: 700; margin-bottom: 2px; }
.dc-td-sub   { font-size: 10px; color: #555; }
.dc-td-desc  { font-size: 12px; color: #777; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 200px; }
.dc-ver-btn  { display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: none; border: 1px solid #1e1e1e; border-radius: 7px; cursor: pointer; font-size: 11px; color: #555; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
.dc-ver-btn:hover { border-color: #39ff14; color: #39ff14; }

.dc-back-dt { display: flex; align-items: center; gap: 8px; margin: 16px; padding: 10px 14px; background: rgba(57,255,20,0.06); border: 1px solid rgba(57,255,20,0.2); border-radius: 9px; cursor: pointer; font-size: 12px; font-weight: 700; color: #39ff14; font-family: 'JetBrains Mono', monospace; }
.dc-back-dt:hover { background: rgba(57,255,20,0.1); }
.dc-detail-mini  { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.dc-dm-code  { font-family: 'Orbitron', sans-serif; font-size: 16px; color: #39ff14; font-weight: 900; }
.dc-dm-equipo { font-size: 14px; color: #ccc; font-weight: 700; margin-top: 4px; }
.dc-dm-fecha  { font-size: 11px; color: #555; }

.dc-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.dc-det-card { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 14px; padding: 16px 18px; }
.dc-det-card-title { font-size: 9px; color: #555; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 14px; }

/* ══════════════ MOBILE ══════════════ */
.dc-mb-root    { min-height: 100dvh; background: #080808; max-width: 480px; margin: 0 auto; }
.dc-mb-topbar  { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #0d0d0d; border-bottom: 1px solid #1e1e1e; position: sticky; top: 0; z-index: 50; }
.dc-brand-mb   { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.dc-brand-icon-mb { width: 30px; height: 30px; border-radius: 8px; background: #39ff14; display: flex; align-items: center; justify-content: center; }
.dc-mb-avatar  { width: 32px; height: 32px; border-radius: 50%; background: rgba(57,255,20,0.12); border: 1px solid rgba(57,255,20,0.3); display: flex; align-items: center; justify-content: center; color: #39ff14; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 900; }
.dc-mb-logout  { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,59,59,0.08); border: 1px solid rgba(255,59,59,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.dc-mb-back    { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; }
.dc-mb-greet   { padding: 20px 16px 14px; }
.dc-mb-greet-sub  { font-size: 11px; color: "#555"; margin-bottom: 4px; }
.dc-mb-greet-name { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 900; color: #efefef; }
.dc-mb-stats   { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 0 16px 14px; }
.dc-mb-stat    { background: #0d0d0d; border-radius: 12px; border: 1px solid #1e1e1e; padding: 12px 10px; }
.dc-mb-tabs    { display: flex; margin: 0 16px 14px; background: #0d0d0d; border-radius: 12px; border: 1px solid #1e1e1e; padding: 4px; }
.dc-mb-tab     { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 8px; border-radius: 9px; background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 700; color: #555; font-family: 'JetBrains Mono', monospace; transition: all 0.15s; }
.dc-mb-tab.active { background: rgba(57,255,20,0.1); color: #39ff14; border: 1px solid rgba(57,255,20,0.3); }
.dc-mb-tab-cnt { background: rgba(57,255,20,0.15); color: #39ff14; border-radius: 10px; padding: 1px 6px; font-size: 9px; font-weight: 700; }
.dc-mb-content { padding: 0 16px 80px; display: flex; flex-direction: column; gap: 10px; }
.dc-mb-card    { background: #0d0d0d; border-radius: 16px; border: 1px solid #1e1e1e; padding: 14px; cursor: pointer; }
.dc-mb-card:active { background: #0f0f0f; }

.dc-mb-det-card  { background: #0d0d0d; border-radius: 14px; border: 1px solid #1e1e1e; padding: 14px 16px; }
.dc-mb-det-title { font-size: 9px; color: #555; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 12px; }

.dc-tap:active { opacity: 0.7; transform: scale(0.98); }
`;