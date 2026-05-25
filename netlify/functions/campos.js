const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json'
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    const method = event.httpMethod
    const id = event.path.split('/').pop()

    if (method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM campos ORDER BY nombre')
      const obj = {}
      rows.forEach(c => { obj[c.nombre] = Number(c.hectareas || 0) })
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, data: obj }) }
    }

    if (method === 'POST') {
      const { nombre, hectareas } = JSON.parse(event.body || '{}')
      if (!nombre) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta nombre' }) }
      await pool.query(
        `INSERT INTO campos (nombre, hectareas) VALUES ($1, $2)
         ON CONFLICT (nombre) DO UPDATE SET hectareas=$2, updated_at=NOW()`,
        [nombre, hectareas || null]
      )
      return { statusCode: 201, headers, body: JSON.stringify({ ok: true, data: { nombre, hectareas } }) }
    }

    if (method === 'DELETE') {
      await pool.query('DELETE FROM campos WHERE id=$1', [id])
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, data: { deleted: id } }) }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) }
  }
}
