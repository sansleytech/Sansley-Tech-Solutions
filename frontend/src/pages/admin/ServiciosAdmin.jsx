import { useEffect, useState } from "react";
import {
    Alert,
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
import { peticionAdmin } from "../../admin/peticionAdmin.js";

// Las dos áreas de servicios del sitio (la clave es la que se guarda en la base de datos)
const CATEGORIAS = {
    tecnologia: "Tecnología",
    contable: "Contabilidad y tributaria",
};

const MAX_NOMBRE = 100;
const MAX_DESCRIPCION = 250;

// "1 proyecto" / "3 proyectos" / "Sin proyectos"
function textoProyectos(cantidad) {
    if (cantidad === 0) return "Sin proyectos";
    return cantidad === 1 ? "1 proyecto" : `${cantidad} proyectos`;
}

/* ---------- Fila de la lista ---------- */
function FilaServicio({ servicio, separador, onEditar, onEliminar }) {
    const enUso = servicio.proyectos > 0;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 2,
                borderTop: separador ? "1px solid" : "none",
                borderColor: "divider",
            }}
        >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                    }}
                >
                    <Typography sx={{ fontWeight: 700 }}>
                        {servicio.nombre}
                    </Typography>
                    <Chip
                        size="small"
                        variant="outlined"
                        color={servicio.categoria === "contable" ? "secondary" : "primary"}
                        label={CATEGORIAS[servicio.categoria] ?? "Tecnología"}
                    />
                    {!servicio.activo && <Chip size="small" label="Oculto" />}
                </Box>
                <Typography
                    color="text.secondary"
                    sx={{
                        fontSize: 14,
                        mt: 0.25,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {servicio.descripcion}
                </Typography>
                <Typography
                    color="text.secondary"
                    sx={{ fontSize: 12, mt: 0.5 }}
                >
                    Orden {servicio.orden} ·{" "}
                    {textoProyectos(servicio.proyectos)}
                </Typography>
            </Box>

            <Tooltip title="Editar">
                <IconButton onClick={onEditar} aria-label="Editar">
                    <EditOutlined />
                </IconButton>
            </Tooltip>
            <Tooltip
                title={
                    enUso
                        ? `Lo usan ${servicio.proyectos} proyecto(s). Ocúltalo en lugar de borrarlo.`
                        : "Eliminar"
                }
            >
                {/* El span permite mostrar el aviso aunque el botón esté desactivado */}
                <span>
                    <IconButton
                        onClick={onEliminar}
                        color="error"
                        disabled={enUso}
                        aria-label="Eliminar"
                    >
                        <DeleteOutlineOutlined />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}

/* ---------- Ventana para crear / editar ---------- */
function FormularioServicio({ servicio, ordenSugerido, onCerrar, onGuardado }) {
    const esNuevo = !servicio.id;
    const esMovil = useMediaQuery((tema) => tema.breakpoints.down("sm"));

    const [campos, setCampos] = useState({
        nombre: servicio.nombre ?? "",
        descripcion: servicio.descripcion ?? "",
        categoria: servicio.categoria ?? "tecnologia",
        orden: servicio.orden ?? ordenSugerido,
        activo: servicio.activo === undefined ? true : Boolean(servicio.activo),
    });
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    function cambiar(campo, valor) {
        setCampos({ ...campos, [campo]: valor });
    }

    async function guardar() {
        if (!campos.nombre.trim() || !campos.descripcion.trim()) {
            return setError("Nombre y descripción son obligatorios");
        }

        setError("");
        setGuardando(true);

        try {
            await peticionAdmin(
                esNuevo
                    ? "/admin/servicios"
                    : `/admin/servicios/${servicio.id}`,
                {
                    method: esNuevo ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(campos),
                },
            );
            onGuardado(esNuevo ? "Servicio creado" : "Cambios guardados");
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
                {esNuevo ? "Nuevo servicio" : "Editar servicio"}
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre"
                        value={campos.nombre}
                        onChange={(e) => cambiar("nombre", e.target.value)}
                        required
                        fullWidth
                        helperText={
                            esNuevo
                                ? undefined
                                : "Si cambias el nombre, la tarjeta del sitio mostrará un ícono genérico."
                        }
                        slotProps={{ htmlInput: { maxLength: MAX_NOMBRE } }}
                    />
                    <TextField
                        label="Descripción"
                        value={campos.descripcion}
                        onChange={(e) => cambiar("descripcion", e.target.value)}
                        required
                        multiline
                        minRows={3}
                        fullWidth
                        helperText={`${campos.descripcion.length}/${MAX_DESCRIPCION}`}
                        slotProps={{
                            htmlInput: { maxLength: MAX_DESCRIPCION },
                        }}
                    />
                    <TextField
                        select
                        label="Categoría"
                        value={campos.categoria}
                        onChange={(e) => cambiar("categoria", e.target.value)}
                        helperText="Define en qué pestaña de la sección Servicios aparece"
                        fullWidth
                    >
                        {Object.entries(CATEGORIAS).map(([clave, nombre]) => (
                            <MenuItem key={clave} value={clave}>
                                {nombre}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Orden"
                        type="number"
                        value={campos.orden}
                        onChange={(e) => cambiar("orden", e.target.value)}
                        helperText="El 1 aparece primero"
                        sx={{ maxWidth: 200 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={campos.activo}
                                onChange={(e) =>
                                    cambiar("activo", e.target.checked)
                                }
                            />
                        }
                        label="Visible en el sitio"
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCerrar} disabled={guardando}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={guardar}
                    disabled={guardando}
                >
                    {guardando ? "Guardando..." : "Guardar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ---------- Confirmación de eliminar ---------- */
function ConfirmarEliminar({ servicio, onCancelar, onEliminado }) {
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState("");

    async function eliminar() {
        setEliminando(true);
        setError("");
        try {
            await peticionAdmin(`/admin/servicios/${servicio.id}`, {
                method: "DELETE",
            });
            onEliminado();
        } catch (e) {
            setError(e.message);
            setEliminando(false);
        }
    }

    return (
        <Dialog
            open
            onClose={eliminando ? undefined : onCancelar}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                ¿Eliminar "{servicio.nombre}"?
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Typography color="text.secondary">
                    Se quitará del sitio y del formulario de contacto. Esta
                    acción no se puede deshacer. Si solo quieres quitarlo por un
                    tiempo, edítalo y apaga "Visible en el sitio".
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancelar} disabled={eliminando}>
                    Cancelar
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={eliminar}
                    disabled={eliminando}
                >
                    {eliminando ? "Eliminando..." : "Eliminar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ---------- Página ---------- */
export default function ServiciosAdmin() {
    const [lista, setLista] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, servicio = editar
    const [aEliminar, setAEliminar] = useState(null);
    const [aviso, setAviso] = useState("");

    async function cargar() {
        try {
            setLista(await peticionAdmin("/admin/servicios"));
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

    // El orden que se propone para un servicio nuevo (uno más que el mayor actual)
    const ordenSugerido = Math.max(0, ...lista.map((s) => s.orden)) + 1;

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
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, fontSize: { xs: 24, md: 32 } }}
                    >
                        Servicios
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        Lo que ofreces. Aparece en la sección "Servicios" del
                        sitio y en el formulario de contacto.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    onClick={() => setEditando({})}
                >
                    Nuevo servicio
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
                    <Typography
                        color="text.secondary"
                        align="center"
                        sx={{ p: 4 }}
                    >
                        Aún no hay servicios. Crea el primero con el botón
                        "Nuevo servicio".
                    </Typography>
                )}

                {lista.map((servicio, indice) => (
                    <FilaServicio
                        key={servicio.id}
                        servicio={servicio}
                        separador={indice > 0}
                        onEditar={() => setEditando(servicio)}
                        onEliminar={() => setAEliminar(servicio)}
                    />
                ))}
            </Card>

            {/* Ventana de crear / editar */}
            {editando && (
                <FormularioServicio
                    key={editando.id ?? "nuevo"}
                    servicio={editando}
                    ordenSugerido={ordenSugerido}
                    onCerrar={() => setEditando(null)}
                    onGuardado={(mensaje) => {
                        setEditando(null);
                        setAviso(mensaje);
                        cargar();
                    }}
                />
            )}

            {/* Ventana de confirmar eliminación */}
            {aEliminar && (
                <ConfirmarEliminar
                    servicio={aEliminar}
                    onCancelar={() => setAEliminar(null)}
                    onEliminado={() => {
                        setAEliminar(null);
                        setAviso("Servicio eliminado");
                        cargar();
                    }}
                />
            )}

            {/* Aviso verde al guardar o eliminar */}
            <Snackbar
                open={Boolean(aviso)}
                autoHideDuration={3500}
                onClose={() => setAviso("")}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setAviso("")}
                >
                    {aviso}
                </Alert>
            </Snackbar>
        </Box>
    );
}
