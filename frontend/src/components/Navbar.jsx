import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Box, Button, Container, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Marca from "./Marca.jsx";
import { enlaces } from "../datosSitio.js";
import { brilloAzul, degradadoMarca } from "../tema.js";

const MotionBox = motion.create(Box);
const SUAVE = [0.22, 1, 0.36, 1];

// Las secciones que se vigilan para saber cuál está a la vista
const IDS = ["inicio", ...enlaces.map((enlace) => enlace.destino.slice(1))];

// Devuelve el id de la sección que está cruzando la mitad de la pantalla
function useSeccionActiva() {
    const [activa, setActiva] = useState("inicio");

    useEffect(() => {
        const elementos = IDS.map((id) => document.getElementById(id)).filter(Boolean);
        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) setActiva(entrada.target.id);
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        elementos.forEach((elemento) => observador.observe(elemento));
        return () => observador.disconnect();
    }, []);

    return activa;
}

const estiloBotonCotizar = {
    background: degradadoMarca,
    color: "#fff",
    boxShadow: brilloAzul,
    transition: "box-shadow .25s, transform .25s",
    "&:hover": {
        background: degradadoMarca,
        boxShadow: "0 0 40px rgba(59,155,255,.75)",
        transform: "translateY(-2px)",
    },
};

export default function Navbar() {
    const [abierto, setAbierto] = useState(false);
    const [conFondo, setConFondo] = useState(false);
    const activa = useSeccionActiva();
    const cerrar = () => setAbierto(false);

    // Al bajar un poco, la barra pasa de transparente a cristal oscuro
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", (valor) => setConFondo(valor > 40));

    return (
        <MotionBox
            component="header"
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: SUAVE }}
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1300,
                bgcolor: conFondo ? "rgba(5,11,26,.72)" : "transparent",
                backdropFilter: conFondo ? "blur(16px) saturate(140%)" : "none",
                borderBottom: "1px solid",
                borderColor: conFondo ? "rgba(255,255,255,.08)" : "transparent",
                boxShadow: conFondo ? "0 8px 32px rgba(0,0,0,.25)" : "none",
                transition: "background-color .3s, border-color .3s, box-shadow .3s",
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        height: { xs: 64, md: 76 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    <Marca tamano={40} oscuro />

                    {/* Escritorio */}
                    <Box
                        component="nav"
                        sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}
                    >
                        {enlaces.map((enlace) => {
                            const esActivo = activa === enlace.destino.slice(1);
                            return (
                                <Box
                                    key={enlace.texto}
                                    component="a"
                                    href={enlace.destino}
                                    sx={{
                                        position: "relative",
                                        px: 2,
                                        py: 1,
                                        borderRadius: 999,
                                        fontSize: 14.5,
                                        fontWeight: 500,
                                        textDecoration: "none",
                                        color: esActivo ? "#fff" : "rgba(255,255,255,.7)",
                                        transition: "color .2s",
                                        "&:hover": { color: "#fff" },
                                    }}
                                >
                                    {esActivo && (
                                        <motion.span
                                            layoutId="seccion-activa"
                                            transition={{ type: "spring", stiffness: 500, damping: 34 }}
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                borderRadius: 999,
                                                background: "rgba(59,155,255,.16)",
                                                border: "1px solid rgba(59,155,255,.4)",
                                            }}
                                        />
                                    )}
                                    <Box component="span" sx={{ position: "relative" }}>
                                        {enlace.texto}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                    <Button
                        href="#contacto"
                        endIcon={<ArrowOutwardIcon />}
                        sx={{ display: { xs: "none", md: "inline-flex" }, ...estiloBotonCotizar }}
                    >
                        Cotiza tu proyecto
                    </Button>

                    {/* Celular */}
                    <IconButton
                        aria-label="Abrir menú"
                        onClick={() => setAbierto(true)}
                        sx={{
                            display: { md: "none" },
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,.18)",
                            bgcolor: "rgba(255,255,255,.06)",
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Container>

            {/* Menú del celular: pantalla completa */}
            <Drawer
                anchor="right"
                open={abierto}
                onClose={cerrar}
                disableScrollLock
                transitionDuration={250}
                sx={{ zIndex: 1500 }}
                slotProps={{
                    paper: {
                        sx: {
                            width: "100%",
                            bgcolor: "noche.main",
                            backgroundImage:
                                "radial-gradient(70% 45% at 85% 0%, rgba(1,89,177,.55), transparent 70%), radial-gradient(60% 40% at 0% 100%, rgba(91,146,31,.35), transparent 70%)",
                            color: "#fff",
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        minHeight: "100%",
                        display: "flex",
                        flexDirection: "column",
                        p: 2.5,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: 40,
                        }}
                    >
                        <Marca tamano={36} oscuro onClick={cerrar} />
                        <IconButton
                            aria-label="Cerrar menú"
                            onClick={cerrar}
                            sx={{
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,.18)",
                                bgcolor: "rgba(255,255,255,.06)",
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box component="nav" sx={{ mt: 5 }}>
                        {enlaces.map((enlace, i) => (
                            <MotionBox
                                key={enlace.texto}
                                component="a"
                                href={enlace.destino}
                                onClick={cerrar}
                                initial={{ opacity: 0, x: 32 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.35, delay: 0.05 + i * 0.05, ease: SUAVE }}
                                sx={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    gap: 2,
                                    py: 1.75,
                                    color: "#fff",
                                    textDecoration: "none",
                                    borderBottom: "1px solid rgba(255,255,255,.1)",
                                    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
                                    fontWeight: 700,
                                    fontSize: 30,
                                    "&:active": { color: "cielo.light" },
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{ minWidth: 26, fontSize: 13, fontWeight: 600, color: "lima.main", letterSpacing: ".1em" }}
                                >
                                    {String(i + 1).padStart(2, "0")}
                                </Box>
                                {enlace.texto}
                            </MotionBox>
                        ))}
                    </Box>

                    <Button
                        fullWidth
                        href="#contacto"
                        onClick={cerrar}
                        endIcon={<ArrowOutwardIcon />}
                        sx={{ mt: "auto", py: 1.5, ...estiloBotonCotizar }}
                    >
                        Cotiza tu proyecto
                    </Button>
                </Box>
            </Drawer>
        </MotionBox>
    );
}