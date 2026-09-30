import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    const [empresas] = await db.query(
        "SELECT nombre, eslogan, descripcion, mision, vision, alcance, correo, whatsapp, ubicacion FROM empresa LIMIT 1",
    );

    if (empresas.length === 0) {
        return res
            .status(404)
            .json({ mensaje: "Aún no hay información de la empresa" });
    }

    const [objetivos] = await db.query(
        "SELECT id, titulo, descripcion FROM objetivos WHERE activo = TRUE ORDER BY orden",
    );

    res.json({ ...empresas[0], objetivos });
});

export default router;
