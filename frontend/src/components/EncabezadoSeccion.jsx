import { Box, Typography } from "@mui/material";
import Aparecer from "./Aparecer.jsx";

// Título de cada sección. Con oscuro={true} se ve bien sobre fondos de noche.
export default function EncabezadoSeccion({
    etiqueta,
    titulo,
    subtitulo,
    centrado = false,
    oscuro = false,
}) {
    const linea = {
        width: 28,
        height: 2,
        borderRadius: 1,
        background: oscuro
            ? "linear-gradient(90deg, #3B9BFF, #8EE04A)"
            : "linear-gradient(90deg, #0159B1, #5B921F)",
    };

    return (
        <Box
            sx={{
                maxWidth: 860,
                mx: centrado ? "auto" : 0,
                textAlign: centrado ? "center" : "left",
            }}
        >
            <Aparecer>
                <Box
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <Box aria-hidden="true" sx={linea} />
                    <Typography
                        sx={{
                            color: oscuro ? "lima.main" : "secondary.dark",
                            fontSize: { xs: 12, md: 13 },
                            fontWeight: 600,
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                        }}
                    >
                        {etiqueta}
                    </Typography>
                    {centrado && (
                        <Box
                            aria-hidden="true"
                            sx={{ ...linea, transform: "scaleX(-1)" }}
                        />
                    )}
                </Box>
            </Aparecer>

            <Aparecer retraso={0.07}>
                <Typography
                    variant="h2"
                    sx={{
                        mt: 1,
                        fontSize: { xs: 27, md: 40 },
                        lineHeight: 1.15,
                        color: oscuro ? "#fff" : "text.primary",
                    }}
                >
                    {titulo}
                </Typography>
            </Aparecer>

            <Aparecer retraso={0.14}>
                <Typography
                    sx={{
                        mt: { xs: 1.5, md: 2 },
                        fontSize: { xs: 15, md: 17 },
                        lineHeight: 1.6,
                        color: oscuro
                            ? "rgba(255,255,255,.7)"
                            : "text.secondary",
                    }}
                >
                    {subtitulo}
                </Typography>
            </Aparecer>
        </Box>
    );
}
