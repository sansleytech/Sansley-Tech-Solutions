import { Router } from 'express'
import { db } from '../db.js'
import verificarToken from '../verificarToken.js'
import { subirUna, rutaPublica, borrarImagen } from '../subirImagen.js'

const router = Router()

// Todo lo de este archivo exige haber iniciado sesión
router.use(verificarToken)

const subirFoto = subirUna('equipo')
const CAMPOS = 'id, nombre, cargo, descripcion, foto, orden, activo'

// Convierte lo que llega del formulario (todo texto) en valores listos para la base de datos
function leerFormulario(cuerpo) {
    const orden = Number.parseInt(cuerpo.orden, 10)
    const activo =
        cuerpo.activo === undefined ? true : ['1', 'true', 'on'].includes(String(cuerpo.activo))
    return {
        nombre: cuerpo.nombre?.trim() ?? '',
        cargo: cuerpo.cargo?.trim() ?? '',
        descripcion: cuerpo.descripcion?.trim() || null,
        orden: Number.isNaN(orden) ? 0 : orden,
        activo: activo ? 1 : 0,
    }
}

function errorDeDatos(datos) {
    if (!datos.nombre || !datos.cargo) return 'Nombre y cargo son obligatorios'
    if (datos.nombre.length > 120) return 'El nombre no puede superar 120 caracteres'
    if (datos.cargo.length > 100) return 'El cargo no puede superar 100 caracteres'
    return null
}

// GET /api/admin/equipo → todos los integrantes, también los ocultos
router.get('/', async (req, res) => {
    const [filas] = await db.query(`SELECT ${CAMPOS} FROM equipo ORDER BY orden, id`)
    res.json(filas)
})

// POST /api/admin/equipo → crea un integrante (con foto opcional)
router.post('/', subirFoto, async (req, res) => {
    const datos = leerFormulario(req.body ?? {})
    const foto = req.file ? rutaPublica('equipo', req.file.filename) : null

    const problema = errorDeDatos(datos)
    if (problema) {
        borrarImagen(foto)
        return res.status(400).json({ mensaje: problema })
    }

    const [resultado] = await db.execute(
        'INSERT INTO equipo (nombre, cargo, descripcion, foto, orden, activo) VALUES (?, ?, ?, ?, ?, ?)',
        [datos.nombre, datos.cargo, datos.descripcion, foto, datos.orden, datos.activo]
    )
    const [[nuevo]] = await db.query(`SELECT ${CAMPOS} FROM equipo WHERE id = ?`, [resultado.insertId])
    res.status(201).json(nuevo)
})

// PUT /api/admin/equipo/:id → edita un integrante; foto nueva la reemplaza, quitarFoto=true la elimina
router.put('/:id', subirFoto, async (req, res) => {
    const cuerpo = req.body ?? {}
    const datos = leerFormulario(cuerpo)
    const fotoNueva = req.file ? rutaPublica('equipo', req.file.filename) : null

    const rechazar = (estado, mensaje) => {
        borrarImagen(fotoNueva)
        return res.status(estado).json({ mensaje })
    }

    const [existentes] = await db.query('SELECT foto FROM equipo WHERE id = ?', [req.params.id])
    if (existentes.length === 0) return rechazar(404, 'Integrante no encontrado')

    const problema = errorDeDatos(datos)
    if (problema) return rechazar(400, problema)

    const fotoAnterior = existentes[0].foto
    let foto = fotoAnterior
    if (fotoNueva) foto = fotoNueva
    else if (cuerpo.quitarFoto === 'true') foto = null

    await db.execute(
        'UPDATE equipo SET nombre = ?, cargo = ?, descripcion = ?, foto = ?, orden = ?, activo = ? WHERE id = ?',
        [datos.nombre, datos.cargo, datos.descripcion, foto, datos.orden, datos.activo, req.params.id]
    )
    if (foto !== fotoAnterior) borrarImagen(fotoAnterior)

    const [[actualizado]] = await db.query(`SELECT ${CAMPOS} FROM equipo WHERE id = ?`, [req.params.id])
    res.json(actualizado)
})

// DELETE /api/admin/equipo/:id → borra el integrante y su foto
router.delete('/:id', async (req, res) => {
    const [existentes] = await db.query('SELECT foto FROM equipo WHERE id = ?', [req.params.id])
    if (existentes.length === 0) {
        return res.status(404).json({ mensaje: 'Integrante no encontrado' })
    }

    await db.execute('DELETE FROM equipo WHERE id = ?', [req.params.id])
    borrarImagen(existentes[0].foto)
    res.json({ mensaje: 'Integrante eliminado' })
})

export default router