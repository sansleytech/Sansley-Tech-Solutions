import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import BuildOutlined from "@mui/icons-material/BuildOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import LockResetOutlined from "@mui/icons-material/LockResetOutlined";

export const menu = [
    {
        texto: "Resumen",
        ruta: "/admin",
        icono: <DashboardOutlined />,
        descripcion: "Vista general del panel",
    },
    {
        texto: "Proyectos",
        ruta: "/admin/proyectos",
        icono: <WorkOutlineOutlined />,
        descripcion: "Publica, edita y ordena los proyectos del portafolio",
    },
    {
        texto: "Categorías",
        ruta: "/admin/categorias",
        icono: <CategoryOutlined />,
        descripcion: "El tipo de cada proyecto, para clasificar y filtrar el portafolio",
    },
    {
        texto: "Equipo",
        ruta: "/admin/equipo",
        icono: <GroupsOutlined />,
        descripcion: "Integrantes, cargos y fotos",
    },
    {
        texto: "Servicios",
        ruta: "/admin/servicios",
        icono: <BuildOutlined />,
        descripcion: "Los servicios que ofreces",
    },
    {
        texto: "Empresa",
        ruta: "/admin/empresa",
        icono: <BusinessOutlined />,
        descripcion: "Misión, visión, alcance y objetivos",
    },
    {
        texto: "Mensajes",
        ruta: "/admin/mensajes",
        icono: <MailOutlined />,
        descripcion: "Solicitudes que llegan desde el formulario de contacto",
    },
    {
        texto: "Mi cuenta",
        ruta: "/admin/cuenta",
        icono: <LockResetOutlined />,
        descripcion: "Cambiar tu contraseña",
    },
];