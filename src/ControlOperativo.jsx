import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line,
} from "recharts";

const DIRECCIONES = [
  "Unidad de Mercado Masivo (UMC)",
  "Unidad de Mercado Corporativo (UMM)",
  "Gestión Humana",
  "Financiera",
  "Jurídica y Sostenibilidad",
  "Tecnología",
  "Planeación Estratégica",
  "Auditoría",
  "Riesgo y Control Interno",
];

function KearneySVG({ height = 18 }) {
  return (
    <svg height={height} viewBox="0 0 600 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="62" fontFamily="'Outfit',system-ui,sans-serif" fontSize="72" fontWeight="900" letterSpacing="12" fill="#1A1A18">KEARNEY</text>
    </svg>
  );
}

// ─── DIMENSIONES (deben coincidir con ModeloOperativo.jsx) ────────────────────
const DIMS_META = [
  { key:"talento", label:"Talento y Capacidades", num:"01", icon:"👥",
    subDetails:[
      { id:"t1", label:"Capacidades organizacionales", opp:"Mapa integral de capacidades conectado con estrategia, inversiones y desempeño; benchmark externo continuo.", ndesc:["Capacidades no definidas; lenguaje común inexistente.","Reconocimiento parcial; definición heterogénea por área.","Definición formal alineada con estrategia; usada para decisiones clave.","Mapa integral actualizado, medido y comparado contra benchmark externo."] },
      { id:"t2", label:"Aprendizaje y Desarrollo", opp:"Aprendizaje continuo diferenciado, con datos para anticipar reskilling/upskilling y medir impacto real.", ndesc:["Formación aislada y reactiva; sin arquitectura de aprendizaje.","Iniciativas definidas pero cobertura y seguimiento varían por área.","Agenda estructurada con currículos, seguimiento y evaluación de adopción.","Aprendizaje continuo diferenciado por segmento, con anticipación de necesidades y medición de impacto."] },
      { id:"t3", label:"Gestión del talento", opp:"Gestión estratégica y data-driven; anticipación de brechas, movilidad ágil y banca de sucesión robusta.", ndesc:["Gestión administrativa y transaccional; procesos fragmentados.","Procesos básicos sin integración estratégica; toma de decisiones reactiva.","Gestión integral con procesos consistentes de atracción, desempeño y sucesión.","Estratégica y data-driven; anticipa brechas y moviliza talento con agilidad."] },
      { id:"t4", label:"Propuesta de valor al empleado (EVP)", opp:"EVP distintiva, segmentada para talento crítico, monitoreada con indicadores de atracción y retención.", ndesc:["Sin EVP articulada; experiencia depende de prácticas heredadas.","Elementos aspiracionales definidos sin narrativa integrada ni segmentación.","EVP clara y alineada con cultura, desarrollo y prioridades del negocio.","EVP distintiva, segmentada para talento crítico y monitoreada con métricas concretas."] },
      { id:"t5", label:"Gestión del conocimiento", opp:"Conocimiento capturado, curado y reutilizado sistemáticamente; continuidad y menor dependencia de individuos.", ndesc:["Conocimiento en personas clave; transferencia informal; riesgo operativo alto.","Documentación parcial con bajo uso transversal y sin estándares comunes.","Mecanismos definidos para capturar y compartir conocimiento crítico.","Conocimiento integrado a la operación; capturado, curado y reutilizado sistemáticamente."] },
      { id:"t6", label:"Planificación estratégica de workforce", opp:"Planeación orientada a escenarios, integrada con estrategia; decisiones proactivas de build/buy/borrow.", ndesc:["Planeación reactiva de corto plazo; sin visión estructurada de demanda futura.","Ejercicios parciales ligados a presupuesto; horizonte limitado e integración escasa.","Proceso formal para proyectar necesidades futuras alineado con prioridades estratégicas.","Planeación orientada a escenarios integrada con estrategia, tecnología y modelo operativo."] },
    ]},
  { key:"organizacion", label:"Organización y Gobernanza", num:"02", icon:"🏗️",
    subDetails:[
      { id:"o1", label:"Estructura organizacional", opp:"Estructura clara, adaptable y orientada a valor; criterios de diseño explícitos y revisiones periódicas.", ndesc:["Estructura responde a historia, no a lógica de valor; solapamientos frecuentes.","Ajustes parciales; inconsistencias en criterios de diseño persisten.","Diseñada con criterios explícitos y alineada a capacidades y coordinación.","Clara, adaptable y orientada a valor con revisiones periódicas y reconfiguración ágil."] },
      { id:"o2", label:"Roles y responsabilidades", opp:"Roles con claridad de propósito, accountability e interfaces; actualizados conforme evoluciona el modelo operativo.", ndesc:["Roles ambiguos; zonas grises, trabajo duplicado y escalaciones innecesarias.","Definiciones parciales con múltiples interpretaciones y solapamientos.","La mayoría de roles clave tiene mandatos claramente definidos.","Roles con claridad plena de propósito, accountability e interfaces; actualizados continuamente."] },
      { id:"o3", label:"Jerarquías y spans de control", opp:"Jerarquías y spans optimizados con criterios explícitos; eficiencia estructural con empowerment y revisión periódica.", ndesc:["Jerarquías definidas de forma poco deliberada; complejidad y supervisión excesiva.","Análisis parciales; criterios no homogéneos entre áreas.","Criterios relativamente claros para niveles y spans según tipo de trabajo.","Optimizados con criterios de valor, velocidad y desarrollo de líderes; revisión periódica."] },
      { id:"o4", label:"Gobernanza y decision rights", opp:"Gobernanza con decision rights explícitos, foros racionalizados y equilibrio entre empowerment y control.", ndesc:["Gobernanza poco clara o centralizada; decisiones retrasadas o duplicadas.","Comités parciales con superposiciones y diferente madurez entre áreas.","Gobernanza formal con foros, umbrales y roles relativamente bien definidos.","Decisiones rápidas y claras con decision rights explícitos, foros racionalizados y trazabilidad."] },
    ]},
  { key:"liderazgo", label:"Liderazgo y Cultura", num:"03", icon:"🌟",
    subDetails:[
      { id:"l1", label:"Valores y comportamientos", opp:"Valores como referente real para decisiones; incorporados en incentivos, desarrollo, reconocimiento y gestión del desempeño.", ndesc:["Valores no claramente definidos; decisiones responden a hábitos individuales.","Valores aspiracionales sin guiar consistentemente decisiones o comportamientos.","Valores definidos en comportamientos esperados con nivel razonable de apropiación.","Referente real para decisiones; incorporados en liderazgo, incentivos y gestión del desempeño."] },
      { id:"l2", label:"Cultura corporativa", opp:"Cultura gestionada como activo estratégico; mecanismos para reforzarla, medirla y sostener cambios.", ndesc:["Cultura no explicitada ni gestionada; lógica implícita predomina.","Visión aspiracional sin mecanismos sólidos para movilizarla.","Cultura diagnosticada con agenda clara para reforzar atributos clave.","Gestionada como activo estratégico con mecanismos formales e informales y medición."] },
      { id:"l3", label:"Diversidad, equidad e inclusión (DEI)", opp:"DEI integrada con objetivos, métricas y accountability; entorno de pertenencia que amplía diversidad de pensamiento.", ndesc:["DEI no en la agenda; cumplimiento básico sin prácticas ni métricas.","Mensajes o políticas puntuales con alcance limitado y baja integración.","Lineamientos y prácticas incorporados en procesos clave; indicadores monitoreados.","Integrada al modelo de liderazgo y cultura con objetivos, métricas y accountability."] },
      { id:"l4", label:"Ways of working", opp:"Ways of working diseñados para velocidad y colaboración; rutinas, cadencias y herramientas consistentes.", ndesc:["Silos, dependencia de jerarquía y coordinación informal dominan.","Prácticas colaborativas con adopción desigual; hábitos tradicionales persisten.","Formas de trabajo relativamente consistentes desplegadas para coordinación transversal.","Diseñados para maximizar velocidad y colaboración; rutinas y herramientas consistentes."] },
      { id:"l5", label:"Excelencia del liderazgo", opp:"Liderazgo como fortaleza distintiva: estándares, desarrollo continuo, feedback y accountability a escala.", ndesc:["Liderazgo reactivo y funcional; baja alineación en prioridades y comportamientos.","Algunas prácticas comunes; efectividad heterogénea y dependiente de perfiles individuales.","Marco claro de liderazgo reforzado a través de evaluación y desarrollo.","Fortaleza distintiva: estándares, desarrollo continuo, feedback y accountability que aseguran transformación."] },
    ]},
  { key:"procesos", label:"Procesos", num:"04", icon:"⚙️",
    subDetails:[
      { id:"p1", label:"Diseño end-to-end de procesos", opp:"Procesos gestionados end-to-end con foco en cliente, valor y simplicidad; revisión sistemática.", ndesc:["Procesos definidos desde funciones; handoffs, redundancias y puntos ciegos.","Enfoque end-to-end parcial; fragmentación y reprocesos en transversales.","Procesos clave definidos end-to-end con roles e interdependencias claras.","Diseño y gestión end-to-end con foco en cliente, valor, simplicidad y escalabilidad."] },
      { id:"p2", label:"Desempeño y métricas de procesos", opp:"Métricas end-to-end confiables y accionables; usadas para priorizar mejoras y anticipar desvíos.", ndesc:["Sin medición estructurada; visibilidad limitada de tiempos, calidad o valor.","KPIs para algunas áreas; no reflejan lógica end-to-end ni guían decisiones.","Métricas de desempeño, calidad y tiempos revisadas con regularidad.","Métricas end-to-end conectadas con estrategia; confiables, accionables y para priorizar mejoras."] },
      { id:"p3", label:"Interfaces y SLAs", opp:"Interfaces y SLAs estructurados, medidos y revisados periódicamente; reducen fricciones y mejoran accountability.", ndesc:["Interfaces ambiguas; sin acuerdos de tiempos, entregables ni escalamiento.","Acuerdos básicos parciales; cumplimiento poco monitoreado.","Interfaces críticas con responsabilidades y SLAs razonablemente claros.","Gestión estructurada orientada a valor; acuerdos claros, medidos y revisados."] },
      { id:"p4", label:"Automatización e inteligencia artificial", opp:"Automatización e IA integradas en procesos; priorización por valor, escalamiento sostenible y gobierno de impacto.", ndesc:["Dependencia de tareas manuales; uso de IA inexistente o desconectado.","Automatizaciones puntuales sin escalamiento ni rediseño integral del proceso.","Partes relevantes automatizadas con lógica de priorización y beneficios tangibles.","Automatización e IA integradas deliberadamente; priorización por valor y gobierno de impacto."] },
      { id:"p5", label:"Mejora continua", opp:"Mejora continua como ADN operativo: datos, ownership claro y cultura de resolución sistemática.", ndesc:["Mejora esporádica y reactiva; sin disciplina ni backlog priorizado.","Ejercicios puntuales; no institucionalizado ni conectado con métricas y ownership.","Mecanismos definidos con responsables, rutinas y herramientas.","ADN operativo: datos, ownership claro, cultura de resolución sistemática y beneficios sostenidos."] },
    ]},
  { key:"tecnologia", label:"Tecnología y Datos", num:"05", icon:"💻",
    subDetails:[
      { id:"td1", label:"Arquitectura tecnológica", opp:"Arquitectura modular y escalable con principios explícitos que facilitan interoperabilidad y velocidad de cambio.", ndesc:["Arquitectura fragmentada; decisiones locales y múltiples dependencias.","Visión parcial; aplicación desigual con deuda tecnológica persistente.","Arquitectura definida con principios de integración, modularidad y escalabilidad.","Modular, escalable y gobernada con principios explícitos; facilita interoperabilidad."] },
      { id:"td2", label:"Sistemas y herramientas de TI", opp:"Sistemas integrados y confiables; landscape gestionado que habilita automatización y escalabilidad.", ndesc:["Sistemas inconsistentes; proliferación de soluciones y workarounds.","Algunos consolidados; coexisten herramientas duplicadas e integraciones parciales.","Sistemas clave soportan la mayoría de procesos de forma integrada.","Integrados, confiables y orientados a valor; landscape gestionado con disciplina."] },
      { id:"td3", label:"Datos y analítica avanzada", opp:"Compañía data-driven: fuentes confiables, gobierno claro y analítica avanzada para captura de valor.", ndesc:["Datos para reporting histórico; calidad, acceso y definiciones inconsistentes.","Iniciativas de BI en algunas áreas; información fragmentada sin gobierno integrado.","Información confiable para decisiones con avances en gobierno y analítica.","Data-driven: gobierno claro, analítica avanzada y uso extendido en decisiones estratégicas."] },
    ]},
  { key:"cadena", label:"Cadena de Valor y Alianzas", num:"06", icon:"🔗",
    subDetails:[
      { id:"cv1", label:"Make vs. buy", opp:"Make vs. buy como palanca estratégica; revisión periódica con criterios robustos alineados a creación de valor.", ndesc:["Decisiones caso a caso sin criterios explícitos de capacidades o costo total.","Criterios básicos sin aplicación uniforme ni visión integral de capacidades estratégicas.","Lineamientos claros incorporando costo, calidad, riesgo y criticidad estratégica.","Gestión como palanca estratégica con revisión periódica y criterios robustos."] },
      { id:"cv2", label:"Gestión de ecosistema y partners", opp:"Ecosistema de partners orquestado como extensión del modelo operativo; colaboración sostenida.", ndesc:["Relaciones transaccionales; sin modelo para gestionar desempeño o valor conjunto.","Algunos partners con seguimiento; gestión desigual con foco limitado en valor.","Partners relevantes gestionados con criterios de desempeño, SLAs y gobernanza.","Ecosistema orquestado como extensión del modelo; gobierno claro y métricas de valor."] },
      { id:"cv3", label:"Servicios compartidos", opp:"Servicios compartidos como plataforma de eficiencia: catálogo claro, SLAs, automatización y mejora continua.", ndesc:["Sin lógica clara de centralización; actividades dispersas con calidad variable.","Algunas centralizaciones parciales; catálogos y SLAs poco maduros.","Modelo para actividades seleccionadas con alcance y niveles de servicio definidos.","Plataforma de eficiencia con catálogo, SLAs, automatización, métricas y mejora continua."] },
      { id:"cv4", label:"Huella geográfica", opp:"Huella geográfica gestionada estratégicamente; equilibra talento, resiliencia y costo con revisión proactiva.", ndesc:["Responde a legados históricos sin lógica de costo, talento o resiliencia.","Decisiones puntuales sin arquitectura integral de huella geográfica.","Lógica clara para ubicar actividades según naturaleza del trabajo y eficiencia.","Gestión estratégica equilibrando cercanía al cliente, talento, resiliencia y escalabilidad."] },
    ]},
];

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const PASSWORD = "kearney2025";
const LV_META = [
  { v:1, label:"Naciente",      c:"#78716C", bg:"#FAFAF8" },
  { v:2, label:"Emergente",     c:"#D97706", bg:"#FFFBEB" },
  { v:3, label:"Robusto",       c:"#2563EB", bg:"#EFF6FF" },
  { v:4, label:"Best-in-Class", c:"#059669", bg:"#ECFDF5" },
];
const TOTAL_SUBS = DIMS_META.reduce((a, d) => a + d.subDetails.length, 0); // 27
const RED = "#7823DC";

function lvMeta(v) { return LV_META[Math.max(0, Math.min(3, Math.round(v)-1))] || LV_META[0]; }
function avgArr(arr) {
  const a = arr.filter(x => x != null && !isNaN(x));
  return a.length ? parseFloat((a.reduce((s,x)=>s+x,0)/a.length).toFixed(2)) : null;
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
function getLevelColor(v) { return LV_META[Math.max(0,Math.min(3,Math.round(v)-1))]?.c || "#78716C"; }
function getLevelLabel(v) { return LV_META[Math.max(0,Math.min(3,Math.round(v)-1))]?.label || "—"; }

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;font-family:'Outfit',system-ui,sans-serif;}
body{margin:0;background:#F7F5F2;color:#1A1A18;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#D9D5CF;border-radius:99px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both;}
.fade-up-1{animation:fadeUp .4s .06s cubic-bezier(.22,1,.36,1) both;}
.fade-up-2{animation:fadeUp .4s .12s cubic-bezier(.22,1,.36,1) both;}
.fade-up-3{animation:fadeUp .4s .18s cubic-bezier(.22,1,.36,1) both;}
.spin{animation:spin .8s linear infinite;}
.row-hover{transition:background .12s;cursor:pointer;}
.row-hover:hover{background:rgba(120,35,220,0.04)!important;}
.btn-action{transition:all .15s cubic-bezier(.22,1,.36,1);}
.btn-action:hover{transform:translateY(-1px);opacity:.88;}
.nav-item{transition:all .15s;cursor:pointer;border-radius:10px;}
.nav-item:hover{background:rgba(120,35,220,0.07)!important;}
.nav-item.active{background:rgba(120,35,220,0.12)!important;}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function ScoreBadge({ v, sm, pct }) {
  if (!v && pct != null) return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:sm?"2px 6px":"3px 9px", borderRadius:99, background:"#F3F2F0", fontSize:sm?10:12, color:"#888", fontWeight:600 }}>
      {pct}%
    </span>
  );
  if (!v) return <span style={{ color:"#CCC", fontSize:sm?11:13 }}>—</span>;
  const c = getLevelColor(v);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:sm?"2px 7px":"3px 10px", borderRadius:99, background:c+"18", border:`1px solid ${c}40`, fontSize:sm?10:12, fontWeight:700, color:c }}>
      <span style={{ width:sm?5:6, height:sm?5:6, borderRadius:"50%", background:c }} />
      {parseFloat(v).toFixed(1)}
    </span>
  );
}

function StatCard({ icon, label, value, color, delay }) {
  return (
    <div className={`fade-up-${delay}`} style={{ background:"#FFFFFF", borderRadius:16, padding:"22px 24px", border:"1px solid #E8E4DF" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:11, color:"#999", fontWeight:600, textTransform:"uppercase", letterSpacing:".1em", marginBottom:10 }}>{label}</div>
          <div style={{ fontSize:32, fontWeight:900, color:color||"#1A1A18", letterSpacing:"-.02em", lineHeight:1 }}>{value}</div>
        </div>
        <div style={{ width:40, height:40, borderRadius:10, fontSize:18, background:(color||RED)+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
      </div>
    </div>
  );
}

function MiniBar({ value, max=4, color=RED }) {
  return (
    <div style={{ height:5, background:"#F0EDE9", borderRadius:99, overflow:"hidden", flex:1 }}>
      <div style={{ height:"100%", width:`${Math.min(100,(value/max)*100)}%`, background:color, borderRadius:99, transition:"width .5s" }} />
    </div>
  );
}

function AnalyticsCard({ children, style={} }) {
  return <div style={{ background:"#FFFFFF", borderRadius:16, border:"1px solid #E8E4DF", padding:"22px 24px", ...style }}>{children}</div>;
}
function AnalyticsLabel({ children }) {
  return <div style={{ fontSize:10, fontWeight:700, color:"#BBB", textTransform:"uppercase", letterSpacing:".14em", marginBottom:14 }}>{children}</div>;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  function attempt() {
    if (pw === PASSWORD) onLogin();
    else setErr(true);
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F7F5F2" }}>
      <div className="fade-up" style={{ width:360, padding:"48px 40px", background:"#FFFFFF", borderRadius:20, border:"1px solid #E8E4DF", boxShadow:"0 40px 100px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:10 }}>📊</div>
          <div style={{ fontSize:17, fontWeight:800, color:"#1A1A18", marginBottom:4 }}>Tablero de Control</div>
          <div style={{ fontSize:11, fontWeight:700, color:RED, letterSpacing:".12em", textTransform:"uppercase" }}>Modelo Operativo · Admin</div>
        </div>
        <input
          type="password" placeholder="Contraseña"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key==="Enter" && attempt()}
          autoFocus
          style={{ width:"100%", padding:"12px 16px", borderRadius:10, marginBottom:8, background:"#F7F5F2", border:`1.5px solid ${err?RED:"#E8E4DF"}`, color:"#1A1A18", fontSize:14, outline:"none" }}
        />
        {err && <div style={{ fontSize:11, color:RED, marginBottom:12 }}>Contraseña incorrecta</div>}
        <button onClick={attempt} className="btn-action" style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#7823DC,#5A1AA0)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 4px 14px rgba(120,35,220,0.25)", marginBottom:12 }}>
          Entrar →
        </button>
        <button onClick={() => navigate("/")} style={{ width:"100%", padding:"10px", borderRadius:10, border:"1px solid #E8E4DF", background:"transparent", color:"#888", fontSize:12, cursor:"pointer" }}>
          ← Volver al modelo
        </button>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ evaluacion, respuestas, onClose }) {
  const resps = respuestas.filter(r => r.evaluacion_id === evaluacion.id);
  // Build label lookup
  const labelMap = {};
  DIMS_META.forEach(d => d.subDetails.forEach(s => { labelMap[s.id] = s.label; }));

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)", padding:24 }} onClick={onClose}>
      <div className="fade-up" onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:680, maxHeight:"85vh", background:"#FFFFFF", borderRadius:20, border:"1px solid #E8E4DF", boxShadow:"0 40px 80px rgba(0,0,0,0.2)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"22px 28px", borderBottom:"1px solid #F0EDE9", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#1A1A18" }}>
              {evaluacion.direccion || "Evaluación"}{evaluacion.rol ? <span style={{ color:"#AAA", fontWeight:500 }}> · {evaluacion.rol}</span> : ""}
            </div>
            <div style={{ fontSize:11, color:"#BBB", marginTop:3 }}>{formatDate(evaluacion.created_at)} · {resps.length} respuestas</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <ScoreBadge v={evaluacion.score_global} />
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:"1px solid #E8E4DF", background:"#F7F5F2", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
        </div>
        <div style={{ padding:"16px 28px", borderBottom:"1px solid #F0EDE9", display:"flex", gap:10, flexWrap:"wrap", flexShrink:0 }}>
          {DIMS_META.map(d => (
            <div key={d.key} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:8, background:"#F7F5F2", border:"1px solid #E8E4DF" }}>
              <span style={{ fontSize:12 }}>{d.icon}</span>
              <span style={{ fontSize:10, fontWeight:700, color:"#BBB" }}>{d.num}</span>
              <span style={{ fontSize:11, color:"#888" }}>{d.label.split(" ")[0]}</span>
              <ScoreBadge v={evaluacion[`score_${d.key}`]} sm />
            </div>
          ))}
        </div>
        <div style={{ overflow:"auto", padding:"20px 28px", display:"flex", flexDirection:"column", gap:18 }}>
          {DIMS_META.map(d => {
            const dimResps = resps.filter(r=>r.dimension_key===d.key);
            if (!dimResps.length) return null;
            return (
              <div key={d.key}>
                <div style={{ fontSize:11, fontWeight:700, color:RED, textTransform:"uppercase", letterSpacing:".1em", marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
                  {d.icon} {d.num} · {d.label}<ScoreBadge v={evaluacion[`score_${d.key}`]} sm />
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {dimResps.map(r => {
                    const c = getLevelColor(r.valor);
                    const subLabel = labelMap[r.subdimension_id] || r.subdimension_id;
                    return (
                      <div key={r.subdimension_id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 14px", borderRadius:10, background:"#F7F5F2", border:"1px solid #EEEBE6" }}>
                        <span style={{ fontSize:12, color:"#555" }}>{subLabel}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:80, height:5, borderRadius:99, background:"#E8E4DF", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${(r.valor/4)*100}%`, background:c, borderRadius:99 }} />
                          </div>
                          <span style={{ fontSize:10, fontWeight:700, color:c, background:c+"18", padding:"2px 8px", borderRadius:99, border:`1px solid ${c}30` }}>{r.valor} · {getLevelLabel(r.valor)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {resps.length === 0 && <div style={{ textAlign:"center", color:"#AAA", fontSize:13, padding:"32px 0" }}>Sin respuestas registradas</div>}
        </div>
      </div>
    </div>
  );
}

// ─── MONITOR TAB ──────────────────────────────────────────────────────────────
function MonitorTab({ evaluaciones, respuestas, selected, setSelected, onDelete, loading }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [detail, setDetail] = useState(null);

  const completas = evaluaciones.filter(e => respuestas.filter(r=>r.evaluacion_id===e.id).length === TOTAL_SUBS).length;
  const scores = evaluaciones.map(e => e.score_global).filter(Boolean);
  const avgScore = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2) : null;

  const filtered = evaluaciones
    .filter(e => {
      const q = search.toLowerCase();
      return !q || (e.direccion||"").toLowerCase().includes(q) || (e.rol||"").toLowerCase().includes(q);
    })
    .sort((a,b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === "string") { va = va?.toLowerCase(); vb = vb?.toLowerCase(); }
      if (va < vb) return sortDir==="asc"?-1:1;
      if (va > vb) return sortDir==="asc"?1:-1;
      return 0;
    });

  function toggleSort(col) {
    if (sortBy===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortBy(col); setSortDir("desc"); }
  }

  const SortIcon = ({ col }) => (
    <span style={{ marginLeft:3, opacity:sortBy===col?1:0.3, fontSize:9 }}>
      {sortBy===col?(sortDir==="asc"?"▲":"▼"):"⇅"}
    </span>
  );

  const COL = `minmax(60px,0.5fr) minmax(90px,1fr) 60px ${DIMS_META.map(()=>"48px").join(" ")} 100px 32px 32px`;

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
        <StatCard icon="📋" label="Total evaluaciones" value={evaluaciones.length} delay={1} />
        <StatCard icon="⭐" label="Score promedio" value={avgScore||"—"} color="#D97706" delay={2} />
        <StatCard icon="📊" label="Respuestas totales" value={respuestas.length} color="#2563EB" delay={3} />
        <StatCard icon="✅" label={`Completas (${TOTAL_SUBS} resp)`} value={completas} color="#059669" delay={4} />
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:16, alignItems:"center" }}>
        <input placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, padding:"10px 14px", borderRadius:10, background:"#FFFFFF", border:"1px solid #E8E4DF", color:"#1A1A18", fontSize:13, outline:"none" }} />
        {selected.length > 0 && (
          <button onClick={() => onDelete(selected)} className="btn-action" style={{ padding:"10px 18px", borderRadius:10, border:`1px solid ${RED}40`, background:RED+"18", color:RED, fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
            🗑 Eliminar ({selected.length})
          </button>
        )}
      </div>

      <div style={{ background:"#FFFFFF", borderRadius:16, border:"1px solid #E8E4DF", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:COL, padding:"12px 20px", background:"#FBF9F7", borderBottom:"1px solid #E8E4DF", gap:8, alignItems:"center" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:".1em", cursor:"pointer" }} onClick={()=>toggleSort("score_global")}>
            Global<SortIcon col="score_global"/>
          </div>
          <div style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:".08em", cursor:"pointer" }} onClick={()=>toggleSort("direccion")}>
            Dirección<SortIcon col="direccion"/>
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:".1em" }}>Resp</div>
          {DIMS_META.map(d => (
            <div key={d.key} style={{ fontSize:9, fontWeight:700, color:"#BBB", textTransform:"uppercase", letterSpacing:".06em", textAlign:"center" }} title={d.label}>{d.icon}</div>
          ))}
          <div style={{ fontSize:11, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:".1em", cursor:"pointer" }} onClick={()=>toggleSort("created_at")}>
            Fecha<SortIcon col="created_at"/>
          </div>
          <div /><div />
        </div>

        {loading && filtered.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center" }}>
            <div className="spin" style={{ display:"inline-block", width:22, height:22, border:"2px solid #333", borderTopColor:RED, borderRadius:"50%" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center", color:"#AAA", fontSize:13 }}>
            {search ? "Sin resultados" : "No hay evaluaciones aún"}
          </div>
        ) : filtered.map((e, i) => {
          const eResps = respuestas.filter(r=>r.evaluacion_id===e.id);
          const pct = e.score_global ? null : Math.round((eResps.length/TOTAL_SUBS)*100);
          return (
            <div key={e.id} className="row-hover"
              style={{ display:"grid", gridTemplateColumns:COL, padding:"13px 20px", gap:8, alignItems:"center", borderBottom:i<filtered.length-1?"1px solid #F0EDE9":"none", background:selected.includes(e.id)?"rgba(120,35,220,0.04)":"transparent", cursor:"default" }}>
              <div style={{ textAlign:"center" }}>
                <ScoreBadge v={e.score_global} pct={pct} />
              </div>
              <div style={{ fontSize:10, color:"#666", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={e.direccion||"—"}>{e.direccion ? e.direccion.replace(/\s*\(.*\)/, "").split(" ").slice(0,3).join(" ") : "—"}</div>
              <div style={{ fontSize:12, color:"#AAA", textAlign:"center" }}>{eResps.length}/{TOTAL_SUBS}</div>
              {DIMS_META.map(d => (
                <div key={d.key} style={{ textAlign:"center" }}>
                  <ScoreBadge v={e[`score_${d.key}`]} sm />
                </div>
              ))}
              <div style={{ fontSize:11, color:"#AAA" }}>
                {formatDate(e.created_at)}
                {!e.score_global && eResps.length > 0 && (
                  <div style={{ marginTop:3, height:3, borderRadius:99, background:"#E8E4DF", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.round(eResps.length/TOTAL_SUBS*100)}%`, background:RED, borderRadius:99 }} />
                  </div>
                )}
              </div>
              <button onClick={()=>onDelete([e.id])} className="btn-action" style={{ width:32, height:32, borderRadius:8, border:`1px solid ${RED}30`, background:RED+"10", color:RED, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }} title="Eliminar">🗑</button>
              <button onClick={()=>setDetail(e)} className="btn-action" style={{ width:32, height:32, borderRadius:8, border:"1px solid #2563EB30", background:"#2563EB10", color:"#2563EB", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }} title="Ver detalle">👁</button>
            </div>
          );
        })}
      </div>

      {filtered.length > 0 && (
        <div style={{ marginTop:10, fontSize:11, color:"#444" }}>
          {filtered.length} evaluaciones · {selected.length} seleccionadas
        </div>
      )}

      {detail && <DetailModal evaluacion={detail} respuestas={respuestas} onClose={()=>setDetail(null)} />}
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
function AnalyticsTab({ evaluaciones, respuestas }) {
  const [gapsView, setGapsView] = useState("critical");

  const enriched = useMemo(() => evaluaciones.map(e => {
    if (e.score_global) return e;
    const eResps = respuestas.filter(r=>r.evaluacion_id===e.id);
    if (!eResps.length) return e;
    const dimScores = DIMS_META.reduce((acc,d) => {
      const vals = eResps.filter(r=>r.dimension_key===d.key).map(r=>r.valor);
      acc[`score_${d.key}`] = vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
      return acc;
    }, {});
    const dVals = Object.values(dimScores).filter(Boolean);
    const score_global = dVals.length ? parseFloat((dVals.reduce((a,b)=>a+b,0)/dVals.length).toFixed(2)) : null;
    return { ...e, ...dimScores, score_global };
  }), [evaluaciones, respuestas]);

  const globalAvg = avgArr(enriched.map(e=>e.score_global));
  const dimAvgs   = DIMS_META.map(d => ({ ...d, score: avgArr(enriched.map(e=>e[`score_${d.key}`])) }));
  const strongest = [...dimAvgs].filter(d=>d.score).sort((a,b)=>b.score-a.score)[0];
  const weakest   = [...dimAvgs].filter(d=>d.score).sort((a,b)=>a.score-b.score)[0];
  const spread    = strongest && weakest ? parseFloat((strongest.score-weakest.score).toFixed(1)) : null;

  const distData = LV_META.map(l => ({
    ...l,
    count: enriched.filter(e=>Math.round(e.score_global)===l.v).length,
    pct: enriched.length ? Math.round(enriched.filter(e=>Math.round(e.score_global)===l.v).length/enriched.length*100) : 0,
  }));

  const radarData = dimAvgs.map(d => ({ dim: d.label.split(" ")[0], value: d.score||0, fullMark:4 }));

  // Gaps: critical <= 2, moderate > 2 && <= 3
  const gapsData = useMemo(() => {
    const gaps = [];
    DIMS_META.forEach(d => {
      const dimScore = avgArr(enriched.map(e=>e[`score_${d.key}`]));
      if (dimScore && dimScore < 3.5) {
        const allResps = respuestas.filter(r => enriched.map(e=>e.id).includes(r.evaluacion_id) && r.dimension_key===d.key);
        const subScores = d.subDetails.map(sub => {
          const vals = allResps.filter(r=>r.subdimension_id===sub.id).map(r=>r.valor).filter(Boolean);
          const avg = vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
          return { ...sub, score: avg };
        }).filter(s => s.score && s.score < 3.5).sort((a,b)=>a.score-b.score);

        gaps.push({
          key:d.key, dimLabel:d.label, dimNum:d.num, dimIcon:d.icon,
          score:dimScore, gap:parseFloat((4-dimScore).toFixed(1)),
          n:enriched.filter(e=>e[`score_${d.key}`]).length,
          subScores,
          topOpp: subScores[0]?.opp || "",
        });
      }
    });
    return gaps.sort((a,b)=>a.score-b.score);
  }, [enriched, respuestas]);

  const critGaps = gapsData.filter(g=>g.score<=2);
  const modGaps  = gapsData.filter(g=>g.score>2&&g.score<=3);

  if (!evaluaciones.length) return (
    <AnalyticsCard><div style={{ textAlign:"center", padding:"48px 0", color:"#AAA", fontSize:13 }}>No hay evaluaciones registradas aún.</div></AnalyticsCard>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { icon:"⭐", label:"Score Global Prom.", value:globalAvg?.toFixed(2)||"—", color:globalAvg?lvMeta(globalAvg).c:"#AAA" },
          { icon:"💪", label:"Componente más fuerte", value:strongest?.label||"—", sub:strongest?.score?.toFixed(1), color:"#059669" },
          { icon:"⚠️", label:"Componente más débil", value:weakest?.label||"—", sub:weakest?.score?.toFixed(1), color:RED },
          { icon:"📐", label:"Dispersión (max−min)", value:spread!=null?`${spread} pts`:"—", color:spread>=1.5?RED:spread>=0.8?"#D97706":"#059669" },
        ].map((k,i)=>(
          <AnalyticsCard key={i} style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>{k.icon}</div>
            <div style={{ fontSize:9.5, fontWeight:700, color:"#CCC", textTransform:"uppercase", letterSpacing:".12em", marginBottom:4 }}>{k.label}</div>
            <div style={{ fontSize:k.sub?14:22, fontWeight:900, color:k.color, lineHeight:1.2 }}>{k.value}</div>
            {k.sub && <div style={{ fontSize:11, color:"#AAA", marginTop:2 }}>{k.sub} / 4</div>}
          </AnalyticsCard>
        ))}
      </div>

      {/* Distribución + Radar */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <AnalyticsCard>
          <AnalyticsLabel>Distribución por Nivel Global</AnalyticsLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {distData.map(l=>(
              <div key={l.v} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:90, fontSize:11, fontWeight:600, color:l.c, flexShrink:0 }}>{l.label}</div>
                <MiniBar value={l.count} max={Math.max(...distData.map(x=>x.count),1)} color={l.c} />
                <div style={{ fontSize:13, fontWeight:800, color:l.c, width:22, textAlign:"right", flexShrink:0 }}>{l.count}</div>
                <div style={{ fontSize:10, color:"#CCC", width:32, flexShrink:0 }}>{l.pct}%</div>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        <AnalyticsCard>
          <AnalyticsLabel>Radar de Madurez Promedio</AnalyticsLabel>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top:10, right:30, bottom:10, left:30 }}>
              <PolarGrid stroke="#F0EDE9" />
              <PolarAngleAxis dataKey="dim" tick={{ fill:"#AAA", fontSize:9, fontWeight:600 }} />
              <PolarRadiusAxis angle={90} domain={[0,4]} tick={{ fontSize:7, fill:"#CCC" }} tickCount={5} />
              <Radar dataKey="value" stroke={RED} fill={RED} fillOpacity={0.1} strokeWidth={2.5} />
              <Tooltip formatter={v=>[`${v} / 4`,"Score"]} contentStyle={{ borderRadius:8, fontSize:11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>

      {/* Score por componente */}
      <AnalyticsCard>
        <AnalyticsLabel>Score por Componente</AnalyticsLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[...dimAvgs].sort((a,b)=>(b.score||0)-(a.score||0)).map(d => {
            const l = d.score ? lvMeta(d.score) : null;
            return (
              <div key={d.key} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:22, fontSize:14, flexShrink:0 }}>{d.icon}</div>
                <div style={{ width:24, fontSize:9, fontWeight:700, color:"#CCC", flexShrink:0 }}>{d.num}</div>
                <div style={{ width:180, fontSize:12, fontWeight:600, color:"#555", flexShrink:0 }}>{d.label}</div>
                <MiniBar value={d.score||0} color={l?.c||"#E8E4DF"} />
                <div style={{ fontSize:13, fontWeight:800, color:l?.c||"#CCC", flexShrink:0, width:32, textAlign:"right" }}>{d.score?.toFixed(2)||"—"}</div>
                <div style={{ fontSize:10, color:"#CCC", flexShrink:0 }}>/4</div>
                {d.score && <span style={{ fontSize:9, fontWeight:700, color:l?.c, background:l?.c+"18", padding:"2px 8px", borderRadius:99, flexShrink:0 }}>{l?.label}</span>}
              </div>
            );
          })}
        </div>
      </AnalyticsCard>

      {/* Brechas */}
      <AnalyticsCard style={{ padding:0, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", borderBottom:"1px solid #F0EDE9" }}>
          <div>
            <AnalyticsLabel style={{ marginBottom:2 }}>Análisis de Brechas</AnalyticsLabel>
            <div style={{ fontSize:11, color:"#AAA" }}>{critGaps.length} críticas · {modGaps.length} moderadas</div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {[
              { id:"critical", label:"🚨 Críticas",  count:critGaps.length, c:"#DC2626" },
              { id:"moderate", label:"⚡ Moderadas", count:modGaps.length,  c:"#D97706" },
            ].map(t=>(
              <button key={t.id} onClick={()=>setGapsView(t.id)} style={{ padding:"7px 16px", borderRadius:99, fontSize:11, fontWeight:700, cursor:"pointer", border:`1.5px solid ${gapsView===t.id?t.c:"#E8E4DF"}`, background:gapsView===t.id?t.c+"15":"#FAFAFA", color:gapsView===t.id?t.c:"#AAA", display:"flex", alignItems:"center", gap:5 }}>
                {t.label}<span style={{ background:gapsView===t.id?t.c:"#E8E4DF", color:gapsView===t.id?"#fff":"#888", borderRadius:99, fontSize:10, fontWeight:800, padding:"1px 7px" }}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding:"20px 24px" }}>
          {gapsView==="critical" && (
            critGaps.length===0
              ? <div style={{ textAlign:"center", color:"#AAA", fontSize:13, padding:"40px 0" }}>✅ No hay brechas críticas (score ≤ 2)</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {critGaps.map(g=>{
                    const l=lvMeta(g.score);
                    return (
                      <div key={g.key} style={{ borderRadius:14, border:"2px solid #FECACA", overflow:"hidden" }}>
                        <div style={{ background:"linear-gradient(135deg,#FEF2F2,#FFF5F5)", padding:"16px 20px", borderBottom:"1px solid #FECACA" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ width:44, height:44, borderRadius:12, background:"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:20 }}>{g.dimIcon}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                <span style={{ fontSize:10, fontWeight:700, color:"#DC2626", background:"#FEE2E2", padding:"2px 9px", borderRadius:99 }}>{g.dimNum}</span>
                                <span style={{ fontSize:15, fontWeight:900, color:"#1A1A18" }}>{g.dimLabel}</span>
                                <span style={{ padding:"3px 10px", borderRadius:99, fontSize:10, fontWeight:700, background:l.c+"18", color:l.c, border:`1px solid ${l.c}30` }}>{l.label} · {g.score.toFixed(2)}/4</span>
                                <span style={{ marginLeft:"auto", fontSize:12, fontWeight:800, color:"#DC2626" }}>Brecha: +{g.gap.toFixed(1)} pts</span>
                              </div>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ flex:1, height:7, background:"#FEE2E2", borderRadius:99, overflow:"hidden" }}>
                                  <div style={{ height:"100%", width:`${(g.score/4)*100}%`, background:"linear-gradient(90deg,#DC2626,#EF4444)", borderRadius:99 }}/>
                                </div>
                                <span style={{ fontSize:10, color:"#AAA", flexShrink:0 }}>{g.n} evals</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {g.topOpp && (
                          <div style={{ padding:"12px 20px", background:"#FFFBF8", borderBottom:"1px solid #FECACA", display:"flex", gap:10 }}>
                            <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
                            <div>
                              <div style={{ fontSize:9, fontWeight:700, color:"#059669", textTransform:"uppercase", letterSpacing:".1em", marginBottom:3 }}>Oportunidad clave</div>
                              <div style={{ fontSize:12, color:"#064E3B", lineHeight:1.65 }}>{g.topOpp}</div>
                            </div>
                          </div>
                        )}
                        {g.subScores?.length>0 && (
                          <div style={{ padding:"14px 20px" }}>
                            <div style={{ fontSize:10, fontWeight:700, color:"#AAA", textTransform:"uppercase", letterSpacing:".12em", marginBottom:10 }}>Sub-componentes más débiles</div>
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                              {g.subScores.slice(0,4).map((s,i)=>{
                                const sl=lvMeta(s.score);
                                return (
                                  <div key={i} style={{ borderRadius:10, border:`1px solid ${sl.c}25`, overflow:"hidden" }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", background:`${sl.c}08`, borderBottom:`1px solid ${sl.c}20` }}>
                                      <span style={{ fontSize:16, fontWeight:900, color:sl.c, minWidth:32, textAlign:"center" }}>{s.score.toFixed(1)}</span>
                                      <div style={{ flex:1 }}>
                                        <div style={{ fontSize:11, fontWeight:700, color:"#1A1A18" }}>{s.label}</div>
                                        {s.ndesc?.[Math.round(s.score)-1] && <div style={{ fontSize:9.5, color:"#AAA", marginTop:1 }}>{s.ndesc[Math.round(s.score)-1]}</div>}
                                      </div>
                                      <span style={{ padding:"2px 8px", borderRadius:99, fontSize:9.5, fontWeight:700, background:sl.c+"18", color:sl.c, flexShrink:0 }}>{sl.label}</span>
                                    </div>
                                    <div style={{ padding:"8px 14px", background:"#F0FDF4" }}>
                                      <span style={{ fontSize:9, fontWeight:700, color:"#059669", marginRight:6 }}>→</span>
                                      <span style={{ fontSize:10.5, color:"#064E3B", fontStyle:"italic" }}>{s.opp}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
          )}
          {gapsView==="moderate" && (
            modGaps.length===0
              ? <div style={{ textAlign:"center", color:"#AAA", fontSize:13, padding:"40px 0" }}>Sin brechas moderadas (score 2–3)</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {modGaps.map(g=>{
                    const l=lvMeta(g.score);
                    return (
                      <div key={g.key} style={{ borderRadius:12, border:"2px solid #FDE68A", overflow:"hidden" }}>
                        <div style={{ background:"linear-gradient(135deg,#FFFBEB,#FFFDF5)", padding:"14px 18px", borderBottom:"1px solid #FDE68A" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <span style={{ fontSize:18 }}>{g.dimIcon}</span>
                            <div style={{ flex:1 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                                <span style={{ fontSize:10, fontWeight:700, color:"#D97706", background:"#FEF3C7", padding:"2px 8px", borderRadius:99 }}>{g.dimNum}</span>
                                <span style={{ fontSize:13, fontWeight:800, color:"#1A1A18" }}>{g.dimLabel}</span>
                                <span style={{ padding:"2px 9px", borderRadius:99, fontSize:10, fontWeight:700, background:l.c+"18", color:l.c }}>{l.label} · {g.score.toFixed(2)}/4</span>
                                <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:"#D97706" }}>+{g.gap.toFixed(1)} pts</span>
                              </div>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ flex:1, height:5, background:"#FEF3C7", borderRadius:99, overflow:"hidden" }}>
                                  <div style={{ height:"100%", width:`${(g.score/4)*100}%`, background:"#D97706", borderRadius:99 }}/>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {g.topOpp && <div style={{ padding:"10px 18px", background:"#FFFDF5", display:"flex", gap:8 }}><span style={{ fontSize:14, flexShrink:0 }}>🚀</span><div style={{ fontSize:11, color:"#064E3B", fontStyle:"italic" }}>{g.topOpp}</div></div>}
                        {g.subScores?.length>0 && (
                          <div style={{ padding:"10px 18px" }}>
                            {g.subScores.slice(0,3).map((s,i)=>{
                              const sl=lvMeta(s.score);
                              return (
                                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:i<g.subScores.slice(0,3).length-1?"1px dashed #FDE68A":"none" }}>
                                  <span style={{ fontSize:11, fontWeight:800, color:sl.c, minWidth:28 }}>{s.score.toFixed(1)}</span>
                                  <span style={{ fontSize:11, color:"#555", flex:1 }}>{s.label}</span>
                                  <span style={{ fontSize:9, fontWeight:700, color:sl.c, background:sl.c+"18", padding:"2px 7px", borderRadius:99 }}>{sl.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
          )}
        </div>
      </AnalyticsCard>
    </div>
  );
}

// ─── ROADMAP TAB ──────────────────────────────────────────────────────────────
function RoadmapTab({ evaluaciones, respuestas }) {
  const enriched = useMemo(() => evaluaciones.map(e => {
    const eResps = respuestas.filter(r=>r.evaluacion_id===e.id);
    if (!eResps.length) return e;
    const dimScores = DIMS_META.reduce((acc,d) => {
      const vals = eResps.filter(r=>r.dimension_key===d.key).map(r=>r.valor);
      acc[`score_${d.key}`] = vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
      return acc;
    }, {});
    return { ...e, ...dimScores };
  }), [evaluaciones, respuestas]);

  // Calcular score promedio por sub-componente
  const subAvgs = useMemo(() => {
    const result = [];
    DIMS_META.forEach(d => {
      d.subDetails.forEach(sub => {
        const vals = respuestas.filter(r =>
          enriched.map(e=>e.id).includes(r.evaluacion_id) && r.subdimension_id === sub.id
        ).map(r=>r.valor).filter(Boolean);
        const avg = vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
        if (avg !== null) result.push({ ...sub, dimKey:d.key, dimLabel:d.label, dimIcon:d.icon, dimNum:d.num, score:avg });
      });
    });
    return result.sort((a,b)=>a.score-b.score);
  }, [enriched, respuestas]);

  // Clasificar en fases
  const fase1 = subAvgs.filter(s => s.score <= 1.5);   // Naciente puro → acción inmediata
  const fase2 = subAvgs.filter(s => s.score > 1.5 && s.score <= 2.5); // Emergente → corto-mediano
  const fase3 = subAvgs.filter(s => s.score > 2.5 && s.score <= 3.5); // Robusto bajo → mediano

  const FASES = [
    { id:1, label:"Prioridad 1 — Acción Inmediata", plazo:"0–3 meses", items:fase1, borderColor:"#FECACA", bg:"#FEF2F2", headBg:"linear-gradient(135deg,#FEF2F2,#FFF5F5)", tagColor:"#DC2626", tagBg:"#FEE2E2", icon:"🔴" },
    { id:2, label:"Prioridad 2 — Corto Plazo", plazo:"3–9 meses", items:fase2, borderColor:"#FDE68A", bg:"#FFFBEB", headBg:"linear-gradient(135deg,#FFFBEB,#FFFDF5)", tagColor:"#D97706", tagBg:"#FEF3C7", icon:"🟡" },
    { id:3, label:"Prioridad 3 — Mediano Plazo", plazo:"9–18 meses", items:fase3, borderColor:"#BFDBFE", bg:"#EFF6FF", headBg:"linear-gradient(135deg,#EFF6FF,#F0F9FF)", tagColor:"#2563EB", tagBg:"#DBEAFE", icon:"🔵" },
  ];

  if (!evaluaciones.length) return (
    <AnalyticsCard><div style={{ textAlign:"center", padding:"48px 0", color:"#AAA", fontSize:13 }}>No hay evaluaciones registradas aún.</div></AnalyticsCard>
  );

  if (!subAvgs.length) return (
    <AnalyticsCard><div style={{ textAlign:"center", padding:"48px 0", color:"#AAA", fontSize:13 }}>No hay respuestas suficientes para generar el roadmap.</div></AnalyticsCard>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Encabezado */}
      <AnalyticsCard style={{ background:"linear-gradient(135deg,#7823DC,#5A1AA0)", border:"none" }}>
        <div style={{ color:"#fff" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:".14em", marginBottom:6 }}>Plan de Implementación</div>
          <div style={{ fontSize:20, fontWeight:900, marginBottom:6 }}>Roadmap de Evolución del Modelo Operativo</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", lineHeight:1.65 }}>
            Prioridades derivadas del análisis de brechas. Los sub-componentes con menor madurez requieren atención más urgente para acelerar la transformación.
          </div>
          <div style={{ display:"flex", gap:20, marginTop:16 }}>
            {[{l:"Acción inmediata",n:fase1.length,c:"#FCA5A5"},{l:"Corto plazo",n:fase2.length,c:"#FCD34D"},{l:"Mediano plazo",n:fase3.length,c:"#93C5FD"}].map(f=>(
              <div key={f.l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:28, fontWeight:900, color:f.c, lineHeight:1 }}>{f.n}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginTop:2 }}>{f.l}</div>
              </div>
            ))}
          </div>
        </div>
      </AnalyticsCard>

      {FASES.map(fase => (
        fase.items.length === 0 ? null : (
          <div key={fase.id} style={{ borderRadius:16, border:`2px solid ${fase.borderColor}`, overflow:"hidden" }}>
            {/* Header de fase */}
            <div style={{ background:fase.headBg, padding:"18px 24px", borderBottom:`1px solid ${fase.borderColor}`, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:24 }}>{fase.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:900, color:"#1A1A18", marginBottom:2 }}>{fase.label}</div>
                <div style={{ fontSize:11, color:"#888" }}>Horizonte: {fase.plazo} · {fase.items.length} sub-componente{fase.items.length!==1?"s":""}</div>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                {[...new Set(fase.items.map(i=>i.dimLabel))].map(dl=>(
                  <span key={dl} style={{ fontSize:10, fontWeight:700, color:fase.tagColor, background:fase.tagBg, padding:"3px 10px", borderRadius:99 }}>
                    {DIMS_META.find(d=>d.label===dl)?.icon} {dl.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Items */}
            <div style={{ padding:"16px 24px", display:"flex", flexDirection:"column", gap:10 }}>
              {fase.items.map((s,i) => {
                const l = lvMeta(s.score);
                const nextDesc = s.ndesc?.[Math.min(3, Math.round(s.score))];
                return (
                  <div key={s.id} style={{ borderRadius:12, border:`1px solid ${fase.borderColor}`, overflow:"hidden", background:"#FFFFFF" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:`1px solid ${fase.borderColor}` }}>
                      <span style={{ fontSize:18 }}>{s.dimIcon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:9, fontWeight:700, color:fase.tagColor, background:fase.tagBg, padding:"1px 7px", borderRadius:99 }}>{s.dimNum}</span>
                          <span style={{ fontSize:12, fontWeight:800, color:"#1A1A18" }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize:10, color:"#AAA", marginTop:2 }}>{s.dimLabel}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        <div style={{ width:60, height:5, background:"#F0EDE9", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(s.score/4)*100}%`, background:l.c, borderRadius:99 }}/>
                        </div>
                        <span style={{ fontSize:12, fontWeight:900, color:l.c, minWidth:24 }}>{s.score.toFixed(1)}</span>
                        <span style={{ fontSize:9, fontWeight:700, color:l.c, background:l.c+"18", padding:"2px 8px", borderRadius:99 }}>{l.label}</span>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
                      <div style={{ padding:"10px 16px", background:"#FFF8F8", borderRight:`1px solid ${fase.borderColor}` }}>
                        <div style={{ fontSize:8.5, fontWeight:700, color:"#DC2626", textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>📍 Situación actual</div>
                        <div style={{ fontSize:10.5, color:"#7F1D1D", lineHeight:1.6 }}>{s.ndesc?.[Math.round(s.score)-1] || "—"}</div>
                      </div>
                      <div style={{ padding:"10px 16px", background:"#F0FDF4" }}>
                        <div style={{ fontSize:8.5, fontWeight:700, color:"#059669", textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>🎯 Estado objetivo</div>
                        <div style={{ fontSize:10.5, color:"#064E3B", lineHeight:1.6, fontStyle:"italic" }}>{s.opp}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ))}

      {fase1.length===0 && fase2.length===0 && fase3.length===0 && (
        <AnalyticsCard>
          <div style={{ textAlign:"center", padding:"48px 0" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🏆</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#059669", marginBottom:6 }}>Excelente nivel de madurez</div>
            <div style={{ fontSize:13, color:"#AAA" }}>Todos los componentes se encuentran en niveles Robusto o Best-in-Class.</div>
          </div>
        </AnalyticsCard>
      )}
    </div>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ count, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}>
      <div className="fade-up" style={{ width:360, background:"#FFFFFF", borderRadius:18, border:"1px solid #E8E4DF", padding:"32px", boxShadow:"0 40px 80px rgba(0,0,0,0.12)" }}>
        <div style={{ fontSize:32, textAlign:"center", marginBottom:16 }}>🗑️</div>
        <div style={{ fontSize:16, fontWeight:800, color:"#1A1A18", textAlign:"center", marginBottom:8 }}>
          ¿Eliminar {count} evaluación{count>1?"es":""}?
        </div>
        <div style={{ fontSize:12, color:"#AAA", textAlign:"center", marginBottom:28, lineHeight:1.7 }}>
          Esta acción no se puede deshacer.
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} className="btn-action" style={{ flex:1, padding:"11px", borderRadius:10, border:"1px solid #E8E4DF", background:"#F7F5F2", color:"#999", fontWeight:600, fontSize:13, cursor:"pointer" }}>Cancelar</button>
          <button onClick={onConfirm} className="btn-action" style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#7823DC,#5A1AA0)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ControlOperativo() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("monitor");
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [dirFilter, setDirFilter] = useState("");

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  async function fetchData() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const timeout = setTimeout(() => { setLoading(false); loadingRef.current = false; }, 10000);
    try {
      const [r1, r2] = await Promise.all([
        supabase.from("evaluaciones_op").select("*").order("created_at", { ascending:false }),
        supabase.from("respuestas_op").select("*"),
      ]);
      if (!r1.error) setEvaluaciones(r1.data||[]);
      if (!r2.error) setRespuestas(r2.data||[]);
    } catch(e) {
      console.error("fetchData:", e);
    } finally {
      clearTimeout(timeout);
      loadingRef.current = false;
      setLoading(false);
    }
  }

  async function fetchDataSilent() {
    try {
      const [r1, r2] = await Promise.all([
        supabase.from("evaluaciones_op").select("*").order("created_at", { ascending:false }),
        supabase.from("respuestas_op").select("*"),
      ]);
      if (!r1.error) setEvaluaciones(r1.data||[]);
      if (!r2.error) setRespuestas(r2.data||[]);
    } catch(e) {}
  }

  useEffect(() => {
    if (!authed) return;
    fetchData();
    const channel = supabase.channel("admin-op-realtime")
      .on("postgres_changes", { event:"*", schema:"public", table:"evaluaciones_op" }, ()=>fetchDataSilent())
      .on("postgres_changes", { event:"*", schema:"public", table:"respuestas_op" }, ()=>fetchDataSilent())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authed]);

  function showToast(msg, type="success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function doDelete() {
    const ids = confirmDelete;
    setConfirmDelete(null);
    try {
      await supabase.from("respuestas_op").delete().in("evaluacion_id", ids);
      await supabase.from("evaluaciones_op").delete().in("id", ids);
      setSelected([]);
      await fetchData();
      showToast(`${ids.length} evaluación${ids.length>1?"es":""} eliminada${ids.length>1?"s":""}`);
    } catch(e) {
      showToast("Error: "+e.message, "error");
    }
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const TABS = [
    { id:"monitor",   icon:"📊", label:"Monitoreo" },
    { id:"analytics", icon:"📈", label:"Analytics" },
    { id:"roadmap",   icon:"🗺️", label:"Roadmap" },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"#F7F5F2" }}>

      {/* Sidebar */}
      <div style={{ width:220, flexShrink:0, background:"#FFFFFF", borderRight:"1px solid #E8E4DF", display:"flex", flexDirection:"column", padding:"24px 16px" }}>
        <div style={{ marginBottom:28 }}>
          <KearneySVG height={14} />
          <div style={{ height:1, background:"#E8E4DF", margin:"10px 0" }} />
          <div style={{ fontSize:11, fontWeight:700, color:RED, textTransform:"uppercase", letterSpacing:".14em", marginBottom:2 }}>Tablero de Control</div>
          <div style={{ fontSize:9.5, color:"#BBB", fontWeight:500 }}>Modelo Operativo · Claro</div>
        </div>

        <nav style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {TABS.map(t => (
            <button key={t.id} className={`nav-item${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 12px", borderRadius:10, border:"none",
              background:"transparent", cursor:"pointer", textAlign:"left", width:"100%",
            }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              <span style={{ fontSize:13, fontWeight:tab===t.id?700:500, color:tab===t.id?RED:"#555" }}>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Filtro por dirección */}
        <div style={{ marginTop:16, padding:"12px", borderRadius:12, background:"#F7F5F2", border:"1px solid #E8E4DF" }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#CCC", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>Filtrar por dirección</div>
          <select value={dirFilter} onChange={e=>setDirFilter(e.target.value)} style={{
            width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #E8E4DF",
            background:"#FFFFFF", color:"#1A1A18", fontSize:11, fontWeight:500, cursor:"pointer",
            outline:"none",
          }}>
            <option value="">Todas las direcciones</option>
            {DIRECCIONES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {dirFilter && (
            <button onClick={() => setDirFilter("")} style={{
              marginTop:6, width:"100%", padding:"5px", borderRadius:6,
              border:"none", background:RED+"12", color:RED,
              fontSize:10, fontWeight:600, cursor:"pointer",
            }}>✕ Limpiar filtro</button>
          )}
        </div>

        <div style={{ flex:1 }} />

        <div style={{ padding:"14px", borderRadius:12, background:"#F7F5F2", border:"1px solid #E8E4DF", marginBottom:12 }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#CCC", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>Resumen</div>
          <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>
            <strong style={{ fontSize:20, fontWeight:900, color:RED }}>{evaluaciones.length}</strong> evaluaciones
          </div>
          <div style={{ fontSize:11, color:"#666" }}>
            <strong style={{ fontSize:16, fontWeight:800, color:"#555" }}>{respuestas.length}</strong> respuestas
          </div>
        </div>

        <button onClick={fetchData} disabled={loading} className="btn-action" style={{ padding:"8px 14px", borderRadius:10, border:"1px solid #E8E4DF", background:"#F7F5F2", color:"#666", fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:8 }}>
          {loading ? <span className="spin" style={{ display:"inline-block", width:12, height:12, border:"2px solid #CCC", borderTopColor:RED, borderRadius:"50%" }}/> : "↻"} Actualizar
        </button>

        <button onClick={() => navigate("/")} style={{ padding:"8px 14px", borderRadius:10, border:`1px solid ${RED}30`, background:RED+"08", color:RED, fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          ← Volver al modelo
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflow:"auto", padding:"32px" }}>
        {dirFilter && (
          <div style={{ marginBottom:16, padding:"8px 16px", borderRadius:10, background:RED+"10", border:`1px solid ${RED}25`, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12 }}>🏢</span>
            <span style={{ fontSize:12, fontWeight:600, color:RED }}>Filtrando por: {dirFilter}</span>
            <span style={{ fontSize:11, color:"#AAA", marginLeft:4 }}>({evaluaciones.filter(e => e.direccion === dirFilter).length} evaluaciones)</span>
          </div>
        )}
        {(() => {
          const filtEvals = dirFilter ? evaluaciones.filter(e => e.direccion === dirFilter) : evaluaciones;
          const filtEvalIds = new Set(filtEvals.map(e => e.id));
          const filtResps = dirFilter ? respuestas.filter(r => filtEvalIds.has(r.evaluacion_id)) : respuestas;
          return (
            <>
              {tab === "monitor" && (
                <MonitorTab
                  evaluaciones={filtEvals}
                  respuestas={filtResps}
                  selected={selected}
                  setSelected={setSelected}
                  onDelete={(ids) => setConfirmDelete(ids)}
                  loading={loading}
                />
              )}
              {tab === "analytics" && <AnalyticsTab evaluaciones={filtEvals} respuestas={filtResps} />}
              {tab === "roadmap"   && <RoadmapTab   evaluaciones={filtEvals} respuestas={filtResps} />}
            </>
          );
        })()}
      </div>

      {confirmDelete && <ConfirmModal count={confirmDelete.length} onConfirm={doDelete} onCancel={()=>setConfirmDelete(null)} />}

      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, padding:"12px 20px", borderRadius:12, background:toast.type==="error"?"#FEF2F2":"#ECFDF5", border:`1px solid ${toast.type==="error"?"#FECACA":"#A7F3D0"}`, color:toast.type==="error"?"#DC2626":"#059669", fontWeight:700, fontSize:13, boxShadow:"0 8px 24px rgba(0,0,0,0.1)", zIndex:999 }}>
          {toast.type==="error"?"❌":"✅"} {toast.msg}
        </div>
      )}
    </div>
  );
}
