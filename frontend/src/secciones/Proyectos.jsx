import { Box, Container, Skeleton, Typography } from "@mui/material";
import EncabezadoSeccion from "../components/EncabezadoSeccion.jsx";
import VitrinaProyectos from "../components/VitrinaProyectos.jsx";
import useDatos from "../hooks/useDatos.js";
import { urlImagen } from "../api.js";

export default function Proyectos() {
    const { datos: proyectos, cargando, error } = useDatos("/proyectos");

    // La ruta de la imagen viene relativa ("/uploads/..."); la volvemos absoluta
    const proyectosConImagen = proyectos.map((proyecto) => ({
        ...proyecto,
        imagen: urlImagen(proyecto.imagen),
    }));

    return (
        <Box
            id="proyectos"
            sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: "noche.main",
                py: { xs: 8, md: 12 },
                scrollMarginTop: { xs: "64px", md: "76px" },
            }}
        >
            {/* Resplandor sutil, coherente con el resto del sitio en modo oscuro */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(45% 40% at 15% 0%, rgba(59,155,255,.16), transparent 70%), radial-gradient(40% 45% at 100% 100%, rgba(142,224,74,.12), transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <Container maxWidth="lg" sx={{ position: "relative" }}>
                <EncabezadoSeccion
                    etiqueta="Proyectos"
                    titulo="Proyectos destacados"
                    subtitulo="Una muestra de los sistemas que hemos construido para nuestros clientes."
                    centrado
                    oscuro
                />

                {error && (
                    <Typography sx={{ mt: 4, color: "rgba(255,255,255,.7)" }}>
                        No pudimos cargar los proyectos. Intenta de nuevo más
                        tarde.
                    </Typography>
                )}

                {!cargando && !error && proyectos.length === 0 && (
                    <Typography sx={{ mt: 4, color: "rgba(255,255,255,.7)" }}>
                        Muy pronto publicaremos nuestros proyectos aquí.
                    </Typography>
                )}

                {cargando && (
                    <Skeleton
                        variant="rounded"
                        sx={{
                            mt: { xs: 4, md: 6 },
                            height: { xs: 640, md: 520 },
                            borderRadius: "20px",
                            bgcolor: "rgba(255,255,255,.06)",
                        }}
                    />
                )}

                {!cargando && !error && proyectosConImagen.length > 0 && (
                    <Box sx={{ mt: { xs: 4, md: 6 } }}>
                        <VitrinaProyectos proyectos={proyectosConImagen} />
                    </Box>
                )}
            </Container>
        </Box>
    );
}