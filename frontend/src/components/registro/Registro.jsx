import React, { useState, useRef } from 'react'
import { Card, SectionTitle, Btn, RespIA, AgentLog, inputStyle, labelStyle } from '../ui.jsx'
import { C, CULTIVOS, PROBLEMAS, hoy } from '../../data/constants.js'
import { callIA } from '../../services/claudeApi.js'
import { PROMPT_NATURAL, PROMPT_FORMULARIO } from '../../data/prompts.js'

const MAX_KG = { "Espárrago verde":2000,"Espárrago blanco":2000,"Palta Hass":3000,"Arándano":500,"Uva Red Globe":3000,"Mango Kent":2000 }

export default function Registro({ addReg }) {
  const [tab, setTab] = useState('natural')

  // Tab natural
  const [txt,      setTxt]      = useState('')
  const [loadIA,   setLoadIA]   = useState(false)
  const [logs,     setLogs]     = useState([])
  const [respIA,   setRespIA]   = useState(null)
  const [datos,    setDatos]    = useState(null)
  const [escucha,  setEscucha]  = useState(false)
  const recognRef               = useRef(null)

  // Tab formulario
  const [form,  setForm]  = useState({ producto:'',cantidad:'',calidad:'',lote:'',fecha:hoy,problema:'Ninguno — todo bien',trabajadores:'',obs:'' })
  const [loadF, setLoadF] = useState(false)
  const [logsF, setLogsF] = useState([])
  const [respF, setRespF] = useState(null)

  const sF = (k,v) => setForm(f => ({...f,[k]:v}))
  const addLog = setter => (entry) => setter(prev => {
    const idx = prev.findIndex(l => l.status === 'active')
    if (idx >= 0) {
      const n = [...prev]; n[idx] = { ...n[idx], status:'done' }
      return [...n, entry]
    }
    return [...prev, entry]
  })

  // ── Analizar texto libre ──────────────────────────────────
  async function doAnalizar() {
    const t = txt.trim()
    if (!t || t.length < 8) {
      setRespIA({ tipo:'alerta', mensaje:'✍️ Necesito más detalle: qué cosechaste, cuánto y en qué campo.' })
      return
    }
    setLoadIA(true); setRespIA(null); setDatos(null); setLogs([])
    const logger = addLog(setLogs)
    const p = await callIA(
      PROMPT_NATURAL,
      `Fecha de hoy: ${hoy}. Texto del agricultor: ${t}`,
      1500, logger
    )
    setRespIA(p)
    if (p.datos && p.tipo !== 'error') setDatos(p.datos)
    setLoadIA(false)
  }

  function confirmar() {
    if (!datos) return
    addReg({
      ...datos,
      tipo: respIA?.tipo || 'ok',
      ia_comentario: respIA?.mensaje || '',
      hora: new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})
    })
    setTxt(''); setRespIA(null); setDatos(null); setLogs([])
  }

  // ── Voz ────────────────────────────────────────────────────
  function iniciarVoz() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR(); r.lang = 'es-PE'; r.continuous = false; r.interimResults = false
    recognRef.current = r
    r.onstart  = () => setEscucha(true)
    r.onend    = () => setEscucha(false)
    r.onerror  = () => setEscucha(false)
    r.onresult = e => { setTxt(p => p ? p+' '+e.results[0][0].transcript : e.results[0][0].transcript); setEscucha(false) }
    r.start()
  }

  // ── Formulario ────────────────────────────────────────────
  async function doForm() {
    if (!form.producto) { setRespF({ tipo:'alerta', mensaje:'🌱 Elige el cultivo primero.' }); return }
    const cant = Number(form.cantidad)
    if (!form.cantidad || isNaN(cant) || cant <= 0) {
      setRespF({ tipo:'error', mensaje:'⚖️ La cantidad debe ser mayor a cero. Ej: 350' }); return
    }
    if (cant > (MAX_KG[form.producto] || 5000) * 2) {
      setRespF({ tipo:'error', mensaje:`⚠️ ${cant} kg parece imposible para ${form.producto}. Revisa el número.` }); return
    }
    if (!form.calidad) { setRespF({ tipo:'alerta', mensaje:'🏷️ Elige la calidad.' }); return }
    if (!form.lote)    { setRespF({ tipo:'alerta', mensaje:'📍 Escribe el nombre del campo.' }); return }
    const fechaHoy = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`
    if (form.fecha > fechaHoy) {
      setRespF({ tipo:'error', mensaje:`📅 La fecha ${form.fecha} es futura. ¿Quisiste poner hoy (${fechaHoy})?` }); return
    }

    setLoadF(true); setRespF(null); setLogsF([])
    const logger = addLog(setLogsF)
    const p = await callIA(PROMPT_FORMULARIO, JSON.stringify({ ...form, campo:form.lote }), 800, logger)
    setRespF(p)

    if (p.tipo === 'error')  { setLoadF(false); return }
    if (p.tipo === 'alerta') {
      setLoadF(false)
      if (!window.confirm(`⚠️ AGROTECH detectó:\n\n${p.mensaje}\n\n¿Guardar de todas formas?`)) return
    }

    addReg({
      cultivo: form.producto, cantidad_kg: cant, campo: form.lote,
      calidad: form.calidad, fecha: form.fecha, problema: form.problema,
      trabajadores: form.trabajadores, tipo: p.tipo || 'ok',
      ia_comentario: p.mensaje,
      hora: new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})
    })
    setForm({ producto:'',cantidad:'',calidad:'',lote:'',fecha:hoy,problema:'Ninguno — todo bien',trabajadores:'',obs:'' })
    setRespF(null); setLogsF([])
    setLoadF(false)
  }

  return (
    <>
      {/* Selector tab */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {[
          {id:'natural',   icon:'💬', label:'Escribe libremente', sub:'Con tus propias palabras'},
          {id:'formulario',icon:'📋', label:'Formulario guiado',  sub:'Campos paso a paso'},
        ].map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab===t.id ? 'white' : C.bg,
            border: `2px solid ${tab===t.id ? C.green : C.border}`,
            borderRadius:12, padding:14, cursor:'pointer', transition:'all .15s'
          }}>
            <div style={{fontSize:24}}>{t.icon}</div>
            <div style={{fontWeight:700,fontSize:13,color:tab===t.id?C.green:C.muted,
                         marginTop:5,fontFamily:'var(--font-display)'}}>{t.label}</div>
            <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TAB NATURAL ── */}
      {tab === 'natural' && (
        <Card>
          <SectionTitle icon="💬" text="¿Qué cosechaste hoy?"
            sub="Escribe como quieras — la IA entiende todo" />
          <div style={{position:'relative',marginBottom:10}}>
            <textarea value={txt} onChange={e=>setTxt(e.target.value)}
              placeholder='Ej: "Hoy cosechamos 350 kilos de espárrago en La Loma, calidad primera. Trabajaron Juan y Carmen."'
              style={{...inputStyle,minHeight:95,resize:'none',lineHeight:1.7,paddingRight:52}}/>
            {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
              <button onClick={escucha ? () => recognRef.current?.stop() : iniciarVoz}
                style={{
                  position:'absolute',bottom:10,right:10,width:36,height:36,
                  borderRadius:'50%',border:'none',cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
                  background:escucha?'#dc2626':'#16a34a',
                  boxShadow:escucha?'0 0 0 4px rgba(220,38,38,.25)':'0 2px 8px rgba(22,163,74,.4)'
                }}>
                {escucha ? '⏹' : '🎙️'}
              </button>
            )}
          </div>

          {escucha && (
            <div style={{display:'flex',alignItems:'center',gap:8,background:'#fee2e2',
              borderRadius:8,padding:'7px 12px',marginBottom:8,border:'1px solid #fca5a5'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#dc2626',animation:'pulse .8s ease-in-out infinite'}}/>
              <span style={{fontSize:12,fontWeight:600,color:'#dc2626'}}>Escuchando... Habla claro</span>
            </div>
          )}

          {/* Ejemplos rápidos */}
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
            {[
              {k:"Hoy cosechamos 420 kilos de espárrago verde en La Loma, calidad primera. Trabajaron Juan y Carmen.",l:"🥦 Normal"},
              {k:"Cosecha de palta hass, 280 kg de segunda, detectamos hongos. Solo Pedro.",l:"⚠️ Problema"},
              {k:"Arándano en El Bajo, 45 kg, plaga de áfidos. Revisión urgente.",l:"🚨 Urgente"},
              {k:"650 kilos de palta Hass zona norte, calidad primera, todo perfecto. Ana, Luis, Rosa.",l:"🥑 Palta"},
            ].map((e,i) => (
              <button key={i} onClick={() => {setTxt(e.k);setRespIA(null);setDatos(null);setLogs([])}}
                style={{background:C.greenL,color:C.green,border:'none',borderRadius:20,
                  padding:'4px 11px',fontSize:11,fontWeight:600,cursor:'pointer',
                  fontFamily:'var(--font-body)'}}>
                {e.l}
              </button>
            ))}
          </div>

          <Btn onClick={doAnalizar} loading={loadIA} label="🤖 Analizar con IA" lblLoad="⏳ El agente está analizando..." color={C.green}/>
          <AgentLog logs={logs}/>
          <RespIA r={respIA}/>

          {datos && (
            <div className="fade-in" style={{marginTop:10,background:C.greenL,borderRadius:10,padding:12,border:`1px solid ${C.green}18`}}>
              <div style={{fontWeight:700,fontSize:12,color:C.green,marginBottom:9,
                           fontFamily:'var(--font-display)'}}>📦 Datos identificados por el agente:</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                {[{k:'cultivo',l:'Cultivo'},{k:'cantidad_kg',l:'Kg'},{k:'campo',l:'Campo'},
                  {k:'calidad',l:'Calidad'},{k:'fecha',l:'Fecha'},{k:'problema',l:'Problema'}].map(c => {
                  const v = datos[c.k]; const d = Array.isArray(v)?v.join(', '):v; const falta = !d
                  return (
                    <div key={c.k} style={{background:falta?'#ffebee':'white',
                      border:`1px solid ${falta?'#ef9a9a':C.border}`,borderRadius:7,padding:'7px 9px'}}>
                      <div style={{fontSize:9,fontWeight:700,color:falta?C.red:'#aaa',
                                   textTransform:'uppercase',marginBottom:2}}>{c.l}</div>
                      <div style={{fontSize:12,fontWeight:600,color:falta?C.red:C.text}}>
                        {falta?'No indicado':d}
                      </div>
                    </div>
                  )
                })}
              </div>
              {respIA?.tipo !== 'error' && (
                <button onClick={confirmar} style={{
                  width:'100%',background:C.gold,color:'white',border:'none',
                  borderRadius:9,padding:10,fontFamily:'var(--font-body)',
                  fontSize:13,fontWeight:700,cursor:'pointer',marginTop:9
                }}>✅ Confirmar y Guardar</button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── TAB FORMULARIO ── */}
      {tab === 'formulario' && (
        <Card>
          <SectionTitle icon="📋" text="Registro detallado"
            sub="El agente valida cada campo antes de guardar" />

          <div style={{marginBottom:10}}>
            <label style={labelStyle}>🌱 Cultivo *</label>
            <select value={form.producto} onChange={e=>sF('producto',e.target.value)} style={inputStyle}>
              <option value="">— Elige el cultivo —</option>
              {CULTIVOS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:10}}>
            <div>
              <label style={labelStyle}>⚖️ Kilos cosechados *</label>
              <input type="number" value={form.cantidad} onChange={e=>sF('cantidad',e.target.value)}
                placeholder="Ej: 350" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>🏷️ Calidad *</label>
              <select value={form.calidad} onChange={e=>sF('calidad',e.target.value)} style={inputStyle}>
                <option value="">— Elige —</option>
                <option>Primera (Premium)</option>
                <option>Segunda</option>
                <option>Tercera</option>
                <option>Descarte</option>
              </select>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:10}}>
            <div>
              <label style={labelStyle}>📍 Campo / Lote *</label>
              <input type="text" value={form.lote} onChange={e=>sF('lote',e.target.value)}
                placeholder="Ej: La Loma" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>📅 Fecha *</label>
              <input type="date" value={form.fecha} onChange={e=>sF('fecha',e.target.value)} style={inputStyle}/>
            </div>
          </div>

          <div style={{marginBottom:10}}>
            <label style={labelStyle}>⚠️ Problema observado</label>
            <select value={form.problema} onChange={e=>sF('problema',e.target.value)} style={inputStyle}>
              {PROBLEMAS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:12}}>
            <div>
              <label style={labelStyle}>👷 Trabajadores</label>
              <input type="text" value={form.trabajadores} onChange={e=>sF('trabajadores',e.target.value)}
                placeholder="Juan, María..." style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>📝 Observaciones</label>
              <input type="text" value={form.obs} onChange={e=>sF('obs',e.target.value)}
                placeholder="Notas adicionales..." style={inputStyle}/>
            </div>
          </div>

          <Btn onClick={doForm} loading={loadF}
            label="🤖 Validar con IA y Guardar"
            lblLoad="⏳ El agente está validando..."
            color={C.green}/>
          <AgentLog logs={logsF}/>
          <RespIA r={respF}/>
        </Card>
      )}
    </>
  )
}
