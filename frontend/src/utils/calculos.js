import { hoy } from '../data/constants.js'

export function calcKPIs(regs) {
  const totalHoy  = regs.filter(r => r.fecha === hoy).reduce((s,r) => s+Number(r.cantidad_kg||0), 0)
  const total     = regs.reduce((s,r) => s+Number(r.cantidad_kg||0), 0)
  const conProb   = regs.filter(r => r.problema && !r.problema.includes('Ninguno')).length
  const campos    = [...new Set(regs.map(r => r.campo).filter(Boolean))]
  const cultivos  = [...new Set(regs.map(r => r.cultivo).filter(Boolean))]
  const tasaProb  = regs.length ? Math.round(conProb/regs.length*100) : 0

  // últimos 7 días
  const _hoy = new Date()
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(_hoy); d.setDate(_hoy.getDate()-i)
    const f = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    dias.push({
      dia: d.toLocaleDateString('es-PE', { weekday:'short' }),
      kg:  regs.filter(r => r.fecha === f).reduce((s,r) => s+Number(r.cantidad_kg||0), 0)
    })
  }

  const porCultivo = cultivos
    .map(cv => ({ name: cv.split(' ')[0], value: regs.filter(r => r.cultivo===cv).reduce((s,r)=>s+Number(r.cantidad_kg||0),0) }))
    .sort((a,b) => b.value-a.value).slice(0,5)

  const porCampo = campos
    .map(c => ({
      campo:    c,
      kg:       regs.filter(r => r.campo===c).reduce((s,r)=>s+Number(r.cantidad_kg||0),0),
      problemas:regs.filter(r => r.campo===c && r.problema && !r.problema.includes('Ninguno')).length,
      registros:regs.filter(r => r.campo===c).length
    }))
    .sort((a,b) => b.kg-a.kg)

  return { totalHoy, total, conProb, camposN: campos.length, cultivosN: cultivos.length,
           tasaProb, dias, porCultivo, porCampo, totalRegs: regs.length }
}

export function semaforo(campo, regs) {
  const rs = regs.filter(r => r.campo === campo).slice(0,5)
  if (!rs.length) return 'gris'
  if (rs.some(r => r.tipo === 'error')) return 'rojo'
  if (rs.filter(r => r.tipo === 'alerta').length >= 2) return 'amarillo'
  return 'verde'
}

export function calcTrabajadores(regs) {
  const mapa = {}
  regs.forEach(r => {
    const raw = r.trabajadores
    const ws = Array.isArray(raw)
      ? raw.flatMap(t => t.split(/[,;y ]+/).map(s=>s.trim())).filter(s=>s.length>=2)
      : (typeof raw==='string' ? raw.split(/[,;]+/).map(t=>t.trim()).filter(s=>s.length>=2) : [])
    ws.forEach(n => {
      if (!mapa[n]) mapa[n] = { nombre:n, registros:0, totalKg:0, campos:new Set(), cultivos:new Set(), ultimaFecha:'', conProblema:0 }
      mapa[n].registros++
      mapa[n].totalKg += Number(r.cantidad_kg||0)
      if (r.campo) mapa[n].campos.add(r.campo)
      if (r.cultivo) mapa[n].cultivos.add(r.cultivo)
      if (!mapa[n].ultimaFecha || r.fecha > mapa[n].ultimaFecha) mapa[n].ultimaFecha = r.fecha
      if (r.problema && !r.problema.includes('Ninguno')) mapa[n].conProblema++
    })
  })
  return Object.values(mapa)
    .map(t => ({ ...t, campos:[...t.campos], cultivos:[...t.cultivos], promedioKg: Math.round(t.totalKg/t.registros) }))
    .sort((a,b) => b.totalKg-a.totalKg)
}
