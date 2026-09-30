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
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import { peticionAdmin } from "../../admin/peticionAdmin.js";

// Los campos del formulario. Sirve de molde para que ninguno quede en null
const VACIO = {
    nombre: "",
    eslogan: "",
    descripcion: "",
    mision: "",
    vision: "",
    alcance: "",
    correo: "",
    whatsapp: "",
    ubicacion: "",
};

// Convierte lo que llega de la base de datos (con nulls) en textos para los TextField
function aCampos(empresa) {
    const campos = { ...VACIO };
    for (const clave of Object.keys(VACIO)) {
        campos[clave] = empresa?.[clave] ?? "";
    }
    return campos;
}

/* ---------- Formulario con los datos de la empresa ---------- */
function DatosEmpresa({ empresa, onGuardado }) {
    const [campos, setCampos] = useState(aCampos(empresa));
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    function cambiar(campo, valor) {
        setCampos({ ...campos, [campo]: valor });
    }

    async function guardar(evento) {
        evento.preventDefault();

        if (!campos.nombre.trim()) {
            return setError("El nombre de la empresa es obligatorio");
        }

        setError("");
        setGuardando(true);

        try {
            const guardado = await peticionAdmin("/admin/empresa", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(campos),
            });
            // El servidor devuelve los datos ya limpios (por ejemplo, el WhatsApp con el 57)
            setCampos(aCampos(guardado));
            onGuardado("Datos de la empresa guardados");
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <Card
            variant="outlined"
            component="form"
            onSubmit={guardar}
            sx={{ p: { xs: 2, md: 3 } }}
        >
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Typography sx={{ fontWeight: 700, mb: 2 }}>Identidad</Typography>
            <Stack spacing={2} sx={{ mb: 4 }}>
                <TextField
                    label="Nombre de la empresa"
                    value={campos.nombre}
                    onChange={(e) => cambiar("nombre", e.target.value)}
                    required
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 120 } }}
                />
                <TextField
                    label="Eslogan"
                    value={campos.eslogan}
                    onChange={(e) => cambiar("eslogan", e.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 200 } }}
                />
                <TextField
                    label="Descripción"
                    value={campos.descripcion}
                    onChange={(e) => cambiar("descripcion", e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 3000 } }}
                />
            </Stack>

            <Typography sx={{ fontWeight: 700, mb: 2 }}>
                Misión, visión y alcance
            </Typography>
            <Stack spacing={2} sx={{ mb: 4 }}>
                <TextField
                    label="Misión"
                    value={campos.mision}
                    onChange={(e) => cambiar("mision", e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 3000 } }}
                />
                <TextField
                    label="Visión"
                    value={campos.vision}
                    onChange={(e) => cambiar("vision", e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 3000 } }}
                />
                <TextField
                    label="Alcance"
                    value={campos.alcance}
                    onChange={(e) => cambiar("alcance", e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 3000 } }}
                />
            </Stack>

            <Typography sx={{ fontWeight: 700, mb: 2 }}>Contacto</Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                    label="Correo"
                    type="email"
                    value={campos.correo}
                    onChange={(e) => cambiar("correo", e.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 150 } }}
                />
                <TextField
                    label="WhatsApp"
                    value={campos.whatsapp}
                    onChange={(e) => cambiar("whatsapp", e.target.value)}
                    helperText="Con indicativo del país y sin +, por ejemplo 573001234567. Si escribes solo los 10 dígitos, agregamos el 57."
                    fullWidth
                    slotProps={{
                        htmlInput: { maxLength: 20, inputMode: "tel" },
                    }}
                />
                <TextField
                    label="Ubicación"
                    value={campos.ubicacion}
                    onChange={(e) => cambiar("ubicacion", e.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 120 } }}
                />
            </Stack>

            <Button
                type="submit"
                variant="contained"
                startIcon={<SaveOutlined />}
                disabled={guardando}
                sx={{ width: { xs: "100%", sm: "auto" } }}
            >
                {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
        </Card>
    );
}

/* ---------- Ventana para crear / editar un objetivo ---------- */
function FormularioObjetivo({ objetivo, ordenSugerido, onCerrar, onGuardado }) {
    const esNuevo = !objetivo.id;
    const esMovil = useMediaQuery((tema) => tema.breakpoints.down("sm"));

    const [campos, setCampos] = useState({
        titulo: objetivo.titulo ?? "",
        descripcion: objetivo.descripcion ?? "",
        orden: objetivo.orden ?? ordenSugerido,
        activo: objetivo.activo === undefined ? true : Boolean(objetivo.activo),
    });
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    function cambiar(campo, valor) {
        setCampos({ ...campos, [campo]: valor });
    }

    async function guardar() {
        if (!campos.titulo.trim()) {
            return setError("El título es obligatorio");
        }

        setError("");
        setGuardando(true);

        try {
            await peticionAdmin(
                esNuevo
                    ? "/admin/empresa/objetivos"
                    : `/admin/empresa/objetivos/${objetivo.id}`,
                {
                    method: esNuevo ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(campos),
                },
            );
            onGuardado(esNuevo ? "Objetivo creado" : "Cambios guardados");
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
                {esNuevo ? "Nuevo objetivo" : "Editar objetivo"}
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Título"
                        value={campos.titulo}
                        onChange={(e) => cambiar("titulo", e.target.value)}
                        required
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                    />
                    <TextField
                        label="Descripción"
                        value={campos.descripcion}
                        onChange={(e) => cambiar("descripcion", e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 400 } }}
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

/* ---------- Confirmación de eliminar un objetivo ---------- */
function ConfirmarEliminarObjetivo({ objetivo, onCancelar, onEliminado }) {
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState("");

    async function eliminar() {
        setEliminando(true);
        setError("");
        try {
            await peticionAdmin(`/admin/empresa/objetivos/${objetivo.id}`, {
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
                ¿Eliminar este objetivo?
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    {objetivo.titulo}
                </Typography>
                <Typography color="text.secondary">
                    Esta acción no se puede deshacer. Si solo quieres quitarlo
                    del sitio por un tiempo, edítalo y apaga "Visible en el
                    sitio".
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

/* ---------- Lista de objetivos ---------- */
function ListaObjetivos({ objetivos, onCambio }) {
    const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, objetivo = editar
    const [aEliminar, setAEliminar] = useState(null);

    // El orden que se propone para un objetivo nuevo (uno más que el mayor actual)
    const ordenSugerido = Math.max(0, ...objetivos.map((o) => o.orden)) + 1;

    return (
        <Box sx={{ mt: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                    mb: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, fontSize: { xs: 20, md: 24 } }}
                    >
                        Objetivos
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        Lo que Sansley se propone lograr.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    onClick={() => setEditando({})}
                >
                    Nuevo objetivo
                </Button>
            </Box>

            <Card variant="outlined">
                {objetivos.length === 0 && (
                    <Typography
                        color="text.secondary"
                        align="center"
                        sx={{ p: 4 }}
                    >
                        Aún no hay objetivos. Crea el primero con el botón
                        "Nuevo objetivo".
                    </Typography>
                )}

                {objetivos.map((objetivo, indice) => (
                    <Box
                        key={objetivo.id}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            p: 2,
                            borderTop: indice > 0 ? "1px solid" : "none",
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
                                    {objetivo.titulo}
                                </Typography>
                                {!objetivo.activo && (
                                    <Chip size="small" label="Oculto" />
                                )}
                            </Box>
                            {objetivo.descripcion && (
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
                                    {objetivo.descripcion}
                                </Typography>
                            )}
                            <Typography
                                color="text.secondary"
                                sx={{ fontSize: 12, mt: 0.5 }}
                            >
                                Orden {objetivo.orden}
                            </Typography>
                        </Box>

                        <Tooltip title="Editar">
                            <IconButton
                                onClick={() => setEditando(objetivo)}
                                aria-label="Editar"
                            >
                                <EditOutlined />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <IconButton
                                onClick={() => setAEliminar(objetivo)}
                                color="error"
                                aria-label="Eliminar"
                            >
                                <DeleteOutlineOutlined />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ))}
            </Card>

            {editando && (
                <FormularioObjetivo
                    key={editando.id ?? "nuevo"}
                    objetivo={editando}
                    ordenSugerido={ordenSugerido}
                    onCerrar={() => setEditando(null)}
                    onGuardado={(mensaje) => {
                        setEditando(null);
                        onCambio(mensaje);
                    }}
                />
            )}

            {aEliminar && (
                <ConfirmarEliminarObjetivo
                    objetivo={aEliminar}
                    onCancelar={() => setAEliminar(null)}
                    onEliminado={() => {
                        setAEliminar(null);
                        onCambio("Objetivo eliminado");
                    }}
                />
            )}
        </Box>
    );
}

/* ---------- Página ---------- */
export default function EmpresaAdmin() {
    const [empresa, setEmpresa] = useState(null);
    const [objetivos, setObjetivos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");

    async function cargar() {
        try {
            const datos = await peticionAdmin("/admin/empresa");
            setEmpresa(datos.empresa);
            setObjetivos(datos.objetivos);
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

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, fontSize: { xs: 24, md: 32 } }}
                >
                    Empresa
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    La información de Sansley que aparece en el sitio: quiénes
                    somos, misión, visión y contacto.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {cargando && <Skeleton variant="rounded" height={420} />}

            {!cargando && !error && (
                <>
                    <DatosEmpresa empresa={empresa} onGuardado={setAviso} />
                    <ListaObjetivos
                        objetivos={objetivos}
                        onCambio={(mensaje) => {
                            setAviso(mensaje);
                            cargar();
                        }}
                    />
                </>
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
