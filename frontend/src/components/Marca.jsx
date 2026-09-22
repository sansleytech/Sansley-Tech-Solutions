import { Box, Typography } from "@mui/material";
import logo from "../assets/logo.png";

// Logo del engranaje + nombre escrito en texto (se ve nítido sobre fondos oscuros y claros)
export default function Marca({
    tamano = 40,
    oscuro = true,
    href = "#inicio",
    onClick,
}) {
    return (
        <Box
            component="a"
            href={href}
            onClick={onClick}
            aria-label="Sansley Tech Solutions, ir al inicio"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.25,
                textDecoration: "none",
            }}
        >
            <Box
                component="img"
                src={logo}
                alt=""
                sx={{
                    height: tamano,
                    width: "auto",
                    display: "block",
                    filter: oscuro
                        ? "drop-shadow(0 0 14px rgba(59,155,255,.45))"
                        : "none",
                }}
            />
            <Box sx={{ lineHeight: 1 }}>
                <Typography
                    component="span"
                    sx={{
                        display: "block",
                        fontFamily:
                            '"Poppins", "Helvetica", "Arial", sans-serif',
                        fontWeight: 800,
                        fontSize: tamano * 0.52,
                        letterSpacing: ".04em",
                        lineHeight: 1,
                    }}
                >
                    <Box
                        component="span"
                        sx={{ color: oscuro ? "cielo.main" : "primary.main" }}
                    >
                        SAN
                    </Box>
                    <Box
                        component="span"
                        sx={{ color: oscuro ? "lima.main" : "secondary.main" }}
                    >
                        SLEY
                    </Box>
                </Typography>
                <Typography
                    component="span"
                    sx={{
                        display: "block",
                        mt: 0.5,
                        fontSize: Math.max(8, tamano * 0.2),
                        fontWeight: 600,
                        letterSpacing: ".3em",
                        color: oscuro
                            ? "rgba(255,255,255,.72)"
                            : "text.secondary",
                        lineHeight: 1,
                    }}
                >
                    TECH SOLUTIONS
                </Typography>
            </Box>
        </Box>
    );
}
