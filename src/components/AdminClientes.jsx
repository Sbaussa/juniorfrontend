import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import {
  Search, X, Users, ArrowLeft, Plus, Edit3, Eye, Hash,
  Camera, Save, ArrowRight, Package, Phone, Mail, Calendar, Wrench,
} from "lucide-react";

const ESTADOS = [
  { v: "pendiente",     l: "Pendiente",      c: "#ffb800" },
  { v: "diagnostico",   l: "En Diagnóstico", c: "#00d4ff" },
  { v: "cotizado",      l: "Cotizado",        c: "#ce93d8" },
  { v: "aprobado",      l: "Aprobado",        c: "#39ff14" },
  { v: "en_reparacion", l: "En Reparación",   c: "#ffb74d" },
  { v: "reparado",      l: "Reparado",        c: "#69f0ae" },
  { v: "entregado",     l: "Entregado",       c: "#39ff14" },
  { v: "cancelado",     l: "Cancelado",       c: "#ff3b3b" },
];
const EMAP  = Object.fromEntries(ESTADOS.map(e => [e.v, e]));
const TIPOS = ["consola", "computador", "celular", "tablet", "otro"];
const TIPOS_EMO = { consola: "🎮", computador: "💻", celular: "📱", tablet: "📱", otro: "🔧" };

const fmt     = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const fmtFull = (d) => new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtCOP  = (v) => v != null ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v) : "—";

function parseFotos(raw) {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}

function Badge({ estado }) {
  const cfg = EMAP[estado] ?? { l: estado, c: "#888" };
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:0.4,whiteSpace:"nowrap",background:`${cfg.c}18`,color:cfg.c,border:`1px solid ${cfg.c}30`,fontFamily:"'JetBrains Mono',monospace" }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:cfg.c }} />
      {cfg.l}
    </span>
  );
}

function InfoChip({ Icon, text }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:5 }}>
      <Icon size={12} color="#555" />
      <span style={{ fontSize:11,color:"#666" }}>{text}</span>
    </div>
  );
}
function StatPill({ label, value, color }) {
  return (
    <div style={{ background:`${color}10`,border:`1px solid ${color}25`,borderRadius:10,padding:"8px 14px",textAlign:"center" }}>
      <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,color }}>{value}</div>
      <div style={{ fontSize:9,color:"#666",fontWeight:700,textTransform:"uppercase" }}>{label}</div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block",fontSize:9,color:"#666",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}
function InfoRow({ label, val, hl }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #111" }}>
      <span style={{ fontSize:11,color:"#666" }}>{label}</span>
      <span style={{ fontSize:12,color:hl?"#39ff14":"#ccc",fontWeight:hl?700:400 }}>{val}</span>
    </div>
  );
}
function Empty({ icon, text, action }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"60px 20px",gap:12 }}>
      {icon}
      <span style={{ fontSize:13,color:"#555" }}>{text}</span>
      {action}
    </div>
  );
}

/* ══════════════════ COMPONENTE PRINCIPAL ══════════════════ */
export default function AdminClientes() {
  const [clientes,setClientes]     = useState([]);
  const [loading,setLoading]       = useState(true);
  const [busqueda,setBusqueda]     = useState("");
  const [perfil,setPerfil]         = useState(null);
  const [perfilLoading,setPerfilLoading] = useState(false);
  const [modal,setModal]           = useState(null);
  const [detailRep,setDetailRep]   = useState(null);

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get("/api/clientes"); setClientes(r.data); } catch(e){ console.error(e); }
    setLoading(false);
  };

  const abrirPerfil = async (c) => {
    setPerfilLoading(true); setPerfil(null);
    try { const r = await api.get(`/api/clientes/${c.id}`); setPerfil(r.data); } catch(e){ console.error(e); }
    setPerfilLoading(false);
  };

  const recargarPerfil = async () => {
    if (!perfil) return;
    try { const r = await api.get(`/api/clientes/${perfil.id}`); setPerfil(r.data); } catch(e){ console.error(e); }
  };

  const filtered = clientes.filter(c =>
    [c.nombre,c.email,c.telefono].some(v=>v?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (detailRep && perfil) return (
    <RepDetail rep={detailRep} clienteId={perfil.id} onBack={()=>setDetailRep(null)} onEdit={()=>setModal({mode:"editar",rep:detailRep})} afterSave={async(u)=>{ setDetailRep(u); await recargarPerfil(); }} />
  );

  if (perfil || perfilLoading) {
    if (perfilLoading) return <div style={S.page}><style>{CSS}</style><div style={S.loadBox}><div className="ac-spinner"/></div></div>;
    return (
      <div style={S.page}>
        <style>{CSS}</style>
        <ClientePerfil perfil={perfil} onBack={()=>{setPerfil(null);load();}} onNuevaRep={()=>setModal({mode:"nueva"})} onEditRep={(r)=>setModal({mode:"editar",rep:r})} onVerRep={(r)=>setDetailRep(r)} />
        {modal && <RepModal mode={modal.mode} rep={modal.rep} clienteId={perfil.id} onClose={()=>setModal(null)} onSaved={async()=>{setModal(null);await recargarPerfil();}} />}
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={S.head}>
        <div>
          <h1 style={S.title}>Clientes</h1>
          <p style={S.sub}>{clientes.length} registrados · {filtered.length} visibles</p>
        </div>
      </div>

      <div style={S.srch}>
        <Search size={14} color="#666"/>
        <input style={S.srchInput} placeholder="Buscar nombre, email, teléfono..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
        {busqueda && <button style={S.clearBtn} onClick={()=>setBusqueda("")}><X size={12} color="#666"/></button>}
      </div>

      {loading
        ? <div style={S.loadBox}><div className="ac-spinner"/></div>
        : filtered.length===0
          ? <Empty icon={<Users size={40} color="#1a1a1a"/>} text={busqueda?`Sin resultados para "${busqueda}"`:"No hay clientes registrados"}/>
          : <>
            {/* DESKTOP */}
            <div className="cl-dt">
              <div style={S.tWrap}>
                <table style={S.table}>
                  <thead><tr>{["Cliente","Email","Reparaciones","Cotizaciones","Registro",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map(c=>(
                      <tr key={c.id} style={S.tr} className="cl-tr" onClick={()=>abrirPerfil(c)}>
                        <td style={S.td}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={S.av}>{c.nombre.charAt(0).toUpperCase()}</div>
                            <div><div style={S.cNom}>{c.nombre}</div>{c.telefono&&<div style={S.cSub}>{c.telefono}</div>}</div>
                          </div>
                        </td>
                        <td style={S.td}><span style={S.cEmail}>{c.email}</span></td>
                        <td style={S.td}><span style={S.cnt}>{c._count?.reparaciones??0} rep.</span></td>
                        <td style={S.td}><span style={{...S.cnt,color:"#00d4ff",background:"#00d4ff18",borderColor:"#00d4ff30"}}>{c._count?.cotizaciones??0} cot.</span></td>
                        <td style={S.td}><span style={S.dt}>{fmt(c.createdAt)}</span></td>
                        <td style={S.td}><button style={S.vBtn} className="cl-vbtn" onClick={e=>{e.stopPropagation();abrirPerfil(c);}}><Eye size={13}/> Ver perfil</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* MOBILE */}
            <div className="cl-mb">
              {filtered.map(c=>(
                <div key={c.id} style={{...S.card,marginBottom:10}} onClick={()=>abrirPerfil(c)} className="cl-card">
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <div style={{...S.av,width:40,height:40,fontSize:16}}>{c.nombre.charAt(0).toUpperCase()}</div>
                    <div style={{flex:1}}><div style={S.cNom}>{c.nombre}</div><div style={S.cEmail}>{c.email}</div></div>
                    <ArrowRight size={14} color="#555"/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <span style={S.cnt}>{c._count?.reparaciones??0} rep.</span>
                    <span style={{...S.cnt,color:"#00d4ff",background:"#00d4ff18",borderColor:"#00d4ff30"}}>{c._count?.cotizaciones??0} cot.</span>
                    <span style={{marginLeft:"auto",fontSize:10,color:"#555"}}>{fmt(c.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
      }
    </div>
  );
}

/* ══════════════════ PERFIL ══════════════════ */
function ClientePerfil({ perfil, onBack, onNuevaRep, onEditRep, onVerRep }) {
  const [tab,setTab] = useState("reparaciones");
  const reps = perfil.reparaciones ?? [];
  const cots = perfil.cotizaciones ?? [];

  return (
    <div>
      <div style={S.pHead}>
        <button style={S.backBtn} onClick={onBack} className="cl-back">
          <ArrowLeft size={15} color="#39ff14"/>
          <span style={{color:"#39ff14",fontSize:12,fontWeight:700}}>Clientes</span>
        </button>
        <button style={S.addBtn} onClick={onNuevaRep}><Plus size={14} color="#000"/> Nueva reparación</button>
      </div>

      <div style={S.pInfo}>
        <div style={{...S.av,width:52,height:52,fontSize:22,flexShrink:0}}>{perfil.nombre.charAt(0).toUpperCase()}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"#efefef",marginBottom:8}}>{perfil.nombre}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
            <InfoChip Icon={Mail} text={perfil.email}/>
            {perfil.telefono&&<InfoChip Icon={Phone} text={perfil.telefono}/>}
            <InfoChip Icon={Calendar} text={`Desde ${fmt(perfil.createdAt)}`}/>
          </div>
        </div>
        <div style={{display:"flex",gap:12,flexShrink:0}}>
          <StatPill label="Reparaciones" value={reps.length} color="#39ff14"/>
          <StatPill label="Cotizaciones"  value={cots.length} color="#00d4ff"/>
        </div>
      </div>

      <div style={S.tabs}>
        {[["reparaciones",`Reparaciones (${reps.length})`],["cotizaciones",`Cotizaciones (${cots.length})`]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{...S.tab,...(tab===v?S.tabA:{})}}>{l}</button>
        ))}
      </div>

      <div className="p-pad">
        {tab==="reparaciones" && (
          reps.length===0
            ? <Empty icon={<Wrench size={36} color="#1a1a1a"/>} text="Sin reparaciones" action={<button style={S.addBtn} onClick={onNuevaRep}><Plus size={13} color="#000"/> Agregar</button>}/>
            : <>
              <div className="cl-dt">
                <div style={S.tWrap}>
                  <table style={S.table}>
                    <thead><tr>{["Código","Equipo","Estado","Precio","Fotos","Fecha",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {reps.map(rep=>{
                        const fotos=parseFotos(rep.fotos);
                        return (
                          <tr key={rep.id} style={S.tr} className="cl-tr" onClick={()=>onVerRep(rep)}>
                            <td style={S.td}><span style={{fontSize:11,color:"#555",fontWeight:700}}>{rep.codigo}</span></td>
                            <td style={S.td}><div style={{fontSize:12,color:"#eee"}}>{TIPOS_EMO[rep.tipoEquipo]??'🔧'} {rep.marca} {rep.modelo}</div><div style={{fontSize:10,color:"#555"}}>{rep.tipoEquipo}</div></td>
                            <td style={S.td}><Badge estado={rep.estado}/></td>
                            <td style={S.td}><span style={{fontSize:12,color:rep.precio?"#39ff14":"#555"}}>{fmtCOP(rep.precio)}</span></td>
                            <td style={S.td}>
                              {fotos.length>0
                                ?<div style={{display:"flex",gap:4}}>{fotos.slice(0,3).map((f,i)=><img key={i} src={f} alt="" style={{width:32,height:32,borderRadius:6,objectFit:"cover",border:"1px solid #2a2a2a"}}/>)}</div>
                                :<span style={{fontSize:10,color:"#555"}}>—</span>}
                            </td>
                            <td style={S.td}><span style={S.dt}>{fmt(rep.createdAt)}</span></td>
                            <td style={S.td}>
                              <div style={{display:"flex",gap:6}}>
                                <button style={S.iBtn} className="cl-ibtn" onClick={e=>{e.stopPropagation();onVerRep(rep);}}><Eye size={13}/></button>
                                <button style={S.iBtn} className="cl-ibtn" onClick={e=>{e.stopPropagation();onEditRep(rep);}}><Edit3 size={13}/></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="cl-mb" style={{display:"flex",flexDirection:"column",gap:10}}>
                {reps.map(rep=>{
                  const fotos=parseFotos(rep.fotos);
                  return (
                    <div key={rep.id} style={S.card} onClick={()=>onVerRep(rep)} className="cl-card">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div><div style={{fontSize:13,color:"#ddd",fontWeight:700}}>{TIPOS_EMO[rep.tipoEquipo]??'🔧'} {rep.marca} {rep.modelo}</div><div style={{fontSize:10,color:"#555",marginTop:2}}>{rep.codigo}</div></div>
                        <Badge estado={rep.estado}/>
                      </div>
                      <div style={{fontSize:11,color:"#666",marginBottom:8,lineHeight:1.5}}>{rep.descripcionProblema}</div>
                      {fotos.length>0&&<div style={{display:"flex",gap:6,marginBottom:8}}>{fotos.map((f,i)=><img key={i} src={f} alt="" style={{width:44,height:44,borderRadius:8,objectFit:"cover",border:"1px solid #1e1e1e"}}/>)}</div>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:10,color:"#555"}}>{fmt(rep.createdAt)}</span>
                        <button style={S.iBtn} className="cl-ibtn" onClick={e=>{e.stopPropagation();onEditRep(rep);}}><Edit3 size={13}/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
        )}
        {tab==="cotizaciones" && (
          cots.length===0
            ? <Empty icon={<Package size={36} color="#1a1a1a"/>} text="Sin cotizaciones"/>
            : <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {cots.map(c=>{
                const color={pendiente:"#ffb800",revisada:"#00d4ff",aprobada:"#39ff14",rechazada:"#ff3b3b"}[c.estado]??"#888";
                return (
                  <div key={c.id} style={S.card}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <div style={{fontSize:13,color:"#ddd",fontWeight:700}}>{TIPOS_EMO[c.tipoEquipo]??'🔧'} {c.marca} {c.modelo}</div>
                      <span style={{fontSize:10,color,fontWeight:700,background:`${color}18`,padding:"3px 8px",borderRadius:10,border:`1px solid ${color}30`}}>{c.estado}</span>
                    </div>
                    <div style={{fontSize:11,color:"#666",marginBottom:6}}>{c.descripcion}</div>
                    {c.precioEstimado&&<div style={{fontSize:12,color:"#39ff14",fontWeight:700,marginBottom:4}}>{fmtCOP(c.precioEstimado)}</div>}
                    {c.notasAdmin&&<div style={{fontSize:11,color:"#aaa",background:"#0a0a0a",padding:"8px 10px",borderRadius:7,marginBottom:6}}>{c.notasAdmin}</div>}
                    <div style={{fontSize:10,color:"#555"}}>{c.codigo} · {fmt(c.createdAt)}</div>
                  </div>
                );
              })}
            </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════ DETALLE REPARACIÓN ══════════════════ */
function RepDetail({ rep, onBack, onEdit }) {
  const fotos = parseFotos(rep.fotos);
  const cfg = EMAP[rep.estado]??{l:rep.estado,c:"#888"};
  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={S.pHead}>
        <button style={S.backBtn} onClick={onBack} className="cl-back"><ArrowLeft size={15} color="#39ff14"/><span style={{color:"#39ff14",fontSize:12,fontWeight:700}}>Perfil</span></button>
        <button style={S.addBtn} onClick={onEdit}><Edit3 size={13} color="#000"/> Editar</button>
      </div>
      <div className="p-pad">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:17,color:"#39ff14",fontWeight:900}}>{rep.codigo}</span>
          <Badge estado={rep.estado}/>
        </div>
        <div style={{fontSize:20,color:"#efefef",fontWeight:700,marginBottom:16}}>{TIPOS_EMO[rep.tipoEquipo]??'🔧'} {rep.marca} {rep.modelo}</div>
        <div style={S.dGrid}>
          <div style={S.dCard}>
            <div style={S.cTitle}>Información</div>
            <InfoRow label="Tipo"    val={rep.tipoEquipo}/>
            <InfoRow label="Marca"   val={rep.marca}/>
            <InfoRow label="Modelo"  val={rep.modelo}/>
            <InfoRow label="Estado"  val={<Badge estado={rep.estado}/>}/>
            <InfoRow label="Precio"  val={fmtCOP(rep.precio)} hl={!!rep.precio}/>
            <InfoRow label="Fecha"   val={fmtFull(rep.createdAt)}/>
          </div>
          <div style={S.dCard}>
            <div style={S.cTitle}>Problema</div>
            <p style={{fontSize:13,color:"#aaa",lineHeight:1.7,margin:0}}>{rep.descripcionProblema}</p>
            {rep.diagnostico&&<><div style={{...S.cTitle,marginTop:14}}>Diagnóstico</div><p style={{fontSize:13,color:"#aaa",lineHeight:1.7,margin:0}}>{rep.diagnostico}</p></>}
          </div>
        </div>
        {fotos.length>0&&(
          <div style={{...S.dCard,marginTop:14}}>
            <div style={S.cTitle}>Fotos ({fotos.length})</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {fotos.map((f,i)=><img key={i} src={f} alt={`Foto ${i+1}`} style={{width:110,height:110,borderRadius:10,objectFit:"cover",border:"1px solid #2a2a2a",cursor:"zoom-in"}} onClick={()=>window.open(f,"_blank")}/>)}
            </div>
          </div>
        )}
        <div style={{...S.dCard,marginTop:14}}>
          <div style={S.cTitle}>Historial ({rep.historial?.length??0})</div>
          {(rep.historial??[]).length===0
            ?<p style={{fontSize:12,color:"#444"}}>Sin historial</p>
            :rep.historial.map((h,i)=>{
              const hc=EMAP[h.estadoNuevo]??{c:"#888"};
              return (
                <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #111"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:hc.c,flexShrink:0,marginTop:3}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <span style={{fontSize:11,color:"#555"}}>{h.estadoAnterior}</span>
                      <ArrowRight size={10} color="#39ff14"/>
                      <span style={{fontSize:11,color:"#eee",fontWeight:700}}>{h.estadoNuevo}</span>
                    </div>
                    {h.notas&&<p style={{fontSize:12,color:"#666",margin:"2px 0"}}>{h.notas}</p>}
                    <div style={{fontSize:10,color:"#444"}}>{fmtFull(h.createdAt)} · {h.creadoPor}</div>
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

/* ══════════════════ MODAL FORM ══════════════════ */
function RepModal({ mode, rep, clienteId, onClose, onSaved }) {
  const isEdit = mode==="editar";
  const [form,setForm] = useState({
    tipoEquipo:          rep?.tipoEquipo          ??"consola",
    marca:               rep?.marca               ??"",
    modelo:              rep?.modelo              ??"",
    descripcionProblema: rep?.descripcionProblema ??"",
    diagnostico:         rep?.diagnostico         ??"",
    precio:              rep?.precio              ??"",
    estado:              rep?.estado              ??"pendiente",
    notas:               "",
  });
  const [fotos,setFotos]   = useState(parseFotos(rep?.fotos));
  const [saving,setSaving] = useState(false);
  const [error,setError]   = useState("");
  const fileRef            = useRef();

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleFotos = (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length+files.length>5){ setError("Máximo 5 fotos"); return; }
    files.forEach(file=>{
      const reader=new FileReader();
      reader.onload=(ev)=>{
        const img=new Image();
        img.onload=()=>{
          const canvas=document.createElement("canvas");
          const MAX=500; let w=img.width,h=img.height;
          if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}
          if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}
          canvas.width=w; canvas.height=h;
          canvas.getContext("2d").drawImage(img,0,0,w,h);
          setFotos(prev=>[...prev,canvas.toDataURL("image/jpeg",0.75)]);
        };
        img.src=ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value="";
  };

  const save = async () => {
    setError("");
    if(!form.tipoEquipo||!form.marca||!form.modelo||!form.descripcionProblema){ setError("Completa los campos obligatorios"); return; }
    setSaving(true);
    try {
      const body={...form,precio:form.precio||null,fotos};
      if(isEdit){ await api.put(`/api/clientes/${clienteId}/reparaciones/${rep.id}`,body); }
      else       { await api.post(`/api/clientes/${clienteId}/reparaciones`,body); }
      onSaved();
    } catch(e){ setError(e.response?.data?.error??"Error al guardar"); }
    setSaving(false);
  };

  return (
    <div style={S.ov} onClick={onClose}>
      <div style={S.modal} onClick={e=>e.stopPropagation()}>
        <div style={S.mHead}>
          <div><div style={S.mTitle}>{isEdit?"Editar Reparación":"Nueva Reparación"}</div>{isEdit&&<div style={{fontSize:11,color:"#666",marginTop:3}}>{rep.codigo}</div>}</div>
          <button style={S.closeBtn} onClick={onClose}><X size={14} color="#666"/></button>
        </div>
        <div style={S.mBody}>
          {error&&<div style={S.errBox}>{error}</div>}
          <div style={S.fGrid}>
            <Field label="Tipo de equipo *">
              <select style={S.sel} value={form.tipoEquipo} onChange={e=>set("tipoEquipo",e.target.value)}>
                {TIPOS.map(t=><option key={t} value={t}>{TIPOS_EMO[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select style={S.sel} value={form.estado} onChange={e=>set("estado",e.target.value)}>
                {ESTADOS.map(e=><option key={e.v} value={e.v}>{e.l}</option>)}
              </select>
            </Field>
            <Field label="Marca *"><input style={S.inp} value={form.marca} onChange={e=>set("marca",e.target.value)} placeholder="Sony, Nintendo, Apple..."/></Field>
            <Field label="Modelo *"><input style={S.inp} value={form.modelo} onChange={e=>set("modelo",e.target.value)} placeholder="PS5, Switch, iPhone 14..."/></Field>
            <Field label="Precio (COP)"><input style={S.inp} type="number" value={form.precio} onChange={e=>set("precio",e.target.value)} placeholder="0"/></Field>
            {isEdit&&<Field label="Notas del cambio"><input style={S.inp} value={form.notas} onChange={e=>set("notas",e.target.value)} placeholder="Motivo del cambio..."/></Field>}
          </div>
          <Field label="Descripción del problema *">
            <textarea style={{...S.inp,minHeight:70,resize:"vertical"}} value={form.descripcionProblema} onChange={e=>set("descripcionProblema",e.target.value)} placeholder="Describe el problema del equipo..."/>
          </Field>
          <Field label="Diagnóstico (opcional)">
            <textarea style={{...S.inp,minHeight:60,resize:"vertical"}} value={form.diagnostico} onChange={e=>set("diagnostico",e.target.value)} placeholder="Diagnóstico técnico..."/>
          </Field>
          <Field label={`Fotos (${fotos.length}/5)`}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              {fotos.map((f,i)=>(
                <div key={i} style={{position:"relative"}}>
                  <img src={f} alt="" style={{width:72,height:72,borderRadius:10,objectFit:"cover",border:"1px solid #2a2a2a"}}/>
                  <button style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",background:"#ff3b3b",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setFotos(p=>p.filter((_,j)=>j!==i))}><X size={10} color="#fff"/></button>
                </div>
              ))}
              {fotos.length<5&&(
                <button style={S.photoBtn} onClick={()=>fileRef.current?.click()}>
                  <Camera size={18} color="#39ff14"/>
                  <span style={{fontSize:10,color:"#39ff14",fontWeight:700}}>Agregar</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleFotos}/>
          </Field>
        </div>
        <div style={S.mFoot}>
          <button style={S.ghost} onClick={onClose}>Cancelar</button>
          <button style={S.primary} onClick={save} disabled={saving}><Save size={13} color="#000"/> {saving?"Guardando...":isEdit?"Guardar cambios":"Crear reparación"}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const G="#39ff14", BG0="#080808", BG1="#0d0d0d", BR="#1e1e1e", FONT="'JetBrains Mono',monospace";
const S = {
  page:{ minHeight:"100vh",background:BG0,fontFamily:FONT },
  head:{ padding:"28px 32px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 },
  title:{ fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:900,color:"#efefef",margin:0 },
  sub:{ fontSize:11,color:"#666",margin:"4px 0 0" },
  srch:{ margin:"0 32px 16px",display:"flex",alignItems:"center",gap:10,background:BG1,border:`1px solid ${BR}`,borderRadius:10,padding:"0 14px" },
  srchInput:{ flex:1,background:"none",border:"none",outline:"none",padding:"10px 0",fontSize:13,color:"#ccc",fontFamily:FONT },
  clearBtn:{ background:"none",border:"none",cursor:"pointer",display:"flex",padding:4 },
  loadBox:{ display:"flex",justifyContent:"center",padding:60 },
  tWrap:{ background:BG1,border:`1px solid ${BR}`,borderRadius:10,overflow:"hidden" },
  table:{ width:"100%",borderCollapse:"collapse" },
  th:{ padding:"10px 16px",textAlign:"left",fontSize:9,color:"#555",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,borderBottom:"1px solid #1a1a1a",background:"#0a0a0a" },
  tr:{ borderBottom:"1px solid #111",cursor:"pointer" },
  td:{ padding:"12px 16px",fontSize:12,color:"#888" },
  av:{ width:34,height:34,borderRadius:"50%",background:`${G}15`,border:`1px solid ${G}30`,display:"flex",alignItems:"center",justifyContent:"center",color:G,fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,flexShrink:0 },
  cNom:{ fontSize:13,color:"#eee",fontWeight:700 },
  cSub:{ fontSize:10,color:"#666",marginTop:2 },
  cEmail:{ fontSize:11,color:"#666" },
  cnt:{ display:"inline-block",padding:"3px 8px",borderRadius:10,fontSize:10,fontWeight:700,background:`${G}12`,color:G,border:`1px solid ${G}25` },
  dt:{ fontSize:10,color:"#666" },
  vBtn:{ display:"flex",alignItems:"center",gap:5,padding:"6px 10px",background:"none",border:`1px solid ${BR}`,borderRadius:7,color:"#666",fontSize:11,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap" },
  iBtn:{ width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:`1px solid ${BR}`,borderRadius:7,cursor:"pointer",color:"#555" },
  card:{ background:BG1,borderRadius:14,border:`1px solid ${BR}`,padding:"14px",cursor:"pointer" },
  pHead:{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 28px 16px",borderBottom:`1px solid ${BR}` },
  pInfo:{ display:"flex",alignItems:"flex-start",gap:16,padding:"20px 28px",borderBottom:`1px solid ${BR}`,flexWrap:"wrap" },
  tabs:{ display:"flex",padding:"16px 28px 0",borderBottom:`1px solid ${BR}` },
  tab:{ padding:"9px 16px",background:"none",border:"none",borderBottom:"2px solid transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:"#555",fontFamily:FONT },
  tabA:{ color:G,borderBottomColor:G },
  addBtn:{ display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:G,border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:700,color:"#000",fontFamily:FONT },
  backBtn:{ display:"flex",alignItems:"center",gap:7,background:"none",border:"none",cursor:"pointer",padding:"5px 0" },
  dGrid:{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 },
  dCard:{ background:BG1,border:`1px solid ${BR}`,borderRadius:12,padding:"14px 16px" },
  cTitle:{ fontSize:9,color:"#555",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:12 },
  ov:{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20 },
  modal:{ background:"#0e0e0e",border:"1px solid #2a2a2a",borderRadius:12,width:"100%",maxWidth:680,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden" },
  mHead:{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"18px 22px",borderBottom:"1px solid #1a1a1a",background:"#0a0a0a",flexShrink:0 },
  mTitle:{ fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:G },
  mBody:{ padding:"20px 22px",overflowY:"auto",flex:1 },
  mFoot:{ display:"flex",justifyContent:"flex-end",gap:10,padding:"14px 22px",borderTop:"1px solid #1a1a1a",flexShrink:0 },
  closeBtn:{ width:32,height:32,borderRadius:8,background:"#141414",border:`1px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" },
  fGrid:{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px" },
  inp:{ width:"100%",padding:"10px 12px",background:"#131313",border:`1px solid ${BR}`,borderRadius:9,color:"#ddd",fontSize:12,fontFamily:FONT,outline:"none" },
  sel:{ width:"100%",padding:"10px 12px",background:"#131313",border:`1px solid ${BR}`,borderRadius:9,color:"#ddd",fontSize:12,fontFamily:FONT,outline:"none",cursor:"pointer",appearance:"none" },
  photoBtn:{ width:72,height:72,borderRadius:10,border:`1px dashed ${G}50`,background:`${G}08`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:4 },
  errBox:{ background:"rgba(255,59,59,0.1)",border:"1px solid rgba(255,59,59,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#ff6b6b",marginBottom:14 },
  primary:{ display:"flex",alignItems:"center",gap:6,padding:"10px 16px",background:G,border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,color:"#000",fontFamily:FONT },
  ghost:{ padding:"10px 14px",background:"none",border:`1px solid ${BR}`,borderRadius:8,color:"#666",fontSize:12,cursor:"pointer",fontFamily:FONT },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .cl-dt { display: block; margin: 16px 32px 0; }
  .cl-mb { display: none;  margin: 16px 14px 0; }
  .p-pad { padding: 20px 28px 40px; }
  @media (max-width: 767px) {
    .cl-dt { display: none; }
    .cl-mb { display: block; }
    .p-pad { padding: 16px 14px 40px !important; }
  }
  .cl-tr:hover { background: #0f0f0f !important; }
  .cl-card:active { background: #0f0f0f !important; }
  .cl-back:active { opacity: 0.7; }
  .cl-vbtn:hover { border-color: #39ff14; color: #39ff14; }
  .cl-ibtn:hover  { border-color: #2a2a2a; color: #888; }
  .ac-spinner { width: 26px; height: 26px; border: 2px solid #1a1a1a; border-top-color: #39ff14; border-radius: 50%; animation: ac-spin 0.65s linear infinite; }
  @keyframes ac-spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 4px; }
`;
