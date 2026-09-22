import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import servicios from './rutas/servicios.js'
import proyectos from './rutas/proyectos.js'
import equipo from './rutas/equipo.js'
import testimonios from './rutas/testimonios.js'
import contacto from './rutas/contacto.js'
import empresa from './rutas/empresa.js'
import auth from './rutas/auth.js'
import adminEquipo from './rutas/adminEquipo.js'
import adminProyectos from './rutas/adminProyectos.js'
import adminMensajes from './rutas/adminMensajes.js'
import adminEmpresa from './rutas/adminEmpresa.js'
import adminServicios from './rutas/adminServicios.js'
import adminResumen from './rutas/adminResumen.js'
import { RAIZ_UPLOADS } from './subirImagen.js'

const app = express()
const PORT = process.env.PORT || 4000

// En producción solo se permiten los orígenes listados en CORS_ORIGENES (separados por coma).
// Si no se define nada (desarrollo local), se permite el servidor de Vite por defecto.
const origenesPermitidos = (process.env.CORS_ORIGENES || 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean)

app.use(cors({
    origin(origen, callback) {
        // Sin "origin" (Postman, curl, apps nativas) se permite siempre
        if (!origen || origenesPermitidos.includes(origen)) return callback(null, true)
        callback(new Error('Origen no permitido por CORS'))
    },
}))
app.use(express.json())

// Las imágenes subidas se sirven desde /uploads (los nombres son únicos, se pueden cachear)
app.use('/uploads', express.static(RAIZ_UPLOADS, { maxAge: '30d', immutable: true }))

// Rutas públicas
app.use('/api/servicios', servicios)
app.use('/api/proyectos', proyectos)
app.use('/api/equipo', equipo)
app.use('/api/testimonios', testimonios)
app.use('/api/contacto', contacto)
app.use('/api/empresa', empresa)
app.use('/api/auth', auth)

// Rutas del panel de administración (exigen sesión)
app.use('/api/admin/resumen', adminResumen)
app.use('/api/admin/equipo', adminEquipo)
app.use('/api/admin/proyectos', adminProyectos)
app.use('/api/admin/servicios', adminServicios)
app.use('/api/admin/empresa', adminEmpresa)
app.use('/api/admin/mensajes', adminMensajes)

app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).json({ mensaje: 'Error interno del servidor' })
})

app.listen(PORT, (error) => {
    if (error) {
        console.error('No se pudo iniciar el servidor:', error.message)
        process.exit(1)
    }
    console.log(`Servidor listo en http://localhost:${PORT}`)
})
