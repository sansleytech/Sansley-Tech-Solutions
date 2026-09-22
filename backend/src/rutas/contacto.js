import { Router } from 'express'
import { db } from '../db.js'

const router = Router()

const limpio = (valor) => String(valor ?? '').trim()

router.post('/', async (req, res) => {
  const { nombre, correo, telefono, servicio_id, mensaje } = req.body ?? {}

  if (!limpio(nombre) || !limpio(correo) || !limpio(mensaje)) {
    return res.status(400).json({ mensaje: 'Nombre, correo y mensaje son obligatorios' })
  }

  if (!/^\S+@\S+\.\S+$/.test(limpio(correo))) {
    return res.status(400).json({ mensaje: 'El correo no es válido' })
  }

  await db.query(
    `INSERT INTO mensajes_contacto (nombre, correo, telefono, servicio_id, mensaje)
     VALUES (?, ?, ?, ?, ?)`,
    [limpio(nombre), limpio(correo), limpio(telefono) || null, servicio_id || null, limpio(mensaje)]
  )

  res.status(201).json({ mensaje: 'Mensaje enviado correctamente' })
})

export default router