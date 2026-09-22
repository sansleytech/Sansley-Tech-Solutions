import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { API_URL } from "../api.js";
import useDatos from "../hooks/useDatos.js";
import useEmpresa from "../hooks/useEmpresa.js";
import Aparecer from "../components/Aparecer.jsx";

const formularioVacio = {
    nombre: "",
    correo: "",
    telefono: "",
    servicio_id: "",
    mensaje: "",
};

function DatoContacto({ icono: Icono, etiqueta, valor, href, retraso }) {
    const contenido = (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,.09)",
                    color: "secondary.light",
                    transition: "background-color .25s, transform .25s",
                }}
                className="icono-dato"
            >
                <Icono fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
                    {etiqueta}
                </Typography>
                <Typography
                    sx={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#fff",
                        overflowWrap: "anywhere",
                    }}
                >
                    {valor}
                </Typography>
            </Box>
        </Stack>
    );

    return (
        <Aparecer tipo="izquierda" retraso={retraso}>
            {href ? (
                <Box
                    component="a"
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    sx={{
                        display: "block",
                        borderRadius: "12px",
                        transition: "transform .2s",
                        "@media (hover: hover)": {
                            "&:hover": { transform: "translateX(4px)" },
                            "&:hover .icono-dato": {
                                bgcolor: "secondary.main",
                                color: "#fff",
                            },
                        },
                        "@media (prefers-reduced-motion: reduce)": {
                            transition: "none",
                            "&:hover": { transform: "none" },
                        },
                    }}
                >
                    {contenido}
                </Box>
            ) : (
                contenido
            )}
        </Aparecer>
    );
}

export default function Contacto() {
    const { datos: servicios } = useDatos("/servicios");
    const { empresa } = useEmpresa();
    const [formulario, setFormulario] = useState(formularioVacio);
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null); // { tipo: 'success' | 'error', texto: '...' }

    const cambiar = (campo) => (evento) =>
        setFormulario((previo) => ({
            ...previo,
            [campo]: evento.target.value,
        }));

    async function enviar(evento) {
        evento.preventDefault();
        setEnviando(true);
        setResultado(null);

        try {
            const respuesta = await fetch(`${API_URL}/contacto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formulario,
                    servicio_id: formulario.servicio_id || null,
                }),
            });
            const cuerpo = await respuesta.json().catch(() => ({}));

            if (respuesta.ok) {
                setResultado({
                    tipo: "success",
                    texto: "¡Gracias! Recibimos tu mensaje y te responderemos muy pronto.",
                });
                setFormulario(formularioVacio);
            } else {
                setResultado({
                    tipo: "error",
                    texto: cuerpo.mensaje || "No pudimos enviar tu mensaje. Intenta de nuevo.",
                });
            }
        } catch {
            setResultado({
                tipo: "error",
                texto: "No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.",
            });
        } finally {
            setEnviando(false);
        }
    }

    return (
        <Box
            id="contacto"
            sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: "marino.main",
                py: { xs: 8, md: 12 },
                scrollMarginTop: { xs: "64px", md: "76px" },
            }}
        >
            {/* Resplandor suave, coherente con las demás secciones oscuras */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(50% 45% at 0% 0%, rgba(1,89,177,.28), transparent 70%), radial-gradient(45% 40% at 100% 100%, rgba(91,146,31,.2), transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 4, md: 10 }}
                    sx={{
                        alignItems: { md: "center" },
                        justifyContent: "space-between",
                    }}
                >
                    {/* Texto y datos de contacto */}
                    <Box sx={{ width: { md: 440 }, flexShrink: 0 }}>
                        <Aparecer tipo="izquierda">
                            <Typography
                                sx={{
                                    color: "secondary.light",
                                    fontSize: { xs: 12, md: 13 },
                                    fontWeight: 600,
                                    letterSpacing: ".12em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Contacto
                            </Typography>
                        </Aparecer>
                        <Aparecer tipo="izquierda" retraso={0.06}>
                            <Typography
                                variant="h2"
                                sx={{
                                    mt: 1,
                                    color: "#fff",
                                    fontSize: { xs: 28, md: 44 },
                                    lineHeight: 1.12,
                                }}
                            >
                                Hablemos de tu proyecto
                            </Typography>
                        </Aparecer>
                        <Aparecer tipo="izquierda" retraso={0.12}>
                            <Typography
                                sx={{
                                    mt: 2,
                                    fontSize: { xs: 15, md: 17 },
                                    lineHeight: 1.6,
                                    color: "rgba(255,255,255,.75)",
                                }}
                            >
                                Cuéntanos qué necesitas y te respondemos con una
                                propuesta clara, sin compromiso.
                            </Typography>
                        </Aparecer>

                        {/* Datos de contacto (vienen de la base de datos) */}
                        <Stack spacing={2} sx={{ mt: { xs: 3, md: 4 } }}>
                            {empresa?.correo && (
                                <DatoContacto
                                    icono={EmailOutlined}
                                    etiqueta="Correo"
                                    valor={empresa.correo}
                                    href={`mailto:${empresa.correo}`}
                                    retraso={0.2}
                                />
                            )}
                            {empresa?.whatsapp && (
                                <DatoContacto
                                    icono={WhatsApp}
                                    etiqueta="WhatsApp"
                                    valor={`+${empresa.whatsapp}`}
                                    href={`https://wa.me/${empresa.whatsapp}`}
                                    retraso={0.26}
                                />
                            )}
                            {empresa?.ubicacion && (
                                <DatoContacto
                                    icono={LocationOnOutlined}
                                    etiqueta="Ubicación"
                                    valor={empresa.ubicacion}
                                    retraso={0.32}
                                />
                            )}
                        </Stack>
                    </Box>

                    {/* Formulario */}
                    <Aparecer tipo="zoom" retraso={0.1} sx={{ flex: 1, maxWidth: { md: 620 }, width: "100%" }}>
                        <Box
                            component="form"
                            onSubmit={enviar}
                            sx={{
                                p: { xs: 2.5, md: 4 },
                                borderRadius: "20px",
                                bgcolor: "background.paper",
                                boxShadow: "0 30px 60px rgba(0,0,0,.25)",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "1fr 1fr",
                                    },
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    label="Nombre"
                                    size="small"
                                    required
                                    autoComplete="name"
                                    value={formulario.nombre}
                                    onChange={cambiar("nombre")}
                                />
                                <TextField
                                    label="Correo"
                                    type="email"
                                    size="small"
                                    required
                                    autoComplete="email"
                                    value={formulario.correo}
                                    onChange={cambiar("correo")}
                                />
                                <TextField
                                    label="Teléfono (opcional)"
                                    type="tel"
                                    size="small"
                                    autoComplete="tel"
                                    value={formulario.telefono}
                                    onChange={cambiar("telefono")}
                                />
                                <TextField
                                    select
                                    label="Servicio de interés"
                                    size="small"
                                    value={formulario.servicio_id}
                                    onChange={cambiar("servicio_id")}
                                    slotProps={{
                                        select: { displayEmpty: true },
                                        inputLabel: { shrink: true },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Sin especificar</em>
                                    </MenuItem>
                                    {servicios.map((servicio) => (
                                        <MenuItem key={servicio.id} value={servicio.id}>
                                            {servicio.nombre}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <TextField
                                label="Mensaje"
                                required
                                multiline
                                minRows={3}
                                fullWidth
                                size="small"
                                value={formulario.mensaje}
                                onChange={cambiar("mensaje")}
                                sx={{ mt: 2 }}
                            />

                            {resultado && (
                                <Alert severity={resultado.tipo} sx={{ mt: 2 }}>
                                    {resultado.texto}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={enviando}
                                sx={{
                                    mt: 2,
                                    transition: "transform .25s, box-shadow .25s",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 10px 24px rgba(1,89,177,.3)",
                                    },
                                }}
                            >
                                {enviando ? "Enviando…" : "Enviar mensaje"}
                            </Button>
                        </Box>
                    </Aparecer>
                </Stack>
            </Container>
        </Box>
    );
}