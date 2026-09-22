import { Box, Button, Card, Chip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import logo from "../assets/logo.png";

const MAX_TECNOLOGIAS = 4;

// "finalizado" es el estado por defecto de un proyecto de portafolio, así que no se etiqueta
// (etiquetar todo sería ruido visual); solo se avisa cuando vale la pena aclararlo.
const ESTADOS = {
    planeacion: { etiqueta: "En planeación", color: "#8A97AC" },
    en_proceso: { etiqueta: "En proceso", color: "#C98A1E" },
    pausado: { etiqueta: "Pausado", color: "#B23A3A" },
};

function VistaPrevia({ proyecto }) {
    const { nombre, url, imagen, mostrar_iframe: mostrarIframe } = proyecto;
    const direccion = url
        ? url.replace(/^https?:\/\//, "").replace(/\/$/, "")
        : "próximamente";

    return (
        <Box>
            {/* Barra tipo navegador */}
            <Box
                sx={{
                    height: 28,
                    bgcolor: "#EEF2F8",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.5,
                }}
            >
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#C9D3E2",
                        }}
                    />
                ))}
                <Box
                    sx={{
                        ml: 1,
                        height: 18,
                        flex: 1,
                        px: 1,
                        display: "flex",
                        alignItems: "center",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        borderRadius: 999,
                        bgcolor: "#fff",
                        border: "1px solid #DCE4F0",
                        fontSize: 10,
                        color: "text.secondary",
                    }}
                >
                    {direccion}
                </Box>
            </Box>

            {/* Contenido de la vista previa */}
            <Box
                sx={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    bgcolor: "marino.main",
                    overflow: "hidden",
                }}
            >
                {url && mostrarIframe ? (
                    <Box
                        component="iframe"
                        src={url}
                        title={`Vista previa de ${nombre}`}
                        loading="lazy"
                        tabIndex={-1}
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "400%",
                            height: "400%",
                            border: 0,
                            bgcolor: "#fff",
                            transform: "scale(0.25)",
                            transformOrigin: "0 0",
                            pointerEvents: "none",
                        }}
                    />
                ) : imagen ? (
                    <Box
                        component="img"
                        className="captura"
                        src={imagen}
                        alt={`Captura de ${nombre}`}
                        loading="lazy"
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transition:
                                "transform .5s cubic-bezier(.22,1,.36,1)",
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                        }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt=""
                            sx={{ width: 52, height: "auto" }}
                        />
                        <Typography
                            sx={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}
                        >
                            Vista previa próximamente
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default function TarjetaProyecto({ proyecto }) {
    const {
        nombre,
        descripcion_corta: descripcionCorta,
        descripcion,
        servicio,
        cliente,
        destacado,
        estado,
        url,
        tecnologias = [],
    } = proyecto;
    const visibles = tecnologias.slice(0, MAX_TECNOLOGIAS);
    const ocultas = tecnologias.length - visibles.length;
    const infoEstado = ESTADOS[estado];

    return (
        <Card
            variant="outlined"
            sx={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: "16px",
                borderColor: destacado ? "primary.main" : "divider",
                overflow: "hidden",
                transition:
                    "transform .25s, box-shadow .25s, border-color .25s",
                "@media (hover: hover)": {
                    "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 18px 40px rgba(10,37,64,.14)",
                    },
                    "&:hover .captura": { transform: "scale(1.06)" },
                },
                "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover": { transform: "none" },
                    "&:hover .captura": { transform: "none" },
                },
            }}
        >
            {destacado && (
                <Chip
                    icon={<StarRoundedIcon sx={{ fontSize: 15 }} />}
                    label="Destacado"
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 1,
                        height: 24,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        bgcolor: "primary.main",
                        "& .MuiChip-icon": { color: "#fff" },
                    }}
                />
            )}

            {infoEstado && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        height: 24,
                        px: 1,
                        borderRadius: 999,
                        bgcolor: "rgba(10,37,64,.7)",
                        backdropFilter: "blur(3px)",
                    }}
                >
                    <Box
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: infoEstado.color,
                        }}
                    />
                    <Typography
                        sx={{ fontSize: 11, fontWeight: 700, color: "#fff" }}
                    >
                        {infoEstado.etiqueta}
                    </Typography>
                </Box>
            )}

            <VistaPrevia proyecto={proyecto} />

            <Box
                sx={{ p: 2, display: "flex", flexDirection: "column", flex: 1 }}
            >
                {servicio && (
                    <Chip
                        label={servicio}
                        size="small"
                        sx={{
                            alignSelf: "flex-start",
                            height: 22,
                            fontSize: 11,
                            fontWeight: 600,
                            color: "primary.main",
                            bgcolor: (tema) =>
                                alpha(tema.palette.primary.main, 0.1),
                        }}
                    />
                )}

                <Typography variant="h5" sx={{ mt: 1, fontSize: 18 }}>
                    {nombre}
                </Typography>
                {cliente && (
                    <Typography
                        sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}
                    >
                        Cliente: {cliente}
                    </Typography>
                )}

                <Typography
                    sx={{
                        mt: 0.75,
                        fontSize: 13.5,
                        lineHeight: 1.55,
                        color: "text.secondary",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {descripcionCorta || descripcion}
                </Typography>

                {visibles.length > 0 && (
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.75,
                            mt: 1.5,
                        }}
                    >
                        {visibles.map((tecnologia) => (
                            <Chip
                                key={tecnologia}
                                label={tecnologia}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: 11,
                                    bgcolor: "#EEF2F8",
                                    color: "#33445E",
                                    fontWeight: 600,
                                    borderRadius: "6px",
                                }}
                            />
                        ))}
                        {ocultas > 0 && (
                            <Chip
                                label={`+${ocultas}`}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: 11,
                                    bgcolor: "#EEF2F8",
                                    color: "#33445E",
                                    fontWeight: 600,
                                    borderRadius: "6px",
                                }}
                            />
                        )}
                    </Box>
                )}

                {url && (
                    <Box sx={{ mt: "auto", pt: 2 }}>
                        <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            endIcon={<OpenInNewIcon />}
                            sx={{ py: 0.75, px: 2 }}
                        >
                            Ver proyecto
                        </Button>
                    </Box>
                )}
            </Box>
        </Card>
    );
}
