import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
         PieChart, Pie, Cell } from 'recharts'
import { Card, SectionTitle, Chip, Modal } from '../ui.jsx'
import { C, PIE_COLORS, TYPE_COLOR, TYPE_BG } from '../../data/constants.js'
import { semaforo } from '../../utils/calculos.js'
import { hoy } from '../../data/constants.js'

const SEM_COLOR = { verde:C.green, amarillo:C.gold, rojo:C.red, gris:'#9ca3af' }
const SEM_LABEL = { verde:'Óptimo', amarillo:'Revisar', rojo:'Urgente', gris:'Sin datos' }

export default function Dashboard({ kpis, regs, campos }) {
  const [modal, setModal] = useState(null)

  const configs = {
    hoy:      { titulo:'☀️ Cosecha de hoy',      color:C.green,  items: regs.filter(r=>r.fecha===hoy) },
    total:    { titulo:'📦 Todo lo cosechado',    color:C.blue,   items: regs },
    campos:   { titulo:'🌿 Campos activos',       color:C.purple, items: null },
    problemas:{ titulo:'⚠️ Registros con problemas', color:C.red, items: regs.filter(r=>r.problema&&!r.problema.includes('Ninguno')) },
  }

  return (
    <>
      {/* Modal detalle KPI */}
      {modal && (() => {
        const cfg = configs[modal]
        const camposLista = [...new Set(regs.map(r=>r.campo).filter(Boolean))]
        return (
          <Modal open title={cfg.titulo} titleColor={cfg.color} onClose={() => setModal(null)}>
            {modal === 'campos' ? (
              <div>
                <div style={{fontWeight:700,fontSize:13,color:C.muted,marginBottom:10}}>
                  {camposLista.length} campos con registros
                </div>
                {camposLista.map((campo,i) => {
                  const rs  = regs.filter(r=>r.campo===campo)
                  const kg  = rs.reduce((s,r)=>s+Number(r.cantidad_kg||0),0)
                  const prob= rs.filter(r=>r.problema&&!r.problema.includes('Ninguno')).length
                  const ha  = campos[campo]
                  return (
                    <div key={i} style={{border:`1px solid ${C.border}`,borderLeft:`4px solid ${C.purple}`,
                      borderRadius:10,padding:'12px 14px',marginBottom:9}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                        <div style={{fontWeight:700,fontSize:14,color:C.text}}>📍 {campo}</div>
                        <div style={{fontWeight:800,fontSize:15,color:C.purple}}>{kg.toLocaleString()} kg</div>
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                        <Chip bg={C.purpleL} color={C.purple}>📋 {rs.length} registros</Chip>
                        {ha ? <Chip bg={C.greenL} color={C.green}>📐 {ha} ha · {Math.round(kg/ha).toLocaleString()} kg/ha</Chip>
                            : <Chip bg={C.goldL} color={C.gold}>📐 Sin hectáreas</Chip>}
                        {prob>0 && <Chip bg={C.redL} color={C.red}>⚠️ {prob} problemas</Chip>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
                  {[
                    {l:'Registros',v:cfg.items.length,c:cfg.color},
                    {l:'Total kg',  v:cfg.items.reduce((s,r)=>s+Number(r.cantidad_kg||0),0).toLocaleString(),c:cfg.color},
                    {l:'Cultivos',  v:[...new Set(cfg.items.map(r=>r.cultivo))].length,c:cfg.color},
                  ].map((k,i) => (
                    <div key={i} style={{background:`${k.c}12`,borderRadius:9,padding:10,
                      textAlign:'center',border:`1px solid ${k.c}20`}}>
                      <div style={{fontWeight:800,fontSize:18,color:k.c,
                                   fontFamily:'var(--font-display)'}}>{k.v}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:2}}>{k.l}</div>
                    </div>
                  ))}
                </div>
                {cfg.items.slice(0,40).map((r,i) => (
                  <div key={i} style={{border:`1px solid ${C.border}`,
                    borderLeft:`4px solid ${TYPE_COLOR[r.tipo]||C.green}`,
                    borderRadius:9,padding:'10px 12px',marginBottom:7}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,color:C.text}}>{r.cultivo}</div>
                        <div style={{fontSize:10,color:'#aaa'}}>{r.fecha}{r.hora?` · ${r.hora}`:''}</div>
                      </div>
                      <div style={{fontWeight:700,fontSize:14,color:TYPE_COLOR[r.tipo]||C.green}}>
                        {Number(r.cantidad_kg).toLocaleString()} kg
                      </div>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      <Chip bg={C.purpleL} color={C.purple}>📍 {r.campo}</Chip>
                      <Chip bg={C.blueL}   color={C.blue}>📅 {r.fecha}</Chip>
                      <Chip>{r.calidad}</Chip>
                      {r.problema&&!r.problema.includes('Ninguno')&&
                        <Chip bg={C.redL} color={C.red}>⚠️ {r.problema}</Chip>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )
      })()}

      {/* KPI cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
        {[
          { id:'hoy',      l:'Kg cosechados hoy',  v: kpis.totalHoy>=1000 ? `${(kpis.totalHoy/1000).toFixed(1)}t` : `${kpis.totalHoy.toLocaleString()} kg`, i:'⚖️', c:C.green  },
          { id:'total',    l:'Total acumulado',     v: kpis.total>=1000    ? `${(kpis.total/1000).toFixed(1)}t`    : `${kpis.total.toLocaleString()} kg`,    i:'📦', c:C.blue   },
          { id:'campos',   l:'Campos activos',      v: kpis.camposN,  i:'🌿', c:C.purple },
          { id:'problemas',l:'Tasa de problemas',   v: `${kpis.tasaProb}%`, i:'⚠️', c: kpis.tasaProb>20 ? C.red : C.green },
        ].map((k,i) => (
          <div key={i} onClick={() => setModal(k.id)} style={{
            background:'white', borderRadius:12, padding:'14px',
            boxShadow:'var(--shadow-sm)', border:`1px solid ${C.border}`,
            borderTop:`3px solid ${k.c}`, cursor:'pointer', transition:'all .15s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 6px 20px ${k.c}22`}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-sm)'}}>
            <div style={{fontSize:22,marginBottom:6}}>{k.i}</div>
            <div style={{fontWeight:800,fontSize:22,color:k.c,lineHeight:1,
                         fontFamily:'var(--font-display)'}}>{k.v}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3}}>{k.l}</div>
            <div style={{fontSize:9,color:'#bbb',marginTop:5}}>Toca para ver detalle →</div>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:10,marginBottom:12}}>
        <Card style={{marginBottom:0}}>
          <SectionTitle icon="📈" text="Producción — últimos 7 días" />
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={kpis.dias} barSize={22}>
              <XAxis dataKey="dia" tick={{fontSize:11,fill:'#aaa'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#aaa'}} axisLine={false} tickLine={false} width={30}/>
              <Tooltip contentStyle={{borderRadius:8,border:'none',fontSize:12}}
                       formatter={v => [`${v.toLocaleString()} kg`]}/>
              <Bar dataKey="kg" fill={C.green} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{marginBottom:0}}>
          <SectionTitle icon="🌱" text="Por cultivo" />
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={kpis.porCultivo} cx="50%" cy="50%"
                   innerRadius={25} outerRadius={46} paddingAngle={3} dataKey="value">
                {kpis.porCultivo.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{borderRadius:8,border:'none',fontSize:11}}
                       formatter={(v,_,p) => [`${v.toLocaleString()} kg`, p.payload.name]}/>
            </PieChart>
          </ResponsiveContainer>
          {kpis.porCultivo.slice(0,3).map((cv,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,marginTop:4}}>
              <div style={{width:7,height:7,borderRadius:2,background:PIE_COLORS[i],flexShrink:0}}/>
              <span style={{color:C.muted,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cv.name}</span>
              <span style={{fontWeight:700,color:C.green}}>{cv.value.toLocaleString()} kg</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Tabla campos */}
      <Card>
        <SectionTitle icon="🗺️" text="Rendimiento por campo" />
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`2px solid ${C.border}`}}>
                {['Campo','Total kg','Registros','Problemas','Estado'].map(h =>
                  <th key={h} style={{textAlign:'left',padding:'5px 8px',fontSize:10,
                    fontWeight:700,color:'#aaa',textTransform:'uppercase'}}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {kpis.porCampo.map((c,i) => {
                const s = semaforo(c.campo, regs)
                return (
                  <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:'8px',fontWeight:600,color:C.text}}>📍 {c.campo}</td>
                    <td style={{padding:'8px',fontWeight:700,color:C.green,
                                fontFamily:'var(--font-display)'}}>{c.kg.toLocaleString()} kg</td>
                    <td style={{padding:'8px',color:C.muted}}>{c.registros}</td>
                    <td style={{padding:'8px'}}>
                      <Chip bg={c.problemas>0?C.redL:C.greenL} color={c.problemas>0?C.red:C.green}>
                        {c.problemas>0?`⚠️ ${c.problemas}`:'✅ 0'}
                      </Chip>
                    </td>
                    <td style={{padding:'8px'}}>
                      <Chip bg={SEM_COLOR[s]+'20'} color={SEM_COLOR[s]}>{SEM_LABEL[s]}</Chip>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Últimos registros */}
      <Card>
        <SectionTitle icon="🕐" text="Últimos registros" />
        {regs.slice(0,6).map((r,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,
            padding:'8px 0',borderBottom:i<5?`1px solid ${C.border}`:'none'}}>
            <div style={{width:34,height:34,borderRadius:8,
              background:TYPE_BG[r.tipo]||C.greenL,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:15,flexShrink:0}}>
              {r.tipo==='ok'?'✅':r.tipo==='alerta'?'⚠️':'🚨'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:13,color:C.text,
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {r.cultivo} · {r.campo}
              </div>
              <div style={{fontSize:10,color:'#aaa'}}>{r.fecha}{r.hora?` · ${r.hora}`:''}</div>
            </div>
            <div style={{fontWeight:700,fontSize:13,color:C.green,
                         flexShrink:0,fontFamily:'var(--font-display)'}}>
              {Number(r.cantidad_kg).toLocaleString()} kg
            </div>
            <Chip bg={TYPE_BG[r.tipo]} color={TYPE_COLOR[r.tipo]}>{r.calidad}</Chip>
          </div>
        ))}
      </Card>
    </>
  )
}
