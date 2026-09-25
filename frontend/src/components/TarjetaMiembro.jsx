import { Box, Button, Container, Skeleton, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EncabezadoSeccion from "../components/EncabezadoSeccion.jsx";
import TarjetaMiembro from "../components/TarjetaMiembro.jsx";
import Aparecer from "../components/Aparecer.jsx";
import useDatos from "../hooks/useDatos.js";
import { urlImagen } from "../api.js";

// Cuántas tarjetas caben por fila: 1 en celular, 2 en tablet, 3 en computador y 4 en pantallas grandes.
// Los números 24, 64 y 72 son la suma de los espacios entre tarjetas (en píxeles).
const anchoTarjeta = {
    xs: "100%",
    sm: "calc((100% - 24px) / 2)",
    md: "calc((100% - 64px) / 3)",
    lg: "calc((100% - 72px) / 4)",
};

export default function Equipo() {
    const { datos: equipo, cargando, error } = useDatos("/equipo");

    return (
        <Box
            id="equipo"
            sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: "background.paper",
                pt: { xs: 9, md: 14 },
                pb: { xs: 9, md: 13 },
                scrollMarginTop: { xs: "64px", md: "76px" },
            }}
        >
            {/* Un resplandor azul muy suave para que el fondo no se vea plano */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(45% 35% at 100% 0%, rgba(1,89,177,.07), transparent 70%), radial-gradient(40% 30% at 0% 100%, rgba(91,146,31,.06), transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <Container
                maxWidth="lg"
                sx={{ position: "relative", zIndex: 1 }}>
                <EncabezadoSeccion
                    centrado
                    etiqueta="Nuestro equipo"
                    titulo="Las personas detrás de cada proyecto"
                    subtitulo="Un equipo comprometido con entender tu negocio y entregar tecnología que funciona."
                />

                {error && (
                    <Typography align="center" sx={{ mt: 4, color: "error.main" }}>
                        No pudimos cargar el equipo. Intenta de nuevo más tarde.
                    </Typography>
                )}

                {/* Filas de hasta 3 tarjetas (4 en pantallas grandes). Las que sobran pasan a la fila de abajo y quedan centradas */}
                <Box
                    sx={{
                        mt: { xs: 5, md: 7 },
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "stretch",
                        gap: { xs: 3, md: 4 },
                    }}
                >
                    {cargando &&
                        [0, 1, 2].map((i) => (
                            <Box
                                key={i}
                                sx={{ flex: "0 0 auto", width: anchoTarjeta, maxWidth: 340 }}
                            >
                                <Skeleton
                                    variant="rounded"
                                    animation="wave"
                                    sx={{
                                        height: { xs: 440, md: 500 },
                                        borderRadius: "16px",
                                    }}
                                />
                            </Box>
                        ))}

                    {equipo.map((miembro, indice) => (
                        <Box
                            key={miembro.id}
                            sx={{
                                flex: "0 0 auto",
                                width: anchoTarjeta,
                                maxWidth: 340,
                            }}
                        >
                            <TarjetaMiembro
                                miembro={{ ...miembro, foto: urlImagen(miembro.foto) }}
                                indice={indice % 3}
                            />
                        </Box>
                    ))}
                </Box>

                {equipo.length > 0 && (
                    <Aparecer
                        retraso={0.1}
                        sx={{
                            mt: { xs: 6, md: 8 },
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: 15, md: 17 },
                                color: "text.secondary",
                            }}
                        >
                            ¿Tienes una idea o un proyecto en mente?
                        </Typography>
                        <Button
                            variant="contained"
                            href="#contacto"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                mt: 2,
                                px: 4,
                                minHeight: 48,
                                transition: "transform .25s, box-shadow .25s",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 10px 24px rgba(1,89,177,.3)",
                                },
                            }}
                        >
                            Hablemos
                        </Button>
                    </Aparecer>
                )}
            </Container>
        </Box>
    );
}