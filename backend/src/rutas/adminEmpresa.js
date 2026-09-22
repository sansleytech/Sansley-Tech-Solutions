import { Router } from "express";
import { db } from "../db.js";
import verificarToken from "../verificarToken.js";

const router = Router();

// Todo lo de este archivo exige haber iniciado sesión
router.use(verificarToken);

// Devuelve el texto sin espacios sobrantes; si no es texto, devuelve ""
const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");
// Igual, pero si queda vacío lo guarda como NULL en la base de datos
const textoOpcional = (valor) => texto(valor) || null;

// Toma solo los campos que nos interesan del cuerpo de la petición
function leerEmpresa(cuerpo) {
    // Dejamos solo dígitos; si escribe 10 (celular colombiano) le ponemos el 57
    let whatsapp = texto(cuerpo.whatsapp).replace(/\D/g, "");
    if (whatsapp.length === 10) whatsapp = "57" + whatsapp;

    return {
        nombre: texto(cuerpo.nombre),
        eslogan: textoOpcional(cuerpo.eslogan),
        descripcion: textoOpcional(cuerpo.descripcion),
        mision: textoOpcional(cuerpo.mision),
        vision: textoOpcional(cuerpo.vision),
        alcance: textoOpcional(cuerpo.alcance),
        correo: textoOpcional(cuerpo.correo),
        whatsapp: whatsapp || null,
        ubicacion: textoOpcional(cuerpo.ubicacion),
    };
}

// Devuelve el mensaje de error si algo está mal, o null si todo está bien
function errorDeEmpresa(d) {
    if (!d.nombre) return "El nombre de la empresa es obligatorio";
    if (d.nombre.length > 120)
        return "El nombre no puede pasar de 120 caracteres";
    if (d.eslogan && d.eslogan.length > 200)
        return "El eslogan no puede pasar de 200 caracteres";
    if (d.ubicacion && d.ubicacion.length > 120)
        return "La ubicación no puede pasar de 120 caracteres";
    if (
        d.correo &&
        (d.correo.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo))
    )
        return "El correo no es válido";
    if (d.whatsapp && (d.whatsapp.length < 11 || d.whatsapp.length > 15))
        return "El WhatsApp debe incluir el indicativo del país, por ejemplo 573001234567";
    for (const campo of ["descripcion", "mision", "vision", "alcance"]) {
        if (d[campo] && d[campo].length > 3000)
            return `El campo ${campo} no puede pasar de 3000 caracteres`;
    }
    return null;
}

// GET /api/admin/empresa → los datos de la empresa y TODOS los objetivos (activos o no)
router.get("/", async (req, res) => {
    const [empresas] = await db.query("SELECT * FROM empresa LIMIT 1");
    const [objetivos] = await db.query(
        "SELECT id, titulo, descripcion, orden, activo FROM objetivos ORDER BY orden, id",
    );
    res.json({
        empresa: empresas[0] ?? null,
        objetivos: objetivos.map((o) => ({ ...o, activo: Boolean(o.activo) })),
    });
});

// PUT /api/admin/empresa → guarda los datos (si no hay fila todavía, la crea)
router.put("/", async (req, res) => {
    const datos = leerEmpresa(req.body ?? {});
    const error = errorDeEmpresa(datos);
    if (error) return res.status(400).json({ mensaje: error });

    const [existentes] = await db.query("SELECT id FROM empresa LIMIT 1");
    const valores = [
        datos.nombre,
        datos.eslogan,
        datos.descripcion,
        datos.mision,
        datos.vision,
        datos.alcance,
        datos.correo,
        datos.whatsapp,
        datos.ubicacion,
    ];

    if (existentes.length === 0) {
        await db.execute(
            `INSERT INTO empresa (nombre, eslogan, descripcion, mision, vision, alcance, correo, whatsapp, ubicacion)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            valores,
        );
    } else {
        await db.execute(
            `UPDATE empresa SET nombre = ?, eslogan = ?, descripcion = ?, mision = ?, vision = ?,
                    alcance = ?, correo = ?, whatsapp = ?, ubicacion = ?
             WHERE id = ?`,
            [...valores, existentes[0].id],
        );
    }
    res.json(datos);
});

function leerObjetivo(cuerpo) {
    return {
        titulo: texto(cuerpo.titulo),
        descripcion: textoOpcional(cuerpo.descripcion),
        orden: parseInt(cuerpo.orden, 10) || 0,
        activo: [true, 1, "1", "true"].includes(cuerpo.activo) ? 1 : 0,
    };
}

function errorDeObjetivo(d) {
    if (!d.titulo) return "El título del objetivo es obligatorio";
    if (d.titulo.length > 120)
        return "El título no puede pasar de 120 caracteres";
    if (d.descripcion && d.descripcion.length > 400)
        return "La descripción no puede pasar de 400 caracteres";
    return null;
}

async function obtenerObjetivo(id) {
    const [filas] = await db.query(
        "SELECT id, titulo, descripcion, orden, activo FROM objetivos WHERE id = ?",
        [id],
    );
    return filas[0] ? { ...filas[0], activo: Boolean(filas[0].activo) } : null;
}

// POST /api/admin/empresa/objetivos → crea un objetivo
router.post("/objetivos", async (req, res) => {
    const datos = leerObjetivo(req.body ?? {});
    const error = errorDeObjetivo(datos);
    if (error) return res.status(400).json({ mensaje: error });

    const [resultado] = await db.execute(
        "INSERT INTO objetivos (titulo, descripcion, orden, activo) VALUES (?, ?, ?, ?)",
        [datos.titulo, datos.descripcion, datos.orden, datos.activo],
    );
    res.status(201).json(await obtenerObjetivo(resultado.insertId));
});

// PUT /api/admin/empresa/objetivos/:id → edita un objetivo
router.put("/objetivos/:id", async (req, res) => {
    if (!(await obtenerObjetivo(req.params.id))) {
        return res.status(404).json({ mensaje: "Objetivo no encontrado" });
    }
    const datos = leerObjetivo(req.body ?? {});
    const error = errorDeObjetivo(datos);
    if (error) return res.status(400).json({ mensaje: error });

    await db.execute(
        "UPDATE objetivos SET titulo = ?, descripcion = ?, orden = ?, activo = ? WHERE id = ?",
        [
            datos.titulo,
            datos.descripcion,
            datos.orden,
            datos.activo,
            req.params.id,
        ],
    );
    res.json(await obtenerObjetivo(req.params.id));
});

// DELETE /api/admin/empresa/objetivos/:id → borra un objetivo
router.delete("/objetivos/:id", async (req, res) => {
    const [resultado] = await db.execute("DELETE FROM objetivos WHERE id = ?", [
        req.params.id,
    ]);
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Objetivo no encontrado" });
    }
    res.json({ mensaje: "Objetivo eliminado" });
});

export default router;
