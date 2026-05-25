import React, { useState } from 'react'
import { Card, SectionTitle, Btn, AgentLog, Chip } from '../ui.jsx'
import { C } from '../../data/constants.js'
import { callIA } from '../../services/claudeApi.js'
import { PROMPT_ALERTAS } from '../../data/prompts.js'

const NIVEL_COLOR = { critica:C.red, alta:C.orange, media:C.gold }

export default function Alertas({ regs }) {
  const [alertas, setAlertas] = useState([])
  const [resumen, setResumen] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs,    setLogs]    = useState([])

  const addLog = (entry) => setLogs(prev => {
    const idx = prev.findIndex(l=>l.status==='active')
    if(idx>=0){const n=[...prev];n[idx]={...n[idx],status:'done'};return[...n,entry]}
    return [...prev,entry]
  })

  async function doAlertas() {
    setLoading(true); setAlertas([]); setResumen(''); setLogs([])
    const content = regs.slice(0,30).map(r =>
      `Campo:${r.campo} Cultivo:${r.cultivo} Fecha:${r.fecha} Kg:${r.cantidad_kg} Calidad:${r.calidad} Problema:${r.problema}`
    ).join('\n')
    const r = await callIA(PROMPT_ALERTAS, content, 1500, addLog)
    setAlertas(r.alertas || [])
    setResumen(r.resumen || '')
    setLoading(false)
  }

  return (
    <>
      <Card>
        <SectionTitle icon="🚨" text="Alertas Tempranas Inteligentes" color={C.red}
          sub="El agente analiza patrones en tu historial y detecta problemas antes de que se agraven." />
        <Btn onClick={doAlertas} loading={loading}
          label="🔍 Analizar historial completo"
          lblLoad="⏳ El agente está analizando patrones..."
          color={C.red}/>
        <AgentLog logs={logs}/>
      </Card>

      {resumen && (
        <Card style={{borderLeft:`4px solid ${C.blue}`}}>
          <div style={{fontWeight:700,fontSize:13,color:C.blue,marginBottom:5,
                       fontFamily:'var(--font-display)'}}>📊 Estado general</div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{resumen}</div>
        </Card>
      )}

      {!loading && !alertas.length && (
        <div style={{textAlign:'center',padding:40,color:'#aaa',background:'white',borderRadius:12}}>
          <div style={{fontSize:40,marginBottom:8}}>🔍</div>
          <div style={{fontSize:14,fontWeight:600,color:'#666'}}>Sin alertas analizadas aún</div>
          <div style={{fontSize:13,marginTop:4}}>Presiona "Analizar" para revisar tu historial.</div>
        </div>
      )}

      {alertas.map((a,i) => (
        <div key={i} className="fade-in" style={{
          background:'white',border:`1px solid ${NIVEL_COLOR[a.nivel]||C.border}`,
          borderLeft:`5px solid ${NIVEL_COLOR[a.nivel]||C.green}`,
          borderRadius:12,padding:14,marginBottom:9,boxShadow:'var(--shadow-sm)'
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:7}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:NIVEL_COLOR[a.nivel],
                           fontFamily:'var(--font-display)'}}>
                {a.nivel==='critica'?'🚨':a.nivel==='alta'?'⚠️':'📢'} {a.titulo}
              </div>
              <div style={{fontSize:10,color:'#aaa',marginTop:2}}>📍 {a.campo} · 🌱 {a.cultivo}</div>
            </div>
            <Chip bg={(NIVEL_COLOR[a.nivel]||C.green)+'20'} color={NIVEL_COLOR[a.nivel]||C.green}>
              {a.nivel}
            </Chip>
          </div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:9}}>{a.mensaje}</div>
          <div style={{background:C.greenL,borderRadius:8,padding:'8px 12px',
                       fontSize:12,fontWeight:600,color:C.green}}>💡 {a.accion}</div>
        </div>
      ))}
    </>
  )
}
