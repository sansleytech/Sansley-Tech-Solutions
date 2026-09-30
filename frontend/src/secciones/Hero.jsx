import { useEffect } from "react";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "motion/react";
import { Box, Button, Container, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import logo from "../assets/logo.png";

const MotionBox = motion.create(Box);
const SUAVE = [0.22, 1, 0.36, 1];

/* ---------- Animaciones de fondo (CSS) ---------- */
const pulso = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(156,203,92,.65); }
    70% { box-shadow: 0 0 0 9px rgba(156,203,92,0); }
    100% { box-shadow: 0 0 0 0 rgba(156,203,92,0); }
`;
const respirar = keyframes`
    0%, 100% { opacity: .7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
`;
const derivar = keyframes`
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(40px, -28px, 0); }
`;

// Quien pidió "reducir movimiento" en su equipo no ve animaciones infinitas
const sinAnimacion = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };

/* ---------- Entrada rápida del texto (uno tras otro) ---------- */
const contenedor = {
    oculto: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const elemento = {
    oculto: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: SUAVE } },
};

/* ---------- Logo grande con brillo, flotación e inclinación 3D ---------- */
function LogoAnimado() {
    const sinMovimiento = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const giroX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 140, damping: 16 });
    const giroY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 140, damping: 16 });

    // El logo se inclina un poco siguiendo el cursor
    useEffect(() => {
        if (sinMovimiento) return;
        function mover(evento) {
            x.set(evento.clientX / window.innerWidth - 0.5);
            y.set(evento.clientY / window.innerHeight - 0.5);
        }
        window.addEventListener("pointermove", mover, { passive: true });
        return () => window.removeEventListener("pointermove", mover);
    }, [sinMovimiento, x, y]);

    return (
        <MotionBox
            initial={sinMovimiento ? false : { opacity: 0, scale: 0.85, x: 32 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: SUAVE }}
            sx={{
                position: "relative",
                width: { xs: 170, sm: 240, md: 430 },
                maxWidth: "100%",
                mx: "auto",
            }}
        >
            {/* Resplandor que respira detrás del logo */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: "-18%",
                    background:
                        "radial-gradient(closest-side, rgba(59,155,255,.4), rgba(59,155,255,.1) 60%, transparent 78%)",
                    animation: `${respirar} 5s ease-in-out infinite`,
                    ...sinAnimacion,
                }}
            />

            <MotionBox
                style={{ rotateX: giroX, rotateY: giroY, transformPerspective: 900 }}
                sx={{ position: "relative" }}
            >
                <motion.img
                    src={logo}
                    alt="Sansley Tech Solutions"
                    animate={sinMovimiento ? undefined : { y: [0, -12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        objectFit: "contain",
                        filter: "drop-shadow(0 24px 40px rgba(0,0,0,.45))",
                    }}
                />
            </MotionBox>
        </MotionBox>
    );
}

/* ---------- Portada ---------- */
export default function Hero() {
    const sinMovimiento = useReducedMotion();

    return (
        <Box
            id="inicio"
            sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: "marino.main",
                display: "flex",
                alignItems: "center",
                pt: { xs: 12, md: 13 },
                pb: { xs: 6, md: 8 },
                minHeight: { md: 680 },
            }}
        >
            {/* Dos luces suaves que se mueven despacio */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    top: "-20%",
                    right: "-10%",
                    width: { xs: 320, md: 620 },
                    height: { xs: 320, md: 620 },
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, rgba(1,89,177,.55), transparent)",
                    filter: "blur(30px)",
                    animation: `${derivar} 18s ease-in-out infinite`,
                    ...sinAnimacion,
                }}
            />
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    bottom: "-25%",
                    left: "-12%",
                    width: { xs: 300, md: 560 },
                    height: { xs: 300, md: 560 },
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, rgba(91,146,31,.35), transparent)",
                    filter: "blur(30px)",
                    animation: `${derivar} 22s ease-in-out infinite reverse`,
                    ...sinAnimacion,
                }}
            />

            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 430px" },
                        alignItems: "center",
                        gap: { xs: 4, md: 6 },
                    }}
                >
                    {/* Texto */}
                    <MotionBox
                        variants={contenedor}
                        initial={sinMovimiento ? false : "oculto"}
                        animate="visible"
                        sx={{ textAlign: { xs: "center", md: "left" } }}
                    >
                        <MotionBox
                            variants={elemento}
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                height: { xs: 28, md: 32 },
                                px: 1.75,
                                borderRadius: 999,
                                fontSize: { xs: 12, md: 13 },
                                fontWeight: 600,
                                color: "secondary.light",
                                bgcolor: "rgba(91,146,31,.2)",
                                border: "1px solid rgba(156,203,92,.35)",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    bgcolor: "secondary.light",
                                    animation: `${pulso} 2s ease-out infinite`,
                                    ...sinAnimacion,
                                }}
                            />
                            Tecnología y gestión contable a tu medida
                        </MotionBox>

                        <MotionBox variants={elemento}>
                            <Typography
                                variant="h1"
                                sx={{
                                    color: "#fff",
                                    mt: { xs: 2, md: 3 },
                                    fontSize: { xs: 34, sm: 46, md: 60 },
                                    lineHeight: 1.1,
                                }}
                            >
                                Tecnología y contabilidad que{" "}
                                <Box
                                    component="span"
                                    sx={{ position: "relative", color: "secondary.light", whiteSpace: "nowrap" }}
                                >
                                    impulsan
                                    {/* Subrayado que se dibuja al cargar */}
                                    <motion.span
                                        aria-hidden="true"
                                        initial={sinMovimiento ? false : { scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.5, delay: 0.55, ease: SUAVE }}
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            bottom: -4,
                                            height: 4,
                                            borderRadius: 2,
                                            transformOrigin: "0 50%",
                                            background: "linear-gradient(90deg, #9CCB5C, #3B9BFF)",
                                        }}
                                    />
                                </Box>{" "}
                                tu negocio
                            </Typography>
                        </MotionBox>

                        <MotionBox variants={elemento}>
                            <Typography
                                sx={{
                                    mt: { xs: 2, md: 3 },
                                    mx: { xs: "auto", md: 0 },
                                    maxWidth: 520,
                                    fontSize: { xs: 15, md: 18 },
                                    lineHeight: 1.6,
                                    color: "rgba(255,255,255,.78)",
                                }}
                            >
                                Construimos software a la medida y llevamos tu contabilidad y
                                tus impuestos al día, para que tu empresa crezca con orden y
                                con tecnología.
                            </Typography>
                        </MotionBox>

                        <MotionBox
                            variants={elemento}
                            sx={{
                                mt: { xs: 3, md: 5 },
                                display: "flex",
                                gap: { xs: 1.5, md: 2 },
                                justifyContent: { xs: "stretch", sm: "center", md: "flex-start" },
                            }}
                        >
                            <Button
                                variant="contained"
                                href="#proyectos"
                                sx={{
                                    flex: { xs: 1, sm: "none" },
                                    px: { xs: 1.5, md: 4 },
                                    minHeight: 48,
                                    transition: "transform .2s, box-shadow .2s",
                                    "&:hover": {
                                        transform: "translateY(-3px)",
                                        boxShadow: "0 10px 28px rgba(59,155,255,.55)",
                                    },
                                }}
                            >
                                Ver proyectos
                            </Button>
                            <Button
                                variant="outlined"
                                href="#contacto"
                                sx={{
                                    flex: { xs: 1, sm: "none" },
                                    px: { xs: 1.5, md: 4 },
                                    minHeight: 48,
                                    color: "#fff",
                                    borderColor: "rgba(255,255,255,.4)",
                                    transition: "transform .2s, background-color .2s, border-color .2s",
                                    "&:hover": {
                                        borderColor: "#fff",
                                        bgcolor: "rgba(255,255,255,.1)",
                                        transform: "translateY(-3px)",
                                    },
                                }}
                            >
                                Solicitar propuesta
                            </Button>
                        </MotionBox>
                    </MotionBox>

                    {/* Logo */}
                    <LogoAnimado />
                </Box>
            </Container>
        </Box>
    );
}