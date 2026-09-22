import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const [testimonios] = await db.query(`
    SELECT t.id, t.autor, t.cargo_autor, t.comentario, t.calificacion,
           c.nombre AS empresa
    FROM testimonios t
    JOIN clientes c ON c.id = t.cliente_id
    WHERE t.publicado = TRUE
    ORDER BY t.fecha_creacion DESC
  `);
  res.json(testimonios);
});

export default router;
