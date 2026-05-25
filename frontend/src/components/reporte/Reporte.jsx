import React, { useState } from 'react'
import { Card, SectionTitle, Btn, AgentLog, Chip } from '../ui.jsx'
import { C } from '../../data/constants.js'
import { callIA } from '../../services/claudeApi.js'
import { PROMPT_REPORTE } from '../../data/prompts.js'

const CAL_COLOR = { Excelente:C.green, Buena:'#43a047', Regular:C.gold, Difícil:C.red }
const PRI_COLOR = { Alta:C.red, Media:C.orange }

export default function Reporte({ regs }) {
  const [periodo, setPeriodo] = useState('semana')
  const [rep,     setRep]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs,    setLogs]    = useState([])

  const addLog = entry => setLogs(prev=>{
    const idx=prev.findIndex(l=>l.status==='active')
    if(idx>=0){const n=[...prev];n[idx]={...n[idx],status:'done'};return[...n,entry]}
    return [...prev,entry]
  })

  async function doRep(p) {
    const per = p || periodo
    setLoading(true); setRep(null); setLogs([])
    const ahora = new Date()
    const filtrados = regs.filter(r => {
      if (!r.fecha) return false
      const diff = Math.floor((ahora - new Date(r.fecha+'T12:00:00')) / 86400000)
      if (per==='hoy')   return diff === 0
      if (per==='semana')return diff <= 7
      return diff <= 30
    })
    if (filtrados.length === 0) {
      setRep({ error:'No hay registros para este período.' })
      setLoading(false); return
    }
    const totalKg = filtrados.reduce((s,r)=>s+Number(r.cantidad_kg||0),0)
    const labels  = { hoy:'de hoy', semana:'últimos 7 días', mes:'último mes' }
    const lineas  = filtrados.map(r=>`${r.cultivo}|${r.campo}|${r.fecha}|${r.cantidad_kg}kg|${r.calidad}|${r.problema}`).join(', ')
    const msg = `Período: ${labels[per]}. ${filtrados.length} registros, ${totalKg} kg. Datos: ${lineas}`
    const res = await callIA(PROMPT_REPORTE, msg, 2000, addLog)
    setRep(res?.calificacion_semana ? res : { error: res?.mensaje || 'No se pudo generar. Intenta de nuevo.' })
    setLoading(false)
  }

  return (
    <>
      {/* Selector */}
      <div style={{
        background:`linear-gradient(135deg,${C.gold},#e0a000)`,
        borderRadius:12,padding:'16px 20px',marginBottom:12,color:'white',
        boxShadow:`0 4px 14px ${C.gold}30`
      }}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
          <div style={{fontSize:32}}>📄</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:15,fontFamily:'var(--font-display)'}}>Reporte AGROTECH</div>
            <div style={{fontSize:12,opacity:.8,marginTop:1}}>{regs.length} registros disponibles</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:10}}>
          {[{id:'hoy',icon:'📅',label:'Hoy'},{id:'semana',icon:'📆',label:'Esta semana'},{id:'mes',icon:'🗓️',label:'Este mes'}].map(p=>(
            <button key={p.id} onClick={()=>{setPeriodo(p.id);setRep(null)}} style={{
              background:periodo===p.id?'white':'rgba(255,255,255,.15)',
              color:periodo===p.id?C.gold:'white',
              border:'1.5px solid rgba(255,255,255,.3)',borderRadius:8,padding:'7px 5px',
              fontFamily:'var(--font-body)',fontSize:11,fontWeight:700,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:4
            }}>
              <span>{p.icon}</span>{p.label}
            </button>
          ))}
        </div>
        <button onClick={()=>doRep(periodo)} disabled={loading} style={{
          width:'100%',background:loading?'rgba(255,255,255,.1)':'rgba(255,255,255,.25)',
          border:'1.5px solid rgba(255,255,255,.4)',color:'white',borderRadius:9,
          padding:10,fontFamily:'var(--font-body)',fontSize:13,fontWeight:800,
          cursor:loading?'not-allowed':'pointer'
        }}>
          {loading?'⏳ Generando reporte...':'🔄 Generar reporte'}
        </button>
      </div>

      <AgentLog logs={logs}/>

      {rep?.error && (
        <div style={{background:C.redL,borderRadius:10,padding:'14px 16px',marginBottom:11,
          border:`1px solid ${C.red}25`,display:'flex',gap:10}}>
          <div style={{fontSize:20}}>❌</div>
          <div>
            <div style={{fontWeight:700,color:C.red,fontSize:13,marginBottom:3}}>Error al generar</div>
            <div style={{fontSize:13,color:C.text}}>{rep.error}</div>
          </div>
        </div>
      )}

      {!loading && !rep && (
        <div style={{textAlign:'center',padding:50,color:'#aaa',background:'white',borderRadius:12}}>
          <div style={{fontSize:44,marginBottom:9}}>📊</div>
          <div style={{fontWeight:600,fontSize:14,color:'#555',marginBottom:5}}>Reporte visual con IA</div>
          <div style={{fontSize:13}}>El agente genera un informe completo con KPIs, logros y recomendaciones.</div>
        </div>
      )}

      {rep && !rep.error && (() => {
        const calC = CAL_COLOR[rep.calificacion_semana] || C.green
        return (
          <>
            {/* Header calificación */}
            <div className="fade-in" style={{
              background:`linear-gradient(135deg,${calC},${calC}cc)`,
              borderRadius:12,padding:'18px 22px',marginBottom:11,color:'white',
              display:'flex',alignItems:'center',gap:14
            }}>
              <div style={{fontSize:44}}>{rep.emoji_semana||'🌿'}</div>
              <div>
                <div style={{fontSize:10,opacity:.7,marginBottom:3,textTransform:'uppercase',letterSpacing:'.5px'}}>Calificación del período</div>
                <div style={{fontWeight:900,fontSize:24,fontFamily:'var(--font-display)'}}>{rep.calificacion_semana}</div>
                <div style={{fontSize:13,opacity:.85,marginTop:3,lineHeight:1.5}}>{rep.resumen_ejecutivo}</div>
              </div>
            </div>

            {/* KPIs */}
            {rep.kpis?.length > 0 && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:7,marginBottom:11}}>
                {rep.kpis.map((k,i)=>{
                  const c = {verde:C.green,rojo:C.red,amarillo:C.gold}[k.color]||C.green
                  return (
                    <div key={i} style={{background:'white',borderRadius:10,padding:'12px 14px',
                      display:'flex',alignItems:'center',gap:10,boxShadow:'var(--shadow-sm)',
                      border:`1px solid ${C.border}`,borderLeft:`4px solid ${c}`}}>
                      <div style={{fontSize:22}}>{k.icono}</div>
                      <div>
                        <div style={{fontWeight:800,fontSize:15,color:c,lineHeight:1,
                                     fontFamily:'var(--font-display)'}}>{k.valor}</div>
                        <div style={{fontSize:10,color:C.muted,marginTop:2}}>{k.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Logros */}
            {rep.logros?.length > 0 && (
              <Card>
                <SectionTitle icon="🏆" text="Logros del período"/>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {rep.logros.map((l,i)=>(
                    <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',
                      background:C.greenL,borderRadius:7,padding:'7px 11px'}}>
                      <div style={{width:18,height:18,borderRadius:'50%',background:C.green,
                        color:'white',fontSize:9,fontWeight:800,display:'flex',
                        alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                      <div style={{fontSize:13,color:C.text}}>{l}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recomendaciones */}
            {rep.recomendaciones?.length > 0 && (
              <Card>
                <SectionTitle icon="💡" text="Recomendaciones"/>
                {rep.recomendaciones.map((r,i)=>(
                  <div key={i} style={{display:'flex',gap:9,alignItems:'flex-start',
                    padding:'7px 0',borderBottom:i<rep.recomendaciones.length-1?`1px solid ${C.border}`:'none'}}>
                    <Chip bg={(PRI_COLOR[r.prioridad]||C.gold)+'20'} color={PRI_COLOR[r.prioridad]||C.gold} style={{flexShrink:0}}>
                      {r.prioridad}
                    </Chip>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{r.accion}</div>
                      <div style={{fontSize:10,color:'#aaa',marginTop:1}}>Campo: {r.campo}</div>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Proyección */}
            {rep.proyeccion && (
              <div style={{
                background:`linear-gradient(135deg,${C.purple},#9c27b0)`,
                borderRadius:12,padding:'13px 16px',color:'white'
              }}>
                <div style={{fontWeight:700,fontSize:11,opacity:.7,marginBottom:4}}>🔮 Proyección próximo período</div>
                <div style={{fontSize:13,lineHeight:1.7}}>{rep.proyeccion}</div>
              </div>
            )}
          </>
        )
      })()}
    </>
  )
}
