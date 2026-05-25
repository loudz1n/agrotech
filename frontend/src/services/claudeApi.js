// Apunta a Netlify Functions
const BASE_URL = import.meta.env.VITE_API_URL || ''
const API_URL = `${BASE_URL}/claude`

async function callRaw(body, onLog) {
  const log = (msg, status = 'active') => onLog?.({ msg, status, ts: Date.now() })
  try {
    log('📡 Conectando con AGROTECH IA...')
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    if (!res.ok) { log(`❌ Error HTTP ${res.status}`, 'error'); throw new Error('HTTP ' + res.status) }
    const data = await res.json()
    if (!data.content?.[0]) throw new Error('Respuesta vacía')
    return data
  } catch (e) {
    log?.(`❌ ${e.message}`, 'error')
    return null
  }
}

export async function callIA(system, content, maxTokens = 1500, onLog = null) {
  const log = (msg, status = 'active') => onLog?.({ msg, status, ts: Date.now() })
  log('🧠 El agente está analizando...')
  const data = await callRaw({
    model:      'gemini-1.5-flash',
    max_tokens: maxTokens,
    system,
    messages:   [{ role: 'user', content }],
  }, onLog)

  if (!data) return { mensaje: 'Sin conexión con el agente.', tipo: 'error', datos: {}, campos_faltantes: [], alertas: [], predicciones: [] }

  try {
    const raw   = data.content[0].text.replace(/```json|```/g, '').trim()
    const start = raw.indexOf('{')
    const end   = raw.lastIndexOf('}')
    const parsed = JSON.parse(raw.substring(start, end + 1))
    log('✅ Análisis completado', 'done')
    return parsed
  } catch {
    log('❌ Error al parsear respuesta', 'error')
    return { mensaje: 'El agente respondió con formato inesperado.', tipo: 'error' }
  }
}

export async function callChat(messages, system, onLog = null) {
  const log = (msg, status = 'active') => onLog?.({ msg, status, ts: Date.now() })
  log('📡 Consultando al asistente...')
  const data = await callRaw({
    model:      'gemini-1.5-flash',
    max_tokens: 1000,
    system,
    messages,
  }, onLog)
  if (!data) return 'Sin conexión. Verifica el servidor.'
  log('✅ Respuesta recibida', 'done')
  return data.content[0].text
}

export async function callFoto(base64, mediaType, cultivo, onLog = null) {
  const log = (msg, status = 'active') => onLog?.({ msg, status, ts: Date.now() })
  log('📷 Procesando imagen...')
  const system = `Eres AGROTECH, experto en fitopatología peruana. El cultivo es: ${cultivo}.
SOLO JSON: {"estado_general":"Saludable|Con problemas|Crítico","cultivo_detectado":"${cultivo}","problemas_detectados":[{"tipo":"Plaga|Enfermedad|Deficiencia|Estrés hídrico|Daño físico|Ninguno","nombre":"nombre","descripcion":"1 línea","severidad":"Leve|Moderada|Severa"}],"zona_afectada":"Hojas|Tallo|Fruto|Raíz|Planta completa","porcentaje_afectacion":"%","diagnostico_principal":"2 líneas","accion_inmediata":"qué hacer","urgencia":"Inmediata|Esta semana|Monitorear|Sin acción necesaria","observaciones":"notas"}`

  const data = await callRaw({
    model:      'gemini-1.5-flash',
    max_tokens: 1500,
    system,
    messages: [{
      role:    'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text',  text:   'Analiza esta foto de mi cultivo.' }
      ]
    }],
  }, onLog)

  if (!data) return { error: 'No se pudo analizar la foto.' }
  try {
    const raw = data.content[0].text.replace(/```json|```/g, '').trim()
    const s   = raw.indexOf('{'), e = raw.lastIndexOf('}')
    log('✅ Diagnóstico completado', 'done')
    return JSON.parse(raw.substring(s, e + 1))
  } catch {
    return { error: 'No se pudo parsear el diagnóstico.' }
  }
}
