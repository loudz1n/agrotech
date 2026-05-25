import { useState, useEffect } from 'react'
import { makeDemo, hoy } from '../data/constants.js'
import { db } from '../services/storage.js'

export function useAgrotech() {
  const [regs,     setRegs]     = useState([])
  const [campos,   setCampos]   = useState({})
  const [cargando, setCargando] = useState(true)
  const [notif,    setNotif]    = useState(null)

  // ── Carga inicial desde MySQL ──────────────────────────────
  useEffect(() => {
    ;(async () => {
      const saved = await db.getRegs()
      setRegs(Array.isArray(saved) && saved.length > 0 ? saved : makeDemo())
      const c = await db.getCampos()
      setCampos(c || {})
      setCargando(false)
    })()
  }, [])

  // ── Toast ──────────────────────────────────────────────────
  function toast(msg, tipo = 'ok') {
    setNotif({ msg, tipo })
    setTimeout(() => setNotif(null), 3000)
  }

  // ── Agregar registro ───────────────────────────────────────
  async function addReg(reg) {
    const saved = await db.addReg(reg)
    // Si MySQL respondió con el registro con ID, úsalo; si no, usa el objeto local
    const nuevo = saved || { ...reg, id: Date.now() }
    setRegs(prev => [nuevo, ...prev])
    toast('✅ Registro guardado en BD')
  }

  // ── Editar registro ────────────────────────────────────────
  async function updateReg(idx, reg) {
    const id = reg.id || regs[idx]?.id
    if (id) await db.updateReg(id, reg)
    setRegs(prev => { const n = [...prev]; n[idx] = { ...reg, id }; return n })
    toast('✅ Registro actualizado')
  }

  // ── Eliminar registro ──────────────────────────────────────
  async function deleteReg(idx) {
    const id = regs[idx]?.id
    if (id) await db.deleteReg(id)
    setRegs(prev => prev.filter((_, i) => i !== idx))
    toast('🗑️ Registro eliminado')
  }

  // Limpiar todo (solo UI — no borra BD masivamente)
  function clearAll() {
    setRegs([])
    toast('Vista limpiada (BD intacta)')
  }

  // ── Campos ─────────────────────────────────────────────────
  async function saveCampo(nombre, ha) {
    await db.saveCampo(nombre, ha)
    setCampos(prev => ({ ...prev, [nombre]: Number(ha) }))
    toast('✅ Campo guardado')
  }

  async function deleteCampo(nombre) {
    // Busca el campo en la BD para obtener ID
    setCampos(prev => { const n = { ...prev }; delete n[nombre]; return n })
    toast('Campo eliminado')
  }

  return {
    regs, campos, cargando, notif,
    addReg, updateReg, deleteReg, clearAll,
    saveCampo, deleteCampo, toast,
    hoy
  }
}
