import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Box, Card, Container, Skeleton, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloudOutlined from "@mui/icons-material/CloudOutlined";
import SmartphoneOutlined from "@mui/icons-material/SmartphoneOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import WidgetsOutlined from "@mui/icons-material/WidgetsOutlined";
import MemoryOutlined from "@mui/icons-material/MemoryOutlined";
import CalculateOutlined from "@mui/icons-material/CalculateOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import GavelOutlined from "@mui/icons-material/GavelOutlined";
import RequestQuoteOutlined from "@mui/icons-material/RequestQuoteOutlined";
import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import EncabezadoSeccion from "../components/EncabezadoSeccion.jsx";
import Aparecer from "../components/Aparecer.jsx";
import useDatos from "../hooks/useDatos.js";

const MotionBox = motion.create(Box);

// Quita tildes y mayúsculas para que el ícono se encuentre aunque cambies un poco el nombre
const clave = (texto = "") =>
    texto
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();

// Ícono de cada servicio, según su nombre
const iconos = {
    // Tecnología
    "microsaas y saas": CloudOutlined,
    "aplicaciones moviles": SmartphoneOutlined,
    "software a la medida": CodeOutlined,
    "sitios web y e-commerce": ShoppingBagOutlined,
    "apis e integraciones": LinkOutlined,
    "asesorias tecnologicas": LightbulbOutlined,
    // Contabilidad y tributaria
    "gestion contable integral": CalculateOutlined,
    "auditoria y certificacion financiera": FactCheckOutlined,
    "liquidacion de nomina y obligaciones": PaymentsOutlined,
    "declaraciones tributarias y planeacion fiscal": ReceiptLongOutlined,
    "representacion ante autoridades tributarias": GavelOutlined,
    "recuperacion de cartera y asesoria fiscal": RequestQuoteOutlined,
};

// Las dos áreas. La "clave" es la misma que se guarda en la base de datos (columna categoria)
const categorias = {
    tecnologia: {
        nombre: "Tecnología",
        corto: "Tecnología",
        icono: MemoryOutlined,
        iconoBase: WidgetsOutlined,
        color: "primary",
        texto: "Software de principio a fin, con tecnología moderna y acompañamiento cercano.",
    },
    contable: {
        nombre: "Contabilidad y tributaria",
        corto: "Contabilidad",
        icono: CalculateOutlined,
        iconoBase: AccountBalanceOutlined,
        color: "secondary",
        texto: "Asesoría contable y tributaria para empresas y personas naturales, con más de 10 años de experiencia.",
    },
};
const ordenCategorias = ["tecnologia", "contable"];

/* ---------- Selector de pestañas ---------- */
function Pestanas({ disponibles, activa, onCambiar, sinMovimiento }) {
    return (
        <Box
            role="tablist"
            aria-label="Áreas de servicio"
            sx={{
                display: "flex",
                gap: 0.5,
                p: 0.5,
                mx: "auto",
                width: { xs: "100%", sm: "fit-content" },
                maxWidth: 520,
                borderRadius: 999,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 6px 20px rgba(10,37,64,.06)",
            }}
        >
            {disponibles.map((id) => {
                const categoria = categorias[id];
                const Icono = categoria.icono;
                const seleccionada = id === activa;

                return (
                    <Box
                        key={id}
                        component="button"
                        type="button"
                        role="tab"
                        aria-selected={seleccionada}
                        onClick={() => onCambiar(id)}
                        sx={{
                            position: "relative",
                            flex: { xs: 1, sm: "0 0 auto" },
                            px: { xs: 1.5, sm: 3.5 },
                            py: 1.25,
                            border: 0,
                            borderRadius: 999,
                            bgcolor: "transparent",
                            cursor: "pointer",
                            font: "inherit",
                            fontWeight: 600,
                            fontSize: { xs: 14, md: 15 },
                            color: seleccionada ? "#fff" : "text.secondary",
                            transition: "color .2s",
                            "&:hover": { color: seleccionada ? "#fff" : "text.primary" },
                            "&:focus-visible": {
                                outline: "2px solid",
                                outlineColor: "primary.main",
                                outlineOffset: 2,
                            },
                        }}
                    >
                        {/* Fondo que se desliza de una pestaña a la otra */}
                        {seleccionada && (
                            <MotionBox
                                layoutId="pestana-servicios"
                                transition={
                                    sinMovimiento
                                        ? { duration: 0 }
                                        : { type: "spring", stiffness: 500, damping: 36 }
                                }
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: 999,
                                    bgcolor: "marino.main",
                                    boxShadow: "0 6px 16px rgba(10,37,64,.25)",
                                }}
                            />
                        )}
                        <Box
                            component="span"
                            sx={{
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                            }}
                        >
                            <Icono sx={{ fontSize: 20 }} />
                            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                                {categoria.nombre}
                            </Box>
                            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                                {categoria.corto}
                            </Box>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

/* ---------- Tarjeta de un servicio ---------- */
function TarjetaServicio({ servicio, categoria, indice }) {
    const { color } = categoria;
    const Icono = iconos[clave(servicio.nombre)] ?? categoria.iconoBase;

    return (
        <Aparecer retraso={(indice % 3) * 0.06} sx={{ height: "100%" }}>
            <Card
                variant="outlined"
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    p: { xs: 2, md: 3.5 },
                    display: "flex",
                    flexDirection: { xs: "row", sm: "column" },
                    alignItems: { xs: "flex-start", sm: "stretch" },
                    gap: { xs: 2, sm: 0 },
                    borderColor: "divider",
                    borderRadius: "16px",
                    transition: "transform .25s, box-shadow .25s, border-color .25s",
                    // Línea de color que se dibuja arriba al pasar el mouse
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 3,
                        bgcolor: `${color}.main`,
                        transition: "width .35s ease",
                    },
                    "@media (hover: hover)": {
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 14px 34px rgba(10,37,64,.10)",
                            borderColor: (tema) => alpha(tema.palette[color].main, 0.4),
                        },
                        "&:hover::before": { width: "100%" },
                        "&:hover .icono": {
                            bgcolor: `${color}.main`,
                            color: "#fff",
                            transform: "scale(1.08) rotate(-4deg)",
                        },
                    },
                    "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                        "&:hover": { transform: "none" },
                        "&::before": { transition: "none" },
                        "&:hover .icono": { transform: "none" },
                    },
                }}
            >
                <Box
                    className="icono"
                    sx={{
                        width: { xs: 44, md: 52 },
                        height: { xs: 44, md: 52 },
                        flexShrink: 0,
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: (tema) => alpha(tema.palette[color].main, 0.1),
                        color: color === "primary" ? "primary.main" : "secondary.dark",
                        transition: "background-color .25s, color .25s, transform .25s",
                    }}
                >
                    <Icono />
                </Box>

                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            mt: { xs: 0, sm: 3 },
                            fontSize: { xs: 17, md: 20 },
                            lineHeight: 1.25,
                        }}
                    >
                        {servicio.nombre}
                    </Typography>
                    <Typography
                        sx={{
                            mt: { xs: 0.5, sm: 1.5 },
                            fontSize: { xs: 14, md: 15 },
                            lineHeight: 1.55,
                            color: "text.secondary",
                        }}
                    >
                        {servicio.descripcion}
                    </Typography>
                </Box>
            </Card>
        </Aparecer>
    );
}

/* ---------- Sección ---------- */
export default function Servicios() {
    const { datos: servicios, cargando, error } = useDatos("/servicios");
    const sinMovimiento = useReducedMotion();
    const [elegida, setElegida] = useState("tecnologia");

    // Cada servicio va a su categoría (si trae una que no conocemos, va a tecnología)
    const categoriaDe = (servicio) => (categorias[servicio.categoria] ? servicio.categoria : "tecnologia");
    const porCategoria = (id) => servicios.filter((s) => categoriaDe(s) === id);

    // Solo mostramos las pestañas que tienen servicios
    const disponibles = ordenCategorias.filter((id) => porCategoria(id).length > 0);
    const activa = disponibles.includes(elegida) ? elegida : disponibles[0];
    const lista = activa ? porCategoria(activa) : [];

    return (
        <Box
            id="servicios"
            sx={{
                bgcolor: "background.default",
                py: { xs: 8, md: 12 },
                scrollMarginTop: { xs: "64px", md: "76px" },
            }}
        >
            <Container maxWidth="lg">
                <EncabezadoSeccion
                    centrado
                    etiqueta="Servicios"
                    titulo="Lo que hacemos por tu negocio"
                    subtitulo="Tecnología para construir y crecer, y asesoría contable para mantener tu empresa en orden."
                />

                {error && (
                    <Typography color="error" align="center" sx={{ mt: 4 }}>
                        No pudimos cargar los servicios. Intenta de nuevo más tarde.
                    </Typography>
                )}

                {/* Pestañas (solo si hay más de un área con servicios) */}
                {disponibles.length > 1 && (
                    <Aparecer retraso={0.2} sx={{ mt: { xs: 4, md: 6 } }}>
                        <Pestanas
                            disponibles={disponibles}
                            activa={activa}
                            onCambiar={setElegida}
                            sinMovimiento={sinMovimiento}
                        />
                    </Aparecer>
                )}

                {/* Frase que explica el área elegida */}
                {activa && (
                    <MotionBox
                        key={`frase-${activa}`}
                        initial={sinMovimiento ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        sx={{ mt: { xs: 2.5, md: 3 }, textAlign: "center" }}
                    >
                        <Typography
                            sx={{
                                mx: "auto",
                                maxWidth: 620,
                                fontSize: { xs: 14.5, md: 16 },
                                color: "text.secondary",
                            }}
                        >
                            {categorias[activa].texto}
                        </Typography>
                    </MotionBox>
                )}

                <Box
                    // Al cambiar de pestaña se vuelve a montar y las tarjetas entran otra vez
                    key={`lista-${activa ?? "cargando"}`}
                    sx={{
                        mt: { xs: 3, md: 5 },
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                        gap: { xs: 1.5, md: 3 },
                    }}
                >
                    {cargando &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                variant="rounded"
                                sx={{ height: { xs: 96, sm: 232 }, borderRadius: "16px" }}
                            />
                        ))}

                    {lista.map((servicio, i) => (
                        <TarjetaServicio
                            key={servicio.id}
                            servicio={servicio}
                            categoria={categorias[activa]}
                            indice={i}
                        />
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
