import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import HandymanOutlined from "@mui/icons-material/HandymanOutlined";
import ExploreOutlined from "@mui/icons-material/ExploreOutlined";
import PhoneIphoneOutlined from "@mui/icons-material/PhoneIphoneOutlined";
import CalculateOutlined from "@mui/icons-material/CalculateOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import logo from "../assets/logo.png";

const ESTADOS = {
    planeacion: "En planeación",
    en_proceso: "En desarrollo",
    finalizado: "Producción activa",
    pausado: "Pausado",
};

// Un proyecto sin categoría asignada se muestra con esta etiqueta genérica
const SIN_CATEGORIA = "Proyecto";

// Ícono según el nombre de la categoría del proyecto (si no reconoce ninguna
// palabra clave, usa un ícono genérico). Funciona con las categorías que crees
// en el panel: "Tienda online", "SaaS", "Aplicación móvil", etc.
function iconoDeCategoria(categoria = "") {
    const texto = categoria.toLowerCase();
    // El grupo de inventario va primero: "venta" es subcadena de "inventario",
    // así que si "tienda" se revisara antes, "Software de inventario" caería
    // por error en el ícono de tienda.
    if (/inventario|\bpos\b|punto de venta|ferreter/.test(texto)) return Inventory2Outlined;
    if (/tienda|ecommerce|e-commerce|\bventa/.test(texto)) return ShoppingBagOutlined;
    if (/contab|tribut|factur|financ/.test(texto)) return CalculateOutlined;
    if (/turis|portal|mapa/.test(texto)) return ExploreOutlined;
    if (/móvil|movil|app /.test(texto) || texto.startsWith("app")) return PhoneIphoneOutlined;
    if (/ferramient|herramient|construc/.test(texto)) return HandymanOutlined;
    if (/web|aplicativo|plataforma|sitio|saas/.test(texto)) return LanguageOutlined;
    return CodeOutlined;
}

/* ---------- Ítem de la lista lateral ---------- */
function ItemProyecto({ proyecto, activo, onClick }) {
    const categoria = proyecto.categoria || SIN_CATEGORIA;
    const Icono = iconoDeCategoria(categoria);

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
                    {categoria}
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

/* ---------- Filtros por categoría, en pila (uno debajo de otro). Solo aparece si hay más de una ---------- */
function FiltrosCategoria({ categorias, activa, onCambiar }) {
    return (
        <Box
            component="nav"
            aria-label="Filtrar proyectos por categoría"
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                mb: { xs: 2.5, md: 3 },
            }}
        >
            {["todos", ...categorias].map((categoria) => {
                const esActiva = categoria === activa;
                return (
                    <Box
                        key={categoria}
                        component="button"
                        type="button"
                        onClick={() => onCambiar(categoria)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            width: "100%",
                            cursor: "pointer",
                            px: 1.75,
                            py: 1,
                            borderRadius: "12px",
                            fontSize: 12.5,
                            fontWeight: 700,
                            letterSpacing: ".03em",
                            textTransform: "uppercase",
                            textAlign: "left",
                            border: "1px solid",
                            borderColor: esActiva ? "rgba(142,224,74,.4)" : "rgba(255,255,255,.08)",
                            bgcolor: esActiva ? "rgba(142,224,74,.08)" : "rgba(255,255,255,.03)",
                            color: esActiva ? "lima.main" : "rgba(255,255,255,.6)",
                            transition: "background-color .2s, border-color .2s, color .2s",
                            "&:hover": {
                                borderColor: esActiva ? "rgba(142,224,74,.5)" : "rgba(255,255,255,.18)",
                                color: esActiva ? "lima.main" : "#fff",
                            },
                        }}
                    >
                        <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                            {categoria === "todos" ? "Todos" : categoria}
                        </Box>
                        {esActiva && <CheckRounded sx={{ flexShrink: 0, fontSize: 16 }} />}
                    </Box>
                );
            })}
        </Box>
    );
}

/* ---------- Panel grande con el proyecto seleccionado ---------- */
function PanelProyecto({ proyecto }) {
    const {
        nombre,
        descripcion_corta: descripcionCorta,
        descripcion,
        categoria,
        estado,
        url,
        imagen,
        mostrar_iframe: mostrarIframe,
    } = proyecto;
    const muestraIframe = Boolean(url) && mostrarIframe;

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
                {categoria && (
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
                        {categoria}
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

            {/* Marco tipo navegador con la captura o la vista previa en vivo */}
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
                        {nombre} {categoria ? `· ${categoria}` : ""}
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
                    ) : imagen ? (
                        <Box
                            component="img"
                            src={imagen}
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
        </Box>
    );
}

/* ---------- Componente principal: filtros + lista lateral + panel ---------- */
export default function VitrinaProyectos({ proyectos }) {
    const categorias = useMemo(
        () => [...new Set(proyectos.map((p) => p.categoria).filter(Boolean))],
        [proyectos]
    );
    const [filtro, setFiltro] = useState("todos");
    const proyectosFiltrados = useMemo(
        () => (filtro === "todos" ? proyectos : proyectos.filter((p) => p.categoria === filtro)),
        [proyectos, filtro]
    );

    const [seleccionado, setSeleccionado] = useState(0);
    // Si cambia el filtro (o la lista de proyectos), volvemos siempre al primero de la lista visible
    useEffect(() => {
        setSeleccionado(0);
    }, [filtro, proyectos]);

    const proyecto = proyectosFiltrados[Math.min(seleccionado, proyectosFiltrados.length - 1)];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
                gap: { xs: 2.5, md: 3 },
                alignItems: "start",
            }}
        >
            {/* Columna izquierda: filtros en pila + lista de proyectos */}
            <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                {categorias.length > 1 && (
                    <FiltrosCategoria categorias={categorias} activa={filtro} onCambiar={setFiltro} />
                )}

                <Box
                    component="nav"
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "row", md: "column" },
                        gap: 1,
                        maxHeight: { md: 560 },
                        overflowX: { xs: "auto", md: "visible" },
                        overflowY: { md: "auto" },
                        pb: { xs: 0.5, md: 0 },
                        pr: { md: 0.5 },
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {proyectosFiltrados.map((p, indice) => (
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
            </Box>

            {/* Panel del proyecto elegido */}
            {proyecto && <PanelProyecto key={proyecto.id} proyecto={proyecto} />}
        </Box>
    );
}