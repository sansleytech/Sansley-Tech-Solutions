import { Box, Card, Container, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import RocketLaunchOutlined from "@mui/icons-material/RocketLaunchOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import ExploreOutlined from "@mui/icons-material/ExploreOutlined";
import EncabezadoSeccion from "../components/EncabezadoSeccion.jsx";
import Aparecer from "../components/Aparecer.jsx";
import useEmpresa from "../hooks/useEmpresa.js";

const bloques = [
    { clave: "mision", titulo: "Misión", icono: RocketLaunchOutlined },
    { clave: "vision", titulo: "Visión", icono: VisibilityOutlined },
    { clave: "alcance", titulo: "Alcance", icono: ExploreOutlined },
    
];

export default function Nosotros() {
    const { empresa, cargando, error } = useEmpresa();
    const objetivos = empresa?.objetivos ?? [];

    return (
        <Box
            id="nosotros"
            sx={{
                bgcolor: "background.default",
                py: { xs: 8, md: 12 },
                scrollMarginTop: { xs: "64px", md: "76px" },
            }}
        >
            <Container maxWidth="lg">
                <EncabezadoSeccion
                    centrado
                    etiqueta="Nosotros"
                    titulo="Quiénes somos"
                    subtitulo={empresa?.descripcion ?? ""}
                />

                {error && (
                    <Typography color="error" align="center" sx={{ mt: 4 }}>
                        No pudimos cargar esta información. Intenta de nuevo más
                        tarde.
                    </Typography>
                )}

                {/* Misión, visión y alcance */}
                <Box
                    sx={{
                        mt: { xs: 5, md: 7 },
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(3, 1fr)",
                        },
                        gap: { xs: 1.5, md: 3 },
                    }}
                >
                    {cargando &&
                        [0, 1, 2].map((i) => (
                            <Skeleton
                                key={i}
                                variant="rounded"
                                sx={{ height: { xs: 130, md: 230 }, borderRadius: "16px" }}
                            />
                        ))}

                    {empresa &&
                        bloques
                            .filter((bloque) => empresa[bloque.clave])
                            .map((bloque, i) => {
                                const Icono = bloque.icono;
                                const color = i % 2 === 0 ? "primary" : "secondary";

                                return (
                                    <Aparecer key={bloque.clave} retraso={i * 0.08} sx={{ height: "100%" }}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                height: "100%",
                                                p: { xs: 2.5, md: 3.5 },
                                                borderColor: "divider",
                                                borderRadius: "16px",
                                                transition: "transform .25s, box-shadow .25s, border-color .25s",
                                                "@media (hover: hover)": {
                                                    "&:hover": {
                                                        transform: "translateY(-4px)",
                                                        boxShadow: "0 14px 34px rgba(10,37,64,.10)",
                                                        borderColor: (tema) =>
                                                            alpha(tema.palette[color].main, 0.4),
                                                    },
                                                },
                                                "@media (prefers-reduced-motion: reduce)": {
                                                    transition: "none",
                                                    "&:hover": { transform: "none" },
                                                },
                                            }}
                                        >
                                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                                <Box
                                                    sx={{
                                                        width: { xs: 40, md: 48 },
                                                        height: { xs: 40, md: 48 },
                                                        flexShrink: 0,
                                                        borderRadius: "12px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        bgcolor: (tema) => alpha(tema.palette[color].main, 0.1),
                                                        color: color === "primary" ? "primary.main" : "secondary.dark",
                                                    }}
                                                >
                                                    <Icono />
                                                </Box>
                                                <Typography
                                                    variant="h5"
                                                    sx={{ fontSize: { xs: 18, md: 20 } }}
                                                >
                                                    {bloque.titulo}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                sx={{
                                                    mt: 2,
                                                    fontSize: { xs: 14.5, md: 15 },
                                                    lineHeight: 1.65,
                                                    color: "text.secondary",
                                                }}
                                            >
                                                {empresa[bloque.clave]}
                                            </Typography>
                                        </Card>
                                    </Aparecer>
                                );
                            })}
                </Box>

                {/* Objetivos */}
                {objetivos.length > 0 && (
                    <Aparecer retraso={0.15} sx={{ mt: { xs: 3, md: 4 } }}>
                        <Box
                            sx={{
                                p: { xs: 3, md: 6 },
                                borderRadius: { xs: "20px", md: "24px" },
                                bgcolor: "marino.main",
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{ color: "#fff", fontSize: { xs: 22, md: 30 } }}
                            >
                                Nuestros objetivos
                            </Typography>

                            <Box
                                sx={{
                                    mt: { xs: 3, md: 4 },
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "repeat(2, 1fr)",
                                        lg: "repeat(4, 1fr)",
                                    },
                                    gap: { xs: 2.5, md: 4 },
                                }}
                            >
                                {objetivos.map((objetivo, i) => (
                                    <Stack
                                        key={objetivo.id}
                                        direction={{ xs: "row", lg: "column" }}
                                        spacing={{ xs: 2, lg: 1.5 }}
                                    >
                                        <Typography
                                            variant="h3"
                                            component="span"
                                            sx={{
                                                minWidth: { xs: 46, lg: "auto" },
                                                fontSize: { xs: 28, md: 36 },
                                                lineHeight: 1,
                                                color: "secondary.light",
                                            }}
                                        >
                                            {String(i + 1).padStart(2, "0")}
                                        </Typography>
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                sx={{ color: "#fff", fontSize: { xs: 16, md: 17.5 } }}
                                            >
                                                {objetivo.titulo}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    mt: 0.5,
                                                    fontSize: 14,
                                                    lineHeight: 1.6,
                                                    color: "rgba(255,255,255,.72)",
                                                }}
                                            >
                                                {objetivo.descripcion}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Box>
                        </Box>
                    </Aparecer>
                )}
            </Container>
        </Box>
    );
}