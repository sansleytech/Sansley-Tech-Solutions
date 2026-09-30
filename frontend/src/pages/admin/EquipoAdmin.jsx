import { useEffect, useState } from "react";
import {
    Alert,
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
import PhotoCameraOutlined from "@mui/icons-material/PhotoCameraOutlined";
import { peticionAdmin } from "../../admin/peticionAdmin.js";
import { urlImagen } from "../../api.js";

const MAX_MB = 3;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

/* ---------- Fila de la lista ---------- */
function FilaMiembro({ miembro, separador, onEditar, onEliminar }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderTop: separador ? "1px solid" : "none",
                borderColor: "divider",
            }}
        >
            <Avatar
                src={urlImagen(miembro.foto) ?? undefined}
                sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
            >
                {miembro.nombre.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 700 }}>{miembro.nombre}</Typography>
                    {!miembro.activo && <Chip size="small" label="Oculto" />}
                </Box>
                <Typography color="text.secondary" noWrap sx={{ fontSize: 14 }}>
                    {miembro.cargo} · Orden {miembro.orden}
                </Typography>
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
function FormularioMiembro({ miembro, ordenSugerido, onCerrar, onGuardado }) {
    const esNuevo = !miembro.id;
    const esMovil = useMediaQuery((tema) => tema.breakpoints.down("sm"));

    const [campos, setCampos] = useState({
        nombre: miembro.nombre ?? "",
        cargo: miembro.cargo ?? "",
        descripcion: miembro.descripcion ?? "",
        orden: miembro.orden ?? ordenSugerido,
        activo: miembro.activo === undefined ? true : Boolean(miembro.activo),
    });
    const [archivo, setArchivo] = useState(null);
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [quitarFoto, setQuitarFoto] = useState(false);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const fotoActual = vistaPrevia ?? (quitarFoto ? null : urlImagen(miembro.foto));

    function cambiar(campo, valor) {
        setCampos({ ...campos, [campo]: valor });
    }

    function elegirArchivo(evento) {
        const elegido = evento.target.files[0];
        evento.target.value = ""; // permite volver a elegir el mismo archivo
        if (!elegido) return;

        if (!TIPOS.includes(elegido.type)) {
            return setError("La foto debe ser JPG, PNG o WebP");
        }
        if (elegido.size > MAX_MB * 1024 * 1024) {
            return setError(`La foto supera los ${MAX_MB} MB`);
        }

        if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        setError("");
        setArchivo(elegido);
        setVistaPrevia(URL.createObjectURL(elegido));
        setQuitarFoto(false);
    }

    function quitar() {
        if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        setArchivo(null);
        setVistaPrevia(null);
        if (miembro.foto) setQuitarFoto(true);
    }

    async function guardar() {
        if (!campos.nombre.trim() || !campos.cargo.trim()) {
            return setError("Nombre y cargo son obligatorios");
        }

        setError("");
        setGuardando(true);

        try {
            const datos = new FormData();
            datos.append("nombre", campos.nombre);
            datos.append("cargo", campos.cargo);
            datos.append("descripcion", campos.descripcion);
            datos.append("orden", campos.orden);
            datos.append("activo", campos.activo);
            if (archivo) datos.append("foto", archivo);
            if (quitarFoto) datos.append("quitarFoto", "true");

            await peticionAdmin(
                esNuevo ? "/admin/equipo" : `/admin/equipo/${miembro.id}`,
                { method: esNuevo ? "POST" : "PUT", body: datos }
            );
            onGuardado(esNuevo ? "Integrante creado" : "Cambios guardados");
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
                {esNuevo ? "Nuevo integrante" : "Editar integrante"}
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Foto */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, mt: 1 }}>
                    <Avatar
                        src={fotoActual ?? undefined}
                        sx={{ width: 88, height: 88, bgcolor: "primary.main", fontSize: 32 }}
                    >
                        {campos.nombre.charAt(0).toUpperCase()}
                    </Avatar>
                    <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
                        <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            startIcon={<PhotoCameraOutlined />}
                        >
                            {fotoActual ? "Cambiar foto" : "Subir foto"}
                            <input
                                hidden
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={elegirArchivo}
                            />
                        </Button>
                        {fotoActual && (
                            <Button size="small" color="error" onClick={quitar}>
                                Quitar foto
                            </Button>
                        )}
                        <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                            JPG, PNG o WebP · máx. {MAX_MB} MB
                        </Typography>
                    </Stack>
                </Box>

                <Stack spacing={2}>
                    <TextField
                        label="Nombre"
                        value={campos.nombre}
                        onChange={(e) => cambiar("nombre", e.target.value)}
                        required
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                    />
                    <TextField
                        label="Cargo"
                        value={campos.cargo}
                        onChange={(e) => cambiar("cargo", e.target.value)}
                        required
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                    />
                    <TextField
                        label="Descripción"
                        value={campos.descripcion}
                        onChange={(e) => cambiar("descripcion", e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />
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
                                onChange={(e) => cambiar("activo", e.target.checked)}
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
                <Button variant="contained" onClick={guardar} disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ---------- Confirmación de eliminar ---------- */
function ConfirmarEliminar({ miembro, onCancelar, onEliminado }) {
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState("");

    async function eliminar() {
        setEliminando(true);
        setError("");
        try {
            await peticionAdmin(`/admin/equipo/${miembro.id}`, { method: "DELETE" });
            onEliminado();
        } catch (e) {
            setError(e.message);
            setEliminando(false);
        }
    }

    return (
        <Dialog open onClose={eliminando ? undefined : onCancelar} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar a {miembro.nombre}?</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Typography color="text.secondary">
                    Se quitará del sitio y se borrará su foto. Esta acción no se puede deshacer. Si solo
                    quieres ocultarlo, edítalo y apaga "Visible en el sitio".
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
export default function EquipoAdmin() {
    const [lista, setLista] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, miembro = editar
    const [aEliminar, setAEliminar] = useState(null);
    const [aviso, setAviso] = useState("");

    async function cargar() {
        try {
            setLista(await peticionAdmin("/admin/equipo"));
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

    // El orden que se propone para un integrante nuevo (uno más que el mayor actual)
    const ordenSugerido = Math.max(0, ...lista.map((m) => m.orden)) + 1;

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
                        Equipo
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        Las personas que aparecen en la sección "Nuestro equipo" del sitio.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setEditando({})}>
                    Nuevo integrante
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
                        {[0, 1].map((i) => (
                            <Skeleton key={i} variant="rounded" height={64} />
                        ))}
                    </Stack>
                )}

                {!cargando && !error && lista.length === 0 && (
                    <Typography color="text.secondary" align="center" sx={{ p: 4 }}>
                        Aún no hay integrantes. Crea el primero con el botón "Nuevo integrante".
                    </Typography>
                )}

                {lista.map((miembro, indice) => (
                    <FilaMiembro
                        key={miembro.id}
                        miembro={miembro}
                        separador={indice > 0}
                        onEditar={() => setEditando(miembro)}
                        onEliminar={() => setAEliminar(miembro)}
                    />
                ))}
            </Card>

            {/* Ventana de crear / editar */}
            {editando && (
                <FormularioMiembro
                    key={editando.id ?? "nuevo"}
                    miembro={editando}
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
                    miembro={aEliminar}
                    onCancelar={() => setAEliminar(null)}
                    onEliminado={() => {
                        setAEliminar(null);
                        setAviso("Integrante eliminado");
                        cargar();
                    }}
                />
            )}

            {/* Aviso verde al guardar o eliminar */}
            <Snackbar open={Boolean(aviso)} autoHideDuration={3500} onClose={() => setAviso("")}>
                <Alert severity="success" variant="filled" onClose={() => setAviso("")}>
                    {aviso}
                </Alert>
            </Snackbar>
        </Box>
    );
}