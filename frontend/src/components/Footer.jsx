import { Box, Container, Divider, Link, Stack, Typography } from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Marca from "./Marca.jsx";
import Aparecer from "./Aparecer.jsx";
import useDatos from "../hooks/useDatos.js";
import useEmpresa from "../hooks/useEmpresa.js";
import { enlaces } from "../datosSitio.js";

const estiloEnlace = {
    color: "rgba(255,255,255,.68)",
    fontSize: 14.5,
    transition: "color .2s",
    "&:hover": { color: "cielo.light" },
};

function Columna({ titulo, children, retraso }) {
    return (
        <Aparecer retraso={retraso}>
            <Box>
                <Typography
                    sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.9)",
                    }}
                >
                    {titulo}
                </Typography>
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                    {children}
                </Stack>
            </Box>
        </Aparecer>
    );
}

function DatoContacto({ icono: Icono, children }) {
    return (
        <Stack
            direction="row"
            spacing={1.25}
            sx={{
                alignItems: "flex-start",
                color: "rgba(255,255,255,.68)",
                fontSize: 14.5,
            }}
        >
            <Icono sx={{ fontSize: 19, mt: "2px", color: "lima.light" }} />
            <Box sx={{ overflowWrap: "anywhere" }}>{children}</Box>
        </Stack>
    );
}

export default function Footer() {
    const { datos: servicios } = useDatos("/servicios");
    const { empresa } = useEmpresa();

    return (
        <Box
            component="footer"
            sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: "marino.main",
            }}
        >
            {/* Resplandor sutil, coherente con Hero y Contacto */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(40% 60% at 10% 0%, rgba(59,155,255,.14), transparent 70%), radial-gradient(35% 50% at 90% 100%, rgba(142,224,74,.12), transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            {/* Línea de marca: azul a verde */}
            <Box
                sx={{
                    position: "relative",
                    height: 3,
                    background: (tema) =>
                        `linear-gradient(90deg, ${tema.palette.cielo.main}, ${tema.palette.lima.main})`,
                }}
            />

            <Container maxWidth="lg" sx={{ position: "relative", pt: { xs: 5, md: 8 }, pb: 3 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr 1fr",
                            md: "1.6fr 1fr 1fr 1.3fr",
                        },
                        columnGap: { xs: 3, md: 6 },
                        rowGap: { xs: 4, md: 0 },
                    }}
                >
                    {/* Marca */}
                    <Box sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}>
                        <Aparecer>
                            <Box>
                                <Marca tamano={38} oscuro />
                                <Typography
                                    sx={{
                                        mt: 2,
                                        maxWidth: 340,
                                        fontSize: 14.5,
                                        lineHeight: 1.65,
                                        color: "rgba(255,255,255,.68)",
                                    }}
                                >
                                    Desarrollo de software a la medida y asesoría
                                    contable y tributaria para hacer crecer tu
                                    negocio.
                                </Typography>
                            </Box>
                        </Aparecer>
                    </Box>

                    {/* Servicios (vienen de la base de datos) */}
                    {servicios.length > 0 && (
                        <Columna titulo="Servicios" retraso={0.06}>
                            {servicios.map((servicio) => (
                                <Link
                                    key={servicio.id}
                                    href="#servicios"
                                    underline="none"
                                    sx={estiloEnlace}
                                >
                                    {servicio.nombre}
                                </Link>
                            ))}
                        </Columna>
                    )}

                    {/* Navegación */}
                    <Columna titulo="Navegación" retraso={0.12}>
                        {enlaces.map((enlace) => (
                            <Link
                                key={enlace.texto}
                                href={enlace.destino}
                                underline="none"
                                sx={estiloEnlace}
                            >
                                {enlace.texto}
                            </Link>
                        ))}
                    </Columna>

                    {/* Contacto (viene de la base de datos) */}
                    <Box sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}>
                        <Columna titulo="Contacto" retraso={0.18}>
                            {empresa?.correo && (
                                <DatoContacto icono={EmailOutlined}>
                                    <Link
                                        href={`mailto:${empresa.correo}`}
                                        underline="hover"
                                        sx={estiloEnlace}
                                    >
                                        {empresa.correo}
                                    </Link>
                                </DatoContacto>
                            )}
                            {empresa?.whatsapp && (
                                <DatoContacto icono={WhatsApp}>
                                    <Link
                                        href={`https://wa.me/${empresa.whatsapp}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        underline="hover"
                                        sx={estiloEnlace}
                                    >
                                        +{empresa.whatsapp}
                                    </Link>
                                </DatoContacto>
                            )}
                            {empresa?.ubicacion && (
                                <DatoContacto icono={LocationOnOutlined}>
                                    {empresa.ubicacion}
                                </DatoContacto>
                            )}
                        </Columna>
                    </Box>
                </Box>

                <Divider sx={{ mt: { xs: 4, md: 6 }, mb: 2.5, borderColor: "rgba(255,255,255,.12)" }} />

                <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    spacing={1.5}
                    sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 13,
                            color: "rgba(255,255,255,.55)",
                            textAlign: "center",
                        }}
                    >
                        © {new Date().getFullYear()} Sansley Tech Solutions.
                        Todos los derechos reservados.
                    </Typography>
                    <Link
                        href="#inicio"
                        underline="none"
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "cielo.light",
                            transition: "color .2s, transform .2s",
                            "&:hover": {
                                color: "lima.light",
                                transform: "translateY(-2px)",
                            },
                            "@media (prefers-reduced-motion: reduce)": {
                                "&:hover": { transform: "none" },
                            },
                        }}
                    >
                        Volver arriba <KeyboardArrowUp fontSize="small" />
                    </Link>
                </Stack>
            </Container>
        </Box>
    );
}