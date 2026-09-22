import jwt from 'jsonwebtoken'

export default function verificarToken(req, res, next) {
    const cabecera = req.headers.authorization ?? ''
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null

    if (!token) {
        return res.status(401).json({ mensaje: 'Debes iniciar sesión' })
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch {
        res.status(401).json({ mensaje: 'Sesión inválida o vencida' })
    }
}