import React from 'react'
import { C } from '../../data/constants.js'

const NAV_TOP = [
  { id:'dashboard',    icon:'📊', label:'Inicio'       },
  { id:'registro',     icon:'📝', label:'Registrar'    },
  { id:'asistente',    icon:'🤖', label:'Asistente IA' },
  { id:'alertas',      icon:'🚨', label:'Alertas',  badge:true },
]
const NAV_MAIN = [
  { id:'trazabilidad', icon:'📜', label:'Trazabilidad'    },
  { id:'campos',       icon:'🌾', label:'Mis campos'      },
  { id:'prediccion',   icon:'🔮', label:'Predicción IA'   },
  { id:'inteligencia', icon:'🐛', label:'Detector plagas' },
  { id:'trabajadores', icon:'👷', label:'Trabajadores'    },
  { id:'reporte',      icon:'📄', label:'Reporte'         },
]

export function Sidebar({ vista, setVista, collapsed, setCollapsed, regs, kpis, alertasCount, onClearAll }) {
  return (
    <div style={{
      width: collapsed ? 56 : 220, minWidth: collapsed ? 56 : 220,
      background: C.sidebar, display:'flex', flexDirection:'column',
      transition:'width .2s', overflow:'hidden', flexShrink:0
    }}>
      {/* Logo */}
      <div style={{
        background:'linear-gradient(135deg,#0a1628,#1e3a5f 60%,#0f2d1a)',
        padding: collapsed ? '12px 0' : '14px 14px',
        display:'flex', alignItems:'center', gap:10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom:'1px solid rgba(255,255,255,.08)', minHeight:64, flexShrink:0
      }}>
        <div style={{
          width:38, height:38, borderRadius:10,
          background:'linear-gradient(135deg,#2563eb,#16a34a)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 16px rgba(37,99,235,.5)', flexShrink:0
        }}>
          <svg width="22" height="22" viewBox="0 0 120 120">
            <path d="M28,10 C-8,25 -5,75 22,95 C35,65 40,30 28,10 Z" fill="rgba(255,255,255,.5)"/>
            <circle cx="60" cy="65" r="42" fill="white"/>
            <ellipse cx="60" cy="90" rx="40" ry="14" fill="#16a34a"/>
            <circle cx="32" cy="52" r="13" fill="#f59e0b"/>
            <polygon points="72,28 81,57 63,57" fill="#166534"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div style={{color:'white', fontFamily:'var(--font-display)',
                         fontWeight:800, fontSize:16, letterSpacing:'2px'}}>AGROTECH</div>
            <div style={{color:'rgba(255,255,255,.35)',fontSize:8,
                         marginTop:2,letterSpacing:'.8px',textTransform:'uppercase'}}>
              Automatiza · Valida · Analiza
            </div>
          </div>
        )}
      </div>

      {/* Stats mini */}
      {!collapsed && (
        <div style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{color:'rgba(255,255,255,.3)',fontSize:9,fontWeight:700,
                       textTransform:'uppercase',letterSpacing:'.5px',marginBottom:2}}>Total registros</div>
          <div style={{color:'white',fontWeight:900,fontSize:22,
                       fontFamily:'var(--font-display)',lineHeight:1}}>{regs.length}</div>
          <div style={{color:'rgba(255,255,255,.25)',fontSize:10,marginTop:2}}>
            {kpis.camposN} campos · {kpis.cultivosN} cultivos
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{flex:1,overflowY:'auto',padding:'6px 5px'}}>
        {NAV_MAIN.map(item => {
          const active = vista === item.id
          const badge  = item.badge && alertasCount > 0 ? alertasCount : 0
          return (
            <button key={item.id} onClick={() => setVista(item.id)}
              title={collapsed ? item.label : ''}
              style={{
                width:'100%', display:'flex', alignItems:'center',
                gap: collapsed ? 0 : 9,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '9px 0' : '8px 10px',
                borderRadius:8, border:'none', cursor:'pointer',
                background: active ? 'rgba(76,175,80,.22)' : 'transparent',
                borderLeft: active ? '3px solid #66bb6a' : '3px solid transparent',
                marginBottom:1, fontFamily:'var(--font-body)', transition:'background .15s',
              }}>
              <span style={{fontSize:15,flexShrink:0,position:'relative'}}>
                {item.icon}
                {badge>0 && collapsed && (
                  <span style={{position:'absolute',top:-4,right:-4,background:C.red,
                    color:'white',fontSize:8,fontWeight:700,borderRadius:8,padding:'0 3px'}}>
                    {badge}
                  </span>
                )}
              </span>
              {!collapsed && (
                <>
                  <span style={{
                    fontSize:12, fontWeight: active ? 700 : 400,
                    color: active ? 'white' : 'rgba(255,255,255,.5)',
                    flex:1, textAlign:'left', whiteSpace:'nowrap'
                  }}>{item.label}</span>
                  {badge > 0 && (
                    <span style={{background:C.red,color:'white',fontSize:9,
                      fontWeight:700,padding:'1px 5px',borderRadius:8}}>{badge}</span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div style={{padding:'8px 5px',borderTop:'1px solid rgba(255,255,255,.07)'}}>
          <button onClick={() => {
            if(window.confirm('¿Borrar todos los registros? No se puede deshacer.')) onClearAll()
          }} style={{
            width:'100%',background:'rgba(198,40,40,.15)',
            border:'1px solid rgba(198,40,40,.2)',color:'rgba(255,120,120,.8)',
            borderRadius:7,padding:'5px',fontSize:10,fontWeight:600,
            cursor:'pointer',fontFamily:'var(--font-body)',marginBottom:4
          }}>🗑️ Borrar registros</button>
        </div>
      )}
    </div>
  )
}

export function Header({ vista, setVista, collapsed, setCollapsed, kpis, alertasCount }) {
  return (
    <div style={{
      background:'white', borderBottom:`1px solid ${C.border}`,
      padding:'0 14px', display:'flex', alignItems:'center',
      height:52, gap:8, flexShrink:0,
      boxShadow:'0 1px 4px rgba(0,0,0,.06)'
    }}>
      <button onClick={() => setCollapsed(s => !s)} style={{
        background:'none', border:`1px solid ${C.border}`,
        borderRadius:8, width:32, height:32, cursor:'pointer',
        color:C.muted, fontSize:16, display:'flex',
        alignItems:'center', justifyContent:'center', flexShrink:0
      }}>☰</button>

      <div style={{display:'flex',gap:5,flex:1,overflowX:'auto'}}>
        {NAV_TOP.map(item => {
          const active = vista === item.id
          const badge  = item.badge && alertasCount > 0 ? alertasCount : 0
          return (
            <button key={item.id} onClick={() => setVista(item.id)} style={{
              display:'flex', alignItems:'center', gap:5, position:'relative',
              background: active ? C.green : 'transparent',
              border:`1px solid ${active ? C.green : C.border}`,
              borderRadius:8, color: active ? 'white' : C.muted,
              padding:'5px 12px', cursor:'pointer',
              fontFamily:'var(--font-body)', fontSize:11,
              fontWeight: active ? 700 : 400,
              transition:'all .15s', whiteSpace:'nowrap', flexShrink:0
            }}>
              <span style={{fontSize:13}}>{item.icon}</span>
              {item.label}
              {badge > 0 && (
                <span style={{
                  position:'absolute',top:-4,right:-4,
                  background:C.red,color:'white',fontSize:9,
                  fontWeight:700,padding:'0 4px',borderRadius:8,minWidth:14,textAlign:'center'
                }}>{badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* KG hoy */}
      <div style={{
        background:C.goldL, border:`1px solid ${C.gold}30`,
        borderRadius:8, padding:'3px 10px', textAlign:'center', flexShrink:0
      }}>
        <div style={{fontSize:8,color:C.gold,fontWeight:700}}>KG HOY</div>
        <div style={{fontSize:13,fontWeight:800,color:C.gold,
                     fontFamily:'var(--font-display)',lineHeight:1}}>
          {kpis.totalHoy.toLocaleString()}
        </div>
      </div>

      {/* IA activa */}
      <div style={{
        display:'flex', alignItems:'center', gap:5,
        background:C.greenL, border:`1px solid ${C.green}25`,
        borderRadius:20, padding:'4px 10px', flexShrink:0
      }}>
        <div style={{width:6,height:6,borderRadius:'50%',background:C.green,animation:'pulse 1.5s infinite'}}/>
        <span style={{fontSize:10,fontWeight:600,color:C.green,
                      fontFamily:'var(--font-display)'}}>IA Activa</span>
      </div>
    </div>
  )
}
