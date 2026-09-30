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

const MAX_NOMBRE = 100;

// "1 proyecto" / "3 proyectos" / "Sin proyectos"
function textoProyectos(cantidad) {
    if (cantidad === 0) return "Sin proyectos";
    return cantidad === 1 ? "1 proyecto" : `${cantidad} proyectos`;
}

/* ---------- Fila de la lista ---------- */
function FilaCategoria({ categoria, separador, onEditar, onEliminar }) {
    const enUso = categoria.proyectos > 0;

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
                        {categoria.nombre}
                    </Typography>
                    {!categoria.activo && <Chip size="small" label="Oculta" />}
                </Box>
                <Typography
                    color="text.secondary"
                    sx={{ fontSize: 12, mt: 0.5 }}
                >
                    Orden {categoria.orden} · {textoProyectos(categoria.proyectos)}
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
                        ? `La usan ${categoria.proyectos} proyecto(s). Ocúltala en lugar de borrarla.`
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
function FormularioCategoria({ categoria, ordenSugerido, onCerrar, onGuardado }) {
    const esNueva = !categoria.id;
    const esMovil = useMediaQuery((tema) => tema.breakpoints.down("sm"));

    const [campos, setCampos] = useState({
        nombre: categoria.nombre ?? "",
        orden: categoria.orden ?? ordenSugerido,
        activo: categoria.activo === undefined ? true : Boolean(categoria.activo),
    });
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    function cambiar(campo, valor) {
        setCampos({ ...campos, [campo]: valor });
    }

    async function guardar() {
        if (!campos.nombre.trim()) {
            return setError("El nombre es obligatorio");
        }

        setError("");
        setGuardando(true);

        try {
            await peticionAdmin(
                esNueva
                    ? "/admin/categorias"
                    : `/admin/categorias/${categoria.id}`,
                {
                    method: esNueva ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(campos),
                },
            );
            onGuardado(esNueva ? "Categoría creada" : "Cambios guardados");
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
                {esNueva ? "Nueva categoría" : "Editar categoría"}
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
                        placeholder="Ej. Tienda online, SaaS, Aplicación móvil"
                        slotProps={{ htmlInput: { maxLength: MAX_NOMBRE } }}
                    />
                    <TextField
                        label="Orden"
                        type="number"
                        value={campos.orden}
                        onChange={(e) => cambiar("orden", e.target.value)}
                        helperText="El 1 aparece primero en los filtros del portafolio"
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
function ConfirmarEliminar({ categoria, onCancelar, onEliminado }) {
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState("");

    async function eliminar() {
        setEliminando(true);
        setError("");
        try {
            await peticionAdmin(`/admin/categorias/${categoria.id}`, {
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
                ¿Eliminar "{categoria.nombre}"?
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Typography color="text.secondary">
                    Se quitará de los proyectos que la tengan asignada y del filtro del
                    portafolio. Esta acción no se puede deshacer. Si solo quieres
                    quitarla por un tiempo, edítala y apaga "Visible en el sitio".
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
export default function CategoriasAdmin() {
    const [lista, setLista] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [editando, setEditando] = useState(null); // null = cerrado, {} = nueva, categoria = editar
    const [aEliminar, setAEliminar] = useState(null);
    const [aviso, setAviso] = useState("");

    async function cargar() {
        try {
            setLista(await peticionAdmin("/admin/categorias"));
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

    // El orden que se propone para una categoría nueva (uno más que el mayor actual)
    const ordenSugerido = Math.max(0, ...lista.map((c) => c.orden)) + 1;

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
                        Categorías
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        El tipo de cada proyecto (Tienda online, SaaS, Aplicación
                        móvil...). Se usa para clasificar y filtrar el portafolio.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    onClick={() => setEditando({})}
                >
                    Nueva categoría
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
                        Aún no hay categorías. Crea la primera con el botón "Nueva
                        categoría" y luego asígnala a tus proyectos.
                    </Typography>
                )}

                {lista.map((categoria, indice) => (
                    <FilaCategoria
                        key={categoria.id}
                        categoria={categoria}
                        separador={indice > 0}
                        onEditar={() => setEditando(categoria)}
                        onEliminar={() => setAEliminar(categoria)}
                    />
                ))}
            </Card>

            {/* Ventana de crear / editar */}
            {editando && (
                <FormularioCategoria
                    key={editando.id ?? "nueva"}
                    categoria={editando}
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
                    categoria={aEliminar}
                    onCancelar={() => setAEliminar(null)}
                    onEliminado={() => {
                        setAEliminar(null);
                        setAviso("Categoría eliminada");
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