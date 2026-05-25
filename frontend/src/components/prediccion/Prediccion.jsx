import React, { useState, useRef, useEffect } from 'react'
import { Card, SectionTitle, Btn, AgentLog, Chip } from '../ui.jsx'
import { C } from '../../data/constants.js'
import { callIA, callChat } from '../../services/claudeApi.js'
import { PROMPT_PREDICCION, PROMPT_CLIMA } from '../../data/prompts.js'
import { hoy } from '../../data/constants.js'

export default function Prediccion({ regs }) {
  const [preds,   setPreds]   = useState([])
  const [recGen,  setRecGen]  = useState('')
  const [kpiP,    setKpiP]    = useState(null)
  const [loadP,   setLoadP]   = useState(false)
  const [logsP,   setLogsP]   = useState([])

  const [clima,   setClima]   = useState(null)
  const [loadC,   setLoadC]   = useState(false)
  const [logsC,   setLogsC]   = useState([])

  const [chatMsgs,setChatMsgs]= useState([])
  const [chatIn,  setChatIn]  = useState('')
  const [loadChat,setLoadChat]= useState(false)
  const endRef = useRef(null)

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[chatMsgs])

  const addLog = setter => entry => setter(prev=>{
    const idx=prev.findIndex(l=>l.status==='active')
    if(idx>=0){const n=[...prev];n[idx]={...n[idx],status:'done'};return[...n,entry]}
    return [...prev,entry]
  })

  async function doPreds() {
    setLoadP(true); setPreds([]); setLogsP([])
    const content = regs.slice(0,40).map(r =>
      `Campo:${r.campo} Cultivo:${r.cultivo} Fecha:${r.fecha} Kg:${r.cantidad_kg} Calidad:${r.calidad} Problema:${r.problema}`
    ).join('\n')
    const r = await callIA(PROMPT_PREDICCION, content, 1500, addLog(setLogsP))
    setPreds(r.predicciones||[]); setRecGen(r.recomendacion_general||''); setKpiP(r.kpi_proyectado||null)
    setLoadP(false)
  }

  async function doClima() {
    setLoadC(true); setClima(null); setLogsC([])
    const cultivos = [...new Set(regs.map(r=>r.cultivo).filter(Boolean))]
    const r = await callIA(
      PROMPT_CLIMA,
      `Fecha: ${hoy}. Cultivos: ${cultivos.join(', ')||'espárrago, palta'}`,
      1500, addLog(setLogsC)
    )
    setClima(r.prediccion_7dias ? r : { error:'No se pudo generar. Intenta de nuevo.' })
    setLoadC(false)
  }

  async function sendChat(msg) {
    const m = msg || chatIn.trim()
    if (!m || loadChat) return
    setChatIn('')
    const totalKg = regs.reduce((s,r)=>s+Number(r.cantidad_kg||0),0)
    const diasConDatos = [...new Set(regs.map(r=>r.fecha))].length
    const promDiario = diasConDatos>0 ? Math.round(totalKg/diasConDatos) : 0
    const next = [...chatMsgs, {role:'user',content:m}]
    setChatMsgs(next); setLoadChat(true)
    const sys = `Eres AGROTECH, experto en planificación agrícola peruana. Responde preguntas de proyección.
DATOS: ${regs.length} registros | ${totalKg.toLocaleString()} kg total | ${promDiario} kg/día promedio
Cultivos: ${[...new Set(regs.map(r=>r.cultivo))].join(', ')}
USA SIEMPRE formato con • y ➤ y 💡. Máximo 8 líneas. Da números concretos.`
    const resp = await callChat(next.map(x=>({role:x.role,content:x.content})),sys)
    setChatMsgs(v=>[...v,{role:'assistant',content:resp}]); setLoadChat(false)
  }

  const condIcon = {Soleado:'☀️',Nublado:'⛅',Lluvioso:'🌧️','Viento fuerte':'💨','Niebla costera':'🌫️','Parcialmente nublado':'🌤️'}

  return (
    <>
      {/* Clima */}
      <Card>
        <SectionTitle icon="🌤️" text="Predicción climática — próximos 7 días" color={C.blue}
          sub="AGROTECH estima el clima de la costa norte del Perú y su impacto en tus cultivos." />
        <Btn onClick={doClima} loading={loadC}
          label="🌤️ Predecir clima de mi zona" lblLoad="⏳ Analizando condiciones climáticas..." color={C.blue}/>
        <AgentLog logs={logsC}/>
        {clima && !clima.error && (
          <div className="fade-in" style={{marginTop:12}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:9}}>
              {(clima.prediccion_7dias||[]).map((d,i)=>(
                <div key={i} style={{background:'white',borderRadius:9,padding:'7px 3px',
                  textAlign:'center',border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:9,fontWeight:700,color:C.muted,marginBottom:2}}>{d.dia}</div>
                  <div style={{fontSize:16}}>{condIcon[d.condicion]||'🌡️'}</div>
                  <div style={{fontSize:11,fontWeight:700,color:'#c62828'}}>{d.temp_max}°</div>
                  <div style={{fontSize:10,color:C.blue}}>{d.temp_min}°</div>
                  <div style={{fontSize:9,color:C.muted}}>💧{d.probabilidad_lluvia}%</div>
                  {d.alerta&&d.alerta!=='ninguna'&&<div style={{fontSize:9,color:C.red,fontWeight:700}}>⚠️</div>}
                </div>
              ))}
            </div>
            <div style={{background:C.greenL,borderRadius:8,padding:'8px 11px',
              marginBottom:8,borderLeft:`4px solid ${C.green}`}}>
              <div style={{fontSize:9,fontWeight:700,color:C.green,marginBottom:2}}>📋 RESUMEN</div>
              <div style={{fontSize:12,color:C.text}}>{clima.resumen_semana}</div>
            </div>
            {(clima.recomendaciones_climaticas||[]).map((r,i)=>(
              <div key={i} style={{display:'flex',gap:6,marginBottom:5}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:C.green,flexShrink:0,marginTop:5}}/>
                <div style={{fontSize:12,color:C.text}}>{r}</div>
              </div>
            ))}
          </div>
        )}
        {clima?.error && <div style={{marginTop:8,background:C.redL,borderRadius:7,padding:'8px 12px',color:C.red,fontSize:12}}>{clima.error}</div>}
      </Card>

      {/* Chat predicción */}
      <Card>
        <SectionTitle icon="💬" text="Consulta tu planificación" color={C.purple}/>
        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
          {['¿Cuánto cosecharé en un mes? 📅','¿Cuántas ha necesito para 5,000 kg? 🌱','¿Cuál es mi cultivo más rentable? 💰','¿Cuándo es mejor sembrar? 🗓️'].map((q,i)=>(
            <button key={i} onClick={()=>sendChat(q)} disabled={loadChat} style={{
              background:C.purpleL,color:C.purple,border:'none',borderRadius:20,
              padding:'4px 10px',fontSize:11,fontWeight:600,
              cursor:loadChat?'not-allowed':'pointer',fontFamily:'var(--font-body)'}}>
              {q}
            </button>
          ))}
        </div>

        {chatMsgs.length === 0 ? (
          <div style={{textAlign:'center',padding:20,color:'#bbb'}}>
            <div style={{fontSize:30,marginBottom:5}}>🔮</div>
            <div style={{fontSize:13}}>Hazme una pregunta sobre tu producción futura</div>
          </div>
        ) : (
          <div style={{maxHeight:260,overflowY:'auto',display:'flex',flexDirection:'column',gap:7,marginBottom:9}}>
            {chatMsgs.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:7,alignItems:'flex-start',flexDirection:m.role==='user'?'row-reverse':'row'}}>
                <div style={{width:25,height:25,borderRadius:'50%',
                  background:m.role==='user'?C.purple:C.purpleL,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0}}>
                  {m.role==='user'?'👤':'🔮'}
                </div>
                <div style={{
                  maxWidth:'80%',background:m.role==='user'?C.purple:'#f8f4ff',
                  color:m.role==='user'?'white':C.text,
                  borderRadius:m.role==='user'?'10px 10px 3px 10px':'10px 10px 10px 3px',
                  padding:'8px 11px',fontSize:12,lineHeight:1.7,whiteSpace:'pre-wrap',
                  border:m.role==='assistant'?`1px solid ${C.purpleL}`:'none'
                }}>
                  {m.content.split('\n').map((line,li)=>(
                    <div key={li} style={{marginBottom:line===''?3:0}}>
                      {line.startsWith('•')?<span><span style={{color:m.role==='user'?'rgba(255,255,255,.8)':C.purple,fontWeight:700}}>•</span>{line.slice(1)}</span>
                      :line.startsWith('➤')?<span style={{fontWeight:700,color:m.role==='user'?'#ce93d8':C.purple}}>➤{line.slice(1)}</span>
                      :line.startsWith('💡')?<span style={{fontWeight:600}}>{line}</span>:line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {loadChat&&<div style={{display:'flex',gap:7}}>
              <div style={{width:25,height:25,borderRadius:'50%',background:C.purpleL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>🔮</div>
              <div style={{background:'#f8f4ff',borderRadius:'10px 10px 10px 3px',padding:'8px 11px',display:'flex',gap:4,alignItems:'center'}}>
                {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:C.purple,animation:`bounce 1.2s ${i*.2}s infinite`}}/>)}
              </div>
            </div>}
            <div ref={endRef}/>
          </div>
        )}

        <div style={{display:'flex',gap:6,background:'#f8f4ff',borderRadius:9,padding:'7px 10px',border:`1px solid ${C.purple}25`}}>
          <input value={chatIn} onChange={e=>setChatIn(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();sendChat()}}}
            placeholder="¿En cuánto tiempo recupero mi inversión?" disabled={loadChat}
            style={{flex:1,border:'none',outline:'none',fontSize:12,fontFamily:'var(--font-body)',color:C.text,background:'transparent'}}/>
          <button onClick={()=>sendChat()} disabled={loadChat||!chatIn.trim()} style={{
            width:30,height:30,borderRadius:7,border:'none',
            background:loadChat||!chatIn.trim()?'#ddd':C.purple,
            color:'white',cursor:loadChat||!chatIn.trim()?'not-allowed':'pointer',
            fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0
          }}>➤</button>
        </div>
        {chatMsgs.length>0&&<button onClick={()=>setChatMsgs([])} style={{marginTop:5,background:'none',border:'none',color:'#bbb',fontSize:10,cursor:'pointer'}}>🗑️ Limpiar</button>}
      </Card>

      {/* Predicción automática */}
      <Card>
        <SectionTitle icon="📊" text="Predicción automática — 7 días" color={C.purple}/>
        <Btn onClick={doPreds} loading={loadP} label="🔮 Generar predicción automática" lblLoad="⏳ El agente está prediciendo..." color={C.purple}/>
        <AgentLog logs={logsP}/>
      </Card>

      {kpiP && (
        <div className="fade-in" style={{
          background:`linear-gradient(135deg,${C.purple},#9c27b0)`,
          borderRadius:12,padding:'16px 20px',marginBottom:12,color:'white',textAlign:'center'
        }}>
          <div style={{fontSize:11,opacity:.7,marginBottom:3}}>PRODUCCIÓN PROYECTADA — 7 DÍAS</div>
          <div style={{fontWeight:900,fontSize:32,fontFamily:'var(--font-display)'}}>
            {kpiP.toLocaleString()} <span style={{fontSize:16}}>kg</span>
          </div>
        </div>
      )}

      {recGen && (
        <Card style={{borderLeft:`4px solid ${C.purple}`}}>
          <div style={{fontWeight:700,fontSize:13,color:C.purple,marginBottom:5,fontFamily:'var(--font-display)'}}>🧠 Recomendación estratégica</div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{recGen}</div>
        </Card>
      )}

      {preds.map((p,i)=>(
        <Card key={i}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:9}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:C.text}}>{p.cultivo}</div>
              <div style={{fontSize:10,color:'#aaa',marginTop:2}}>📍 {p.campo}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontWeight:800,fontSize:18,color:C.purple,fontFamily:'var(--font-display)'}}>{p.kg_estimado?.toLocaleString()} kg</div>
              <div style={{fontSize:10,color:'#aaa'}}>estimado/semana</div>
            </div>
          </div>
          <div style={{display:'flex',gap:6,marginBottom:9}}>
            <Chip bg={p.tendencia==='subiendo'?C.greenL:p.tendencia==='estable'?C.blueL:C.redL}
              color={p.tendencia==='subiendo'?C.green:p.tendencia==='estable'?C.blue:C.red}>
              {p.tendencia==='subiendo'?'📈 Subiendo':p.tendencia==='estable'?'➡️ Estable':'📉 Bajando'}
            </Chip>
            <Chip bg={p.confianza==='alta'?C.greenL:C.goldL} color={p.confianza==='alta'?C.green:C.gold}>
              Conf: {p.confianza}
            </Chip>
          </div>
          <div style={{background:C.purpleL,borderRadius:7,padding:'7px 11px',fontSize:12,fontWeight:600,color:C.purple}}>
            💡 {p.recomendacion}
          </div>
        </Card>
      ))}
    </>
  )
}
