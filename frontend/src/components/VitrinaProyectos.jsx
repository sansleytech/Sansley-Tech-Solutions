import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Box, IconButton, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import PauseRounded from "@mui/icons-material/PauseRounded";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import HandymanOutlined from "@mui/icons-material/HandymanOutlined";
import ExploreOutlined from "@mui/icons-material/ExploreOutlined";
import PhoneIphoneOutlined from "@mui/icons-material/PhoneIphoneOutlined";
import CalculateOutlined from "@mui/icons-material/CalculateOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import logo from "../assets/logo.png";

const SEGUNDOS_ENTRE_IMAGENES = 4500;

const ESTADOS = {
    planeacion: "En planeación",
    en_proceso: "En desarrollo",
    finalizado: "Producción activa",
    pausado: "Pausado",
};

// Ícono según el nombre del servicio/categoría del proyecto (funciona con lo que ya tengas
// cargado en "Servicios"; si no reconoce ninguna palabra clave, usa un ícono genérico)
function iconoDeServicio(servicio = "") {
    const texto = servicio.toLowerCase();
    // El grupo de inventario va primero: "venta" es subcadena de "inventario",
    // así que si "tienda" se revisara antes, "Software de inventario" caería
    // por error en el ícono de tienda.
    if (/inventario|\bpos\b|punto de venta|ferreter/.test(texto)) return Inventory2Outlined;
    if (/tienda|ecommerce|e-commerce|\bventa/.test(texto)) return ShoppingBagOutlined;
    if (/contab|tribut|factur|financ/.test(texto)) return CalculateOutlined;
    if (/turis|portal|mapa/.test(texto)) return ExploreOutlined;
    if (/móvil|movil|app /.test(texto) || texto.startsWith("app")) return PhoneIphoneOutlined;
    if (/ferramient|herramient|construc/.test(texto)) return HandymanOutlined;
    if (/web|aplicativo|plataforma|sitio/.test(texto)) return LanguageOutlined;
    return CodeOutlined;
}

/* ---------- Ítem de la lista lateral ---------- */
function ItemProyecto({ proyecto, activo, onClick }) {
    const Icono = iconoDeServicio(proyecto.servicio);

    return (
        <Box
            component="button"
            type="button"
            onClick={onClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
                p: 1.5,
                borderRadius: "14px",
                textAlign: "left",
                cursor: "pointer",
                border: "1px solid",
                borderColor: activo ? "rgba(142,224,74,.4)" : "rgba(255,255,255,.08)",
                bgcolor: activo ? "rgba(142,224,74,.08)" : "rgba(255,255,255,.03)",
                transition: "background-color .2s, border-color .2s",
                "&:hover": {
                    borderColor: activo ? "rgba(142,224,74,.5)" : "rgba(255,255,255,.18)",
                    bgcolor: activo ? "rgba(142,224,74,.1)" : "rgba(255,255,255,.05)",
                },
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    display: "grid",
                    placeItems: "center",
                    background: activo
                        ? "linear-gradient(135deg, #5B921F, #8EE04A)"
                        : "rgba(255,255,255,.06)",
                    color: activo ? "#0A2540" : "rgba(255,255,255,.6)",
                }}
            >
                <Icono sx={{ fontSize: 20 }} />
            </Box>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                    noWrap
                    sx={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        letterSpacing: ".03em",
                        textTransform: "uppercase",
                        color: "#fff",
                    }}
                >
                    {proyecto.servicio}
                </Typography>
                <Typography
                    noWrap
                    sx={{
                        fontSize: 11.5,
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.5)",
                    }}
                >
                    {proyecto.nombre}
                </Typography>
            </Box>

            <ChevronRightRounded
                sx={{
                    flexShrink: 0,
                    fontSize: 18,
                    color: "lima.main",
                    opacity: activo ? 1 : 0,
                    transition: "opacity .2s",
                }}
            />
        </Box>
    );
}

/* ---------- Panel grande con el proyecto seleccionado ---------- */
function PanelProyecto({ proyecto }) {
    const sinMovimiento = useReducedMotion();
    const [imagenActual, setImagenActual] = useState(0);
    const [reproduciendo, setReproduciendo] = useState(!sinMovimiento);

    const { nombre, descripcion_corta: descripcionCorta, descripcion, servicio, estado, url, mostrar_iframe: mostrarIframe, imagenes = [] } = proyecto;
    const muestraIframe = Boolean(url) && mostrarIframe;
    const totalImagenes = imagenes.length;

    // Cuando cambia el proyecto seleccionado, siempre arrancamos desde la primera imagen
    useEffect(() => {
        setImagenActual(0);
        setReproduciendo(!sinMovimiento);
    }, [proyecto.id, sinMovimiento]);

    // Avance automático de la galería (se pausa si el usuario le da al botón de pausa,
    // si solo hay una imagen, o si el sistema pide reducir el movimiento)
    useEffect(() => {
        if (muestraIframe || !reproduciendo || totalImagenes < 2) return;
        const intervalo = setInterval(() => {
            setImagenActual((actual) => (actual + 1) % totalImagenes);
        }, SEGUNDOS_ENTRE_IMAGENES);
        return () => clearInterval(intervalo);
    }, [muestraIframe, reproduciendo, totalImagenes]);

    function anterior() {
        setImagenActual((actual) => (actual - 1 + totalImagenes) % totalImagenes);
    }
    function siguiente() {
        setImagenActual((actual) => (actual + 1) % totalImagenes);
    }

    const direccion = url
        ? url.replace(/^https?:\/\//, "").replace(/\/$/, "")
        : "próximamente";

    return (
        <Box
            sx={{
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,.1)",
                bgcolor: "rgba(255,255,255,.03)",
                p: { xs: 2.5, md: 3.5 },
            }}
        >
            {/* Etiquetas: categoría y estado */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {servicio && (
                    <Box
                        sx={{
                            px: 1.25,
                            py: 0.4,
                            borderRadius: 999,
                            border: "1px solid rgba(142,224,74,.4)",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: ".06em",
                            textTransform: "uppercase",
                            color: "lima.main",
                        }}
                    >
                        {servicio}
                    </Box>
                )}
                {ESTADOS[estado] && (
                    <Box
                        sx={{
                            px: 1.25,
                            py: 0.4,
                            borderRadius: 999,
                            bgcolor: "rgba(255,255,255,.08)",
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: ".05em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,.7)",
                        }}
                    >
                        {ESTADOS[estado]}
                    </Box>
                )}
            </Box>

            {/* Título y descripción */}
            <Typography
                component="h3"
                sx={{
                    mt: 1.5,
                    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
                    fontWeight: 700,
                    fontSize: { xs: 21, md: 25 },
                    color: "#fff",
                    textTransform: "uppercase",
                }}
            >
                {nombre}
            </Typography>
            {(descripcionCorta || descripcion) && (
                <Typography
                    sx={{
                        mt: 1,
                        maxWidth: 640,
                        fontSize: 14.5,
                        lineHeight: 1.6,
                        color: "rgba(255,255,255,.62)",
                    }}
                >
                    {descripcionCorta || descripcion}
                </Typography>
            )}

            {/* Enlace directo al sitio en vivo (si el proyecto tiene dirección) */}
            {url && (
                <Box
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        mt: 1.5,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "lima.main",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                    }}
                >
                    Visitar sitio
                    <OpenInNewRounded sx={{ fontSize: 15 }} />
                </Box>
            )}

            {/* Marco tipo navegador con la galería o la vista previa en vivo */}
            <Box
                sx={{
                    mt: 2.5,
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,.1)",
                    bgcolor: "#050B1A",
                }}
            >
                <Box
                    sx={{
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        px: 1.5,
                        bgcolor: "rgba(255,255,255,.04)",
                        borderBottom: "1px solid rgba(255,255,255,.06)",
                    }}
                >
                    {["#FF5F57", "#FEBC2E", "#28C840"].map((color) => (
                        <Box
                            key={color}
                            sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: color }}
                        />
                    ))}
                    <Typography
                        noWrap
                        sx={{
                            ml: 1,
                            flex: 1,
                            textAlign: "center",
                            fontSize: 11,
                            letterSpacing: ".04em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,.4)",
                        }}
                    >
                        {nombre} {servicio ? `· ${servicio}` : ""}
                    </Typography>
                </Box>

                <Box sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: "marino.main" }}>
                    {muestraIframe ? (
                        <Box
                            component="iframe"
                            src={url}
                            title={`Vista previa de ${nombre}`}
                            loading="lazy"
                            tabIndex={-1}
                            sx={{
                                position: "absolute",
                                inset: 0,
                                width: "400%",
                                height: "400%",
                                border: 0,
                                bgcolor: "#fff",
                                transform: "scale(0.25)",
                                transformOrigin: "0 0",
                                pointerEvents: "none",
                            }}
                        />
                    ) : totalImagenes > 0 ? (
                        <Box
                            component="img"
                            key={imagenes[imagenActual]}
                            src={imagenes[imagenActual]}
                            alt={`Captura de ${nombre}`}
                            loading="lazy"
                            sx={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                            }}
                        >
                            <Box component="img" src={logo} alt="" sx={{ width: 48, height: "auto" }} />
                            <Typography sx={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>
                                Vista previa próximamente
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Barra inferior: reproducir/pausar, etiqueta y controles de la galería */}
            {!muestraIframe && totalImagenes > 0 && (
                <Box
                    sx={{
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        {totalImagenes > 1 && (
                            <IconButton
                                onClick={() => setReproduciendo((valor) => !valor)}
                                aria-label={reproduciendo ? "Pausar galería" : "Reproducir galería"}
                                size="small"
                                sx={{
                                    color: "rgba(255,255,255,.7)",
                                    border: "1px solid rgba(255,255,255,.14)",
                                    "&:hover": { color: "#fff", borderColor: "rgba(255,255,255,.28)" },
                                }}
                            >
                                {reproduciendo ? (
                                    <PauseRounded fontSize="small" />
                                ) : (
                                    <PlayArrowRounded fontSize="small" />
                                )}
                            </IconButton>
                        )}
                        <Typography
                            noWrap
                            sx={{
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: ".08em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,.4)",
                            }}
                        >
                            Galería del proyecto
                        </Typography>
                    </Box>

                    {totalImagenes > 1 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                {imagenes.map((imagen, indice) => (
                                    <Box
                                        key={imagen}
                                        component="button"
                                        type="button"
                                        onClick={() => setImagenActual(indice)}
                                        aria-label={`Ir a la imagen ${indice + 1}`}
                                        sx={{
                                            cursor: "pointer",
                                            p: 0,
                                            height: 6,
                                            width: indice === imagenActual ? 22 : 6,
                                            borderRadius: 999,
                                            border: "none",
                                            bgcolor:
                                                indice === imagenActual
                                                    ? "lima.main"
                                                    : "rgba(255,255,255,.25)",
                                            transition: "width .25s, background-color .25s",
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                                <IconButton
                                    onClick={anterior}
                                    aria-label="Imagen anterior"
                                    size="small"
                                    sx={{
                                        color: "rgba(255,255,255,.7)",
                                        border: "1px solid rgba(255,255,255,.14)",
                                        "&:hover": { color: "#fff", borderColor: "rgba(255,255,255,.28)" },
                                    }}
                                >
                                    <ChevronLeftRounded fontSize="small" />
                                </IconButton>
                                <IconButton
                                    onClick={siguiente}
                                    aria-label="Siguiente imagen"
                                    size="small"
                                    sx={{
                                        color: "rgba(255,255,255,.7)",
                                        border: "1px solid rgba(255,255,255,.14)",
                                        "&:hover": { color: "#fff", borderColor: "rgba(255,255,255,.28)" },
                                    }}
                                >
                                    <ChevronRightRounded fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    )}
                </Box>
            )}

            {muestraIframe && (
                <Typography
                    sx={{
                        mt: 2,
                        fontSize: 11,
                        letterSpacing: ".04em",
                        color: "rgba(255,255,255,.4)",
                    }}
                >
                    {direccion}
                </Typography>
            )}
        </Box>
    );
}

/* ---------- Componente principal: lista lateral + panel ---------- */
export default function VitrinaProyectos({ proyectos }) {
    const [seleccionado, setSeleccionado] = useState(0);
    const proyecto = proyectos[Math.min(seleccionado, proyectos.length - 1)];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
                gap: { xs: 2.5, md: 3 },
                alignItems: "start",
            }}
        >
            {/* Lista lateral */}
            <Box
                component="nav"
                sx={{
                    display: "flex",
                    flexDirection: { xs: "row", md: "column" },
                    gap: 1,
                    overflowX: { xs: "auto", md: "visible" },
                    pb: { xs: 0.5, md: 0 },
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {proyectos.map((p, indice) => (
                    <Box
                        key={p.id}
                        sx={{ flex: { xs: "0 0 260px", md: "1 1 auto" } }}
                    >
                        <ItemProyecto
                            proyecto={p}
                            activo={indice === seleccionado}
                            onClick={() => setSeleccionado(indice)}
                        />
                    </Box>
                ))}
            </Box>

            {/* Panel del proyecto elegido */}
            <PanelProyecto key={proyecto.id} proyecto={proyecto} />
        </Box>
    );
}