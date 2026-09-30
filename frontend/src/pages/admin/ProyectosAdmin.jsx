import { useEffect, useState } from "react";
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Skeleton,
    Snackbar,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import PhotoCameraOutlined from "@mui/icons-material/PhotoCameraOutlined";
import StarRounded from "@mui/icons-material/StarRounded";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { peticionAdmin } from "../../admin/peticionAdmin.js";
import { urlImagen } from "../../api.js";

const MAX_MB = 3;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

const ESTADOS = {
    planeacion: { etiqueta: "Planeación", color: "default" },
    en_proceso: { etiqueta: "En proceso", color: "warning" },
    finalizado: { etiqueta: "Finalizado", color: "success" },
    pausado: { etiqueta: "Pausado", color: "error" },
};

/* ---------- Fila de la lista ---------- */
function FilaProyecto({ proyecto, separador, onEditar, onEliminar }) {
    // "Servicio · Cliente", omitiendo lo que esté vacío
    const detalle = [proyecto.servicio, proyecto.cliente].filter(Boolean).join(" · ");

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
                p: 2,
                borderTop: separador ? "1px solid" : "none",
                borderColor: "divider",
            }}
        >
            <Avatar
                variant="rounded"
                src={urlImagen(proyecto.imagen) ?? undefined}
                sx={{
                    width: { xs: 64, sm: 88 },
                    height: { xs: 44, sm: 56 },
                    bgcolor: "action.hover",
                    color: "text.secondary",
                }}
            >
                <WorkOutlineOutlined />
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 700 }}>{proyecto.nombre}</Typography>
                    {!proyecto.publicado && <Chip size="small" label="Borrador" />}
                    {ESTADOS[proyecto.estado] && (
                        <Chip
                            size="small"
                            color={ESTADOS[proyecto.estado].color}
                            variant="outlined"
                            label={ESTADOS[proyecto.estado].etiqueta}
                        />
                    )}
                    {Boolean(proyecto.destacado) && (
                        <Chip
                            size="small"
                            color="secondary"
                            variant="outlined"
                            icon={<StarRounded />}
                            label="Destacado"
                        />
                    )}
                </Box>
                <Typography color="text.secondary" noWrap sx={{ fontSize: 14 }}>
                    {detalle}
                </Typography>
                {proyecto.tecnologias.length > 0 && (
                    <Typography color="text.secondary" noWrap sx={{ fontSize: 13, opacity: 0.8 }}>
                        {proyecto.tecnologias.join(" · ")}
                    </Typography>
                )}
            </Box>

            <Tooltip title="Editar">
                <IconButton onClick={onEditar} aria-label="Editar">
                    <EditOutlined />
                </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
                <IconButton onClick={onEliminar} color="error" aria-label="Eliminar">
                    <DeleteOutlineOutlined />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

/* ---------- Ventana para crear / editar ---------- */
function FormularioProyecto({ proyecto, opciones, ordenSugerido, onCerrar, onGuardado }) {
    const esNuevo = !proyecto.id;
    const esMovil = useMediaQuery((tema) => tema.breakpoints.down("sm"));

    const [campos, setCampos] = useState({
        nombre: proyecto.nombre ?? "",
        descripcion_corta: proyecto.descripcion_corta ?? "",
        descripcion: proyecto.descripcion ?? "",
        servicio_id: proyecto.servicio_id ?? "",
        cliente: proyecto.cliente ?? "",
        tecnologias: proyecto.tecnologias ?? [],
        url: proyecto.url ?? "",
        orden: proyecto.orden ?? ordenSugerido,
        estado: proyecto.estado ?? "en_proceso",
        publicado: proyecto.publicado === undefined ? true : Boolean(proyecto.publicado),
        mostrar_iframe: Boolean(proyecto.mostrar_iframe),
        destacado: Boolean(proyecto.destacado),
    });
    const [archivo, setArchivo] = useState(null);
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [quitarImagen, setQuitarImagen] = useState(false);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const imagenActual = vistaPrevia ?? (quitarImagen ? null : urlImagen(proyecto.imagen));

    function cambiar(campo, valor) {
        setCampos({ ...campos, [campo]: valor });
    }

    function elegirArchivo(evento) {
        const elegido = evento.target.files[0];
        evento.target.value = ""; // permite volver a elegir el mismo archivo
        if (!elegido) return;

        if (!TIPOS.includes(elegido.type)) {
            return setError("La imagen debe ser JPG, PNG o WebP");
        }
        if (elegido.size > MAX_MB * 1024 * 1024) {
            return setError(`La imagen supera los ${MAX_MB} MB`);
        }

        if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        setError("");
        setArchivo(elegido);
        setVistaPrevia(URL.createObjectURL(elegido));
        setQuitarImagen(false);
    }

    function quitar() {
        if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        setArchivo(null);
        setVistaPrevia(null);
        if (proyecto.imagen) setQuitarImagen(true);
    }

    async function guardar() {
        if (!campos.nombre.trim() || !campos.descripcion_corta.trim()) {
            return setError("Nombre y descripción corta son obligatorios");
        }
        if (!campos.servicio_id) {
            return setError("Elige un servicio");
        }

        setError("");
        setGuardando(true);

        try {
            const datos = new FormData();
            datos.append("nombre", campos.nombre);
            datos.append("descripcion_corta", campos.descripcion_corta);
            datos.append("descripcion", campos.descripcion);
            datos.append("servicio_id", campos.servicio_id);
            datos.append("cliente", campos.cliente);
            datos.append("tecnologias", JSON.stringify(campos.tecnologias));
            datos.append("url", campos.url);
            datos.append("orden", campos.orden);
            datos.append("estado", campos.estado);
            datos.append("publicado", campos.publicado);
            datos.append("mostrar_iframe", campos.mostrar_iframe);
            datos.append("destacado", campos.destacado);
            if (archivo) datos.append("imagen", archivo);
            if (quitarImagen) datos.append("quitarImagen", "true");

            await peticionAdmin(
                esNuevo ? "/admin/proyectos" : `/admin/proyectos/${proyecto.id}`,
                { method: esNuevo ? "POST" : "PUT", body: datos }
            );
            onGuardado(esNuevo ? "Proyecto creado" : "Cambios guardados");
        } catch (e) {
            setError(e.message);
            setGuardando(false);
        }
    }

    return (
        <Dialog
            open
            onClose={guardando ? undefined : onCerrar}
            fullWidth
            maxWidth="sm"
            fullScreen={esMovil}
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                {esNuevo ? "Nuevo proyecto" : "Editar proyecto"}
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Captura del proyecto */}
                <Box sx={{ mt: 1, mb: 3 }}>
                    <Box
                        sx={{
                            width: "100%",
                            aspectRatio: "16 / 9",
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: "action.hover",
                            color: "text.secondary",
                            border: "1px solid",
                            borderColor: "divider",
                            display: "grid",
                            placeItems: "center",
                        }}
                    >
                        {imagenActual ? (
                            <Box
                                component="img"
                                src={imagenActual}
                                alt="Vista previa"
                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <ImageOutlined fontSize="large" />
                        )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
                        <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            startIcon={<PhotoCameraOutlined />}
                        >
                            {imagenActual ? "Cambiar captura" : "Subir captura"}
                            <input
                                hidden
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={elegirArchivo}
                            />
                        </Button>
                        {imagenActual && (
                            <Button size="small" color="error" onClick={quitar}>
                                Quitar
                            </Button>
                        )}
                        <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                            JPG, PNG o WebP · máx. {MAX_MB} MB
                        </Typography>
                    </Box>
                </Box>

                <Stack spacing={2}>
                    <TextField
                        label="Nombre"
                        value={campos.nombre}
                        onChange={(e) => cambiar("nombre", e.target.value)}
                        required
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 150 } }}
                    />
                    <TextField
                        label="Descripción corta"
                        value={campos.descripcion_corta}
                        onChange={(e) => cambiar("descripcion_corta", e.target.value)}
                        required
                        fullWidth
                        helperText={`Es la que sale en la tarjeta · ${campos.descripcion_corta.length}/255`}
                        slotProps={{ htmlInput: { maxLength: 255 } }}
                    />
                    <TextField
                        label="Descripción completa"
                        value={campos.descripcion}
                        onChange={(e) => cambiar("descripcion", e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />

                    <TextField
                        select
                        label="Servicio"
                        value={campos.servicio_id}
                        onChange={(e) => cambiar("servicio_id", e.target.value)}
                        required
                        fullWidth
                    >
                        {opciones.servicios.map((servicio) => (
                            <MenuItem key={servicio.id} value={servicio.id}>
                                {servicio.nombre}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Autocomplete
                        freeSolo
                        options={opciones.clientes}
                        inputValue={campos.cliente}
                        onInputChange={(evento, valor) => cambiar("cliente", valor)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Cliente (opcional)"
                                helperText="Elige uno existente o escribe uno nuevo"
                            />
                        )}
                    />

                    <Autocomplete
                        multiple
                        freeSolo
                        autoSelect
                        filterSelectedOptions
                        options={opciones.tecnologias}
                        value={campos.tecnologias}
                        onChange={(evento, valor) => cambiar("tecnologias", valor)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tecnologías"
                                helperText="Elige de la lista o escribe una nueva y pulsa Enter"
                            />
                        )}
                    />

                    <TextField
                        label="Dirección del proyecto"
                        value={campos.url}
                        onChange={(e) => cambiar("url", e.target.value)}
                        placeholder="https://..."
                        fullWidth
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            label="Orden"
                            type="number"
                            value={campos.orden}
                            onChange={(e) => cambiar("orden", e.target.value)}
                            helperText="El 1 aparece primero"
                            sx={{ maxWidth: { sm: 200 } }}
                        />
                        <TextField
                            select
                            label="Estado del proyecto"
                            value={campos.estado}
                            onChange={(e) => cambiar("estado", e.target.value)}
                            fullWidth
                        >
                            {Object.entries(ESTADOS).map(([valor, { etiqueta }]) => (
                                <MenuItem key={valor} value={valor}>
                                    {etiqueta}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={campos.publicado}
                                    onChange={(e) => cambiar("publicado", e.target.checked)}
                                />
                            }
                            label="Publicado en el sitio"
                        />
                        <br />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={campos.mostrar_iframe}
                                    onChange={(e) => cambiar("mostrar_iframe", e.target.checked)}
                                />
                            }
                            label="Mostrar vista previa en vivo (usa la dirección)"
                        />
                        <br />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={campos.destacado}
                                    onChange={(e) => cambiar("destacado", e.target.checked)}
                                />
                            }
                            label="Destacado"
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCerrar} disabled={guardando}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={guardar} disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ---------- Confirmación de eliminar ---------- */
function ConfirmarEliminar({ proyecto, onCancelar, onEliminado }) {
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState("");

    async function eliminar() {
        setEliminando(true);
        setError("");
        try {
            await peticionAdmin(`/admin/proyectos/${proyecto.id}`, { method: "DELETE" });
            onEliminado();
        } catch (e) {
            setError(e.message);
            setEliminando(false);
        }
    }

    return (
        <Dialog open onClose={eliminando ? undefined : onCancelar} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar {proyecto.nombre}?</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Typography color="text.secondary">
                    Se quitará del sitio y se borrará su imagen. Esta acción no se puede deshacer. Si solo
                    quieres dejar de mostrarlo, edítalo y apaga "Publicado en el sitio".
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancelar} disabled={eliminando}>
                    Cancelar
                </Button>
                <Button color="error" variant="contained" onClick={eliminar} disabled={eliminando}>
                    {eliminando ? "Eliminando..." : "Eliminar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ---------- Página ---------- */
export default function ProyectosAdmin() {
    const [lista, setLista] = useState([]);
    const [opciones, setOpciones] = useState({ servicios: [], clientes: [], tecnologias: [] });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, proyecto = editar
    const [aEliminar, setAEliminar] = useState(null);
    const [aviso, setAviso] = useState("");

    async function cargar() {
        try {
            // Pedimos la lista y las opciones de los desplegables al mismo tiempo
            const [proyectos, opcionesNuevas] = await Promise.all([
                peticionAdmin("/admin/proyectos"),
                peticionAdmin("/admin/proyectos/opciones"),
            ]);
            setLista(proyectos);
            setOpciones(opcionesNuevas);
            setError("");
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargar();
    }, []);

    // El orden que se propone para un proyecto nuevo (uno más que el mayor actual)
    const ordenSugerido = Math.max(0, ...lista.map((p) => p.orden)) + 1;

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                    mb: 3,
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: 24, md: 32 } }}>
                        Proyectos
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        Los proyectos que se muestran en el portafolio del sitio.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    onClick={() => setEditando({})}
                    disabled={cargando || Boolean(error)}
                >
                    Nuevo proyecto
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card variant="outlined">
                {cargando && (
                    <Stack spacing={1} sx={{ p: 2 }}>
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} variant="rounded" height={64} />
                        ))}
                    </Stack>
                )}

                {!cargando && !error && lista.length === 0 && (
                    <Typography color="text.secondary" align="center" sx={{ p: 4 }}>
                        Aún no hay proyectos. Crea el primero con el botón "Nuevo proyecto".
                    </Typography>
                )}

                {lista.map((proyecto, indice) => (
                    <FilaProyecto
                        key={proyecto.id}
                        proyecto={proyecto}
                        separador={indice > 0}
                        onEditar={() => setEditando(proyecto)}
                        onEliminar={() => setAEliminar(proyecto)}
                    />
                ))}
            </Card>

            {editando && (
                <FormularioProyecto
                    key={editando.id ?? "nuevo"}
                    proyecto={editando}
                    opciones={opciones}
                    ordenSugerido={ordenSugerido}
                    onCerrar={() => setEditando(null)}
                    onGuardado={(mensaje) => {
                        setEditando(null);
                        setAviso(mensaje);
                        cargar();
                    }}
                />
            )}

            {aEliminar && (
                <ConfirmarEliminar
                    proyecto={aEliminar}
                    onCancelar={() => setAEliminar(null)}
                    onEliminado={() => {
                        setAEliminar(null);
                        setAviso("Proyecto eliminado");
                        cargar();
                    }}
                />
            )}

            <Snackbar open={Boolean(aviso)} autoHideDuration={3500} onClose={() => setAviso("")}>
                <Alert severity="success" variant="filled" onClose={() => setAviso("")}>
                    {aviso}
                </Alert>
            </Snackbar>
        </Box>
    );
}