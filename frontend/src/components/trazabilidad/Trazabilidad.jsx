import React, { useState } from 'react'
import { Card, SectionTitle, Chip, Modal, inputStyle, labelStyle } from '../ui.jsx'
import { C, CULTIVOS, PROBLEMAS, TYPE_COLOR, TYPE_BG, hoy } from '../../data/constants.js'

export default function Trazabilidad({ regs, updateReg, deleteReg }) {
  const [filtro,  setFiltro]  = useState('todos')
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const sE = (k,v) => setForm(f=>({...f,[k]:v}))

  function abrirEdicion(r, idx) {
    setEditing({ ...r, _idx:idx })
    setForm({
      cultivo:    r.cultivo || '',
      cantidad_kg:r.cantidad_kg || '',
      campo:      r.campo || '',
      calidad:    r.calidad || '',
      fecha:      r.fecha || hoy,
      problema:   r.problema || 'Ninguno — todo bien',
      trabajadores: Array.isArray(r.trabajadores) ? r.trabajadores.join(', ') : (r.trabajadores||'')
    })
  }

  function guardar() {
    if (!form.cultivo||!form.cantidad_kg||!form.campo||!form.calidad) {
      alert('Completa los campos obligatorios.'); return
    }
    const probCrit = ['Plaga','Hongo','granizo','enfermedad']
    let tipo = 'ok'
    if (form.problema && !form.problema.includes('Ninguno')) {
      tipo = probCrit.some(p => form.problema.includes(p)) ? 'error' : 'alerta'
    }
    updateReg(editing._idx, { ...editing, ...form, cantidad_kg:Number(form.cantidad_kg), tipo })
    setEditing(null)
  }

  const lista = filtro === 'todos' ? regs : regs.filter(r => r.campo === filtro)
  const campos = [...new Set(regs.map(r => r.campo).filter(Boolean))]

  return (
    <>
      {/* Modal edición */}
      <Modal open={!!editing} onClose={()=>setEditing(null)}
        title="✏️ Editar Registro" titleColor={C.blue}>
        {editing && (
          <>
            <div style={{marginBottom:11}}>
              <label style={{...labelStyle,color:C.blue}}>🌱 Cultivo *</label>
              <select value={form.cultivo} onChange={e=>sE('cultivo',e.target.value)} style={inputStyle}>
                <option value="">— Elige —</option>
                {CULTIVOS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:11}}>
              <div>
                <label style={{...labelStyle,color:C.blue}}>⚖️ Kilos *</label>
                <input type="number" value={form.cantidad_kg} onChange={e=>sE('cantidad_kg',e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={{...labelStyle,color:C.blue}}>🏷️ Calidad *</label>
                <select value={form.calidad} onChange={e=>sE('calidad',e.target.value)} style={inputStyle}>
                  <option value="">—</option>
                  <option>Primera (Premium)</option><option>Segunda</option>
                  <option>Tercera</option><option>Descarte</option>
                </select>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:11}}>
              <div>
                <label style={{...labelStyle,color:C.blue}}>📍 Campo *</label>
                <input value={form.campo} onChange={e=>sE('campo',e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={{...labelStyle,color:C.blue}}>📅 Fecha</label>
                <input type="date" value={form.fecha} onChange={e=>sE('fecha',e.target.value)} style={inputStyle}/>
              </div>
            </div>
            <div style={{marginBottom:11}}>
              <label style={{...labelStyle,color:C.blue}}>⚠️ Problema</label>
              <select value={form.problema} onChange={e=>sE('problema',e.target.value)} style={inputStyle}>
                {PROBLEMAS.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{marginBottom:11}}>
              <label style={{...labelStyle,color:C.blue}}>👷 Trabajadores</label>
              <input value={form.trabajadores} onChange={e=>sE('trabajadores',e.target.value)}
                placeholder="Juan, María..." style={inputStyle}/>
            </div>
            <div style={{display:'flex',gap:8,paddingTop:4}}>
              <button onClick={()=>{if(window.confirm('¿Eliminar este registro?')){deleteReg(editing._idx);setEditing(null)}}}
                style={{background:'#fff5f5',border:`1px solid ${C.red}30`,color:C.red,
                  borderRadius:9,padding:'9px 14px',fontFamily:'var(--font-body)',
                  fontSize:12,fontWeight:700,cursor:'pointer'}}>🗑️ Eliminar</button>
              <button onClick={()=>setEditing(null)} style={{flex:1,background:C.bg,
                border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:9,
                fontFamily:'var(--font-body)',fontSize:12,cursor:'pointer'}}>Cancelar</button>
              <button onClick={guardar} style={{flex:2,
                background:`linear-gradient(135deg,${C.blue},#1976d2)`,border:'none',
                color:'white',borderRadius:9,padding:9,fontFamily:'var(--font-body)',
                fontSize:13,fontWeight:800,cursor:'pointer'}}>✅ Guardar cambios</button>
            </div>
          </>
        )}
      </Modal>

      <Card>
        <SectionTitle icon="📜" text="Historial de cosechas"
          sub={`${lista.length} registros${filtro!=='todos'?` en ${filtro}`:''}`}/>

        <div style={{marginBottom:11}}>
          <select value={filtro} onChange={e=>setFiltro(e.target.value)} style={inputStyle}>
            <option value="todos">Todos los campos ({regs.length})</option>
            {campos.map(c=><option key={c} value={c}>{c} ({regs.filter(r=>r.campo===c).length})</option>)}
          </select>
        </div>

        {filtro !== 'todos' && (() => {
          const rs  = lista
          const tot = rs.reduce((s,r)=>s+Number(r.cantidad_kg||0),0)
          return (
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:11}}>
              {[{l:'Total kg',v:tot.toLocaleString(),c:C.green},
                {l:'Promedio',v:Math.round(tot/rs.length).toLocaleString()+' kg',c:C.blue},
                {l:'Problemas',v:rs.filter(r=>r.problema&&!r.problema.includes('Ninguno')).length,c:C.red}
              ].map((k,i)=>(
                <div key={i} style={{background:`${k.c}10`,borderRadius:8,padding:9,
                  textAlign:'center',border:`1px solid ${k.c}20`}}>
                  <div style={{fontWeight:800,fontSize:17,color:k.c,fontFamily:'var(--font-display)'}}>{k.v}</div>
                  <div style={{fontSize:10,color:'#aaa',marginTop:2}}>{k.l}</div>
                </div>
              ))}
            </div>
          )
        })()}

        {lista.map((r,i) => (
          <div key={i} style={{border:`1px solid ${C.border}`,
            borderLeft:`4px solid ${TYPE_COLOR[r.tipo]||C.green}`,
            borderRadius:9,padding:'10px 12px',marginBottom:7}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:C.text}}>{r.cultivo}</div>
                <div style={{fontSize:10,color:'#aaa'}}>{r.fecha}{r.hora?` · ${r.hora}`:''}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <Chip bg={TYPE_BG[r.tipo]} color={TYPE_COLOR[r.tipo]}>
                  {r.tipo==='ok'?'✅ OK':r.tipo==='alerta'?'⚠️ Alerta':'🚨 Crítico'}
                </Chip>
                <button onClick={()=>abrirEdicion(r,regs.indexOf(r))} style={{
                  background:'none',border:`1px solid ${C.border}`,borderRadius:6,
                  padding:'2px 8px',cursor:'pointer',fontSize:11,color:C.muted,
                  fontFamily:'var(--font-body)',fontWeight:600}}>✏️</button>
              </div>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              {r.cantidad_kg && <Chip>⚖️ {r.cantidad_kg} kg</Chip>}
              {r.campo       && <Chip bg={C.purpleL} color={C.purple}>📍 {r.campo}</Chip>}
              {r.calidad     && <Chip bg={C.blueL}   color={C.blue}>🏷️ {r.calidad}</Chip>}
              {r.problema&&!r.problema.includes('Ninguno')&&
                <Chip bg={C.orangeL} color={C.orange}>⚠️ {r.problema}</Chip>}
            </div>
            {r.ia_comentario && (
              <div style={{marginTop:7,fontSize:11,color:C.muted,
                padding:'5px 8px',background:`${C.border}60`,borderRadius:5}}>
                🤖 {r.ia_comentario}
              </div>
            )}
          </div>
        ))}
      </Card>
    </>
  )
}
