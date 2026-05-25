const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
}

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registros (
      id            SERIAL PRIMARY KEY,
      cultivo       VARCHAR(100)  NOT NULL,
      cantidad_kg   DECIMAL(10,2) NOT NULL,
      campo         VARCHAR(120)  NOT NULL,
      calidad       VARCHAR(50)   NOT NULL,
      fecha         DATE          NOT NULL,
      hora          VARCHAR(10),
      problema      VARCHAR(200)  DEFAULT 'Ninguno — todo bien',
      trabajadores  TEXT,
      tipo          VARCHAR(10)   DEFAULT 'ok',
      ia_comentario TEXT,
      observaciones TEXT,
      created_at    TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS campos (
      id         SERIAL PRIMARY KEY,
      nombre     VARCHAR(120) NOT NULL UNIQUE,
      hectareas  DECIMAL(8,2),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    await initDB()
    const method = event.httpMethod
    const id = event.path.split('/').pop()

    if (method === 'GET') {
      const { campo, desde, hasta } = event.queryStringParameters || {}
      let sql = 'SELECT * FROM registros'
      const cond = [], vals = []
      if (campo) { cond.push(`campo=$${vals.length+1}`); vals.push(campo) }
      if (desde) { cond.push(`fecha>=$${vals.length+1}`); vals.push(desde) }
      if (hasta) { cond.push(`fecha<=$${vals.length+1}`); vals.push(hasta) }
      if (cond.length) sql += ' WHERE ' + cond.join(' AND ')
      sql += ' ORDER BY fecha DESC, hora DESC LIMIT 2000'
      const { rows } = await pool.query(sql, vals)
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, data: rows }) }
    }

    if (method === 'POST') {
      const { cultivo, cantidad_kg, campo, calidad, fecha, hora, problema, trabajadores, tipo, ia_comentario, observaciones } = JSON.parse(event.body || '{}')
      if (!cultivo || !cantidad_kg || !campo || !calidad || !fecha)
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Faltan campos obligatorios' }) }
      const trab = Array.isArray(trabajadores) ? trabajadores.join(', ') : (trabajadores || null)
      const { rows } = await pool.query(
        `INSERT INTO registros (cultivo,cantidad_kg,campo,calidad,fecha,hora,problema,trabajadores,tipo,ia_comentario,observaciones)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [cultivo, Number(cantidad_kg), campo, calidad, fecha, hora||null, problema||'Ninguno — todo bien', trab, tipo||'ok', ia_comentario||null, observaciones||null]
      )
      return { statusCode: 201, headers, body: JSON.stringify({ ok: true, data: rows[0] }) }
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      const campos = ['cultivo','cantidad_kg','campo','calidad','fecha','hora','problema','trabajadores','tipo','ia_comentario','observaciones']
      const sets = [], vals = []
      campos.forEach(f => {
        if (body[f] !== undefined) {
          sets.push(`${f}=$${vals.length+1}`)
          vals.push(Array.isArray(body[f]) ? body[f].join(', ') : body[f])
        }
      })
      if (!sets.length) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Sin campos' }) }
      vals.push(id)
      const { rows } = await pool.query(`UPDATE registros SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`, vals)
      if (!rows.length) return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: 'No encontrado' }) }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, data: rows[0] }) }
    }

    if (method === 'DELETE') {
      await pool.query('DELETE FROM registros WHERE id=$1', [id])
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, data: { deleted: id } }) }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  } catch (e) {
    console.error(e)
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) }
  }
}
