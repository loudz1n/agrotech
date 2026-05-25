import React, { useState } from 'react'
import { useAgrotech }  from './hooks/useAgrotech.js'
import { calcKPIs }     from './utils/calculos.js'
import { C }            from './data/constants.js'
import { Toast }        from './components/ui.jsx'
import { Sidebar, Header } from './components/layout/Layout.jsx'
import Dashboard    from './components/dashboard/Dashboard.jsx'
import Registro     from './components/registro/Registro.jsx'
import Asistente    from './components/agente/Asistente.jsx'
import Alertas      from './components/alertas/Alertas.jsx'
import Trazabilidad from './components/trazabilidad/Trazabilidad.jsx'
import Campos       from './components/campos/Campos.jsx'
import Prediccion   from './components/prediccion/Prediccion.jsx'
import Inteligencia from './components/plagas/Inteligencia.jsx'
import Trabajadores from './components/trabajadores/Trabajadores.jsx'
import Reporte      from './components/reporte/Reporte.jsx'

export default function App() {
  const {
    regs, campos, cargando, notif,
    addReg, updateReg, deleteReg, clearAll,
    saveCampo, deleteCampo
  } = useAgrotech()

  const [vista,     setVista]     = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [alertasN,  setAlertasN]  = useState(0)

  const kpis = calcKPIs(regs)

  // ── Splash screen ─────────────────────────────────────────
  if (cargando) return (
    <div style={{
      background: C.bg, minHeight:'100vh',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:14,
      fontFamily:'var(--font-body)'
    }}>
      <div style={{
        width:72, height:72, borderRadius:18,
        background:'linear-gradient(135deg,#2563eb,#16a34a)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 8px 32px rgba(37,99,235,.4)',
        animation:'pulse 1.5s ease-in-out infinite'
      }}>
        <svg width="44" height="44" viewBox="0 0 120 120">
          <path d="M28,10 C-8,25 -5,75 22,95 C35,65 40,30 28,10 Z" fill="rgba(255,255,255,.5)"/>
          <circle cx="60" cy="65" r="42" fill="white"/>
          <ellipse cx="60" cy="90" rx="40" ry="14" fill="#16a34a"/>
          <circle cx="32" cy="52" r="13" fill="#f59e0b"/>
          <polygon points="72,28 81,57 63,57" fill="#166534"/>
        </svg>
      </div>
      <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,
                   color:C.green,letterSpacing:'3px'}}>AGROTECH</div>
      <div style={{fontSize:13,color:C.muted}}>Cargando datos...</div>
    </div>
  )

  // ── Render de vista activa ─────────────────────────────────
  const renderVista = () => {
    switch(vista) {
      case 'dashboard':    return <Dashboard     kpis={kpis} regs={regs} campos={campos}/>
      case 'registro':     return <Registro      addReg={addReg}/>
      case 'asistente':    return <Asistente     regs={regs} kpis={kpis}/>
      case 'alertas':      return <Alertas       regs={regs}/>
      case 'trazabilidad': return <Trazabilidad  regs={regs} updateReg={updateReg} deleteReg={deleteReg}/>
      case 'campos':       return <Campos        regs={regs} campos={campos} saveCampo={saveCampo} deleteCampo={deleteCampo}/>
      case 'prediccion':   return <Prediccion    regs={regs}/>
      case 'inteligencia': return <Inteligencia/>
      case 'trabajadores': return <Trabajadores  regs={regs}/>
      case 'reporte':      return <Reporte       regs={regs}/>
      default:             return <Dashboard     kpis={kpis} regs={regs} campos={campos}/>
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:C.bg}}>
      <Toast notif={notif}/>

      <Sidebar
        vista={vista} setVista={setVista}
        collapsed={collapsed} setCollapsed={setCollapsed}
        regs={regs} kpis={kpis}
        alertasCount={alertasN}
        onClearAll={clearAll}
      />

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <Header
          vista={vista} setVista={setVista}
          collapsed={collapsed} setCollapsed={setCollapsed}
          kpis={kpis} alertasCount={alertasN}
        />

        <div style={{flex:1,overflowY:'auto',padding:'18px 20px 48px'}}>
          {renderVista()}
        </div>
      </div>
    </div>
  )
}
