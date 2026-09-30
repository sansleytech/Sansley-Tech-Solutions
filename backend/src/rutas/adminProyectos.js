import { Router } from "express";
import { db } from "../db.js";
import verificarToken from "../verificarToken.js";
import { subirUna, rutaPublica, borrarImagen } from "../subirImagen.js";

const router = Router();

// Todo lo de este archivo exige haber iniciado sesión
router.use(verificarToken);

// La imagen del proyecto llega en el campo "imagen" y se guarda en uploads/proyectos
const subirImagen = subirUna("proyectos", "imagen");

const ESTADOS = ["planeacion", "en_proceso", "finalizado", "pausado"];

// Devuelve los proyectos (o uno solo si se da el id) con servicio, cliente y tecnologías
async function consultarProyectos(id = null) {
    const filtro = id ? "WHERE p.id = ?" : "";
    const parametros = id ? [id] : [];

    const [proyectos] = await db.query(
        `SELECT p.id, p.nombre, p.descripcion_corta, p.descripcion, p.servicio_id,
                s.nombre AS servicio, c.nombre AS cliente, p.imagen, p.url,
                p.mostrar_iframe, p.destacado, p.publicado, p.estado, p.orden
         FROM proyectos p
         JOIN servicios s ON s.id = p.servicio_id
         LEFT JOIN clientes c ON c.id = p.cliente_id
         ${filtro}
         ORDER BY p.orden, p.id`,
        parametros,
    );
    if (proyectos.length === 0) return proyectos;

    const [filas] = await db.query(
        `SELECT pt.proyecto_id, t.nombre
         FROM proyecto_tecnologia pt
         JOIN tecnologias t ON t.id = pt.tecnologia_id
         WHERE pt.proyecto_id IN (?)
         ORDER BY t.nombre`,
        [proyectos.map((p) => p.id)],
    );

    for (const proyecto of proyectos) {
        proyecto.tecnologias = filas
            .filter((fila) => fila.proyecto_id === proyecto.id)
            .map((fila) => fila.nombre);
    }
    return proyectos;
}

// Convierte lo que llega del formulario (todo texto) en valores listos para la base de datos
function leerFormulario(cuerpo) {
    const orden = Number.parseInt(cuerpo.orden, 10);
    const esSi = (valor, porDefecto) =>
        valor === undefined
            ? porDefecto
            : ["1", "true", "on"].includes(String(valor));

    // Las tecnologías llegan como texto JSON: '["React","Node.js"]'
    let tecnologias = [];
    try {
        const lista = JSON.parse(cuerpo.tecnologias ?? "[]");
        if (Array.isArray(lista)) tecnologias = lista;
    } catch {
        // si no es JSON válido, se ignora
    }
    // Quitamos vacías y repetidas (sin importar mayúsculas)
    const unicas = new Map();
    for (const tecnologia of tecnologias) {
        const nombre = String(tecnologia).trim();
        if (nombre && !unicas.has(nombre.toLowerCase()))
            unicas.set(nombre.toLowerCase(), nombre);
    }

    return {
        nombre: cuerpo.nombre?.trim() ?? "",
        descripcionCorta: cuerpo.descripcion_corta?.trim() ?? "",
        descripcion: cuerpo.descripcion?.trim() || null,
        servicioId: Number.parseInt(cuerpo.servicio_id, 10),
        cliente: cuerpo.cliente?.trim() || null,
        url: cuerpo.url?.trim() || null,
        mostrarIframe: esSi(cuerpo.mostrar_iframe, false) ? 1 : 0,
        destacado: esSi(cuerpo.destacado, false) ? 1 : 0,
        publicado: esSi(cuerpo.publicado, true) ? 1 : 0,
        estado: ESTADOS.includes(cuerpo.estado) ? cuerpo.estado : "en_proceso",
        orden: Number.isNaN(orden) ? 0 : orden,
        tecnologias: [...unicas.values()],
    };
}

async function errorDeDatos(datos) {
    if (!datos.nombre || !datos.descripcionCorta)
        return "Nombre y descripción corta son obligatorios";
    if (datos.nombre.length > 150)
        return "El nombre no puede superar 150 caracteres";
    if (datos.descripcionCorta.length > 255)
        return "La descripción corta no puede superar 255 caracteres";
    if (datos.cliente && datos.cliente.length > 120)
        return "El cliente no puede superar 120 caracteres";
    if (
        datos.url &&
        (datos.url.length > 500 || !/^https?:\/\//i.test(datos.url))
    ) {
        return "La dirección debe empezar por http:// o https://";
    }
    if (datos.tecnologias.length > 15)
        return "Máximo 15 tecnologías por proyecto";
    if (datos.tecnologias.some((t) => t.length > 50))
        return "Cada tecnología puede tener máximo 50 caracteres";
    if (Number.isNaN(datos.servicioId)) return "Elige un servicio";
    if (!ESTADOS.includes(datos.estado))
        return "El estado elegido no es válido";

    const [servicios] = await db.query(
        "SELECT id FROM servicios WHERE id = ?",
        [datos.servicioId],
    );
    if (servicios.length === 0) return "El servicio elegido no existe";
    return null;
}

// Busca un cliente o tecnología por nombre; si no existe la crea. Devuelve su id.
// ("tabla" solo recibe valores fijos escritos aquí, nunca datos del usuario)
async function idPorNombre(conexion, tabla, nombre) {
    const [existentes] = await conexion.query(
        `SELECT id FROM ${tabla} WHERE nombre = ?`,
        [nombre],
    );
    if (existentes.length > 0) return existentes[0].id;

    const [resultado] = await conexion.query(
        `INSERT INTO ${tabla} (nombre) VALUES (?)`,
        [nombre],
    );
    return resultado.insertId;
}

// Crea (id = null) o actualiza un proyecto junto con sus tecnologías, todo o nada
async function guardarProyecto(id, datos, imagen) {
    const conexion = await db.getConnection();
    try {
        await conexion.beginTransaction();

        const clienteId = datos.cliente
            ? await idPorNombre(conexion, "clientes", datos.cliente)
            : null;

        if (id === null) {
            const [resultado] = await conexion.query(
                `INSERT INTO proyectos (nombre, descripcion_corta, descripcion, servicio_id, cliente_id,
                                        imagen, url, mostrar_iframe, destacado, publicado, estado, orden)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    datos.nombre,
                    datos.descripcionCorta,
                    datos.descripcion,
                    datos.servicioId,
                    clienteId,
                    imagen,
                    datos.url,
                    datos.mostrarIframe,
                    datos.destacado,
                    datos.publicado,
                    datos.estado,
                    datos.orden,
                ],
            );
            id = resultado.insertId;
        } else {
            await conexion.query(
                `UPDATE proyectos
                 SET nombre = ?, descripcion_corta = ?, descripcion = ?, servicio_id = ?, cliente_id = ?,
                     imagen = ?, url = ?, mostrar_iframe = ?, destacado = ?, publicado = ?, estado = ?, orden = ?
                 WHERE id = ?`,
                [
                    datos.nombre,
                    datos.descripcionCorta,
                    datos.descripcion,
                    datos.servicioId,
                    clienteId,
                    imagen,
                    datos.url,
                    datos.mostrarIframe,
                    datos.destacado,
                    datos.publicado,
                    datos.estado,
                    datos.orden,
                    id,
                ],
            );
        }

        // Tecnologías: borramos las anteriores y dejamos solo las que llegaron
        await conexion.query(
            "DELETE FROM proyecto_tecnologia WHERE proyecto_id = ?",
            [id],
        );
        for (const nombre of datos.tecnologias) {
            const tecnologiaId = await idPorNombre(
                conexion,
                "tecnologias",
                nombre,
            );
            await conexion.query(
                "INSERT INTO proyecto_tecnologia (proyecto_id, tecnologia_id) VALUES (?, ?)",
                [id, tecnologiaId],
            );
        }

        await conexion.commit();
        return id;
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
}

// GET /api/admin/proyectos/opciones → datos para llenar los desplegables del formulario
router.get("/opciones", async (req, res) => {
    const [servicios] = await db.query(
        "SELECT id, nombre FROM servicios ORDER BY orden, id",
    );
    const [clientes] = await db.query(
        "SELECT nombre FROM clientes ORDER BY nombre",
    );
    const [tecnologias] = await db.query(
        "SELECT nombre FROM tecnologias ORDER BY nombre",
    );

    res.json({
        servicios,
        clientes: clientes.map((c) => c.nombre),
        tecnologias: tecnologias.map((t) => t.nombre),
    });
});

// GET /api/admin/proyectos → todos los proyectos, también los no publicados
router.get("/", async (req, res) => {
    res.json(await consultarProyectos());
});

// POST /api/admin/proyectos → crea un proyecto (con imagen opcional)
router.post("/", subirImagen, async (req, res) => {
    const datos = leerFormulario(req.body ?? {});
    const imagen = req.file
        ? rutaPublica("proyectos", req.file.filename)
        : null;

    const problema = await errorDeDatos(datos);
    if (problema) {
        borrarImagen(imagen);
        return res.status(400).json({ mensaje: problema });
    }

    try {
        const id = await guardarProyecto(null, datos, imagen);
        const [nuevo] = await consultarProyectos(id);
        res.status(201).json(nuevo);
    } catch (error) {
        borrarImagen(imagen);
        throw error;
    }
});

// PUT /api/admin/proyectos/:id → edita; imagen nueva la reemplaza, quitarImagen=true la elimina
router.put("/:id", subirImagen, async (req, res) => {
    const cuerpo = req.body ?? {};
    const datos = leerFormulario(cuerpo);
    const imagenNueva = req.file
        ? rutaPublica("proyectos", req.file.filename)
        : null;

    const rechazar = (estado, mensaje) => {
        borrarImagen(imagenNueva);
        return res.status(estado).json({ mensaje });
    };

    const [existentes] = await db.query(
        "SELECT imagen FROM proyectos WHERE id = ?",
        [req.params.id],
    );
    if (existentes.length === 0) return rechazar(404, "Proyecto no encontrado");

    const problema = await errorDeDatos(datos);
    if (problema) return rechazar(400, problema);

    const imagenAnterior = existentes[0].imagen;
    let imagen = imagenAnterior;
    if (imagenNueva) imagen = imagenNueva;
    else if (cuerpo.quitarImagen === "true") imagen = null;

    try {
        await guardarProyecto(Number(req.params.id), datos, imagen);
    } catch (error) {
        borrarImagen(imagenNueva);
        throw error;
    }
    if (imagen !== imagenAnterior) borrarImagen(imagenAnterior);

    const [actualizado] = await consultarProyectos(req.params.id);
    res.json(actualizado);
});

// DELETE /api/admin/proyectos/:id → borra el proyecto, sus tecnologías y su imagen
router.delete("/:id", async (req, res) => {
    const [existentes] = await db.query(
        "SELECT imagen FROM proyectos WHERE id = ?",
        [req.params.id],
    );
    if (existentes.length === 0) {
        return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    await db.query("DELETE FROM proyecto_tecnologia WHERE proyecto_id = ?", [
        req.params.id,
    ]);
    await db.query("DELETE FROM proyectos WHERE id = ?", [req.params.id]);
    borrarImagen(existentes[0].imagen);
    res.json({ mensaje: "Proyecto eliminado" });
});

export default router;
