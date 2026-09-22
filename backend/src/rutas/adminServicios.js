import { Router } from "express";
import { db } from "../db.js";
import verificarToken from "../verificarToken.js";

const router = Router();

// Todo lo de este archivo exige haber iniciado sesión
router.use(verificarToken);

// Las dos áreas de servicios que muestra el sitio
const CATEGORIAS = ["tecnologia", "contable"];

// Devuelve el texto sin espacios sobrantes; si no es texto, devuelve ""
const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");

// Toma solo los campos que nos interesan del cuerpo de la petición
function leerServicio(cuerpo) {
    return {
        nombre: texto(cuerpo.nombre),
        descripcion: texto(cuerpo.descripcion),
        categoria: texto(cuerpo.categoria) || "tecnologia",
        orden: parseInt(cuerpo.orden, 10) || 0,
        activo: [true, 1, "1", "true"].includes(cuerpo.activo) ? 1 : 0,
    };
}

// Devuelve el mensaje de error si algo está mal, o null si todo está bien
function errorDeServicio(d) {
    if (!d.nombre) return "El nombre del servicio es obligatorio";
    if (d.nombre.length > 100)
        return "El nombre no puede pasar de 100 caracteres";
    if (!d.descripcion) return "La descripción es obligatoria";
    if (d.descripcion.length > 250)
        return "La descripción no puede pasar de 250 caracteres";
    if (!CATEGORIAS.includes(d.categoria)) return "La categoría no es válida";
    return null;
}

// Un servicio con la cantidad de proyectos que lo usan
async function obtenerServicio(id) {
    const [filas] = await db.query(
        `SELECT s.id, s.nombre, s.descripcion, s.categoria, s.orden, s.activo, COUNT(p.id) AS proyectos
         FROM servicios s
         LEFT JOIN proyectos p ON p.servicio_id = s.id
         WHERE s.id = ?
         GROUP BY s.id`,
        [id],
    );
    if (filas.length === 0) return null;
    return {
        ...filas[0],
        activo: Boolean(filas[0].activo),
        proyectos: Number(filas[0].proyectos),
    };
}

// ¿Ya existe otro servicio con este nombre? (excluyendo el que se está editando)
async function nombreRepetido(nombre, idActual = 0) {
    const [filas] = await db.query(
        "SELECT id FROM servicios WHERE nombre = ? AND id <> ?",
        [nombre, idActual],
    );
    return filas.length > 0;
}

// GET /api/admin/servicios → todos los servicios (activos o no), con su cantidad de proyectos
router.get("/", async (req, res) => {
    const [filas] = await db.query(
        `SELECT s.id, s.nombre, s.descripcion, s.categoria, s.orden, s.activo, COUNT(p.id) AS proyectos
         FROM servicios s
         LEFT JOIN proyectos p ON p.servicio_id = s.id
         GROUP BY s.id
         ORDER BY s.orden, s.id`,
    );
    res.json(
        filas.map((s) => ({
            ...s,
            activo: Boolean(s.activo),
            proyectos: Number(s.proyectos),
        })),
    );
});

// POST /api/admin/servicios → crea un servicio
router.post("/", async (req, res) => {
    const datos = leerServicio(req.body ?? {});
    const error = errorDeServicio(datos);
    if (error) return res.status(400).json({ mensaje: error });

    if (await nombreRepetido(datos.nombre)) {
        return res
            .status(409)
            .json({ mensaje: "Ya existe un servicio con ese nombre" });
    }

    const [resultado] = await db.execute(
        "INSERT INTO servicios (nombre, descripcion, categoria, orden, activo) VALUES (?, ?, ?, ?, ?)",
        [datos.nombre, datos.descripcion, datos.categoria, datos.orden, datos.activo],
    );
    res.status(201).json(await obtenerServicio(resultado.insertId));
});

// PUT /api/admin/servicios/:id → edita un servicio
router.put("/:id", async (req, res) => {
    if (!(await obtenerServicio(req.params.id))) {
        return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    const datos = leerServicio(req.body ?? {});
    const error = errorDeServicio(datos);
    if (error) return res.status(400).json({ mensaje: error });

    if (await nombreRepetido(datos.nombre, Number(req.params.id))) {
        return res
            .status(409)
            .json({ mensaje: "Ya existe un servicio con ese nombre" });
    }

    await db.execute(
        "UPDATE servicios SET nombre = ?, descripcion = ?, categoria = ?, orden = ?, activo = ? WHERE id = ?",
        [
            datos.nombre,
            datos.descripcion,
            datos.categoria,
            datos.orden,
            datos.activo,
            req.params.id,
        ],
    );
    res.json(await obtenerServicio(req.params.id));
});

// DELETE /api/admin/servicios/:id → borra un servicio, solo si ningún proyecto lo usa
router.delete("/:id", async (req, res) => {
    const servicio = await obtenerServicio(req.params.id);
    if (!servicio) {
        return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    if (servicio.proyectos > 0) {
        return res.status(409).json({
            mensaje: `No se puede eliminar: lo usan ${servicio.proyectos} proyecto(s). Ocúltalo en lugar de borrarlo.`,
        });
    }

    try {
        await db.execute("DELETE FROM servicios WHERE id = ?", [req.params.id]);
    } catch (error) {
        // Otra tabla (por ejemplo los mensajes de contacto) todavía lo referencia
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                mensaje:
                    "Este servicio está en uso y no se puede eliminar. Ocúltalo en lugar de borrarlo.",
            });
        }
        throw error;
    }
    res.json({ mensaje: "Servicio eliminado" });
});

export default router;
