import { Box } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";

const MotionBox = motion.create(Box);

// Cómo empieza cada tipo de entrada (el "visible" siempre termina en su lugar)
const desde = {
    subir: { opacity: 0, y: 28 },
    bajar: { opacity: 0, y: -28 },
    izquierda: { opacity: 0, x: -36 },
    derecha: { opacity: 0, x: 36 },
    zoom: { opacity: 0, scale: 0.92 },
    desenfoque: { opacity: 0, y: 16, filter: "blur(6px)" },
};

const hasta = { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" };

// Hace que su contenido aparezca con animación cuando entra en la pantalla al hacer scroll.
// Si la persona tiene activado "reducir movimiento" en su equipo, no anima nada.
export default function Aparecer({
    children,
    tipo = "subir",
    retraso = 0,
    duracion = 0.45,
    sx,
    ...resto
}) {
    const sinMovimiento = useReducedMotion();

    if (sinMovimiento) {
        return (
            <Box sx={sx} {...resto}>
                {children}
            </Box>
        );
    }

    return (
        <MotionBox
            initial={desde[tipo]}
            whileInView={hasta}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ duration: duracion, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
            sx={sx}
            {...resto}
        >
            {children}
        </MotionBox>
    );
}