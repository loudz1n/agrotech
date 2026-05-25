import React from 'react'
import { C, TYPE_COLOR, TYPE_BG } from '../data/constants.js'

// ── Card ────────────────────────────────────────────────────
export function Card({ children, style={}, className='' }) {
  return (
    <div className={`fade-in ${className}`} style={{
      background: C.card, borderRadius: 14, padding: 18, marginBottom: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,.07)', border: `1px solid ${C.border}`,
      ...style
    }}>
      {children}
    </div>
  )
}

// ── Título de sección ────────────────────────────────────────
export function SectionTitle({ icon, text, color=C.green, sub='' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8,
                    fontFamily:'var(--font-display)', fontWeight:700,
                    fontSize:15, color }}>
        <span>{icon}</span>{text}
      </div>
      {sub && <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{sub}</div>}
    </div>
  )
}

// ── Chip ────────────────────────────────────────────────────
export function Chip({ children, bg=C.greenL, color=C.green, style={} }) {
  return (
    <span style={{
      background:bg, color, fontSize:11, fontWeight:600,
      padding:'2px 9px', borderRadius:20, ...style
    }}>{children}</span>
  )
}

// ── Botón principal ──────────────────────────────────────────
export function Btn({ onClick, disabled, loading, label, lblLoad, color=C.green, outline=false, style={} }) {
  const off = disabled || loading
  return (
    <button onClick={onClick} disabled={off} style={{
      width:'100%', background: off ? '#e5e7eb' : outline ? 'transparent' : color,
      color: off ? '#9ca3af' : outline ? color : 'white',
      border: outline ? `1.5px solid ${color}` : 'none',
      borderRadius:10, padding:'11px 16px',
      fontFamily:'var(--font-body)', fontSize:13, fontWeight:700,
      cursor: off ? 'not-allowed' : 'pointer',
      boxShadow: off || outline ? 'none' : `0 3px 12px ${color}35`,
      transition:'all .15s', ...style
    }}>
      {loading ? (lblLoad || '⏳ Procesando...') : label}
    </button>
  )
}

// ── Respuesta IA ─────────────────────────────────────────────
export function RespIA({ r }) {
  if (!r) return null
  const ico  = { ok:'✅', alerta:'⚠️', error:'❌' }
  const tit  = { ok:'Todo correcto', alerta:'Revisemos esto', error:'Necesita corrección' }
  const tipo = r.tipo || 'ok'
  return (
    <div className="fade-in" style={{ marginTop:10, borderRadius:10, overflow:'hidden',
      border:`1px solid ${TYPE_COLOR[tipo]}30` }}>
      <div style={{ background:TYPE_COLOR[tipo], padding:'7px 13px',
                    display:'flex', alignItems:'center', gap:6 }}>
        <span style={{fontSize:13}}>{ico[tipo]||'ℹ️'}</span>
        <span style={{color:'white',fontWeight:700,fontSize:12,
                      fontFamily:'var(--font-display)'}}>AGROTECH — {tit[tipo]}</span>
      </div>
      <div style={{ background:TYPE_BG[tipo], padding:'11px 13px' }}>
        <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{r.mensaje}</div>
        {r.observacion_ia && (
          <div style={{marginTop:6,fontSize:11,color:C.muted}}>📊 {r.observacion_ia}</div>
        )}
        {r.sugerencia_correccion && tipo==='error' && (
          <div style={{marginTop:8,background:'white',borderRadius:7,padding:'7px 10px',
                       border:`1px solid ${C.gold}40`}}>
            <div style={{fontSize:10,fontWeight:700,color:C.gold,marginBottom:2}}>💡 Corrección sugerida:</div>
            <div style={{fontSize:12,color:C.green,fontStyle:'italic'}}>"{r.sugerencia_correccion}"</div>
          </div>
        )}
        {r.campos_faltantes?.length > 0 && (
          <div style={{marginTop:7,display:'flex',flexWrap:'wrap',gap:4,alignItems:'center'}}>
            <span style={{fontSize:11,color:C.muted}}>Falta:</span>
            {r.campos_faltantes.map((f,i) => <Chip key={i} bg={C.redL} color={C.red}>{f}</Chip>)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── AgentLog: muestra el agente trabajando en tiempo real ────
export function AgentLog({ logs = [] }) {
  if (!logs.length) return null
  return (
    <div style={{
      background:'#0a1628', borderRadius:10, padding:'12px 14px',
      marginTop:10, marginBottom:8, fontFamily:'monospace'
    }}>
      <div style={{fontSize:10,color:'#4ade80',fontWeight:700,marginBottom:8,
                   letterSpacing:'1px',fontFamily:'var(--font-display)'}}>
        ▶ AGROTECH AGENTE — EN PROCESO
      </div>
      {logs.map((l,i) => (
        <div key={i} className={`agent-log-line ${l.status}`}>
          {l.status==='active' && <span style={{marginRight:6,animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span>}
          {l.status==='done'   && <span style={{marginRight:6,color:'#4ade80'}}>✓</span>}
          {l.status==='error'  && <span style={{marginRight:6}}>✗</span>}
          {l.msg}
        </div>
      ))}
    </div>
  )
}

// ── Toast ────────────────────────────────────────────────────
export function Toast({ notif }) {
  if (!notif) return null
  return (
    <div style={{
      position:'fixed', top:14, left:'50%', transform:'translateX(-50%)',
      background: notif.tipo==='ok' ? C.green : C.red,
      color:'white', padding:'9px 20px', borderRadius:24,
      fontSize:12, fontWeight:700, zIndex:9999,
      whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(0,0,0,.2)',
      fontFamily:'var(--font-display)', animation:'slideUp .2s ease'
    }}>
      {notif.msg}
    </div>
  )
}

// ── Modal bottom-sheet ───────────────────────────────────────
export function Modal({ open, onClose, title, titleColor=C.green, children }) {
  if (!open) return null
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.55)',
      zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center',
      backdropFilter:'blur(3px)'
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="slide-up" style={{
        background:'white', borderRadius:'20px 20px 0 0',
        width:'100%', maxWidth:640, maxHeight:'88vh',
        overflow:'hidden', display:'flex', flexDirection:'column'
      }}>
        <div style={{
          background:`linear-gradient(135deg,${titleColor},${titleColor}cc)`,
          padding:'15px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0
        }}>
          <div style={{flex:1,color:'white',fontWeight:800,fontSize:15,
                       fontFamily:'var(--font-display)'}}>{title}</div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,.15)', border:'none', color:'white',
            borderRadius:'50%', width:30, height:30, cursor:'pointer',
            fontSize:15, display:'flex', alignItems:'center', justifyContent:'center'
          }}>✕</button>
        </div>
        <div style={{overflowY:'auto', flex:1, padding:'14px 18px'}}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Inputs reutilizables ─────────────────────────────────────
export const inputStyle = {
  width:'100%', border:`1px solid ${C.border}`, borderRadius:9,
  padding:'9px 12px', fontSize:13, fontFamily:'var(--font-body)',
  color:C.text, background:'white', outline:'none', boxSizing:'border-box'
}
export const labelStyle = {
  display:'block', fontSize:10, fontWeight:700, color:C.green,
  marginBottom:4, textTransform:'uppercase', letterSpacing:'.5px'
}
