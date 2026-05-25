import React, { useState } from 'react'
import { Card, SectionTitle, Btn, Chip, inputStyle, labelStyle } from '../ui.jsx'
import { C } from '../../data/constants.js'

export default function Campos({ regs, campos, saveCampo, deleteCampo }) {
  const [nombre, setNombre] = useState('')
  const [ha,     setHa]     = useState('')

  const camposRegistrados = [...new Set(regs.map(r=>r.campo).filter(Boolean))]

  async function guardar() {
    if (!nombre.trim()||!ha||isNaN(Number(ha))||Number(ha)<=0) {
      alert('Ingresa nombre del campo y hectáreas válidas'); return
    }
    await saveCampo(nombre.trim(), ha)
    setNombre(''); setHa('')
  }

  return (
    <>
      <div style={{
        background:`linear-gradient(135deg,${C.green},#388e3c)`,
        borderRadius:12,padding:'16px 20px',marginBottom:12,color:'white'
      }}>
        <div style={{fontWeight:800,fontSize:15,marginBottom:2,fontFamily:'var(--font-display)'}}>🌾 Gestión de Mis Campos</div>
        <div style={{fontSize:12,opacity:.85}}>Registra el tamaño de cada campo para cálculos de rendimiento por hectárea.</div>
      </div>

      <Card>
        <SectionTitle icon="➕" text="Agregar o actualizar campo"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10,marginBottom:10}}>
          <div>
            <label style={labelStyle}>📍 Nombre del campo</label>
            <input value={nombre} onChange={e=>setNombre(e.target.value)}
              placeholder="Ej: La Loma, Chacra Norte, El Bajo..."
              list="campos-sug" style={inputStyle}/>
            <datalist id="campos-sug">
              {camposRegistrados.map(c=><option key={c} value={c}/>)}
            </datalist>
          </div>
          <div>
            <label style={labelStyle}>📐 Hectáreas</label>
            <input type="number" value={ha} onChange={e=>setHa(e.target.value)}
              placeholder="Ej: 3.5" min="0.1" step="0.1"
              style={{...inputStyle,width:100}}/>
          </div>
        </div>
        <Btn onClick={guardar} label="💾 Guardar campo" color={C.green}/>
        <div style={{marginTop:8,fontSize:11,color:C.muted}}>
          💡 Los campos con registros aparecen como sugerencias al escribir el nombre.
        </div>
      </Card>

      {Object.keys(campos).length > 0 && (
        <Card>
          <SectionTitle icon="📋" text={`Campos registrados (${Object.keys(campos).length})`}/>
          {Object.entries(campos).sort((a,b)=>b[1]-a[1]).map(([nom,haVal],i)=>{
            const kgCampo  = regs.filter(r=>r.campo===nom).reduce((s,r)=>s+Number(r.cantidad_kg||0),0)
            const regsCampo= regs.filter(r=>r.campo===nom).length
            const kgPorHa  = haVal>0 ? Math.round(kgCampo/haVal) : 0
            return (
              <div key={i} style={{border:`1px solid ${C.border}`,borderLeft:`4px solid ${C.green}`,borderRadius:10,padding:'13px 15px',marginBottom:9}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:C.text}}>📍 {nom}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{regsCampo} registros de cosecha</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{background:C.greenL,borderRadius:20,padding:'4px 12px',textAlign:'center'}}>
                      <div style={{fontWeight:900,fontSize:18,color:C.green,lineHeight:1,fontFamily:'var(--font-display)'}}>{haVal}</div>
                      <div style={{fontSize:9,color:C.muted,marginTop:1}}>hectáreas</div>
                    </div>
                    <button onClick={()=>deleteCampo(nom)} style={{
                      background:'none',border:`1px solid ${C.border}`,borderRadius:8,
                      padding:'5px 8px',cursor:'pointer',color:C.red,fontSize:12,fontFamily:'var(--font-body)'}}>
                      🗑️
                    </button>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {[
                    {l:'Total cosechado',v:`${kgCampo.toLocaleString()} kg`,c:C.green},
                    {l:'Kg por hectárea', v:kgPorHa>0?`${kgPorHa.toLocaleString()} kg/ha`:'Sin datos',c:C.blue},
                    {l:'Rendimiento',     v:kgPorHa>0?(kgPorHa>=8000?'🟢 Bueno':kgPorHa>=4000?'🟡 Regular':'🔴 Bajo'):'⚪ Sin datos',c:kgPorHa>=8000?C.green:kgPorHa>=4000?C.gold:C.red},
                  ].map((k,j)=>(
                    <div key={j} style={{background:`${k.c}10`,borderRadius:8,padding:'8px 10px',textAlign:'center',border:`1px solid ${k.c}20`}}>
                      <div style={{fontWeight:700,fontSize:13,color:k.c,fontFamily:'var(--font-display)'}}>{k.v}</div>
                      <div style={{fontSize:9,color:C.muted,marginTop:2}}>{k.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* Campos sin hectáreas */}
      {(() => {
        const sinHa = camposRegistrados.filter(c => !campos[c])
        if (!sinHa.length) return null
        return (
          <Card style={{borderLeft:`4px solid ${C.gold}`}}>
            <SectionTitle icon="⚠️" text="Campos sin hectáreas definidas" color={C.gold}/>
            <div style={{fontSize:12,color:C.muted,marginBottom:10}}>
              Estos campos aparecen en tus registros pero aún no tienen tamaño definido:
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
              {sinHa.map((c,i)=>(
                <button key={i} onClick={()=>setNombre(c)} style={{
                  background:C.goldL,border:`1px solid ${C.gold}30`,borderRadius:20,
                  padding:'5px 13px',cursor:'pointer',fontSize:12,fontWeight:600,
                  color:C.gold,fontFamily:'var(--font-body)'}}>
                  📍 {c} — definir ha
                </button>
              ))}
            </div>
          </Card>
        )
      })()}

      {/* Resumen total */}
      {Object.keys(campos).length > 0 && (
        <Card>
          <SectionTitle icon="📊" text="Resumen total de la finca"/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {[
              {l:'Total hectáreas',v:`${Object.values(campos).reduce((s,v)=>s+v,0).toFixed(1)} ha`,c:C.green},
              {l:'Campos registrados',v:Object.keys(campos).length,c:C.blue},
              {l:'Kg totales',v:`${regs.reduce((s,r)=>s+Number(r.cantidad_kg||0),0).toLocaleString()} kg`,c:C.purple},
            ].map((k,i)=>(
              <div key={i} style={{background:`${k.c}10`,borderRadius:10,padding:12,textAlign:'center',border:`1px solid ${k.c}20`}}>
                <div style={{fontWeight:800,fontSize:16,color:k.c,fontFamily:'var(--font-display)'}}>{k.v}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:3}}>{k.l}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
