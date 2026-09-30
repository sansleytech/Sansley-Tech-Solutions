import { Router } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const [equipo] = await db.query(
    'SELECT id, nombre, cargo, descripcion, foto FROM equipo WHERE activo = TRUE ORDER BY orden'
  )
  res.json(equipo)
})

export default router