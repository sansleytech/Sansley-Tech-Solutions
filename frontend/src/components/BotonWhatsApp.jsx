import { Box, Fab } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { motion, useReducedMotion } from "motion/react";
import WhatsApp from "@mui/icons-material/WhatsApp";
import useEmpresa from "../hooks/useEmpresa.js";

const MotionFab = motion.create(Fab);

const mensaje = "Hola, quiero información sobre sus servicios.";

// Anillo que "respira" suavemente detrás del botón, para llamar la atención sin ser molesto
const pulso = keyframes`
    0% { transform: scale(1); opacity: .45; }
    100% { transform: scale(1.55); opacity: 0; }
`;

export default function BotonWhatsApp() {
    const { empresa } = useEmpresa();
    const sinMovimiento = useReducedMotion();

    // Sin número guardado en el panel, el botón no aparece
    if (!empresa?.whatsapp) return null;

    return (
        <Box
            sx={{
                position: "fixed",
                right: { xs: 16, md: 24 },
                bottom: { xs: 16, md: 24 },
                zIndex: (tema) => tema.zIndex.speedDial,
            }}
        >
            {!sinMovimiento && (
                <Box
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        bgcolor: "#25D366",
                        animation: `${pulso} 2.4s cubic-bezier(.4,0,.6,1) infinite`,
                    }}
                />
            )}
            <MotionFab
                component="a"
                href={`https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensaje)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escríbenos por WhatsApp"
                initial={sinMovimiento ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.5 }}
                whileHover={sinMovimiento ? undefined : { scale: 1.08 }}
                whileTap={sinMovimiento ? undefined : { scale: 0.94 }}
                sx={{
                    position: "relative",
                    bgcolor: "#25D366",
                    color: "#fff",
                    boxShadow: "0 8px 24px rgba(37,211,102,.45)",
                    "&:hover": { bgcolor: "#1EBE5A" },
                }}
            >
                <WhatsApp />
            </MotionFab>
        </Box>
    );
}