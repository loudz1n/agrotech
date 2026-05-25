import React, { useState, useRef, useEffect } from 'react'
import { AgentLog } from '../ui.jsx'
import { C } from '../../data/constants.js'
import { callChat } from '../../services/claudeApi.js'
import { mkPromptChat } from '../../data/prompts.js'

const SUGERENCIAS = [
  '¿Cómo va mi cosecha? 🌿','¿Qué campo rinde mejor? 📊',
  '¿Hay alertas urgentes? 🚨','¿Cuánto cosechamos en total? ⚖️',
  '¿Qué me recomiendas hacer? 💡','¿Cómo combato la plaga? 🐛',
]

export default function Asistente({ regs, kpis }) {
  const [msgs,    setMsgs]    = useState([{
    role:'assistant',
    content:'¡Hola! 👋 Soy AGROTECH, tu asesor agrícola inteligente.\n\nTengo acceso a todos tus registros. ¿En qué te ayudo hoy?'
  }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [logs,    setLogs]    = useState([])
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const addLog = (entry) => setLogs(prev => {
    const idx = prev.findIndex(l => l.status === 'active')
    if (idx >= 0) { const n=[...prev]; n[idx]={...n[idx],status:'done'}; return [...n,entry] }
    return [...prev, entry]
  })

  async function send(msg) {
    const m = msg || input.trim()
    if (!m || loading) return
    setInput('')
    const next = [...msgs, { role:'user', content:m }]
    setMsgs(next); setLoading(true); setLogs([])
    const resp = await callChat(
      next.map(x=>({role:x.role,content:x.content})),
      mkPromptChat(regs),
      addLog
    )
    setMsgs(v => [...v, { role:'assistant', content:resp }])
    setLoading(false); setLogs([])
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 130px)'}}>
      {/* Header agente */}
      <div style={{
        background:`linear-gradient(135deg,${C.sidebar},#1a3a1a)`,
        borderRadius:12,padding:'14px 18px',marginBottom:9,
        display:'flex',alignItems:'center',gap:13,flexShrink:0
      }}>
        <div style={{
          width:48,height:48,borderRadius:'50%',
          background:'rgba(255,255,255,.08)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:24,border:'2px solid rgba(255,255,255,.15)',
          position:'relative',flexShrink:0
        }}>
          🌿
          <div style={{position:'absolute',bottom:1,right:1,width:12,height:12,
            borderRadius:'50%',background:'#4caf50',border:`2px solid ${C.sidebar}`}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{color:'white',fontWeight:800,fontSize:14,
                       fontFamily:'var(--font-display)'}}>AGROTECH IA</div>
          <div style={{color:'rgba(255,255,255,.5)',fontSize:11,marginTop:1}}>
            {regs.length} registros · {kpis.total.toLocaleString()} kg totales
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'rgba(255,255,255,.35)',fontSize:8}}>KG TOTALES</div>
          <div style={{color:C.gold,fontWeight:800,fontSize:18,
                       fontFamily:'var(--font-display)'}}>{kpis.total.toLocaleString()}</div>
        </div>
      </div>

      {/* Sugerencias */}
      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:9,flexShrink:0}}>
        {SUGERENCIAS.map((q,i) => (
          <button key={i} onClick={() => send(q)} disabled={loading} style={{
            background:'white',border:`1px solid ${C.border}`,borderRadius:20,
            padding:'4px 11px',fontSize:11,fontWeight:600,color:C.green,
            cursor:loading?'not-allowed':'pointer',fontFamily:'var(--font-body)'
          }}>{q}</button>
        ))}
      </div>

      {/* Mensajes */}
      <div style={{
        flex:1,overflowY:'auto',background:'white',borderRadius:12,
        padding:12,marginBottom:9,border:`1px solid ${C.border}`,
        display:'flex',flexDirection:'column',gap:9
      }}>
        {msgs.map((m,i) => (
          <div key={i} style={{
            display:'flex',gap:8,alignItems:'flex-start',
            flexDirection:m.role==='user'?'row-reverse':'row'
          }}>
            <div style={{
              width:30,height:30,borderRadius:'50%',
              background:m.role==='user'?C.blueL:`linear-gradient(135deg,${C.sidebar},${C.green})`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:13,flexShrink:0
            }}>{m.role==='user'?'👤':'🌿'}</div>
            <div style={{
              maxWidth:'80%',
              background:m.role==='user'?C.green:'#f7faf7',
              color:m.role==='user'?'white':C.text,
              borderRadius:m.role==='user'?'12px 12px 3px 12px':'12px 12px 12px 3px',
              padding:'9px 13px',fontSize:13,lineHeight:1.7,
              border:m.role==='assistant'?`1px solid ${C.border}`:'none'
            }}>
              {m.content.split('\n').map((line,li) => (
                <div key={li} style={{marginBottom:line===''?4:1}}>
                  {line.startsWith('•') ? <span><span style={{color:m.role==='user'?'rgba(255,255,255,.8)':C.green,fontWeight:700}}>•</span>{line.slice(1)}</span>
                  :line.startsWith('➤') ? <span style={{fontWeight:700,color:m.role==='user'?'#a5d6a7':C.green}}>➤{line.slice(1)}</span>
                  :line.startsWith('💡') ? <span style={{fontWeight:600}}>{line}</span>
                  :line}
                </div>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{display:'flex',gap:8}}>
            <div style={{width:30,height:30,borderRadius:'50%',
              background:`linear-gradient(135deg,${C.sidebar},${C.green})`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🌿</div>
            <div style={{
              background:'#f7faf7',borderRadius:'12px 12px 12px 3px',
              padding:'9px 13px',display:'flex',gap:5,alignItems:'center',
              border:`1px solid ${C.border}`
            }}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',
                background:C.green,animation:`bounce 1.2s ${i*.2}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {logs.length > 0 && <AgentLog logs={logs}/>}

      {/* Input */}
      <div style={{
        display:'flex',gap:7,background:'white',borderRadius:12,
        padding:'8px 11px',border:`1px solid ${C.green}35`,flexShrink:0
      }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
          placeholder="Escribe tu pregunta sobre tus cultivos..." disabled={loading}
          style={{flex:1,border:'none',outline:'none',fontSize:13,
                  fontFamily:'var(--font-body)',color:C.text,background:'transparent'}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{
          width:36,height:36,borderRadius:9,border:'none',
          background:loading||!input.trim()?'#e0e0e0':C.green,
          color:'white',cursor:loading||!input.trim()?'not-allowed':'pointer',
          fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0
        }}>➤</button>
      </div>
    </div>
  )
}
