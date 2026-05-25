const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY
    const { system, messages, max_tokens } = JSON.parse(event.body || '{}')

    const systemText = system || ''
    const userMsg = messages?.[0]
    let parts = []

    if (Array.isArray(userMsg?.content)) {
      for (const part of userMsg.content) {
        if (part.type === 'text') parts.push({ text: part.text })
        else if (part.type === 'image') parts.push({ inline_data: { mime_type: part.source.media_type, data: part.source.data } })
      }
    } else {
      parts.push({ text: userMsg?.content || '' })
    }

    const body = {
      system_instruction: { parts: [{ text: systemText }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { maxOutputTokens: max_tokens || 1500, temperature: 0.3 }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )

    const data = await response.json()
    if (!response.ok) return { statusCode: response.status, headers, body: JSON.stringify({ error: data.error?.message || 'Error Gemini' }) }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return { statusCode: 200, headers, body: JSON.stringify({ content: [{ type: 'text', text }] }) }
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }
  }
}
