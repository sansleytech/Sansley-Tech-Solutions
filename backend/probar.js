// Diagnóstico de la base de datos. Se ejecuta con:  node probar.js
// No muestra contraseñas ni claves, así que puedes pegar su resultado sin problema.
import 'dotenv/config'
import mysql from 'mysql2/promise'

const ok = (texto) => console.log('  OK   ' + texto)
const mal = (texto) => console.log('  FALLO ' + texto)

function pista(error) {
    switch (error.code) {
        case 'ECONNREFUSED':
        case 'ETIMEDOUT':
        case 'ENOTFOUND':
            return 'MySQL no está encendido o DB_HOST / DB_PORT están mal. Enciende el servicio de MySQL.'
        case 'ER_ACCESS_DENIED_ERROR':
            return 'Usuario o contraseña incorrectos en backend\\.env (recuerda reiniciar el backend después de cambiarlo).'
        case 'ER_BAD_DB_ERROR':
            return 'DB_NAME no existe en MySQL.'
        case 'ER_NO_SUCH_TABLE':
            return 'Falta una tabla en la base de datos.'
        case 'ER_BAD_FIELD_ERROR':
            return 'Falta una columna en la tabla (el código usa una columna que tu tabla no tiene).'
        case 'ER_DATA_TOO_LONG':
            return 'Un dato es más largo que la columna donde se guarda (por ejemplo foto).'
        case 'ER_NO_DEFAULT_FOR_FIELD':
            return 'Hay una columna obligatoria que el panel no está enviando.'
        default:
            return 'Copia este código y mensaje para revisarlo.'
    }
}

console.log('\n1. Variables del .env (sin mostrar secretos)')
for (const clave of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME']) {
    console.log(`  ${clave.padEnd(12)} ${process.env[clave] || '(VACÍA)'}`)
}
for (const clave of ['DB_PASSWORD', 'JWT_SECRET']) {
    console.log(`  ${clave.padEnd(12)} ${process.env[clave] ? 'definida' : '(vacía)'}`)
}

let conexion
try {
    console.log('\n2. Conexión a MySQL')
    conexion = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectTimeout: 5000,
    })
    ok('Conectó a la base de datos')
} catch (error) {
    mal(`${error.code ?? 'ERROR'}: ${error.message}`)
    console.log('  → ' + pista(error))
    process.exit(1)
}

try {
    console.log('\n3. Columnas de la tabla equipo')
    const [columnas] = await conexion.query('SHOW COLUMNS FROM equipo')
    for (const c of columnas) {
        console.log(`  ${c.Field.padEnd(12)} ${String(c.Type).padEnd(14)} nulo:${c.Null}  defecto:${c.Default ?? '-'}`)
    }

    console.log('\n4. Integrantes guardados')
    const [filas] = await conexion.query(
        'SELECT id, nombre, orden, activo, LENGTH(foto) AS largo_foto FROM equipo ORDER BY orden, id'
    )
    if (filas.length === 0) console.log('  (la tabla está vacía)')
    for (const f of filas) {
        console.log(`  #${f.id} ${f.nombre} | orden ${f.orden} | activo ${f.activo} | foto ${f.largo_foto ?? 'sin foto'}`)
    }
    ok(`${filas.length} integrante(s)`)

    console.log('\n5. Prueba de crear un integrante (se deshace, no guarda nada)')
    await conexion.beginTransaction()
    const fotoDePrueba = '/uploads/equipo/' + 'a'.repeat(36) + '.png'
    const [resultado] = await conexion.execute(
        'INSERT INTO equipo (nombre, cargo, descripcion, foto, orden, activo) VALUES (?, ?, ?, ?, ?, ?)',
        ['Prueba', 'Prueba', 'Texto de prueba', fotoDePrueba, 99, 1]
    )
    ok(`El INSERT funciona (id ${resultado.insertId})`)
    await conexion.rollback()
} catch (error) {
    mal(`${error.code ?? 'ERROR'}: ${error.message}`)
    console.log('  → ' + pista(error))
    await conexion.rollback().catch(() => {})
}

await conexion.end()
console.log('\nListo.')
