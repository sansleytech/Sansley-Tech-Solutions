import { Router } from "express";
import { db } from "../db.js";
import verificarToken from "../verificarToken.js";

const router = Router();

// Todo lo de este archivo exige haber iniciado sesión
router.use(verificarToken);

// GET /api/admin/resumen → los números del panel y los últimos mensajes
router.get("/", async (req, res) => {
    // Las 5 consultas corren al mismo tiempo; cada una devuelve [filas, columnas]
    const [[[proyectos]], [[equipo]], [[servicios]], [[mensajes]], [ultimos]] =
        await Promise.all([
            db.query(
                "SELECT COUNT(*) AS total, COALESCE(SUM(publicado), 0) AS publicados FROM proyectos",
            ),
            db.query(
                "SELECT COUNT(*) AS total, COALESCE(SUM(activo), 0) AS activos FROM equipo",
            ),
            db.query(
                "SELECT COUNT(*) AS total, COALESCE(SUM(activo), 0) AS activos FROM servicios",
            ),
            db.query(
                "SELECT COUNT(*) AS total, COALESCE(SUM(leido = 0), 0) AS sin_leer FROM mensajes_contacto",
            ),
            db.query(
                `SELECT m.id, m.nombre, m.correo, s.nombre AS servicio, m.mensaje, m.leido, m.fecha_creacion
             FROM mensajes_contacto m
             LEFT JOIN servicios s ON s.id = m.servicio_id
             ORDER BY m.fecha_creacion DESC, m.id DESC
             LIMIT 5`,
            ),
        ]);

    res.json({
        proyectos: {
            total: Number(proyectos.total),
            publicados: Number(proyectos.publicados),
        },
        equipo: {
            total: Number(equipo.total),
            activos: Number(equipo.activos),
        },
        servicios: {
            total: Number(servicios.total),
            activos: Number(servicios.activos),
        },
        mensajes: {
            total: Number(mensajes.total),
            sinLeer: Number(mensajes.sin_leer),
        },
        ultimosMensajes: ultimos.map((m) => ({
            ...m,
            leido: Boolean(m.leido),
        })),
    });
});

export default router;
