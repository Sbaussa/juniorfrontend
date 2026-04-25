import { useContext, useState, useEffect, useRef, useCallback, createContext } from "react";
import {
  Search, ArrowRight, Gamepad2, Cpu, Smartphone, Wrench,
  Shield, Zap, Award, ChevronDown, Star, CheckCircle2, Clock,
  Plus, Trash2, Upload, X, Tag, DollarSign, Package,
  Eye, ShoppingBag, ImageOff, MapPin, Menu, LogOut,
  LayoutDashboard, User, Mail, Phone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../App";

const INTRO_VIDEO_SRC  = "public/logo.mp4";
const HERO_VIDEO_SRC   = "public/videoland.mp4";
const SCROLL_VIDEO_SRC = "public/videolascr.mp4";

const WA_NUMBER   = "573001234567";
const LOGO_SRC    = "/logo.png";
const HERO_IMG    = "/taller.png";
const SHOP_IMG    = "/corto.png";
const MSG_GENERAL = encodeURIComponent("Hola! Me gustaría información sobre sus servicios.");
const MSG_COT     = encodeURIComponent("Hola! Quisiera solicitar una cotización para reparar mi equipo.");
const WA_URL      = `https://wa.me/${WA_NUMBER}?text=${MSG_GENERAL}`;
const WA_URL_COT  = `https://wa.me/${WA_NUMBER}?text=${MSG_COT}`;

const ESTADO_CONFIG = {
  pendiente:     { label: "Pendiente",     color: "#ffb800" },
  diagnostico:   { label: "Diagnóstico",   color: "#00d4ff" },
  cotizado:      { label: "Cotizado",      color: "#ce93d8" },
  aprobado:      { label: "Aprobado",      color: "#39ff14" },
  en_reparacion: { label: "En Reparación", color: "#ffb74d" },
  reparado:      { label: "Reparado",      color: "#69f0ae" },
  entregado:     { label: "Entregado",     color: "#39ff14" },
  cancelado:     { label: "Cancelado",     color: "#ff3b3b" },
};

const CATEGORIAS = [
  { value: "consola",    label: "🎮 Consola",    color: "#7c3aed" },
  { value: "computador", label: "💻 Computador", color: "#2563eb" },
  { value: "celular",    label: "📱 Celular",    color: "#0891b2" },
  { value: "accesorio",  label: "🎧 Accesorio",  color: "#059669" },
  { value: "otro",       label: "📦 Otro",       color: "#d97706" },
];

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────
const waProductUrl = (p) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Me interesa: *${p.nombre}* — $${Number(p.precio).toLocaleString("es-CO")}`)}`;
const getCat = (val) => CATEGORIAS.find((c) => c.value === val) || CATEGORIAS[4];

// ─────────────────────────────────────────────────────────────────
//  Particles canvas
// ─────────────────────────────────────────────────────────────────
function Particles({ count = 45 }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let w = (cv.width = cv.offsetWidth), h = (cv.height = cv.offsetHeight);
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      a: Math.random() * 0.5 + 0.2,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57,255,20,${d.a * 0.5})`; ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach((b) => {
        const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(57,255,20,${0.09 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onR = () => { w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight; };
    window.addEventListener("resize", onR);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, [count]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─────────────────────────────────────────────────────────────────
//  AnimatedImg
// ─────────────────────────────────────────────────────────────────
function AnimatedImg({ src, alt = "", className = "", style = {}, direction = "up", delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const [err, setErr] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const t = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(-40px)", right: "translateX(40px)" };
  return (
    <div ref={ref} className={`anim-img-wrap ${className}`} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : (t[direction] || t.up), transition: `opacity .75s ease ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s`, ...style }}>
      {err
        ? <div className="img-fallback"><ImageOff size={28} /><span>{alt || "Imagen"}</span></div>
        : <img src={src} alt={alt} onError={() => setErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Typewriter
// ─────────────────────────────────────────────────────────────────
function Typewriter({ words }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[idx];
    const t = setTimeout(() => {
      if (!del) { setText(w.slice(0, text.length + 1)); if (text.length + 1 === w.length) setTimeout(() => setDel(true), 1500); }
      else { setText(w.slice(0, text.length - 1)); if (text.length - 1 === 0) { setDel(false); setIdx((idx + 1) % words.length); } }
    }, del ? 38 : 88);
    return () => clearTimeout(t);
  }, [text, del, idx, words]);
  return <span>{text}<span className="tw-cur">|</span></span>;
}

// ─────────────────────────────────────────────────────────────────
//  useVisible hook
// ─────────────────────────────────────────────────────────────────
function useVisible(ref, thr = 0.1) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: thr });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

// ─────────────────────────────────────────────────────────────────
//  WA Icon
// ─────────────────────────────────────────────────────────────────
const WaIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.528 5.858L.057 23.7a.5.5 0 0 0 .632.628l5.905-1.493A11.951 11.951 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.951 0-3.77-.538-5.32-1.47l-.38-.225-3.508.887.893-3.45-.247-.395A9.96 9.96 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
//  CotizacionForm
// ─────────────────────────────────────────────────────────────────
function CotizacionFormCompact() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", tipoEquipo: "consola", marca: "", modelo: "", descripcion: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post("/api/cotizaciones", form); setSuccess(true); setTimeout(() => setSuccess(false), 5000); setForm({ nombre: "", email: "", telefono: "", tipoEquipo: "consola", marca: "", modelo: "", descripcion: "" }); } catch {}
    setLoading(false);
  };
  return (
    <form className="cot-form" onSubmit={submit}>
      <div className="cot-row"><div className="cot-field"><label>Nombre</label><input className="fi" placeholder="Tu nombre" value={form.nombre} onChange={set("nombre")} required /></div><div className="cot-field"><label>Email</label><input className="fi" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set("email")} required /></div></div>
      <div className="cot-row"><div className="cot-field"><label>Teléfono</label><input className="fi" placeholder="+57 300..." value={form.telefono} onChange={set("telefono")} /></div><div className="cot-field"><label>Tipo</label><select className="fi" value={form.tipoEquipo} onChange={set("tipoEquipo")}><option value="consola">🎮 Consola</option><option value="computador">💻 Computador</option><option value="celular">📱 Celular</option></select></div></div>
      <div className="cot-row"><div className="cot-field"><label>Marca</label><input className="fi" placeholder="Ej: PlayStation" value={form.marca} onChange={set("marca")} required /></div><div className="cot-field"><label>Modelo</label><input className="fi" placeholder="Ej: PS5" value={form.modelo} onChange={set("modelo")} required /></div></div>
      <div className="cot-field" style={{ marginBottom: 10 }}><label>Problema</label><textarea className="fi" rows={3} placeholder="¿Qué falla tiene?" value={form.descripcion} onChange={set("descripcion")} required /></div>
      <div className="cot-actions">
        <button className="btn-primary-lg btn-full" type="submit" disabled={loading}>{loading ? <span className="spin" /> : <><Zap size={16} /> Enviar Cotización</>}</button>
        <a href={WA_URL_COT} target="_blank" rel="noreferrer" className="btn-wa-sm"><WaIcon size={15} /> WhatsApp</a>
      </div>
      {success && <div className="cot-success"><CheckCircle2 size={15} /> ¡Cotización enviada! Te contactamos pronto.</div>}
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ProductCard
// ─────────────────────────────────────────────────────────────────
function ProductCard({ producto, isAdmin, onDelete, delay = 0 }) {
  const ref = useRef(null);
  const vis = useVisible(ref, 0.08);
  const cat = getCat(producto.categoria);
  const [imgErr, setImgErr] = useState(false);
  return (
    <div ref={ref} className="prod-card" style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(28px)", transition: `opacity .6s ease ${delay}s, transform .6s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      <div className="prod-img">
        {imgErr || !producto.imagenUrl
          ? <div className="prod-img-fallback"><Package size={44} /></div>
          : <img src={producto.imagenUrl} alt={producto.nombre} onError={() => setImgErr(true)} />}
        <div className="prod-cat" style={{ background: `${cat.color}22`, color: cat.color, borderColor: `${cat.color}44` }}>{cat.label}</div>
        {producto.destacado && <div className="prod-hot">🔥 Destacado</div>}
        {isAdmin && <button className="prod-del" onClick={() => onDelete(producto.id)}><Trash2 size={14} /></button>}
      </div>
      <div className="prod-body">
        <h3 className="prod-name">{producto.nombre}</h3>
        {producto.descripcion && <p className="prod-desc">{producto.descripcion}</p>}
        <div className="prod-footer">
          <div className="prod-price"><span className="price-lbl">Precio</span><span className="price-val">${Number(producto.precio).toLocaleString("es-CO")}</span></div>
          <a href={waProductUrl(producto)} target="_blank" rel="noreferrer" className="btn-wa-prod"><WaIcon size={14} /> Consultar</a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  AdminProductModal
// ─────────────────────────────────────────────────────────────────
function AdminProductModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", categoria: "consola", destacado: false });
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const onFile = (e) => { const f = e.target.files[0]; if (!f) return; setImg(f); setPreview(URL.createObjectURL(f)); };
  const submit = async (e) => {
    e.preventDefault();
    if (!img) { setError("Debes subir una imagen del producto."); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("imagen", img); fd.append("nombre", form.nombre); fd.append("descripcion", form.descripcion);
      fd.append("precio", form.precio); fd.append("categoria", form.categoria); fd.append("destacado", form.destacado);
      await api.post("/api/productos", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onSuccess(); onClose();
    } catch (err) { setError(err.response?.data?.error || "Error al guardar."); }
    setLoading(false);
  };
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <div className="modal-title"><Plus size={18} /> Nuevo Artículo en Venta</div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <div className="img-upload-area" onClick={() => fileRef.current?.click()}>
            {preview ? <img src={preview} alt="preview" className="img-preview" /> : <div className="img-upload-ph"><Upload size={28} /><span>Toca para subir imagen</span><small>JPG · PNG · WEBP — máx 5 MB</small></div>}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          </div>
          {preview && <button type="button" className="btn-ghost-sm" onClick={() => { setImg(null); setPreview(null); }}><X size={13} /> Quitar imagen</button>}
          <div className="modal-row">
            <div className="cot-field"><label><Tag size={12} /> Nombre</label><input className="fi" placeholder="Ej: PlayStation 5 Slim" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
            <div className="cot-field"><label><DollarSign size={12} /> Precio (COP)</label><input className="fi" type="number" min={0} placeholder="Ej: 2500000" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required /></div>
          </div>
          <div className="cot-field"><label><Package size={12} /> Categoría</label>
            <div className="cat-selector">{CATEGORIAS.map((c) => (<button key={c.value} type="button" className={`cat-opt ${form.categoria === c.value ? "cat-active" : ""}`} style={form.categoria === c.value ? { borderColor: c.color, background: `${c.color}18`, color: c.color } : {}} onClick={() => setForm({ ...form, categoria: c.value })}>{c.label}</button>))}</div>
          </div>
          <div className="cot-field"><label>Descripción (opcional)</label><textarea className="fi" rows={2} placeholder="Estado, garantía, detalles..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
          <label className="toggle-row">
            <div className={`toggle ${form.destacado ? "toggle-on" : ""}`} onClick={() => setForm({ ...form, destacado: !form.destacado })}><span className="toggle-thumb" /></div>
            <span>Marcar como destacado 🔥</span>
          </label>
          {error && <div className="modal-err">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost-lg" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary-lg" disabled={loading}>{loading ? <span className="spin" /> : <><ShoppingBag size={15} /> Publicar</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ProductosSection
// ─────────────────────────────────────────────────────────────────
function ProductosSection({ isAdmin }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const ref = useRef(null);
  const vis = useVisible(ref, 0.04);
  const fetch_ = useCallback(async () => { setLoading(true); try { const r = await api.get("/api/productos"); setProductos(r.data); } catch {} setLoading(false); }, []);
  useEffect(() => { fetch_(); }, [fetch_]);
  const handleDelete = async (id) => { if (!window.confirm("¿Eliminar este artículo?")) return; try { await api.delete(`/api/productos/${id}`); fetch_(); } catch {} };
  const filtered = filtro === "todos" ? productos : productos.filter((p) => p.categoria === filtro);
  return (
    <section className="snap-sec productos-sec" ref={ref} id="tienda">
      <div className={`sec-inner ${vis ? "vis" : ""}`}>
        <div className="prod-header">
          <div className="prod-header-left">
            <span className="sec-chip"><ShoppingBag size={11} /> Artículos en Venta</span>
            <h2 className="sec-h2">Equipos <span className="neon-txt">disponibles</span></h2>
            <p className="sec-sub">Revisados y garantizados por nuestro equipo técnico</p>
          </div>
          {isAdmin && <button className="btn-primary-lg" onClick={() => setShowModal(true)}><Plus size={17} /> Agregar artículo</button>}
        </div>
        <div className="prod-filtros">
          <button className={`filtro-btn ${filtro === "todos" ? "filtro-active" : ""}`} onClick={() => setFiltro("todos")}>Todos <span className="filtro-cnt">{productos.length}</span></button>
          {CATEGORIAS.map((c) => { const cnt = productos.filter((p) => p.categoria === c.value).length; if (cnt === 0) return null; return (<button key={c.value} className={`filtro-btn ${filtro === c.value ? "filtro-active" : ""}`} style={filtro === c.value ? { borderColor: c.color, color: c.color, background: `${c.color}12` } : {}} onClick={() => setFiltro(c.value)}>{c.label} <span className="filtro-cnt">{cnt}</span></button>); })}
        </div>
        {loading
          ? <div className="prod-loading">{[1,2,3,4].map((i) => <div key={i} className="prod-skeleton" />)}</div>
          : filtered.length === 0
            ? <div className="prod-empty"><Package size={44} /><p>No hay artículos{filtro !== "todos" ? " en esta categoría" : ""} aún</p>{isAdmin && <button className="btn-primary-lg" onClick={() => setShowModal(true)}><Plus size={15} /> Agregar el primero</button>}</div>
            : <div className="prod-grid">{filtered.map((p, i) => <ProductCard key={p.id} producto={p} isAdmin={isAdmin} onDelete={handleDelete} delay={Math.min(i * 0.07, 0.5)} />)}</div>}
      </div>
      {showModal && <AdminProductModal onClose={() => setShowModal(false)} onSuccess={fetch_} />}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ══ NAVBAR (inline) ══
// ─────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={LOGO_SRC} alt="Junior Technical Service" className="navbar-logo-img" />
        </Link>
        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className={`navbar-links ${mobileOpen ? "open" : ""}`}>
          <a href="#servicios" className="nav-link" onClick={() => setMobileOpen(false)}>Servicios</a>
          <a href="#cotizar"   className="nav-link" onClick={() => setMobileOpen(false)}>Cotizar</a>
          <a href="#buscar"    className="nav-link" onClick={() => setMobileOpen(false)}>Buscar Reparación</a>
          {user ? (
            <div className="nav-auth">
              <span className="nav-user"><User size={16} />{user.nombre}</span>
              {user.rol === "admin" && <Link to="/admin" className="btn btn-secondary btn-sm" onClick={() => setMobileOpen(false)}><LayoutDashboard size={16} />Admin</Link>}
              <Link to="/dashboard" className="btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/"); setMobileOpen(false); }}><LogOut size={16} />Salir</button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login"    className="btn btn-ghost btn-sm"   onClick={() => setMobileOpen(false)}>Ingresar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ══ FOOTER (inline) ══
// ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={LOGO_SRC} alt="Junior Technical Service" className="footer-logo-img" />
            </div>
            <p className="footer-desc">Especialistas en reparación de consolas, computadores y celulares. Servicio técnico profesional con garantía.</p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Servicios</h4>
            <ul className="footer-list">
              <li><Gamepad2 size={14} /> Reparación de Consolas</li>
              <li><Cpu size={14} /> Reparación de Computadores</li>
              <li><Smartphone size={14} /> Reparación de Celulares</li>
              <li>Diagnóstico Gratuito</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Contacto</h4>
            <ul className="footer-list">
              <li><Phone size={14} /> +57 301 7505646</li>
              <li><Mail size={14} /> info@tallertech.com</li>
              <li><MapPin size={14} /> Parque Central L. 151-2</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Horario</h4>
            <ul className="footer-list">
              <li>Lunes - Sábado: 9:30am - 6:30pm</li>
              <li>Domingos: Cerrado</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Junior Technical Service · Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ══ LANDING (main export) ══
// ─────────────────────────────────────────────────────────────────
export default function Landing() {
  const [searchCode, setSearchCode]     = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError]   = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [isAdmin, setIsAdmin]           = useState(false);

  // Intro video state
  const [introDone, setIntroDone]   = useState(false);
  const [introFading, setIntroFading] = useState(false);
  const introVideoRef               = useRef(null);

  // Video state
  const [heroPast, setHeroPast]     = useState(false);
  const scrollVideoRef              = useRef(null);
  const heroSectionRef              = useRef(null);

  const containerRef = useRef(null);

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem("user") || "{}"); setIsAdmin(u.rol === "admin" || u.role === "admin"); } catch {}
  }, []);

  // ── Intro video: fade out cuando termina ────────────────────────
  const handleIntroEnd = () => {
    setIntroFading(true);
    setTimeout(() => setIntroDone(true), 700); // espera que termine el fade
  };

  // Fallback: si el video no carga en 6s, skip intro
  useEffect(() => {
    const t = setTimeout(handleIntroEnd, 6000);
    return () => clearTimeout(t);
  }, []);

  // ── IntersectionObserver: detect when hero leaves viewport ──────
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setHeroPast(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (heroSectionRef.current) obs.observe(heroSectionRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Video 2: siempre corriendo desde el inicio ───────────────────
  useEffect(() => {
    scrollVideoRef.current?.play().catch(() => {});
  }, []);

  // ── Dot nav: track current section ─────────────────────────────
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const fn = () => { el.querySelectorAll(".snap-sec").forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top >= -80 && r.top < window.innerHeight * 0.5) setCurrentSection(i); }); };
    el.addEventListener("scroll", fn, { passive: true });
    return () => el.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (i) => { containerRef.current?.querySelectorAll(".snap-sec")?.[i]?.scrollIntoView({ behavior: "smooth" }); setCurrentSection(i); };

  const handleSearch = async (e) => {
    e.preventDefault(); if (!searchCode.trim()) return;
    setSearchLoading(true); setSearchError(""); setSearchResult(null);
    try { const r = await api.get(`/api/reparaciones/buscar/${searchCode.toUpperCase()}`); setSearchResult(r.data); }
    catch (err) { setSearchError(err.response?.data?.error || "Reparación no encontrada"); }
    setSearchLoading(false);
  };

  const sRefs = Array.from({ length: 7 }, () => useRef(null));
  const vVis  = sRefs.map((r) => useVisible(r));

  const SERVICES = [
    { icon: <Gamepad2 size={38} />, title: "Consolas",    sub: "PlayStation · Xbox · Nintendo",    img: "/images/consola.jpg",  items: ["Joystick drift","No enciende","Sobrecalentamiento","Lector de discos","HDMI roto"] },
    { icon: <Cpu size={38} />,      title: "Computadores", sub: "Laptops y PCs escritorio",          img: "/images/pc.jpg",       items: ["Pantalla rota","Virus / Malware","Upgrade SSD/RAM","Fuente de poder","Teclado/Touchpad"] },
    { icon: <Smartphone size={38} />,title:"Celulares",    sub: "iPhone · Samsung · Xiaomi",         img: "/images/celular.jpg",  items: ["Pantalla rota","Batería dañada","Puerto de carga","Cámara","Sensor de huella"] },
  ];

  const STEPS = [
    { icon: <Search size={24} />, n: "01", title: "Diagnóstico", desc: "Evaluamos tu equipo 100% gratis y sin compromiso." },
    { icon: <Wrench size={24} />, n: "02", title: "Cotización",  desc: "Presupuesto detallado en menos de 24 horas." },
    { icon: <Shield size={24} />, n: "03", title: "Reparación",  desc: "Reparamos con garantía y repuestos originales." },
    { icon: <Award  size={24} />, n: "04", title: "Entrega",     desc: "Tu equipo al 100% con garantía escrita." },
  ];

  return (
    <div className="lnd-root">

      {/* ── INTRO VIDEO — pantalla completa, limpia, sale primero ── */}
      {!introDone && (
        <div className="intro-overlay" style={{ opacity: introFading ? 0 : 1 }}>
          <video
            ref={introVideoRef}
            className="intro-video"
            autoPlay
            muted
            playsInline
            onEnded={handleIntroEnd}
          >
            <source src={INTRO_VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
      )}

      <Navbar />

      {/* ── VIDEO 2: fondo fijo, siempre en bucle ── */}
      <video
        ref={scrollVideoRef}
        className="scroll-video-bg"
        muted
        playsInline
        loop
      >
        <source src={SCROLL_VIDEO_SRC} type="video/mp4" />
      </video>
      <div className="scroll-video-overlay" />

      {/* WA flotante */}
      <a href={WA_URL} target="_blank" rel="noreferrer" className="wa-float" aria-label="WhatsApp">
        <WaIcon size={26} /><span className="wa-pulse" />
      </a>

      {/* Dots nav */}
      <div className="dots-nav">
        {Array.from({ length: 7 }).map((_, i) => (
          <button key={i} className={`dot ${currentSection === i ? "dot-on" : ""}`} onClick={() => scrollTo(i)} aria-label={`Sección ${i + 1}`} />
        ))}
      </div>

      <div className="scroll-wrap" ref={containerRef}>

        {/* ── S1 HERO ── */}
        <section className="snap-sec hero-sec" ref={(el) => { sRefs[0].current = el; heroSectionRef.current = el; }} id="hero">
          {/* VIDEO 1: hero autoplay en bucle */}
          <video className="hero-video-bg" autoPlay loop muted playsInline>
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
          {/* Overlay encima del hero video */}
          <div className="hero-video-overlay" />

          <Particles count={42} />
          <div className="hero-mesh" />

          <div className={`sec-inner hero-inner ${vVis[0] ? "vis" : ""}`}>
            <div className="hero-left">
              <div className="hero-badge"><Zap size={12} /> Servicio Técnico · Barranquilla</div>
              <h1 className="hero-h1">Reparamos tu<br /><span className="neon-word"><Typewriter words={["consola", "computador", "celular", "equipo"]} /></span></h1>
              <p className="hero-p">Diagnóstico <strong>100% gratis</strong>. Técnicos certificados con años de experiencia.</p>
              <div className="hero-ctas">
                <Link to="/registro" className="btn-primary-lg"><span>Crear Cuenta</span><ArrowRight size={16} /></Link>
                <a href={WA_URL_COT} target="_blank" rel="noreferrer" className="btn-wa-lg"><WaIcon size={17} /> Cotizar por WhatsApp</a>
              </div>
              <div className="hero-stats">
                {[["500+","Reparaciones"],["98%","Satisfacción"],["24h","Diagnóstico"],["3m","Garantía"]].map(([n,l]) => (
                  <div className="stat" key={l}><span className="stat-n">{n}</span><span className="stat-l">{l}</span></div>
                ))}
              </div>
            </div>
            <div className="hero-right">
              <div className="hero-img-frame">
                <AnimatedImg src={HERO_IMG} alt="Taller Junior Technical Service" className="hero-main-img" direction="right" delay={0.2} />
                <div className="hero-img-border" />
              </div>
              <div className="fc-badge fc-b1"><CheckCircle2 size={15} /> Garantía Escrita</div>
              <div className="fc-badge fc-b2"><MapPin size={15} /> Parque Central L. 151-2</div>
              <div className="fc-badge fc-b3"><Clock size={15} /> 9:30 a 6:30</div>
            </div>
          </div>
          <button className="scroll-arrow" onClick={() => scrollTo(1)}><ChevronDown size={26} /></button>
        </section>

        {/* ── S2 SERVICIOS ── */}
        <section className="snap-sec srv-sec" ref={sRefs[1]} id="servicios">
          <div className={`sec-inner ${vVis[1] ? "vis" : ""}`}>
            <div className="sec-head">
              <span className="sec-chip">Nuestros Servicios</span>
              <h2 className="sec-h2">¿Qué podemos <span className="neon-txt">reparar</span>?</h2>
              <p className="sec-sub">Cobertura completa para todos tus dispositivos</p>
            </div>
            <div className="srv-grid">
              {SERVICES.map((s, i) => (
                <div className="srv-card" key={i} style={{ "--delay": `${i * 0.13}s` }}>
                  <AnimatedImg src={s.img} alt={s.title} className="srv-img" direction="up" delay={i * 0.1} />
                  <div className="srv-body">
                    <div className="srv-icon-wrap">{s.icon}</div>
                    <h3>{s.title}</h3>
                    <p className="srv-sub">{s.sub}</p>
                    <ul className="srv-list">{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── S3 PROCESO ── */}
        <section className="snap-sec proc-sec" ref={sRefs[2]}>
          <div className={`sec-inner ${vVis[2] ? "vis" : ""}`}>
            <div className="sec-head">
              <span className="sec-chip">Cómo Funciona</span>
              <h2 className="sec-h2">Proceso <span className="neon-txt">simple</span> y rápido</h2>
            </div>
            <div className="proc-grid">
              {STEPS.map((s, i) => (
                <div className="proc-card" key={i} style={{ "--delay": `${i * 0.13}s` }}>
                  <div className="proc-num">{s.n}</div>
                  <div className="proc-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  {i < 3 && <div className="proc-conn" />}
                </div>
              ))}
            </div>
            <div className="proc-bottom">
              <AnimatedImg src="/images/proceso-taller.jpg" alt="Proceso de reparación" className="proc-img" direction="up" delay={0.2} />
            </div>
          </div>
        </section>

        {/* ── S4 COTIZACIÓN ── */}
        <section className="snap-sec cot-sec" ref={sRefs[3]} id="cotizar">
          <div className={`sec-inner cot-inner ${vVis[3] ? "vis" : ""}`}>
            <div className="cot-left">
              <span className="sec-chip">Cotización Gratis</span>
              <h2 className="sec-h2">Solicita tu <span className="neon-txt">presupuesto</span></h2>
              <p className="sec-sub">Sin compromiso. Respondemos en menos de 24 horas.</p>
              <div className="benefits">
                {[[<Zap size={17} />,"Respuesta Rápida","Menos de 24 horas"],[<Shield size={17} />,"Garantía Incluida","En toda reparación"],[<Award size={17} />,"Mejor Precio","Competitivo y justo"]].map(([ic,t,d]) => (
                  <div className="benefit" key={t}><div className="ben-ic">{ic}</div><div><strong>{t}</strong><span>{d}</span></div></div>
                ))}
              </div>
            </div>
            <div className="cot-right"><CotizacionFormCompact /></div>
          </div>
        </section>

        {/* ── S5 TIENDA ── */}
        <ProductosSection isAdmin={isAdmin} />

        {/* ── S6 BUSCAR ── */}
        <section className="snap-sec buscar-sec" ref={sRefs[4]} id="buscar">
          <div className={`sec-inner buscar-inner ${vVis[4] ? "vis" : ""}`}>
            <span className="sec-chip"><Eye size={11} /> Portal de Clientes</span>
            <h2 className="sec-h2">Consulta tu <span className="neon-txt">reparación</span></h2>
            <p className="sec-sub">Ingresa tu código para ver el estado en tiempo real</p>
            <form className="buscar-form" onSubmit={handleSearch}>
              <div className="buscar-box">
                <Search size={19} className="buscar-ico" />
                <input className="buscar-input" placeholder="Ej: JTS-XXXXXX" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
                <button className="btn-primary-lg" type="submit" disabled={searchLoading}>{searchLoading ? <span className="spin" /> : "Buscar"}</button>
              </div>
            </form>
            {searchError && <div className="err-msg">{searchError}</div>}
            {searchResult && (
              <div className="result-card">
                <div className="res-head">
                  <span className="res-code">{searchResult.codigo}</span>
                  <span className="res-badge" style={{ background: `${ESTADO_CONFIG[searchResult.estado]?.color}18`, color: ESTADO_CONFIG[searchResult.estado]?.color, borderColor: `${ESTADO_CONFIG[searchResult.estado]?.color}44` }}>
                    <span className="res-dot" style={{ background: ESTADO_CONFIG[searchResult.estado]?.color }} />
                    {ESTADO_CONFIG[searchResult.estado]?.label}
                  </span>
                </div>
                <div className="res-grid">
                  {[["Equipo",`${searchResult.marca} ${searchResult.modelo}`],["Tipo",searchResult.tipoEquipo],["Fecha",new Date(searchResult.createdAt).toLocaleDateString("es-CO")],searchResult.precio?["Precio",`$${searchResult.precio.toLocaleString()}`]:null].filter(Boolean).map(([l,v]) => (
                    <div key={l}><p className="res-lbl">{l}</p><p className="res-val" style={l==="Precio"?{color:"var(--ng)"}:{}}>{v}</p></div>
                  ))}
                </div>
                <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola, consulta sobre reparación ${searchResult.codigo}`)}`} target="_blank" rel="noreferrer" className="btn-wa-sm" style={{ marginTop: 10 }}><WaIcon size={14} /> Consultar por WhatsApp</a>
              </div>
            )}
          </div>
        </section>

        {/* ── S7 CTA FINAL ── */}
        <section className="snap-sec cta-sec" ref={sRefs[5]}>
          <Particles count={32} />
          <div className={`sec-inner cta-inner ${vVis[5] ? "vis" : ""}`}>
            <div className="cta-chip"><Star size={12} /> +500 clientes satisfechos en Barranquilla</div>
            <h2 className="cta-h2">¿Listo para reparar<br />tu <span className="neon-txt">equipo</span>?</h2>
            <p className="cta-sub">Únete a cientos de clientes que ya confían en nosotros</p>
            <div className="cta-btns">
              <Link to="/registro" className="btn-primary-lg"><span>Crear Cuenta Gratis</span><ArrowRight size={16} /></Link>
              <a href={WA_URL} target="_blank" rel="noreferrer" className="btn-wa-lg"><WaIcon size={17} /> Contactar por WhatsApp</a>
              <Link to="/login" className="btn-ghost-lg">Ya tengo cuenta</Link>
            </div>
            <p className="cta-sub">¡Puedes evitar esto con un mantenimiento regular!</p>
            <AnimatedImg src={SHOP_IMG} alt="Junior Technical Service" className="cta-img" direction="up" delay={0.25} />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="footer-wrap">
          <Footer />
        </div>

      </div>{/* fin scroll-wrap */}

      <style>{`
        :root {
          --ng: #39ff14;
          --ng-glow: rgba(57,255,20,.25);
          --ng-soft: rgba(57,255,20,.08);
          --wa: #25D366;
          --wa-dark: #128C7E;
          --r: 16px;
        }

        /* ── INTRO OVERLAY ── */
        .intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity .7s ease;
          pointer-events: all;
        }
        .intro-video {
          width: 100vw;
          height: 100vh;
          object-fit: cover;
        }

        /* ── Shell ── */
        .lnd-root { background: #080808; }
        .scroll-wrap { height: 100svh; overflow-y: scroll; scroll-snap-type: y proximity; -webkit-overflow-scrolling: touch; position: relative; z-index: 1; }
        .snap-sec { min-height: 100svh; height: auto; scroll-snap-align: start; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 76px 20px 60px; box-sizing: border-box; }
        .productos-sec { height: auto; min-height: 100svh; align-items: flex-start; padding-top: 96px; padding-bottom: 60px; }
        .sec-inner { max-width: 1200px; width: 100%; margin: 0 auto; opacity: 0; transform: translateY(30px); transition: opacity .7s ease, transform .7s cubic-bezier(.22,1,.36,1); }
        .sec-inner.vis { opacity: 1; transform: none; }
        .footer-wrap { scroll-snap-align: start; width: 100%; }

        /* ── VIDEO 2: scroll-driven fixed background ── */
        .scroll-video-bg {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          object-fit: cover;
          z-index: 0;
          pointer-events: none;
        }
        .scroll-video-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.62);
          z-index: 0;
          pointer-events: none;
        }

        /* ── VIDEO 1: hero section background ── */
        .hero-video-bg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          z-index: 0;
          pointer-events: none;
        }
        .hero-video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.65) 100%);
          z-index: 1;
          pointer-events: none;
        }

        /* Sections after hero: semi-transparent so scroll video shows through */
        .srv-sec     { background: rgba(5,5,5,0.80); }
        .proc-sec    { background: rgba(10,10,10,0.78); }
        .cot-sec     { background: rgba(5,5,5,0.80); }
        .productos-sec { background: rgba(8,8,8,0.82); }
        .buscar-sec  { background: rgba(5,5,5,0.80); }
        .cta-sec     { background: rgba(8,8,8,0.75); }

        /* Hero needs transparent bg (video handles it) */
        .hero-sec { background: transparent; }

        /* ── Navbar ── */
        .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(8,8,8,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(57,255,20,.1); }
        .navbar-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 70px; display: flex; align-items: center; justify-content: space-between; }
        .navbar-logo { display: flex; align-items: center; text-decoration: none; }
        .navbar-logo-img { height: 100px; width: auto; object-fit: contain; filter: drop-shadow(0 0 8px rgba(57,255,20,.4)); }
        .navbar-toggle { display: none; background: none; border: none; color: var(--ng); cursor: pointer; }
        .navbar-links { display: flex; align-items: center; gap: 8px; }
        .nav-link { color: var(--text-secondary,#aaa); text-decoration: none; font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: var(--r); transition: all .25s; }
        .nav-link:hover { color: var(--ng); background: var(--ng-soft); }
        .nav-auth { display: flex; align-items: center; gap: 8px; margin-left: 16px; }
        .nav-user { display: flex; align-items: center; gap: 6px; color: #aaa; font-size: 13px; margin-right: 8px; }
        .btn { display: inline-flex; align-items: center; gap: 6px; border-radius: var(--r); font-weight: 600; cursor: pointer; text-decoration: none; transition: all .25s; border: none; }
        .btn-primary { background: var(--ng); color: #000; }
        .btn-ghost { background: transparent; color: #aaa; border: 1px solid rgba(255,255,255,.12); }
        .btn-ghost:hover { border-color: var(--ng); color: var(--ng); }
        .btn-secondary { background: rgba(57,255,20,.12); color: var(--ng); border: 1px solid rgba(57,255,20,.3); }
        .btn-sm { padding: 8px 16px; font-size: 13px; }

        /* ── Footer ── */
        .footer { background: rgba(5,5,5,0.92); border-top: 1px solid rgba(57,255,20,.1); padding: 48px 0 24px; }
        .footer-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .footer-logo { margin-bottom: 16px; }
        .footer-logo-img { width: 140px; height: auto; object-fit: contain; filter: drop-shadow(0 0 8px rgba(57,255,20,.35)); }
        .footer-desc { color: #aaa; font-size: 14px; line-height: 1.6; }
        .footer-title { font-size: 12px; font-weight: 700; color: var(--ng); margin-bottom: 16px; text-transform: uppercase; letter-spacing: .08em; }
        .footer-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .footer-list li { display: flex; align-items: center; gap: 8px; color: #aaa; font-size: 13px; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,.06); padding-top: 24px; text-align: center; color: #666; font-size: 13px; }

        /* ── Dots ── */
        .dots-nav { position: fixed; right: 20px; top: 50%; transform: translateY(-50%); z-index: 900; display: flex; flex-direction: column; gap: 10px; }
        .dot { width: 9px; height: 9px; border-radius: 50%; border: 2px solid var(--ng); background: transparent; cursor: pointer; transition: all .3s; padding: 0; }
        .dot-on { background: var(--ng); box-shadow: 0 0 10px var(--ng); transform: scale(1.4); }

        /* ── WA Float ── */
        .wa-float { position: fixed; bottom: 22px; right: 22px; z-index: 9999; width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg,#25D366,#128C7E); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 18px rgba(37,211,102,.45); text-decoration: none; transition: transform .3s,box-shadow .3s; color: #fff; }
        .wa-float:hover { transform: scale(1.1); box-shadow: 0 6px 26px rgba(37,211,102,.65); }
        .wa-pulse { position: absolute; inset: -5px; border-radius: 50%; border: 2px solid var(--wa); animation: pulse 2.2s ease-out infinite; opacity: 0; }
        @keyframes pulse { 0%{opacity:.5;transform:scale(1)} 100%{opacity:0;transform:scale(1.55)} }

        /* ── Buttons ── */
        .btn-primary-lg { display: inline-flex; align-items: center; gap: 8px; background: var(--ng); color: #000; font-weight: 800; padding: 12px 22px; border-radius: 12px; border: none; font-size: 14px; cursor: pointer; text-decoration: none; transition: all .3s; white-space: nowrap; box-shadow: 0 0 18px rgba(57,255,20,.3); }
        .btn-primary-lg:hover { box-shadow: 0 0 32px rgba(57,255,20,.55); transform: translateY(-2px); }
        .btn-primary-lg:disabled { opacity: .55; cursor: not-allowed; transform: none; }
        .btn-wa-lg { display: inline-flex; align-items: center; gap: 8px; background: var(--wa); color: #fff; font-weight: 700; padding: 12px 22px; border-radius: 12px; font-size: 14px; cursor: pointer; text-decoration: none; transition: all .3s; box-shadow: 0 4px 14px rgba(37,211,102,.3); white-space: nowrap; }
        .btn-wa-lg:hover { background: var(--wa-dark); transform: translateY(-2px); }
        .btn-wa-sm { display: inline-flex; align-items: center; gap: 7px; background: rgba(37,211,102,.1); border: 1px solid rgba(37,211,102,.35); color: var(--wa); font-weight: 600; padding: 9px 14px; border-radius: 10px; font-size: 13px; text-decoration: none; transition: all .3s; }
        .btn-wa-sm:hover { background: rgba(37,211,102,.2); }
        .btn-ghost-lg { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #aaa; border: 1px solid rgba(255,255,255,.15); font-weight: 600; padding: 12px 22px; border-radius: 12px; font-size: 14px; cursor: pointer; text-decoration: none; transition: all .3s; }
        .btn-ghost-lg:hover { border-color: var(--ng); color: var(--ng); }
        .btn-ghost-sm { display: inline-flex; align-items: center; gap: 6px; background: transparent; color: #888; border: 1px solid rgba(255,255,255,.1); font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: all .3s; }
        .btn-ghost-sm:hover { border-color: #ff3b3b; color: #ff3b3b; }
        .btn-full { width: 100%; justify-content: center; }

        /* ── Common ── */
        .neon-txt { color: var(--ng); }
        .sec-chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 13px; border-radius: 20px; background: var(--ng-soft); border: 1px solid rgba(57,255,20,.22); color: var(--ng); font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 13px; }
        .sec-h2 { font-size: 36px; font-weight: 900; line-height: 1.15; margin-bottom: 10px; color: #fff; }
        .sec-sub { color: #aaa; font-size: 15px; line-height: 1.65; }
        .sec-head { text-align: center; margin-bottom: 40px; }
        .scroll-arrow { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: none; border: none; color: var(--ng); cursor: pointer; animation: bob 2s ease-in-out infinite; padding: 8px; z-index: 10; }
        @keyframes bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }
        .neon-word { color: var(--ng); display: block; min-height: 1.2em; }
        .tw-cur { animation: blink .85s step-end infinite; color: var(--ng); }
        @keyframes blink { 50%{opacity:0} }
        .spin { width: 17px; height: 17px; border: 2px solid transparent; border-top-color: currentColor; border-radius: 50%; animation: rot .7s linear infinite; display: inline-block; }
        @keyframes rot { to{transform:rotate(360deg)} }

        /* ── Animated Image ── */
        .anim-img-wrap { overflow: hidden; border-radius: var(--r); }
        .img-fallback { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: rgba(255,255,255,.04); border: 2px dashed rgba(57,255,20,.25); color: rgba(57,255,20,.5); font-size: 12px; border-radius: var(--r); }

        /* ── HERO ── */
        .hero-mesh { position: absolute; inset: 0; pointer-events: none; z-index: 2; background: radial-gradient(ellipse 70% 55% at 20% 20%, rgba(57,255,20,.05), transparent), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(57,255,20,.03), transparent); }
        .hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; position: relative; z-index: 3; }
        .hero-left { display: flex; flex-direction: column; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 30px; background: var(--ng-soft); border: 1px solid rgba(57,255,20,.2); color: var(--ng); font-size: 11px; font-weight: 700; margin-bottom: 18px; width: fit-content; letter-spacing: .05em; }
        .hero-h1 { font-size: 48px; font-weight: 900; line-height: 1.1; margin-bottom: 14px; color: #fff; }
        .hero-p { font-size: 15px; color: rgba(255,255,255,.75); line-height: 1.7; margin-bottom: 26px; }
        .hero-p strong { color: var(--ng); }
        .hero-ctas { display: flex; gap: 11px; flex-wrap: wrap; margin-bottom: 32px; }
        .hero-stats { display: flex; gap: 26px; flex-wrap: wrap; }
        .stat { display: flex; flex-direction: column; }
        .stat-n { font-size: 25px; font-weight: 900; color: var(--ng); }
        .stat-l { font-size: 11px; color: rgba(255,255,255,.5); margin-top: 2px; }
        .hero-right { position: relative; height: 440px; }
        .hero-img-frame { width: 100%; height: 100%; border-radius: 22px; overflow: hidden; border: 2px solid rgba(57,255,20,.22); box-shadow: 0 0 50px rgba(57,255,20,.1); }
        .hero-main-img { width: 100%; height: 100%; opacity: 0.5; }
        .hero-img-border { position: absolute; inset: -5px; border-radius: 26px; border: 1px solid rgba(57,255,20,.1); pointer-events: none; }
        .fc-badge { position: absolute; background: rgba(10,10,10,.85); border: 1px solid rgba(57,255,20,.38); border-radius: 10px; padding: 9px 13px; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--ng); white-space: nowrap; animation: flt 3s ease-in-out infinite; box-shadow: 0 3px 14px rgba(57,255,20,.1); backdrop-filter: blur(6px); }
        .fc-b1 { top: 16px; left: -16px; animation-delay: 0s; }
        .fc-b2 { bottom: 75px; right: -12px; animation-delay: 1.1s; }
        .fc-b3 { bottom: 16px; left: 16px; animation-delay: 1.9s; }
        @keyframes flt { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        /* ── SERVICIOS ── */
        .srv-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .srv-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 18px; overflow: hidden; transition: all .35s; animation: slideUp .6s ease both; animation-delay: var(--delay); display: flex; flex-direction: column; }
        .srv-card:hover { border-color: var(--ng); transform: translateY(-5px); box-shadow: 0 12px 32px rgba(57,255,20,.13); }
        @keyframes slideUp { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        .srv-img { width: 100%; height: 130px; flex-shrink: 0; }
        .srv-body { padding: 16px; display: flex; flex-direction: column; flex: 1; }
        .srv-icon-wrap { width: 52px; height: 52px; border-radius: 13px; background: var(--ng-soft); border: 1px solid rgba(57,255,20,.2); display: flex; align-items: center; justify-content: center; color: var(--ng); margin-bottom: 12px; transition: transform .3s; }
        .srv-card:hover .srv-icon-wrap { transform: rotate(-6deg) scale(1.1); }
        .srv-card h3 { font-size: 17px; font-weight: 800; color: var(--ng); margin-bottom: 3px; }
        .srv-sub { font-size: 12px; color: #888; margin-bottom: 12px; }
        .srv-list { list-style: none; padding: 0; margin: 0 0 10px; flex: 1; }
        .srv-list li { padding: 4px 0; color: #aaa; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,.04); }
        .srv-list li::before { content: "→"; color: var(--ng); margin-right: 6px; font-weight: 700; }

        /* ── PROCESO ── */
        .proc-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 30px; }
        .proc-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 15px; padding: 22px 14px; text-align: center; position: relative; transition: all .3s; animation: slideUp .6s ease both; animation-delay: var(--delay); }
        .proc-card:hover { border-color: var(--ng); box-shadow: 0 8px 26px rgba(57,255,20,.12); }
        .proc-num { font-size: 10px; font-weight: 800; letter-spacing: .14em; color: var(--ng); margin-bottom: 12px; }
        .proc-icon { width: 52px; height: 52px; margin: 0 auto 13px; background: var(--ng-soft); border: 1px solid rgba(57,255,20,.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--ng); transition: transform .3s; }
        .proc-card:hover .proc-icon { transform: scale(1.15) rotate(8deg); }
        .proc-card h3 { font-size: 14px; font-weight: 700; color: var(--ng); margin-bottom: 6px; }
        .proc-card p { font-size: 12px; color: #aaa; line-height: 1.5; }
        .proc-conn { position: absolute; right: -8px; top: 42px; width: 16px; height: 2px; background: rgba(57,255,20,.3); }
        .proc-conn::after { content: "›"; position: absolute; right: -5px; top: -8px; color: var(--ng); font-size: 15px; }
        .proc-bottom { display: flex; justify-content: center; }
        .proc-img { width: 100%; max-width: 680px; height: 170px; }

        /* ── COTIZACIÓN ── */
        .cot-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        .benefits { display: flex; flex-direction: column; gap: 11px; margin-top: 20px; }
        .benefit { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; transition: border-color .3s; }
        .benefit:hover { border-color: rgba(57,255,20,.3); }
        .ben-ic { width: 36px; height: 36px; border-radius: 9px; background: var(--ng-soft); display: flex; align-items: center; justify-content: center; color: var(--ng); flex-shrink: 0; }
        .benefit strong { display: block; font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 1px; }
        .benefit span { font-size: 12px; color: #888; }
        .cot-form { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 18px; padding: 26px; display: flex; flex-direction: column; gap: 10px; backdrop-filter: blur(6px); }
        .cot-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cot-field { display: flex; flex-direction: column; gap: 5px; }
        .cot-field label { font-size: 11px; font-weight: 600; color: #888; letter-spacing: .05em; display: flex; align-items: center; gap: 4px; }
        .fi { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 10px 12px; color: #fff; font-size: 13px; outline: none; transition: all .3s; width: 100%; box-sizing: border-box; }
        .fi:focus { border-color: var(--ng); box-shadow: 0 0 0 3px rgba(57,255,20,.1); }
        .fi::placeholder { color: #666; }
        .fi option { background: #111; }
        .cot-actions { display: flex; gap: 9px; flex-wrap: wrap; }
        .cot-success { display: flex; align-items: center; gap: 7px; background: rgba(57,255,20,.1); border: 1px solid var(--ng); color: var(--ng); padding: 10px 13px; border-radius: 10px; font-size: 13px; font-weight: 600; animation: fadeIn .4s; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        /* ── PRODUCTOS ── */
        .prod-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 22px; flex-wrap: wrap; }
        .prod-header-left { flex: 1; min-width: 0; }
        .prod-filtros { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 24px; }
        .filtro-btn { padding: 6px 14px; border-radius: 30px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); color: #aaa; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .25s; display: flex; align-items: center; gap: 5px; }
        .filtro-btn:hover { border-color: rgba(57,255,20,.4); color: var(--ng); }
        .filtro-active { border-color: var(--ng)!important; color: var(--ng)!important; background: var(--ng-soft)!important; }
        .filtro-cnt { background: rgba(255,255,255,.08); border-radius: 6px; padding: 0 5px; font-size: 10px; }
        .prod-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap: 18px; }
        .prod-card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09); border-radius: 16px; overflow: hidden; transition: all .3s; display: flex; flex-direction: column; }
        .prod-card:hover { border-color: var(--ng); transform: translateY(-4px); box-shadow: 0 10px 28px rgba(57,255,20,.12); }
        .prod-img { position: relative; height: 185px; overflow: hidden; background: rgba(255,255,255,.03); }
        .prod-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
        .prod-card:hover .prod-img img { transform: scale(1.05); }
        .prod-img-fallback { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #666; }
        .prod-cat { position: absolute; top: 9px; left: 9px; padding: 3px 9px; border-radius: 20px; border: 1px solid; font-size: 10px; font-weight: 700; backdrop-filter: blur(6px); background: rgba(0,0,0,.5); }
        .prod-hot { position: absolute; top: 9px; right: 9px; padding: 3px 9px; border-radius: 20px; background: rgba(255,94,0,.85); color: #fff; font-size: 10px; font-weight: 700; }
        .prod-del { position: absolute; bottom: 9px; right: 9px; background: rgba(255,59,59,.85); border: none; width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; transition: all .3s; }
        .prod-del:hover { background: #ff3b3b; transform: scale(1.1); }
        .prod-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .prod-name { font-size: 15px; font-weight: 700; margin-bottom: 5px; line-height: 1.3; color: #fff; }
        .prod-desc { font-size: 12px; color: #888; line-height: 1.5; margin-bottom: 12px; flex: 1; }
        .prod-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; }
        .prod-price { display: flex; flex-direction: column; }
        .price-lbl { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: .06em; }
        .price-val { font-size: 17px; font-weight: 900; color: var(--ng); }
        .btn-wa-prod { display: flex; align-items: center; gap: 5px; background: var(--wa); color: #fff; font-weight: 700; padding: 8px 12px; border-radius: 9px; font-size: 12px; text-decoration: none; transition: all .3s; white-space: nowrap; }
        .btn-wa-prod:hover { background: var(--wa-dark); }
        .prod-loading { display: grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap: 18px; }
        .prod-skeleton { height: 300px; border-radius: 16px; background: linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .prod-empty { text-align: center; padding: 50px 20px; color: #666; display: flex; flex-direction: column; align-items: center; gap: 14px; }

        /* ── MODAL ── */
        .modal-overlay { position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal-box { background: #111; border: 1px solid rgba(57,255,20,.22); border-radius: 22px; width: 100%; max-width: 540px; max-height: 92svh; overflow-y: auto; box-shadow: 0 0 56px rgba(57,255,20,.1); animation: mIn .35s cubic-bezier(.22,1,.36,1); }
        @keyframes mIn { from{opacity:0;transform:scale(.95) translateY(18px)} to{opacity:1;transform:none} }
        .modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px 0; margin-bottom: 18px; }
        .modal-title { display: flex; align-items: center; gap: 9px; font-size: 16px; font-weight: 800; color: var(--ng); }
        .modal-close { background: none; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: all .3s; padding: 0; }
        .modal-close:hover { border-color: #ff3b3b; color: #ff3b3b; }
        .modal-form { padding: 0 22px 22px; display: flex; flex-direction: column; gap: 13px; }
        .img-upload-area { width: 100%; height: 170px; border-radius: 13px; border: 2px dashed rgba(57,255,20,.28); overflow: hidden; cursor: pointer; transition: border-color .3s; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.03); }
        .img-upload-area:hover { border-color: var(--ng); }
        .img-upload-ph { display: flex; flex-direction: column; align-items: center; gap: 7px; color: rgba(57,255,20,.6); }
        .img-upload-ph span { font-size: 13px; font-weight: 600; }
        .img-upload-ph small { font-size: 11px; color: #666; }
        .img-preview { width: 100%; height: 100%; object-fit: cover; }
        .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
        .cat-selector { display: flex; gap: 7px; flex-wrap: wrap; }
        .cat-opt { padding: 5px 11px; border-radius: 20px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); color: #aaa; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .25s; }
        .toggle-row { display: flex; align-items: center; gap: 11px; cursor: pointer; font-size: 13px; color: #aaa; }
        .toggle { width: 38px; height: 21px; border-radius: 11px; background: rgba(255,255,255,.12); position: relative; transition: all .3s; flex-shrink: 0; }
        .toggle-on { background: var(--ng); }
        .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 15px; height: 15px; border-radius: 50%; background: #fff; transition: transform .3s; }
        .toggle-on .toggle-thumb { transform: translateX(17px); }
        .modal-err { background: rgba(255,59,59,.1); border: 1px solid #ff3b3b; color: #ff3b3b; padding: 10px 13px; border-radius: 10px; font-size: 13px; }
        .modal-actions { display: flex; gap: 9px; justify-content: flex-end; flex-wrap: wrap; }

        /* ── BUSCAR ── */
        .buscar-inner { text-align: center; max-width: 660px; margin: 0 auto; }
        .buscar-form { margin-top: 26px; }
        .buscar-box { display: flex; align-items: center; gap: 9px; background: rgba(255,255,255,.06); border: 2px solid rgba(255,255,255,.1); border-radius: 13px; padding: 7px 7px 7px 16px; transition: border-color .3s; }
        .buscar-box:focus-within { border-color: var(--ng); box-shadow: 0 0 0 4px rgba(57,255,20,.07); }
        .buscar-ico { color: #888; flex-shrink: 0; }
        .buscar-input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-size: 15px; padding: 8px 4px; min-width: 0; }
        .buscar-input::placeholder { color: #666; }
        .err-msg { background: rgba(255,59,59,.1); border: 1px solid #ff3b3b; color: #ff3b3b; padding: 12px 16px; border-radius: 10px; margin-top: 16px; font-size: 13px; }
        .result-card { background: rgba(57,255,20,.05); border: 1px solid var(--ng); border-radius: 16px; padding: 22px; margin-top: 22px; text-align: left; box-shadow: 0 0 32px rgba(57,255,20,.09); animation: fadeIn .4s; }
        .res-head { display: flex; align-items: center; gap: 11px; margin-bottom: 16px; padding-bottom: 13px; border-bottom: 1px solid rgba(255,255,255,.08); flex-wrap: wrap; }
        .res-code { font-family: monospace; font-size: 19px; font-weight: 800; color: var(--ng); }
        .res-badge { display: flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 20px; border: 1px solid; font-size: 12px; font-weight: 600; }
        .res-dot { width: 6px; height: 6px; border-radius: 50%; }
        .res-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 13px; margin-bottom: 12px; }
        .res-lbl { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 3px; }
        .res-val { font-size: 14px; font-weight: 600; text-transform: capitalize; color: #fff; }

        /* ── CTA FINAL ── */
        .cta-inner { text-align: center; }
        .cta-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 15px; border-radius: 20px; background: var(--ng-soft); border: 1px solid rgba(57,255,20,.2); color: var(--ng); font-size: 12px; font-weight: 600; margin-bottom: 18px; }
        .cta-h2 { font-size: 44px; font-weight: 900; line-height: 1.1; margin-bottom: 13px; color: #fff; }
        .cta-sub { font-size: 16px; color: #aaa; margin-bottom: 32px; }
        .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 32px; }
        .cta-img { width: 100%; max-width: 460px; height: 190px; margin: 0 auto; }

        /* ══ TABLET ≤1024px ══ */
        @media(max-width:1024px) {
          .hero-inner { grid-template-columns: 1fr; gap: 28px; }
          .hero-right { display: none; }
          .hero-h1 { font-size: 36px; }
          .cot-inner { grid-template-columns: 1fr; gap: 28px; }
          .srv-grid { grid-template-columns: 1fr 1fr; }
          .proc-grid { grid-template-columns: repeat(2,1fr); }
          .proc-conn { display: none; }
          .sec-h2 { font-size: 30px; }
          .cta-h2 { font-size: 34px; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ══ MOBILE ≤768px ══ */
        @media(max-width:768px) {
          .snap-sec { padding: 68px 16px 32px; }
          .dots-nav { display: none; }
          .wa-float { bottom: 16px; right: 16px; width: 50px; height: 50px; }
          .sec-h2 { font-size: 24px; }
          .hero-h1 { font-size: 28px; }
          .cta-h2 { font-size: 26px; }
          .hero-ctas { flex-direction: column; gap: 9px; }
          .hero-ctas > * { justify-content: center; }
          .hero-stats { gap: 14px; }
          .stat-n { font-size: 20px; }
          .srv-grid { grid-template-columns: 1fr; gap: 14px; }
          .proc-grid { grid-template-columns: 1fr 1fr; gap: 9px; }
          .proc-card { padding: 16px 11px; }
          .cot-row { grid-template-columns: 1fr; }
          .cot-form { padding: 18px; }
          .cot-actions { flex-direction: column; }
          .cot-actions .btn-wa-sm { justify-content: center; }
          .prod-header { flex-direction: column; }
          .prod-header .btn-primary-lg { width: 100%; justify-content: center; }
          .prod-grid { grid-template-columns: 1fr 1fr; gap: 11px; }
          .prod-img { height: 140px; }
          .prod-body { padding: 11px; }
          .buscar-box { flex-wrap: wrap; }
          .buscar-box .btn-primary-lg { width: 100%; justify-content: center; }
          .cta-btns { flex-direction: column; align-items: stretch; }
          .cta-btns > * { justify-content: center; }
          .modal-row { grid-template-columns: 1fr; }
          .modal-actions { flex-direction: column-reverse; }
          .navbar-toggle { display: block; }
          .navbar-links { display: none; position: absolute; top: 70px; left: 0; right: 0; background: rgba(8,8,8,.96); border-bottom: 1px solid rgba(57,255,20,.1); flex-direction: column; padding: 16px; gap: 4px; }
          .navbar-links.open { display: flex; }
          .nav-auth { flex-direction: column; width: 100%; }
          .nav-auth .btn-sm { width: 100%; }
          .navbar-logo-img { height: 36px; }
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
        }

        /* ══ SMALL ≤380px ══ */
        @media(max-width:380px) {
          .prod-grid { grid-template-columns: 1fr; }
          .proc-grid { grid-template-columns: 1fr; }
          .hero-h1 { font-size: 24px; }
          .cta-h2 { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}