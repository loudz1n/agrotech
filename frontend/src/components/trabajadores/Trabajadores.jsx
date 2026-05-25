import React, { useState } from 'react'
import { Card, SectionTitle, Chip, Modal } from '../ui.jsx'
import { C, TYPE_COLOR, TYPE_BG } from '../../data/constants.js'
import { calcTrabajadores } from '../../utils/calculos.js'

export default function Trabajadores({ regs }) {
  const [sel, setSel] = useState(null)
  const trabajadores = calcTrabajadores(regs)
  const totalRegs = regs.length
  const totalKgG  = regs.reduce((s,r)=>s+Number(r.cantidad_kg||0),0)

  const jornadas = sel ? regs.filter(r=>{
    const raw=r.trabajadores
    const ws=Array.isArray(raw)?raw.flatMap(x=>x.split(/[,;y ]+/).map(s=>s.trim())).filter(s=>s.length>=2)
      :(typeof raw==='string'?raw.split(/[,;]+/).map(x=>x.trim()).filter(s=>s.length>=2):[])
    return ws.some(w=>w.toLowerCase()===sel.nombre.toLowerCase())
  }).sort((a,b)=>b.fecha.localeCompare(a.fecha)) : []

  return (
    <>
      {/* Modal detalle trabajador */}
      <Modal open={!!sel} onClose={()=>setSel(null)}
        title={sel ? `${sel.nombre} — Historial` : ''} titleColor={C.sidebar}>
        {sel && (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',
              borderBottom:`1px solid ${C.border}`,marginBottom:12}}>
              {[{l:'Total kg',v:sel.totalKg.toLocaleString(),c:C.green},
                {l:'Jornadas',v:jornadas.length,c:C.blue},
                {l:'Con prob.',v:sel.conProblema,c:sel.conProblema>0?C.red:C.green}
              ].map((k,i)=>(
                <div key={i} style={{padding:12,textAlign:'center',
                  borderRight:i<2?`1px solid ${C.border}`:'none'}}>
                  <div style={{fontWeight:800,fontSize:18,color:k.c,fontFamily:'var(--font-display)'}}>{k.v}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{k.l}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',marginBottom:10}}>
              Historial de jornadas
            </div>
            {jornadas.map((r,i)=>(
              <div key={i} style={{border:`1px solid ${C.border}`,
                borderLeft:`4px solid ${TYPE_COLOR[r.tipo]||C.green}`,
                borderRadius:9,padding:'11px 13px',marginBottom:7}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:C.text}}>{r.cultivo}</div>
                    <div style={{fontSize:11,color:C.muted}}>📅 {r.fecha}{r.hora?` · ${r.hora}`:''}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:800,fontSize:14,color:TYPE_COLOR[r.tipo]||C.green,
                                 fontFamily:'var(--font-display)'}}>{Number(r.cantidad_kg).toLocaleString()} kg</div>
                    <div style={{fontSize:10,color:C.muted}}>{r.calidad}</div>
                  </div>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                  {r.campo&&<Chip bg={C.purpleL} color={C.purple}>📍 {r.campo}</Chip>}
                  {r.problema&&!r.problema.includes('Ninguno')&&<Chip bg={C.redL} color={C.red}>⚠️ {r.problema}</Chip>}
                </div>
              </div>
            ))}
          </>
        )}
      </Modal>

      {/* Header */}
      <div style={{
        background:`linear-gradient(135deg,${C.blue},#1976d2)`,
        borderRadius:12,padding:'16px 20px',marginBottom:12,color:'white',
        display:'flex',alignItems:'center',gap:14
      }}>
        <div style={{fontSize:36}}>👷</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:15,fontFamily:'var(--font-display)'}}>Panel de Trabajadores</div>
          <div style={{fontSize:12,opacity:.8,marginTop:2}}>{trabajadores.length} trabajadores · {totalRegs} jornadas registradas</div>
        </div>
      </div>

      {trabajadores.length === 0 ? (
        <div style={{textAlign:'center',padding:50,color:'#aaa',background:'white',borderRadius:12}}>
          <div style={{fontSize:44,marginBottom:9}}>👷</div>
          <div style={{fontWeight:600,color:'#666'}}>Sin trabajadores aún</div>
          <div style={{fontSize:13,marginTop:4}}>Agrégalos al registrar cosechas.</div>
        </div>
      ) : (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9,marginBottom:12}}>
            {[
              {l:'Total trabajadores',v:trabajadores.length,i:'👷',c:C.blue},
              {l:'Mayor productor',v:trabajadores[0]?.nombre.split(' ')[0]||'-',i:'🏆',c:C.gold},
              {l:'Promedio kg/jornada',v:totalRegs>0?Math.round(totalKgG/totalRegs).toLocaleString()+' kg':'-',i:'⚖️',c:C.green},
            ].map((k,i)=>(
              <div key={i} style={{background:'white',borderRadius:12,padding:14,
                boxShadow:'var(--shadow-sm)',border:`1px solid ${C.border}`,borderTop:`3px solid ${k.c}`}}>
                <div style={{fontSize:22,marginBottom:6}}>{k.i}</div>
                <div style={{fontWeight:800,fontSize:18,color:k.c,lineHeight:1,
                             fontFamily:'var(--font-display)'}}>{k.v}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:3}}>{k.l}</div>
              </div>
            ))}
          </div>

          {trabajadores.map((t,i) => {
            const pct   = Math.round((t.registros/totalRegs)*100)
            const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'👷'
            return (
              <div key={i} onClick={()=>setSel(t)} style={{
                background:'white',borderRadius:12,padding:'14px 16px',marginBottom:10,
                boxShadow:'var(--shadow-sm)',border:`1px solid ${C.border}`,cursor:'pointer',
                transition:'border-color .15s'
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:10}}>
                  <div style={{width:44,height:44,borderRadius:'50%',
                    background:i===0?C.goldL:i<3?C.greenL:C.blueL,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:22,flexShrink:0}}>{medal}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:C.text}}>{t.nombre}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:1}}>
                      Última: {t.ultimaFecha||'—'} ·{' '}
                      <span style={{color:C.blue,fontWeight:600}}>Ver historial →</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontWeight:800,fontSize:16,color:C.green,
                                 fontFamily:'var(--font-display)'}}>{t.totalKg.toLocaleString()} kg</div>
                    <div style={{fontSize:10,color:C.muted}}>total</div>
                  </div>
                </div>
                <div style={{marginBottom:9}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.muted,marginBottom:3}}>
                    <span>Participación</span>
                    <span style={{fontWeight:700,color:C.blue}}>{pct}%</span>
                  </div>
                  <div style={{height:5,background:C.border,borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${C.blue},${C.green})`,borderRadius:3}}/>
                  </div>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                  <Chip bg={C.greenL} color={C.green}>⚖️ {t.promedioKg} kg/jornada</Chip>
                  <Chip bg={C.blueL}  color={C.blue}>📋 {t.registros} jornada{t.registros!==1?'s':''}</Chip>
                  {t.campos.length>0&&<Chip bg={C.purpleL} color={C.purple}>📍 {t.campos.slice(0,2).join(', ')}{t.campos.length>2?` +${t.campos.length-2}`:''}</Chip>}
                  {t.conProblema>0&&<Chip bg={C.redL} color={C.red}>⚠️ {t.conProblema} con incidencia</Chip>}
                </div>
              </div>
            )
          })}
        </>
      )}
    </>
  )
}
