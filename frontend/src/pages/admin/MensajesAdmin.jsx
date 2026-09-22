import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    ButtonBase,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Skeleton,
    Snackbar,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import MarkEmailUnreadOutlined from "@mui/icons-material/MarkEmailUnreadOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import { peticionAdmin } from "../../admin/peticionAdmin.js";

const formatoFecha = (fecha) =>
    new Date(fecha).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
    });

// Deja solo los números; si son 10 (celular colombiano) le antepone el 57
function enlaceWhatsApp(telefono, nombre) {
    let numero = telefono.replace(/\D/g, "");
    if (numero.length === 10) numero = "57" + numero;
    const texto = `Hola ${nombre}, te escribimos de Sansley Tech Solutions por tu solicitud.`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/* ---------- Fila de la bandeja ---------- */
function FilaMensaje({ mensaje, separador, onAbrir }) {
    return (
        <ButtonBase
            onClick={onAbrir}
            sx={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                gap: 1.5,
                p: 2,
                textAlign: "left",
                borderTop: separador ? "1px solid" : "none",
                borderColor: "divider",
                bgcolor: mensaje.leido
                    ? "transparent"
                    : (t) => alpha(t.palette.primary.main, 0.05),
                "&:hover": { bgcolor: "action.hover" },
            }}
        >
            {/* Puntito azul: solo aparece si el mensaje no se ha leído */}
            <Box
                sx={{
                    width: 10,
                    height: 10,
                    mt: 0.9,
                    flexShrink: 0,
                    borderRadius: "50%",
                    bgcolor: mensaje.leido ? "transparent" : "primary.main",
                }}
            />

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 2,
                    }}
                >
                    <Typography
                        noWrap
                        sx={{ fontWeight: mensaje.leido ? 500 : 700 }}
                    >
                        {mensaje.nombre}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: 12, flexShrink: 0 }}
                    >
                        {formatoFecha(mensaje.fecha_creacion)}
                    </Typography>
                </Box>

                {mensaje.servicio && (
                    <Typography
                        color="primary"
                        sx={{ fontSize: 13, fontWeight: 600 }}
                    >
                        {mensaje.servicio}
                    </Typography>
                )}

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
                    {mensaje.mensaje}
                </Typography>
            </Box>
        </ButtonBase>
    );
}

/* ---------- Ventana con el mensaje completo ---------- */
function DetalleMensaje({ mensaje, onCerrar, onAlternarLeido, onEliminar }) {
    const esMovil = useMediaQuery((tema) => tema.breakpoints.down("sm"));
    const asunto = encodeURIComponent(
        "Sobre tu solicitud en Sansley Tech Solutions",
    );

    return (
        <Dialog
            open
            onClose={onCerrar}
            fullWidth
            maxWidth="sm"
            fullScreen={esMovil}
        >
            <DialogTitle sx={{ fontWeight: 700 }}>{mensaje.nombre}</DialogTitle>

            <DialogContent>
                <Typography color="text.secondary" sx={{ fontSize: 13, mb: 2 }}>
                    {formatoFecha(mensaje.fecha_creacion)}
                </Typography>

                <Stack spacing={0.5} sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 14 }}>
                        <strong>Correo:</strong> {mensaje.correo}
                    </Typography>
                    {mensaje.telefono && (
                        <Typography sx={{ fontSize: 14 }}>
                            <strong>Teléfono:</strong> {mensaje.telefono}
                        </Typography>
                    )}
                    {mensaje.servicio && (
                        <Typography sx={{ fontSize: 14 }}>
                            <strong>Interesado en:</strong> {mensaje.servicio}
                        </Typography>
                    )}
                </Stack>

                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    <Typography>{mensaje.mensaje}</Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                    <Button
                        component="a"
                        href={`mailto:${mensaje.correo}?subject=${asunto}`}
                        variant="contained"
                        startIcon={<MailOutlined />}
                    >
                        Responder por correo
                    </Button>
                    {mensaje.telefono && (
                        <Button
                            component="a"
                            href={enlaceWhatsApp(
                                mensaje.telefono,
                                mensaje.nombre,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            variant="outlined"
                            color="secondary"
                            startIcon={<WhatsApp />}
                        >
                            WhatsApp
                        </Button>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap" }}>
                <Button
                    color="error"
                    startIcon={<DeleteOutlineOutlined />}
                    onClick={onEliminar}
                >
                    Eliminar
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    startIcon={<MarkEmailUnreadOutlined />}
                    onClick={onAlternarLeido}
                >
                    {mensaje.leido
                        ? "Marcar como no leído"
                        : "Marcar como leído"}
                </Button>
                <Button onClick={onCerrar}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
}

/* ---------- Confirmación de eliminar ---------- */
function ConfirmarEliminar({ mensaje, onCancelar, onEliminado }) {
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState("");

    async function eliminar() {
        setEliminando(true);
        setError("");
        try {
            await peticionAdmin(`/admin/mensajes/${mensaje.id}`, {
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
                ¿Eliminar el mensaje de {mensaje.nombre}?
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Typography color="text.secondary">
                    Se borrará para siempre. Si solo quieres sacarlo de la vista
                    de pendientes, ábrelo y márcalo como leído.
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
export default function MensajesAdmin() {
    const [lista, setLista] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("todos"); // "todos" | "sin_leer"
    const [idAbierto, setIdAbierto] = useState(null);
    const [aEliminar, setAEliminar] = useState(null);
    const [aviso, setAviso] = useState(null); // { tipo: "success" | "error", texto }

    useEffect(() => {
        async function cargar() {
            try {
                setLista(await peticionAdmin("/admin/mensajes"));
            } catch (e) {
                setError(e.message);
            } finally {
                setCargando(false);
            }
        }
        cargar();
    }, []);

    async function marcar(id, leido) {
        try {
            await peticionAdmin(`/admin/mensajes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leido }),
            });
            setLista((actual) =>
                actual.map((m) => (m.id === id ? { ...m, leido } : m)),
            );
        } catch (e) {
            setAviso({ tipo: "error", texto: e.message });
        }
    }

    // Al abrir un mensaje sin leer, lo marcamos como leído
    function abrir(mensaje) {
        setIdAbierto(mensaje.id);
        if (!mensaje.leido) marcar(mensaje.id, true);
    }

    const sinLeer = lista.filter((m) => !m.leido).length;
    const visibles =
        filtro === "sin_leer" ? lista.filter((m) => !m.leido) : lista;
    const abierto = lista.find((m) => m.id === idAbierto);

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, fontSize: { xs: 24, md: 32 } }}
                >
                    Mensajes
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Las solicitudes que llegan desde el formulario de contacto
                    del sitio.
                </Typography>
            </Box>

            <ToggleButtonGroup
                exclusive
                size="small"
                value={filtro}
                onChange={(evento, nuevo) => nuevo && setFiltro(nuevo)}
                sx={{ mb: 2 }}
            >
                <ToggleButton value="todos">
                    Todos ({lista.length})
                </ToggleButton>
                <ToggleButton value="sin_leer">
                    Sin leer ({sinLeer})
                </ToggleButton>
            </ToggleButtonGroup>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card variant="outlined">
                {cargando && (
                    <Stack spacing={1} sx={{ p: 2 }}>
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} variant="rounded" height={72} />
                        ))}
                    </Stack>
                )}

                {!cargando && !error && visibles.length === 0 && (
                    <Typography
                        color="text.secondary"
                        align="center"
                        sx={{ p: 4 }}
                    >
                        {filtro === "sin_leer"
                            ? "No tienes mensajes sin leer."
                            : "Aún no hay mensajes. Cuando alguien escriba desde el sitio, aparecerá aquí."}
                    </Typography>
                )}

                {visibles.map((mensaje, indice) => (
                    <FilaMensaje
                        key={mensaje.id}
                        mensaje={mensaje}
                        separador={indice > 0}
                        onAbrir={() => abrir(mensaje)}
                    />
                ))}
            </Card>

            {abierto && (
                <DetalleMensaje
                    mensaje={abierto}
                    onCerrar={() => setIdAbierto(null)}
                    onAlternarLeido={() => marcar(abierto.id, !abierto.leido)}
                    onEliminar={() => setAEliminar(abierto)}
                />
            )}

            {aEliminar && (
                <ConfirmarEliminar
                    mensaje={aEliminar}
                    onCancelar={() => setAEliminar(null)}
                    onEliminado={() => {
                        setLista((actual) =>
                            actual.filter((m) => m.id !== aEliminar.id),
                        );
                        setAEliminar(null);
                        setIdAbierto(null);
                        setAviso({
                            tipo: "success",
                            texto: "Mensaje eliminado",
                        });
                    }}
                />
            )}

            <Snackbar
                open={Boolean(aviso)}
                autoHideDuration={3500}
                onClose={() => setAviso(null)}
            >
                <Alert
                    severity={aviso?.tipo ?? "success"}
                    variant="filled"
                    onClose={() => setAviso(null)}
                >
                    {aviso?.texto}
                </Alert>
            </Snackbar>
        </Box>
    );
}
