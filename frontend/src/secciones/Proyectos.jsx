import { Box, Container, Skeleton, Typography } from "@mui/material";
import EncabezadoSeccion from "../components/EncabezadoSeccion.jsx";
import TarjetaProyecto from "../components/TarjetaProyecto.jsx";
import Aparecer from "../components/Aparecer.jsx";
import useDatos from "../hooks/useDatos.js";
import { urlImagen } from "../api.js";

// Ancho de cada tarjeta dentro del carrusel del celular
const ANCHO_CELULAR = "0 0 80%";

export default function Proyectos() {
    const { datos: proyectos, cargando, error } = useDatos("/proyectos");

    return (
        <Box
            id="proyectos"
            sx={{
                bgcolor: "background.paper",
                py: { xs: 8, md: 12 },
                scrollMarginTop: { xs: "64px", md: "76px" },
            }}
        >
            <Container maxWidth="lg">
                <EncabezadoSeccion
                    etiqueta="Proyectos"
                    titulo="Trabajo que ya está funcionando"
                    subtitulo="Una muestra de los sistemas que hemos construido para nuestros clientes."
                />

                {error && (
                    <Typography color="error" sx={{ mt: 4 }}>
                        No pudimos cargar los proyectos. Intenta de nuevo más
                        tarde.
                    </Typography>
                )}

                {!cargando && !error && proyectos.length === 0 && (
                    <Typography color="text.secondary" sx={{ mt: 4 }}>
                        Muy pronto publicaremos nuestros proyectos aquí.
                    </Typography>
                )}

                <Box
                    sx={{
                        mt: { xs: 4, md: 6 },
                        mx: { xs: -2, sm: 0 },
                        px: { xs: 2, sm: 0 },
                        pb: { xs: 1, sm: 0 },
                        display: { xs: "flex", sm: "grid" },
                        gridTemplateColumns: {
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                            lg: "repeat(4, 1fr)",
                        },
                        gap: { xs: 1.5, md: 3 },
                        overflowX: { xs: "auto", sm: "visible" },
                        scrollSnapType: { xs: "x mandatory", sm: "none" },
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {cargando &&
                        [0, 1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                variant="rounded"
                                sx={{
                                    flex: { xs: ANCHO_CELULAR, sm: "none" },
                                    height: 380,
                                    borderRadius: "16px",
                                }}
                            />
                        ))}

                    {proyectos.map((proyecto, indice) => (
                        <Aparecer
                            key={proyecto.id}
                            retraso={(indice % 4) * 0.08}
                            sx={{
                                display: "flex",
                                flex: { xs: ANCHO_CELULAR, sm: "none" },
                                minWidth: 0,
                                scrollSnapAlign: "start",
                            }}
                        >
                            <TarjetaProyecto
                                proyecto={{
                                    ...proyecto,
                                    imagen: urlImagen(proyecto.imagen),
                                }}
                            />
                        </Aparecer>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
