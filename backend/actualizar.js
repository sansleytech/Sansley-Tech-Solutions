import 'dotenv/config'
import mysql from 'mysql2/promise'

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

// Solo miramos: columnas de las tablas empresa y objetivos
for (const tabla of ['servicios']) {
    console.log(`\n=== ${tabla} ===`)
    const [columnas] = await db.query(`DESCRIBE ${tabla}`)
    console.table(columnas.map((c) => ({ campo: c.Field, tipo: c.Type, nulo: c.Null, clave: c.Key, defecto: c.Default })))
}

await db.end()