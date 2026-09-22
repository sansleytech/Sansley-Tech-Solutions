import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'
import verificarToken from '../verificarToken.js'

const router = Router()

const LIMITE_INTENTOS = 8 // intentos de login permitidos por IP cada 15 minutos
const VENTANA_MS = 15 * 60 * 1000

// Límite simple en memoria para frenar fuerza bruta (se reinicia si el servidor se reinicia)
const intentos = new Map()

function permitido(ip) {
    const ahora = Date.now()
    const registro = intentos.get(ip)
    if (!registro || ahora - registro.inicio > VENTANA_MS) {
        intentos.set(ip, { inicio: ahora, conteo: 1 })
        return true
    }
    if (registro.conteo >= LIMITE_INTENTOS) return false
    registro.conteo += 1
    return true
}

// Un login correcto le quita la marca a esa IP, para no castigar al dueño de la cuenta
// por los intentos fallidos de otra persona antes de acertar
function limpiar(ip) {
    intentos.delete(ip)
}

// POST /api/auth/login → devuelve el pase (token) si el correo y la contraseña son correctos
router.post('/login', async (req, res) => {
    if (!permitido(req.ip)) {
        return res.status(429).json({ mensaje: 'Demasiados intentos. Espera unos minutos y vuelve a intentar.' })
    }

    const { correo, contrasena } = req.body

    if (!correo || !contrasena) {
        return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' })
    }

    const [usuarios] = await db.query(
        'SELECT id, nombre, correo, contrasena FROM usuarios WHERE correo = ? AND activo = TRUE',
        [correo]
    )
    const usuario = usuarios[0]

    // Mismo mensaje si falla el correo o la contraseña, para no dar pistas
    const valida = usuario && (await bcrypt.compare(contrasena, usuario.contrasena))
    if (!valida) {
        return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' })
    }

    limpiar(req.ip)

    const token = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    )

    res.json({
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
    })
})

// GET /api/auth/yo → ruta protegida, sirve para comprobar que el pase funciona
router.get('/yo', verificarToken, (req, res) => {
    res.json(req.usuario)
})

// PUT /api/auth/contrasena → cambia la contraseña del usuario que inició sesión
router.put('/contrasena', verificarToken, async (req, res) => {
    const { actual, nueva } = req.body ?? {}

    if (!actual || !nueva) {
        return res.status(400).json({ mensaje: 'Escribe tu contraseña actual y la nueva' })
    }
    if (String(nueva).length < 8) {
        return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 8 caracteres' })
    }
    if (actual === nueva) {
        return res.status(400).json({ mensaje: 'La nueva contraseña debe ser distinta a la actual' })
    }

    const [usuarios] = await db.query(
        'SELECT id, contrasena FROM usuarios WHERE id = ? AND activo = TRUE',
        [req.usuario.id]
    )
    const usuario = usuarios[0]
    if (!usuario) {
        return res.status(401).json({ mensaje: 'Sesión inválida' })
    }

    const actualValida = await bcrypt.compare(actual, usuario.contrasena)
    if (!actualValida) {
        return res.status(400).json({ mensaje: 'Tu contraseña actual no es correcta' })
    }

    const hash = await bcrypt.hash(String(nueva), 10)
    await db.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hash, usuario.id])

    res.json({ mensaje: 'Contraseña actualizada' })
})

export default router