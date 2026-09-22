import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    Avatar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
} from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import logo from "../assets/logo.png";
import { menu } from "./menu.jsx";
import { cerrarSesion, obtenerSesion } from "./sesion.js";

const ANCHO = 260;

const estiloPapel = { "& .MuiDrawer-paper": { width: ANCHO, border: 0 } };

export default function LayoutAdmin() {
    const navigate = useNavigate();
    const { usuario } = obtenerSesion();
    const [abierto, setAbierto] = useState(false);

    function salir() {
        cerrarSesion();
        navigate("/admin/login", { replace: true });
    }

    const barraLateral = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "marino.main",
                color: "white",
            }}
        >
            {/* Marca */}
            <Box
                sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}
            >
                <Box component="img" src={logo} alt="" sx={{ height: 36 }} />
                <Box>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Sansley
                    </Typography>
                    <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                        Administración
                    </Typography>
                </Box>
            </Box>

            {/* Módulos */}
            <List sx={{ px: 1.5, flexGrow: 1 }}>
                {menu.map((item) => (
                    <ListItemButton
                        key={item.ruta}
                        component={NavLink}
                        to={item.ruta}
                        end={item.ruta === "/admin"}
                        onClick={() => setAbierto(false)}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            color: "rgba(255,255,255,0.75)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                            "&.active": {
                                bgcolor: "rgba(255,255,255,0.14)",
                                color: "white",
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                            {item.icono}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.texto}
                            slotProps={{
                                primary: {
                                    sx: { fontWeight: 600, fontSize: 15 },
                                },
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>

            {/* Usuario y salir */}
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                }}
            >
                <Avatar
                    sx={{ bgcolor: "secondary.main", width: 36, height: 36 }}
                >
                    {usuario.nombre.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                    noWrap
                    sx={{ flexGrow: 1, fontWeight: 600, fontSize: 14 }}
                >
                    {usuario.nombre}
                </Typography>
                <Tooltip title="Cerrar sesión">
                    <IconButton
                        color="inherit"
                        onClick={salir}
                        aria-label="Cerrar sesión"
                    >
                        <LogoutOutlined />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );

    return (
        <>
            {/* Menú en teléfono: se abre y se cierra */}
            <Drawer
                variant="temporary"
                open={abierto}
                onClose={() => setAbierto(false)}
                ModalProps={{ keepMounted: true, disableScrollLock: true }}
                sx={{ display: { xs: "block", md: "none" }, ...estiloPapel }}
            >
                {barraLateral}
            </Drawer>

            {/* Menú fijo en escritorio */}
            <Drawer
                variant="permanent"
                open
                sx={{ display: { xs: "none", md: "block" }, ...estiloPapel }}
            >
                {barraLateral}
            </Drawer>

            <Box
                component="main"
                sx={{
                    ml: { md: `${ANCHO}px` },
                    minHeight: "100vh",
                    bgcolor: "background.default",
                }}
            >
                {/* Barra superior, solo en teléfono */}
                <Box
                    sx={{
                        display: { xs: "flex", md: "none" },
                        alignItems: "center",
                        gap: 1,
                        position: "sticky",
                        top: 0,
                        zIndex: 1100,
                        bgcolor: "marino.main",
                        color: "white",
                        px: 1,
                        py: 0.5,
                    }}
                >
                    <IconButton
                        color="inherit"
                        onClick={() => setAbierto(true)}
                        aria-label="Abrir menú"
                    >
                        <MenuOutlined />
                    </IconButton>
                    <Typography sx={{ fontWeight: 600 }}>
                        Administración
                    </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, md: 4 } }}>
                    <Outlet />
                </Box>
            </Box>
        </>
    );
}
