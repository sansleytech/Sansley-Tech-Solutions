import { Router } from "express";
import { db } from "../db.js";
import verificarToken from "../verificarToken.js";

const router = Router();

// Todo lo de este archivo exige haber iniciado sesión
router.use(verificarToken);

// Devuelve el texto sin espacios sobrantes; si no es texto, devuelve ""
const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");

// Toma solo los campos que nos interesan del cuerpo de la petición
function leerCategoria(cuerpo) {
    return {
        nombre: texto(cuerpo.nombre),
        orden: parseInt(cuerpo.orden, 10) || 0,
        activo: [true, 1, "1", "true"].includes(cuerpo.activo) ? 1 : 0,
    };
}

// Devuelve el mensaje de error si algo está mal, o null si todo está bien
function errorDeCategoria(d) {
    if (!d.nombre) return "El nombre de la categoría es obligatorio";
    if (d.nombre.length > 100)
        return "El nombre no puede pasar de 100 caracteres";
    return null;
}

// Una categoría con la cantidad de proyectos que la usan
async function obtenerCategoria(id) {
    const [filas] = await db.query(
        `SELECT c.id, c.nombre, c.orden, c.activo, COUNT(p.id) AS proyectos
         FROM categorias c
         LEFT JOIN proyectos p ON p.categoria_id = c.id
         WHERE c.id = ?
         GROUP BY c.id`,
        [id],
    );
    if (filas.length === 0) return null;
    return {
        ...filas[0],
        activo: Boolean(filas[0].activo),
        proyectos: Number(filas[0].proyectos),
    };
}

// ¿Ya existe otra categoría con este nombre? (excluyendo la que se está editando)
async function nombreRepetido(nombre, idActual = 0) {
    const [filas] = await db.query(
        "SELECT id FROM categorias WHERE nombre = ? AND id <> ?",
        [nombre, idActual],
    );
    return filas.length > 0;
}

// GET /api/admin/categorias → todas las categorías (activas o no), con su cantidad de proyectos
router.get("/", async (req, res) => {
    const [filas] = await db.query(
        `SELECT c.id, c.nombre, c.orden, c.activo, COUNT(p.id) AS proyectos
         FROM categorias c
         LEFT JOIN proyectos p ON p.categoria_id = c.id
         GROUP BY c.id
         ORDER BY c.orden, c.id`,
    );
    res.json(
        filas.map((c) => ({
            ...c,
            activo: Boolean(c.activo),
            proyectos: Number(c.proyectos),
        })),
    );
});

// POST /api/admin/categorias → crea una categoría
router.post("/", async (req, res) => {
    const datos = leerCategoria(req.body ?? {});
    const error = errorDeCategoria(datos);
    if (error) return res.status(400).json({ mensaje: error });

    if (await nombreRepetido(datos.nombre)) {
        return res
            .status(409)
            .json({ mensaje: "Ya existe una categoría con ese nombre" });
    }

    const [resultado] = await db.execute(
        "INSERT INTO categorias (nombre, orden, activo) VALUES (?, ?, ?)",
        [datos.nombre, datos.orden, datos.activo],
    );
    res.status(201).json(await obtenerCategoria(resultado.insertId));
});

// PUT /api/admin/categorias/:id → edita una categoría
router.put("/:id", async (req, res) => {
    if (!(await obtenerCategoria(req.params.id))) {
        return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    const datos = leerCategoria(req.body ?? {});
    const error = errorDeCategoria(datos);
    if (error) return res.status(400).json({ mensaje: error });

    if (await nombreRepetido(datos.nombre, Number(req.params.id))) {
        return res
            .status(409)
            .json({ mensaje: "Ya existe una categoría con ese nombre" });
    }

    await db.execute(
        "UPDATE categorias SET nombre = ?, orden = ?, activo = ? WHERE id = ?",
        [datos.nombre, datos.orden, datos.activo, req.params.id],
    );
    res.json(await obtenerCategoria(req.params.id));
});

// DELETE /api/admin/categorias/:id → borra una categoría, solo si ningún proyecto la usa
router.delete("/:id", async (req, res) => {
    const categoria = await obtenerCategoria(req.params.id);
    if (!categoria) {
        return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    if (categoria.proyectos > 0) {
        return res.status(409).json({
            mensaje: `No se puede eliminar: la usan ${categoria.proyectos} proyecto(s). Ocúltala en lugar de borrarla.`,
        });
    }

    try {
        await db.execute("DELETE FROM categorias WHERE id = ?", [
            req.params.id,
        ]);
    } catch (error) {
        // Otra tabla todavía la referencia
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                mensaje:
                    "Esta categoría está en uso y no se puede eliminar. Ocúltala en lugar de borrarla.",
            });
        }
        throw error;
    }
    res.json({ mensaje: "Categoría eliminada" });
});

export default router;
