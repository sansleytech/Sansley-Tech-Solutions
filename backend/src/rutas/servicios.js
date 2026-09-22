import { Router } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const [servicios] = await db.query(
    'SELECT id, nombre, descripcion, categoria FROM servicios WHERE activo = TRUE ORDER BY orden, id'
  )
  res.json(servicios)
})

export default router