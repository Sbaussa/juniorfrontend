import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import api from "../utils/api";
import {
  Package, Clock, CheckCircle, AlertCircle, ChevronRight,
  Wrench, FileText, ArrowLeft, Home, LogOut, Hash, ArrowRight,
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
  pendiente:  { label: "Pendiente",  color: "#ffb800" },
  revisada:   { label: "Revisada",   color: "#00d4ff" },
  aprobada:   { label: "Aprobada",   color: "#39ff14" },
  rechazada:  { label: "Rechazada",  color: "#ff3b3b" },
};

const TIPOS = { consola: "🎮", computador: "💻", celular: "📱" };

const fmtDate = (d) => new Date(d).toLocaleDateString("es-CO", {
  day: "2-digit", month: "short", year: "numeric",
});
const fmtFull = (d) => new Date(d).toLocaleDateString("es-CO", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});
const fmtCOP = (v) => v != null
  ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v)
  : null;

/* ─── Badge ─── */
function Badge({ estado, map }) {
  const cfg = map[estado] ?? { label: estado, color: "#888" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
      background: `${cfg.color}18`, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      fontFamily: "'JetBrains Mono', monospace",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />
      {cfg.label}
    </span>
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
  const [tab, setTab]                    = useState("reparaciones"); // "reparaciones" | "cotizaciones"
  const [detail, setDetail]              = useState(null); // reparación seleccionada

  useEffect(() => {
    Promise.all([
      api.get("/api/reparaciones/mis-reparaciones").then(r => setReparaciones(r.data)).catch(() => {}),
      api.get("/api/cotizaciones/mis-cotizaciones").then(r => setCotizaciones(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#080808" }}>
      <div className="dc-spinner" />
      <style>{spinnerCSS}</style>
    </div>
  );

  /* Vista detalle de una reparación */
  if (detail) return <ReparacionDetail rep={detail} onBack={() => setDetail(null)} />;

  /* ── Vista principal ── */
  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* Top bar */}
      <header style={S.topBar}>
        <Link to="/" style={S.brand}>
          <div style={S.brandIcon}><Wrench size={12} color="#000" strokeWidth={2.5} /></div>
          <div>
            <div style={S.brandName}>JUNIOR</div>
            <div style={S.brandSub}>Technical Service</div>
          </div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={S.avatar}>{user?.nombre?.charAt(0)?.toUpperCase()}</div>
          <button style={S.logoutBtn} onClick={handleLogout} className="dc-tap">
            <LogOut size={15} color="#ff3b3b" />
          </button>
        </div>
      </header>

      {/* Greeting */}
      <div style={S.greeting}>
        <div>
          <div style={S.greetSub}>Bienvenido,</div>
          <div style={S.greetName}>{user?.nombre?.split(" ")[0]}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsGrid}>
        <StatCard label="Reparaciones" value={reparaciones.length} color="#39ff14" Icon={Wrench} />
        <StatCard
          label="En proceso"
          value={reparaciones.filter(r => !["entregado", "cancelado"].includes(r.estado)).length}
          color="#ffb800"
          Icon={Clock}
        />
        <StatCard label="Cotizaciones" value={cotizaciones.length} color="#00d4ff" Icon={FileText} />
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        <button
          style={{ ...S.tab, ...(tab === "reparaciones" ? S.tabActive : {}) }}
          onClick={() => setTab("reparaciones")}
        >
          <Wrench size={14} /> Reparaciones
          {reparaciones.length > 0 && <span style={S.tabBadge}>{reparaciones.length}</span>}
        </button>
        <button
          style={{ ...S.tab, ...(tab === "cotizaciones" ? S.tabActive : {}) }}
          onClick={() => setTab("cotizaciones")}
        >
          <FileText size={14} /> Cotizaciones
          {cotizaciones.length > 0 && <span style={S.tabBadge}>{cotizaciones.length}</span>}
        </button>
      </div>

      {/* Contenido */}
      <div style={S.content}>
        {tab === "reparaciones" && (
          reparaciones.length === 0
            ? <EmptyState icon={<Wrench size={36} color="#222" />} text="No tienes reparaciones registradas" sub="Cuando el taller registre tu equipo aparecerá aquí" />
            : reparaciones.map(rep => (
              <RepCard key={rep.id} rep={rep} onClick={() => setDetail(rep)} />
            ))
        )}
        {tab === "cotizaciones" && (
          cotizaciones.length === 0
            ? <EmptyState icon={<FileText size={36} color="#222" />} text="No tienes cotizaciones" sub="Solicita una desde la página de inicio" action={<Link to="/#cotizar" style={S.actionLink}>Solicitar cotización →</Link>} />
            : cotizaciones.map(cot => <CotCard key={cot.id} cot={cot} />)
        )}
      </div>
    </div>
  );
}

/* ─── Card de reparación ─── */
function RepCard({ rep, onClick }) {
  const cfg = REP_ESTADOS[rep.estado] ?? { label: rep.estado, color: "#888" };
  const tipo = TIPOS[rep.tipoEquipo] ?? "🔧";
  return (
    <div style={S.card} onClick={onClick} className="dc-card">
      <div style={S.cardTop}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{tipo}</span>
          <div>
            <div style={S.cardEquipo}>{rep.marca} {rep.modelo}</div>
            <div style={S.cardTipo}>{rep.tipoEquipo}</div>
          </div>
        </div>
        <Badge estado={rep.estado} map={REP_ESTADOS} />
      </div>

      {/* Barra de progreso del estado */}
      <ProgressBar estado={rep.estado} color={cfg.color} />

      <div style={S.cardMid}>
        <div style={S.cardProblem}>{rep.descripcionProblema}</div>
      </div>

      <div style={S.cardBot}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Hash size={9} color="#555" />
          <span style={S.cardCode}>{rep.codigo}</span>
          <span style={S.cardDate}> · {fmtDate(rep.createdAt)}</span>
        </div>
        <div style={S.cardAction}>
          Ver detalle <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}

/* ─── Barra de progreso visual ─── */
const PROGRESS_STEPS = ["pendiente", "diagnostico", "cotizado", "aprobado", "en_reparacion", "reparado", "entregado"];
function ProgressBar({ estado, color }) {
  if (estado === "cancelado") return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "10px 0 8px" }}>
      <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#ff3b3b33" }}>
        <div style={{ height: "100%", width: "100%", background: "#ff3b3b", borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 9, color: "#ff3b3b", fontWeight: 700, whiteSpace: "nowrap" }}>CANCELADO</span>
    </div>
  );
  const idx = PROGRESS_STEPS.indexOf(estado);
  const pct = idx === -1 ? 0 : Math.round(((idx + 1) / PROGRESS_STEPS.length) * 100);
  return (
    <div style={{ margin: "10px 0 8px" }}>
      <div style={{ height: 3, background: "#1e1e1e", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.5s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 9, color: "#555" }}>Recibido</span>
        <span style={{ fontSize: 9, color, fontWeight: 700 }}>{pct}%</span>
        <span style={{ fontSize: 9, color: "#555" }}>Entregado</span>
      </div>
    </div>
  );
}

/* ─── Card de cotización ─── */
function CotCard({ cot }) {
  const tipo = TIPOS[cot.tipoEquipo] ?? "🔧";
  return (
    <div style={S.card}>
      <div style={S.cardTop}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{tipo}</span>
          <div>
            <div style={S.cardEquipo}>{cot.marca} {cot.modelo}</div>
            <div style={S.cardTipo}>{cot.tipoEquipo}</div>
          </div>
        </div>
        <Badge estado={cot.estado ?? "pendiente"} map={COT_ESTADOS} />
      </div>

      <div style={{ margin: "10px 0 8px" }}>
        <p style={S.cardProblem}>{cot.descripcion}</p>
      </div>

      {cot.precioEstimado && (
        <div style={S.cotPrecio}>
          <span style={{ color: "#888", fontSize: 11 }}>Presupuesto estimado</span>
          <span style={{ color: "#39ff14", fontWeight: 700, fontFamily: "'Orbitron', sans-serif" }}>
            {fmtCOP(cot.precioEstimado)}
          </span>
        </div>
      )}

      {cot.notasAdmin && (
        <div style={S.notasAdmin}>
          <span style={{ fontSize: 9, color: "#39ff14", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Nota del taller</span>
          <p style={{ fontSize: 12, color: "#ccc", margin: 0, lineHeight: 1.6 }}>{cot.notasAdmin}</p>
        </div>
      )}

      <div style={S.cardBot}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Hash size={9} color="#555" />
          <span style={S.cardCode}>{cot.codigo}</span>
          <span style={S.cardDate}> · {fmtDate(cot.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Detalle de reparación ─── */
function ReparacionDetail({ rep, onBack }) {
  const cfg = REP_ESTADOS[rep.estado] ?? { label: rep.estado, color: "#888" };
  return (
    <div style={S.root}>
      <style>{CSS}</style>
      <header style={S.topBar}>
        <button style={S.backBtn} onClick={onBack} className="dc-tap">
          <ArrowLeft size={16} color="#39ff14" />
          <span style={{ color: "#39ff14", fontSize: 13, fontWeight: 700 }}>Volver</span>
        </button>
      </header>

      <div style={{ padding: "16px 16px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: "#39ff14", fontWeight: 900 }}>{rep.codigo}</span>
            <Badge estado={rep.estado} map={REP_ESTADOS} />
          </div>
          <div style={{ fontSize: 20, color: "#efefef", fontWeight: 700, marginBottom: 4 }}>
            {TIPOS[rep.tipoEquipo] ?? "🔧"} {rep.marca} {rep.modelo}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>Ingresado el {fmtFull(rep.createdAt)}</div>
        </div>

        {/* Progress */}
        <div style={S.detailCard}>
          <div style={S.detailCardTitle}>Estado actual</div>
          <ProgressBar estado={rep.estado} color={cfg.color} />
          <div style={{ fontSize: 13, color: cfg.color, fontWeight: 700, textAlign: "center", marginTop: 4 }}>
            {cfg.label}
          </div>
        </div>

        {/* Info equipo */}
        <div style={S.detailCard}>
          <div style={S.detailCardTitle}>Información del equipo</div>
          <InfoRow label="Tipo"     value={`${TIPOS[rep.tipoEquipo] ?? "🔧"} ${rep.tipoEquipo}`} />
          <InfoRow label="Marca"    value={rep.marca} />
          <InfoRow label="Modelo"   value={rep.modelo} />
          <InfoRow label="Problema" value={rep.descripcionProblema} />
          {rep.diagnostico && <InfoRow label="Diagnóstico" value={rep.diagnostico} />}
          {rep.precio != null && (
            <InfoRow label="Precio" value={fmtCOP(rep.precio)} highlight />
          )}
        </div>

        {/* Historial */}
        <div style={S.detailCard}>
          <div style={S.detailCardTitle}>Historial de estados ({rep.historial?.length ?? 0})</div>
          {rep.historial?.length > 0 ? rep.historial.map((h, i) => {
            const hCfg = REP_ESTADOS[h.estadoNuevo] ?? { color: "#888" };
            return (
              <div key={i} style={S.histItem}>
                <div style={{ ...S.histDot, background: hCfg.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, color: "#555" }}>{h.estadoAnterior}</span>
                    <ArrowRight size={10} color="#39ff14" />
                    <span style={{ fontSize: 11, color: "#eee", fontWeight: 700 }}>{h.estadoNuevo}</span>
                  </div>
                  {h.notas && <p style={{ fontSize: 12, color: "#777", margin: "2px 0" }}>{h.notas}</p>}
                  <div style={{ fontSize: 10, color: "#444" }}>{fmtFull(h.createdAt)} · por {h.creadoPor}</div>
                </div>
              </div>
            );
          }) : <p style={{ fontSize: 12, color: "#444", padding: "10px 0" }}>Sin historial aún</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-componentes ─── */
function StatCard({ label, value, color, Icon }) {
  return (
    <div style={{ ...S.statCard, borderColor: `${color}22` }}>
      <div style={{ ...S.statIcon, background: `${color}18` }}><Icon size={14} color={color} /></div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #111", gap: 12 }}>
      <span style={{ fontSize: 11, color: "#666", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: highlight ? "#39ff14" : "#ccc", fontWeight: highlight ? 700 : 400, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function EmptyState({ icon, text, sub, action }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "50px 20px", gap: 12 }}>
      {icon}
      <div style={{ fontSize: 14, color: "#555", fontWeight: 700, textAlign: "center" }}>{text}</div>
      {sub && <div style={{ fontSize: 12, color: "#333", textAlign: "center" }}>{sub}</div>}
      {action}
    </div>
  );
}

/* ─── Styles ─── */
const G = "#39ff14";
const BG0 = "#080808";
const BG1 = "#0d0d0d";
const BR  = "#1e1e1e";

const S = {
  root: { minHeight: "100dvh", background: BG0, fontFamily: "'JetBrains Mono', monospace", maxWidth: 480, margin: "0 auto" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: BG1, borderBottom: `1px solid ${BR}`, position: "sticky", top: 0, zIndex: 50 },
  brand: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  brandIcon: { width: 30, height: 30, borderRadius: 8, background: G, display: "flex", alignItems: "center", justifyContent: "center" },
  brandName: { fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 900, color: G, letterSpacing: 2, lineHeight: 1 },
  brandSub:  { fontSize: 8, color: "#333", letterSpacing: 1.5, marginTop: 2 },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: `${G}18`, border: `1px solid ${G}35`, display: "flex", alignItems: "center", justifyContent: "center", color: G, fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 900 },
  logoutBtn: { width: 32, height: 32, borderRadius: "50%", background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  backBtn: { display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 },
  greeting: { padding: "20px 16px 16px" },
  greetSub:  { fontSize: 11, color: "#555", marginBottom: 4 },
  greetName: { fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#efefef" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px 16px" },
  statCard: { background: BG1, borderRadius: 12, border: `1px solid ${BR}`, padding: "12px 10px" },
  statIcon: { width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tabs: { display: "flex", gap: 0, margin: "0 16px 16px", background: BG1, borderRadius: 12, border: `1px solid ${BR}`, padding: 4 },
  tab: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 8px", borderRadius: 9, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#555", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s" },
  tabActive: { background: "#39ff1418", color: G, border: `1px solid ${G}30` },
  tabBadge: { background: "#39ff1422", color: G, borderRadius: 10, padding: "1px 6px", fontSize: 9, fontWeight: 700 },
  content: { padding: "0 16px 80px", display: "flex", flexDirection: "column", gap: 10 },
  card: { background: BG1, borderRadius: 16, border: `1px solid ${BR}`, padding: "14px 14px 11px", cursor: "pointer" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  cardEquipo: { fontSize: 14, color: "#ddd", fontWeight: 700 },
  cardTipo: { fontSize: 10, color: "#666", textTransform: "capitalize", marginTop: 2 },
  cardMid: { marginBottom: 8 },
  cardProblem: { fontSize: 12, color: "#777", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardBot: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  cardCode: { fontSize: 10, color: "#555", fontWeight: 700 },
  cardDate: { fontSize: 10, color: "#444" },
  cardAction: { display: "flex", alignItems: "center", gap: 2, fontSize: 11, color: G, fontWeight: 700 },
  cotPrecio: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0a", borderRadius: 8, padding: "8px 12px", marginBottom: 8 },
  notasAdmin: { background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, padding: "10px 12px", marginBottom: 8 },
  actionLink: { fontSize: 12, color: G, fontWeight: 700, textDecoration: "none" },
  detailCard: { background: BG1, borderRadius: 14, border: `1px solid ${BR}`, padding: "14px 16px", marginBottom: 12 },
  detailCardTitle: { fontSize: 9, color: "#666", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 },
  histItem: { display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #111" },
  histDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 3 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { background: #080808; }
  .dc-card:active { background: #0f0f0f !important; }
  .dc-tap:active   { opacity: 0.65; transform: scale(0.94); }
  ::-webkit-scrollbar { display: none; }
`;

const spinnerCSS = `
  .dc-spinner { width: 28px; height: 28px; border: 2px solid #1a1a1a; border-top-color: #39ff14; border-radius: 50%; animation: dc-spin 0.7s linear infinite; }
  @keyframes dc-spin { to { transform: rotate(360deg); } }
`;