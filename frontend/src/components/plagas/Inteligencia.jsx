import React, { useState, useRef } from 'react'
import { Card, SectionTitle, Btn, AgentLog, Chip } from '../ui.jsx'
import { C, CULTIVOS, inputStyle, labelStyle } from '../../data/constants.js'
import { callIA, callFoto } from '../../services/claudeApi.js'
import { PROMPT_PLAGAS } from '../../data/prompts.js'

const urgColor  = { Inmediata:C.red, 'Esta semana':C.orange, Monitorear:C.gold }
const urgBg     = { Inmediata:C.redL,'Esta semana':C.orangeL,Monitorear:C.goldL }
const sevColor  = { Leve:C.gold, Moderada:C.orange, Severa:C.red }

export default function Inteligencia() {
  // Foto
  const [cultivo,  setCultivo]  = useState('')
  const [foto,     setFoto]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [loadFoto, setLoadFoto] = useState(false)
  const [logsFoto, setLogsFoto] = useState([])
  const [resFoto,  setResFoto]  = useState(null)
  const fotoRef = useRef(null)

  // Síntomas
  const [sint,    setSint]    = useState('')
  const [loadPl,  setLoadPl]  = useState(false)
  const [logsPl,  setLogsPl]  = useState([])
  const [plRes,   setPlRes]   = useState(null)
  const [sConf,   setSConf]   = useState([])
  const [loadRef, setLoadRef] = useState(false)
  const [plRef,   setPlRef]   = useState(null)

  const addLog = setter => entry => setter(prev=>{
    const idx=prev.findIndex(l=>l.status==='active')
    if(idx>=0){const n=[...prev];n[idx]={...n[idx],status:'done'};return[...n,entry]}
    return [...prev,entry]
  })

  // ── Foto ──────────────────────────────────────────────────
  function handleFoto(e) {
    const f = e.target.files[0]; if(!f) return
    setFoto(f); setResFoto(null)
    setPreview(URL.createObjectURL(f))
  }

  async function analizarFoto() {
    if(!cultivo){ alert('Elige el cultivo primero ↑'); return }
    if(!foto) return
    setLoadFoto(true); setResFoto(null); setLogsFoto([])
    const base64 = await new Promise((res,rej)=>{
      const r=new FileReader(); r.onload=()=>res(r.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(foto)
    })
    const result = await callFoto(base64, foto.type||'image/jpeg', cultivo, addLog(setLogsFoto))
    setResFoto(result); setLoadFoto(false)
  }

  // ── Síntomas ──────────────────────────────────────────────
  async function doPl() {
    if(!sint.trim()) return
    setLoadPl(true); setPlRes(null); setSConf([]); setPlRef(null); setLogsPl([])
    const p = await callIA(PROMPT_PLAGAS, `Cultivo:${cultivo||'no especificado'}\nSíntomas:${sint}`, 1800, addLog(setLogsPl))
    setPlRes(p); setLoadPl(false)
  }

  async function doRef() {
    if(!sConf.length||!plRes) return
    setLoadRef(true); setPlRef(null)
    const sys=`Eres AGROTECH, experto en fitopatología peruana. El agricultor confirmó síntomas adicionales. Actualiza el diagnóstico.
SOLO JSON:{"plaga_probable":"n","certeza":"Alta|Media|Baja","confirmacion_nivel":"t","analisis_refinado":"2-3 líneas","tratamiento_urgente":"acción exacta","pronostico":"qué pasa","nivel_dano_actual":"Inicial|Moderado|Severo|Crítico"}`
    const p = await callIA(sys, `Plaga:${plRes.plaga_probable}\nSíntomas:${sint}\nCultivo:${cultivo}\nConfirmados:${sConf.join(', ')}`, 1200)
    setPlRef(p); setLoadRef(false)
  }

  return (
    <>
      <div style={{background:`linear-gradient(135deg,${C.orange},#f57c00)`,
        borderRadius:12,padding:'16px 20px',marginBottom:12,color:'white'}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:3,fontFamily:'var(--font-display)'}}>🔬 Diagnóstico Inteligente de Cultivos</div>
        <div style={{fontSize:13,opacity:.85}}>Sube una foto o describe los síntomas — AGROTECH identifica la plaga y el tratamiento exacto.</div>
      </div>

      {/* ── FOTO ── */}
      <Card style={{marginBottom:12}}>
        <SectionTitle icon="📸" text="Analizar foto del cultivo" color={C.orange}/>
        <div style={{marginBottom:12}}>
          <label style={{...labelStyle,color:C.orange}}>🌱 ¿De qué cultivo es la foto? *</label>
          <select value={cultivo} onChange={e=>setCultivo(e.target.value)}
            style={{...inputStyle,borderColor:!cultivo?C.orange:C.border}}>
            <option value="">— Elige el cultivo para un diagnóstico preciso —</option>
            {CULTIVOS.map(cv=><option key={cv}>{cv}</option>)}
          </select>
          {!cultivo && <div style={{fontSize:10,color:C.orange,marginTop:3}}>⚠️ Selecciona el cultivo primero</div>}
        </div>

        <input ref={fotoRef} type="file" accept="image/*" capture="environment"
          onChange={handleFoto} style={{display:'none'}}/>

        {!preview ? (
          <div onClick={()=>fotoRef.current?.click()} style={{
            border:`2px dashed ${C.orange}50`,borderRadius:12,padding:'28px 20px',
            textAlign:'center',cursor:'pointer',background:'#fff8f4',
            transition:'border-color .15s'
          }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.orange}
            onMouseLeave={e=>e.currentTarget.style.borderColor=`${C.orange}50`}>
            <div style={{fontSize:42,marginBottom:8}}>📷</div>
            <div style={{fontWeight:700,fontSize:14,color:C.orange,fontFamily:'var(--font-display)'}}>Toca para subir una foto</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3}}>Desde tu galería o toma una foto ahora</div>
          </div>
        ) : (
          <div>
            <div style={{position:'relative',marginBottom:9}}>
              <img src={preview} alt="Cultivo" style={{width:'100%',maxHeight:240,objectFit:'cover',borderRadius:10,border:`1px solid ${C.border}`}}/>
              <button onClick={()=>{setFoto(null);setPreview(null);setResFoto(null)}} style={{
                position:'absolute',top:7,right:7,background:'rgba(0,0,0,.55)',
                border:'none',color:'white',borderRadius:'50%',width:26,height:26,
                cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
              <button onClick={()=>fotoRef.current?.click()} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:8,fontFamily:'var(--font-body)',fontSize:12,fontWeight:600,color:C.muted,cursor:'pointer'}}>📷 Cambiar</button>
              <button onClick={analizarFoto} disabled={loadFoto} style={{
                background:loadFoto?'#ccc':`linear-gradient(135deg,${C.orange},#f57c00)`,
                border:'none',borderRadius:8,padding:8,fontFamily:'var(--font-body)',
                fontSize:12,fontWeight:700,color:'white',cursor:loadFoto?'not-allowed':'pointer'}}>
                {loadFoto?'⏳ Analizando...':'🔬 Analizar con IA'}
              </button>
            </div>
          </div>
        )}

        <AgentLog logs={logsFoto}/>

        {resFoto && !resFoto.error && (() => {
          const r = resFoto
          const estC = {Saludable:C.green,'Con problemas':C.orange,Crítico:C.red}
          return (
            <div className="fade-in" style={{marginTop:12}}>
              <div style={{background:`${estC[r.estado_general]||C.green}15`,
                border:`2px solid ${estC[r.estado_general]||C.green}`,
                borderRadius:12,padding:'13px 15px',marginBottom:9}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:7}}>
                  <div style={{fontWeight:800,fontSize:14,color:estC[r.estado_general]||C.green,fontFamily:'var(--font-display)'}}>
                    {r.estado_general==='Saludable'?'✅':r.estado_general==='Con problemas'?'⚠️':'🚨'} {r.estado_general}
                  </div>
                  <div style={{background:urgColor[r.urgencia]||C.green,color:'white',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,flexShrink:0}}>⚡ {r.urgencia}</div>
                </div>
                <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{r.diagnostico_principal}</div>
              </div>
              {r.problemas_detectados?.filter(p=>p.tipo!=='Ninguno').map((p,i)=>(
                <div key={i} style={{border:`1px solid ${C.border}`,borderLeft:`4px solid ${sevColor[p.severidad]||C.orange}`,borderRadius:8,padding:'9px 12px',marginBottom:7}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                    <div style={{fontWeight:700,fontSize:12,color:C.text}}>{p.nombre}</div>
                    <Chip bg={`${sevColor[p.severidad]||C.orange}20`} color={sevColor[p.severidad]||C.orange}>{p.severidad}</Chip>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>{p.tipo} · {p.descripcion}</div>
                </div>
              ))}
              {r.accion_inmediata && (
                <div style={{background:C.greenL,borderRadius:9,padding:'9px 12px',borderLeft:`4px solid ${C.green}`,marginBottom:7}}>
                  <div style={{fontSize:9,fontWeight:700,color:C.green,marginBottom:2,textTransform:'uppercase'}}>⚡ Acción inmediata</div>
                  <div style={{fontSize:12,color:C.text}}>{r.accion_inmediata}</div>
                </div>
              )}
              <button onClick={()=>{
                const s=r.problemas_detectados?.filter(p=>p.tipo!=='Ninguno').map(p=>p.descripcion).join('. ')||''
                if(s) setSint(s)
              }} style={{width:'100%',marginTop:8,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:8,fontFamily:'var(--font-body)',fontSize:11,fontWeight:600,color:C.muted,cursor:'pointer'}}>
                🐛 Usar síntomas en el detector →
              </button>
            </div>
          )
        })()}
        {resFoto?.error && <div style={{marginTop:9,background:C.redL,borderRadius:8,padding:'10px 12px',color:C.red,fontSize:12}}>{resFoto.error}</div>}
      </Card>

      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <div style={{flex:1,height:1,background:C.border}}/>
        <div style={{fontSize:11,color:C.muted,fontWeight:600,whiteSpace:'nowrap'}}>O DESCRIBE LOS SÍNTOMAS</div>
        <div style={{flex:1,height:1,background:C.border}}/>
      </div>

      {/* ── SÍNTOMAS ── */}
      <Card>
        <div style={{marginBottom:10}}>
          <label style={{...labelStyle,color:C.orange}}>🌱 ¿En qué cultivo?</label>
          <select value={cultivo} onChange={e=>setCultivo(e.target.value)} style={inputStyle}>
            <option value="">— Elige el cultivo afectado —</option>
            {CULTIVOS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{...labelStyle,color:C.orange}}>🔍 Describe los síntomas</label>
          <textarea value={sint} onChange={e=>setSint(e.target.value)}
            placeholder="Ej: Las hojas tienen manchas amarillas, están enroscadas y hay bichitos verdes debajo..."
            style={{...inputStyle,minHeight:110,resize:'none',lineHeight:1.7}}/>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
          {[
            {s:"Hojas amarillas con puntos negros y telaraña fina en el envés",c:"Espárrago verde",l:"🥦"},
            {s:"Frutos con manchas marrones hundidas y olor a fermentado",c:"Palta Hass",l:"🥑"},
            {s:"Plantas con hojas retorcidas y bichitos blancos que vuelan",c:"Arándano",l:"🫐"},
            {s:"Racimos con hongos grises y bayas que se arrugan",c:"Uva Red Globe",l:"🍇"},
          ].map((e,i)=>(
            <button key={i} onClick={()=>{setSint(e.s);setCultivo(e.c)}} style={{
              background:C.orangeL,color:C.orange,border:'none',borderRadius:20,
              padding:'4px 11px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-body)'}}>
              {e.l} {e.c.split(' ')[0]}
            </button>
          ))}
        </div>
        <Btn onClick={doPl} loading={loadPl} disabled={!sint.trim()}
          label="🔬 Diagnosticar con IA"
          lblLoad="⏳ El agente analizando síntomas..."
          color={C.orange}/>
        <AgentLog logs={logsPl}/>
      </Card>

      {plRes && !plRes.error && (() => (
        <>
          <div className="fade-in" style={{background:urgBg[plRes.urgencia]||C.greenL,
            border:`2px solid ${urgColor[plRes.urgencia]||C.green}`,
            borderRadius:12,padding:'16px 18px',marginBottom:11}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:9}}>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:urgColor[plRes.urgencia]||C.green,fontFamily:'var(--font-display)'}}>🔬 {plRes.plaga_probable}</div>
                <div style={{fontSize:11,color:'#888',marginTop:2}}>Certeza: <strong style={{color:plRes.certeza==='Alta'?C.green:C.gold}}>{plRes.certeza}</strong></div>
              </div>
              <div style={{background:urgColor[plRes.urgencia]||C.green,color:'white',fontSize:11,fontWeight:700,padding:'4px 11px',borderRadius:20}}>⚡ {plRes.urgencia}</div>
            </div>
            <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{plRes.descripcion}</div>
            {plRes.alerta_vecinos&&<div style={{marginTop:9,background:C.redL,borderRadius:7,padding:'7px 11px',fontSize:12,fontWeight:700,color:C.red}}>🚨 Esta plaga puede contagiar campos vecinos. ¡Notifica inmediatamente!</div>}
          </div>

          {/* Confirmar síntomas */}
          <Card>
            <SectionTitle icon="🔍" text="¿Ves también estos síntomas?" sub="Márcalos para refinar el diagnóstico"/>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {(plRes.sintomas_confirmacion||[]).map((s,i)=>{
                const m=sConf.includes(s)
                return(
                  <div key={i} onClick={()=>{const n=m?sConf.filter(x=>x!==s):[...sConf,s];setSConf(n);setPlRef(null)}}
                    style={{display:'flex',gap:9,alignItems:'center',
                      background:m?C.greenL:'#f9f9f9',borderRadius:8,padding:'8px 11px',
                      cursor:'pointer',border:`1.5px solid ${m?C.green:C.border}`,transition:'all .15s'}}>
                    <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${m?C.green:C.border}`,background:m?C.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {m&&<span style={{color:'white',fontSize:11,fontWeight:900}}>✓</span>}
                    </div>
                    <div style={{fontSize:13,color:m?C.green:C.text,fontWeight:m?600:400}}>{s}</div>
                  </div>
                )
              })}
            </div>
            {sConf.length>0&&(
              <div style={{marginTop:10}}>
                <div style={{fontSize:12,color:C.green,fontWeight:700,marginBottom:7}}>✅ {sConf.length} síntoma{sConf.length>1?'s':''} confirmado{sConf.length>1?'s':''}</div>
                <Btn onClick={doRef} loading={loadRef} label="🎯 Refinar diagnóstico" lblLoad="⏳ Refinando..." color={C.gold}/>
              </div>
            )}
            {plRef&&!plRef.error&&(
              <div className="fade-in" style={{marginTop:12,borderRadius:10,border:`2px solid ${C.gold}`,overflow:'hidden'}}>
                <div style={{background:`linear-gradient(135deg,${C.green},${C.gold})`,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><div style={{color:'white',fontWeight:800,fontSize:13,fontFamily:'var(--font-display)'}}>🎯 Diagnóstico Refinado</div><div style={{color:'rgba(255,255,255,.65)',fontSize:10,marginTop:1}}>{plRef.confirmacion_nivel}</div></div>
                  <div style={{background:'rgba(255,255,255,.2)',color:'white',fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20}}>Certeza: {plRef.certeza}</div>
                </div>
                <div style={{padding:'13px 15px',background:'white'}}>
                  <div style={{fontWeight:700,fontSize:14,color:C.green,marginBottom:7,fontFamily:'var(--font-display)'}}>{plRef.plaga_probable}</div>
                  <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:9}}>{plRef.analisis_refinado}</div>
                  <div style={{background:C.greenL,borderRadius:8,padding:'9px 11px',marginBottom:7,borderLeft:`4px solid ${C.green}`}}>
                    <div style={{fontSize:9,fontWeight:700,color:C.green,marginBottom:2,textTransform:'uppercase'}}>⚡ Acción inmediata</div>
                    <div style={{fontSize:13,color:C.text}}>{plRef.tratamiento_urgente}</div>
                  </div>
                  <div style={{background:C.goldL,borderRadius:8,padding:'9px 11px',borderLeft:`4px solid ${C.gold}`}}>
                    <div style={{fontSize:9,fontWeight:700,color:C.gold,marginBottom:2,textTransform:'uppercase'}}>🔮 Pronóstico</div>
                    <div style={{fontSize:13,color:C.text}}>{plRef.pronostico}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Tratamientos */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:11}}>
            {plRes.tratamiento_organico&&(
              <Card style={{marginBottom:0,borderTop:`3px solid ${C.green}`}}>
                <div style={{fontWeight:700,fontSize:11,color:C.green,marginBottom:7}}>🌿 ORGÁNICO</div>
                <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:5}}>{plRes.tratamiento_organico.producto}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.7}}>
                  <div>📏 {plRes.tratamiento_organico.dosis}</div>
                  <div>🔄 {plRes.tratamiento_organico.frecuencia}</div>
                  <div>⏰ {plRes.tratamiento_organico.momento}</div>
                </div>
              </Card>
            )}
            {plRes.tratamiento_quimico&&(
              <Card style={{marginBottom:0,borderTop:`3px solid ${C.gold}`}}>
                <div style={{fontWeight:700,fontSize:11,color:C.gold,marginBottom:7}}>⚗️ QUÍMICO</div>
                <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:5}}>{plRes.tratamiento_quimico.producto}</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.7}}>
                  <div>🧪 {plRes.tratamiento_quimico.ingrediente_activo}</div>
                  <div>📏 {plRes.tratamiento_quimico.dosis}</div>
                  <div>⚠️ {plRes.tratamiento_quimico.precaucion}</div>
                </div>
              </Card>
            )}
          </div>
        </>
      ))()}
    </>
  )
}
