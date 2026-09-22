import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const [filas] = await db.query(`
    SELECT p.id, p.nombre, p.descripcion_corta, p.descripcion, p.imagen, p.url,
    p.mostrar_iframe, p.destacado, p.estado,
    s.nombre AS servicio,
    c.nombre AS cliente,
    GROUP_CONCAT(t.nombre ORDER BY t.nombre SEPARATOR ',') AS tecnologias
    FROM proyectos p
    JOIN servicios s ON s.id = p.servicio_id
    LEFT JOIN clientes c ON c.id = p.cliente_id
    LEFT JOIN proyecto_tecnologia pt ON pt.proyecto_id = p.id
    LEFT JOIN tecnologias t ON t.id = pt.tecnologia_id
    WHERE p.publicado = TRUE
    GROUP BY p.id, s.nombre, c.nombre
    ORDER BY p.orden
  `);

  const proyectos = filas.map(p => ({
    ...p,
    mostrar_iframe: Boolean(p.mostrar_iframe),
    destacado: Boolean(p.destacado),
    tecnologias: p.tecnologias ? p.tecnologias.split(",") : []
  }));

  res.json(proyectos);
});

export default router;