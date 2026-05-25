// ── API Storage — conecta con Netlify Functions ──────────────

export const db = {
  async getRegs(filtros = {}) {
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
      console.error(e)
      return []
    }
  },

  async addReg(reg) {
    try {
      const res = await fetch('/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg)
      })

      const data = await res.json()

      return data.ok ? data.data : null
    } catch (e) {
      console.error(e)
      return null
    }
  },

  async updateReg(id, reg) {
    try {
      const res = await fetch(`/registros/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg)
      })

      const data = await res.json()

      return data.ok ? data.data : null
    } catch (e) {
      console.error(e)
      return null
    }
  },

  async deleteReg(id) {
    try {
      const res = await fetch(`/registros/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      return data.ok
    } catch (e) {
      console.error(e)
      return false
    }
  },

  async getCampos() {
    try {
      const res = await fetch('/campos')
      const data = await res.json()

      return data.ok ? data.data : {}
    } catch (e) {
      console.error(e)
      return {}
    }
  },

  async saveCampo(nombre, hectareas) {
    try {
      const res = await fetch('/campos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, hectareas })
      })

      const data = await res.json()

      return data.ok
    } catch (e) {
      console.error(e)
      return false
    }
  },

  async deleteCampo(id) {
    try {
      const res = await fetch(`/campos/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      return data.ok
    } catch (e) {
      console.error(e)
      return false
    }
  }
}

// exports individuales
export const getRegistros = db.getRegs
export const saveRegistro = db.addReg
export const deleteRegistro = db.deleteReg
export const getCampos = db.getCampos
export const saveCampo = db.saveCampo
export const deleteCampo = db.deleteCampo