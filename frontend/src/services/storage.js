// ── API Storage — conecta con Netlify Functions ──────────────
const BASE = ''  // mismo dominio en Netlify

export async function getRegistros(filtros = {}) {
  try {
    const params = new URLSearchParams()
    if (filtros.campo) params.set('campo', filtros.campo)
    if (filtros.desde) params.set('desde', filtros.desde)
    if (filtros.hasta) params.set('hasta', filtros.hasta)
    const url = `/registros${params.toString() ? '?' + params : ''}`
    const res = await fetch(url)
    const data = await res.json()
    return data.ok ? data.data : []
  } catch (e) {
    console.error('getRegistros error:', e)
    return []
  }
}

export async function saveRegistro(registro) {
  try {
    const method = registro.id ? 'PUT' : 'POST'
    const url = registro.id ? `/registros/${registro.id}` : '/registros'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro)
    })
    const data = await res.json()
    return data.ok ? data.data : null
  } catch (e) {
    console.error('saveRegistro error:', e)
    return null
  }
}

export async function deleteRegistro(id) {
  try {
    const res = await fetch(`/registros/${id}`, { method: 'DELETE' })
    const data = await res.json()
    return data.ok
  } catch (e) {
    console.error('deleteRegistro error:', e)
    return false
  }
}

export async function getCampos() {
  try {
    const res = await fetch('/campos')
    const data = await res.json()
    return data.ok ? data.data : {}
  } catch (e) {
    console.error('getCampos error:', e)
    return {}
  }
}

export async function saveCampo(nombre, hectareas) {
  try {
    const res = await fetch('/campos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, hectareas })
    })
    const data = await res.json()
    return data.ok
  } catch (e) {
    console.error('saveCampo error:', e)
    return false
  }
}

export async function deleteCampo(id) {
  try {
    const res = await fetch(`/campos/${id}`, { method: 'DELETE' })
    const data = await res.json()
    return data.ok
  } catch (e) {
    console.error('deleteCampo error:', e)
    return false
  }
}
