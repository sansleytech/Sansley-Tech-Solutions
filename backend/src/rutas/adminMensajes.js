import { Router } from "express";
import { db } from "../db.js";
import verificarToken from "../verificarToken.js";

const router = Router();

// Todo lo de este archivo exige haber iniciado sesión
router.use(verificarToken);

// GET /api/admin/mensajes → todos los mensajes, los más recientes primero
router.get("/", async (req, res) => {
    const [mensajes] = await db.query(
        `SELECT m.id, m.nombre, m.correo, m.telefono, m.servicio_id, s.nombre AS servicio,
                m.mensaje, m.leido, m.fecha_creacion
         FROM mensajes_contacto m
         LEFT JOIN servicios s ON s.id = m.servicio_id
         ORDER BY m.fecha_creacion DESC, m.id DESC`,
    );
    res.json(mensajes.map((m) => ({ ...m, leido: Boolean(m.leido) })));
});

// PATCH /api/admin/mensajes/:id → marca como leído o no leído. Cuerpo: { "leido": true }
router.patch("/:id", async (req, res) => {
    const { leido } = req.body ?? {};
    if (typeof leido !== "boolean") {
        return res
            .status(400)
            .json({
                mensaje: "Indica si el mensaje está leído (true o false)",
            });
    }

    const [existentes] = await db.query(
        "SELECT id FROM mensajes_contacto WHERE id = ?",
        [req.params.id],
    );
    if (existentes.length === 0) {
        return res.status(404).json({ mensaje: "Mensaje no encontrado" });
    }

    await db.execute("UPDATE mensajes_contacto SET leido = ? WHERE id = ?", [
        leido ? 1 : 0,
        req.params.id,
    ]);
    res.json({ id: Number(req.params.id), leido });
});

// DELETE /api/admin/mensajes/:id → borra el mensaje
router.delete("/:id", async (req, res) => {
    const [resultado] = await db.execute(
        "DELETE FROM mensajes_contacto WHERE id = ?",
        [req.params.id],
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Mensaje no encontrado" });
    }
    res.json({ mensaje: "Mensaje eliminado" });
});

export default router;
