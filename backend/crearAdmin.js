import 'dotenv/config'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const [nombre, correo, contrasena] = process.argv.slice(2)

if (!nombre || !correo || !contrasena) {
    console.log("Uso: node crearAdmin.js 'Nombre' 'correo' 'contraseña'")
    process.exit(1)
}

if (contrasena.length < 8) {
    console.log('La contraseña debe tener al menos 8 caracteres')
    process.exit(1)
}

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

try {
    // Guardamos la contraseña cifrada, nunca en texto plano
    const hash = await bcrypt.hash(contrasena, 10)

    try {
        await db.execute(
            'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
            [nombre, correo, hash]
        )
        console.log('Administrador creado:', correo)
    } catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') throw error
        // El correo ya existía: actualizamos su nombre y contraseña
        await db.execute(
            'UPDATE usuarios SET nombre = ?, contrasena = ?, activo = TRUE WHERE correo = ?',
            [nombre, hash, correo]
        )
        console.log('Ese correo ya existía: contraseña actualizada para', correo)
    }
} catch (error) {
    console.log('Error:', error.message)
}

await db.end()