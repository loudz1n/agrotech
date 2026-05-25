// ── LISTAS ──────────────────────────────────────────────────
export const CULTIVOS = [
  "Espárrago verde","Espárrago blanco","Palta Hass","Arándano",
  "Uva Red Globe","Uva Thompson","Mango Kent","Mango Edward",
  "Mandarina","Naranja","Maracuyá","Quinua","Papa","Cebolla",
  "Tomate","Ají amarillo","Otro cultivo"
]

export const PROBLEMAS = [
  "Ninguno — todo bien","Plaga detectada","Hongos o enfermedad",
  "Daño por granizo","Bajo rendimiento","Falla de riego",
  "Clima adverso","Falta de personal","Otro problema"
]

export const CALIDADES = [
  "Primera (Premium)","Segunda","Tercera","Descarte"
]

// ── COLORES ──────────────────────────────────────────────────
export const C = {
  green:   '#16a34a', greenL: '#dcfce7',
  gold:    '#a16207', goldL:  '#fef9c3',
  red:     '#b91c1c', redL:   '#fee2e2',
  orange:  '#ea580c', orangeL:'#fff7ed',
  blue:    '#1d4ed8', blueL:  '#dbeafe',
  purple:  '#7e22ce', purpleL:'#f3e8ff',
  text:    '#111827', muted:  '#6b7280',
  border:  '#e2e8e2', bg:     '#f4f6f4',
  card:    '#ffffff', sidebar:'#0a1628',
}

export const PIE_COLORS = [C.green,'#22c55e','#4ade80',C.gold,'#fbbf24']

export const TYPE_COLOR = { ok: C.green, alerta: C.orange, error: C.red }
export const TYPE_BG    = { ok: C.greenL, alerta: C.orangeL, error: C.redL }

// ── ESTILOS REUTILIZABLES ─────────────────────────────────────
export const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: `1px solid #e2e8e2`,
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
  color: '#111827',
}

export const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '4px',
}

// ── FECHA HOY PERÚ ────────────────────────────────────────────
export const hoy = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})()

// ── DATOS DEMO ────────────────────────────────────────────────
export const makeDemo = () => {
  const d = new Date()
  const f = n => {
    const x = new Date(d); x.setDate(d.getDate()-n)
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`
  }
  return [
    { cultivo:"Espárrago verde", cantidad_kg:420, campo:"La Loma",     calidad:"Primera (Premium)", fecha:f(1), problema:"Ninguno — todo bien",  tipo:"ok",     ia_comentario:"Excelente producción.", hora:"07:30", trabajadores:"Juan, María" },
    { cultivo:"Espárrago verde", cantidad_kg:380, campo:"La Loma",     calidad:"Primera (Premium)", fecha:f(2), problema:"Ninguno — todo bien",  tipo:"ok",     ia_comentario:"Muy buena cosecha.",    hora:"07:45", trabajadores:"Juan" },
    { cultivo:"Espárrago verde", cantidad_kg:290, campo:"La Loma",     calidad:"Segunda",           fecha:f(3), problema:"Bajo rendimiento",     tipo:"alerta", ia_comentario:"Rendimiento bajando.",  hora:"08:00", trabajadores:"María, José" },
    { cultivo:"Palta Hass",      cantidad_kg:650, campo:"Zona Norte",  calidad:"Primera (Premium)", fecha:f(1), problema:"Ninguno — todo bien",  tipo:"ok",     ia_comentario:"Excelente cosecha.",    hora:"09:00", trabajadores:"Carlos" },
    { cultivo:"Palta Hass",      cantidad_kg:620, campo:"Zona Norte",  calidad:"Primera (Premium)", fecha:f(2), problema:"Ninguno — todo bien",  tipo:"ok",     ia_comentario:"Producción estable.",   hora:"09:15", trabajadores:"Carlos, Ana" },
    { cultivo:"Arándano",        cantidad_kg:45,  campo:"El Bajo",     calidad:"Segunda",           fecha:f(2), problema:"Plaga detectada",      tipo:"error",  ia_comentario:"Áfidos. Urgente.",      hora:"10:00", trabajadores:"Luis" },
    { cultivo:"Arándano",        cantidad_kg:110, campo:"El Bajo",     calidad:"Primera (Premium)", fecha:f(4), problema:"Ninguno — todo bien",  tipo:"ok",     ia_comentario:"Buena cosecha.",        hora:"10:00", trabajadores:"Luis, María" },
    { cultivo:"Mango Kent",      cantidad_kg:320, campo:"Chacra Grande",calidad:"Primera (Premium)",fecha:f(1), problema:"Ninguno — todo bien",  tipo:"ok",     ia_comentario:"Excelente mango.",      hora:"11:00", trabajadores:"Pedro" },
    { cultivo:"Mango Kent",      cantidad_kg:350, campo:"Chacra Grande",calidad:"Primera (Premium)",fecha:f(2), problema:"Ninguno — todo bien",  tipo:"ok",     ia_comentario:"Buena producción.",     hora:"11:10", trabajadores:"Pedro, Juan" },
  ]
}
