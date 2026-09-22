import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import BotonWhatsApp from "../components/BotonWhatsApp.jsx";
import BarraProgreso from "../components/BarraProgreso.jsx";
import Hero from "../secciones/Hero.jsx";
import Servicios from "../secciones/Servicios.jsx";
import Proyectos from "../secciones/Proyectos.jsx";
import Nosotros from "../secciones/Nosotros.jsx";
import Equipo from "../secciones/Equipo.jsx";
import Contacto from "../secciones/Contacto.jsx";

export default function Sitio() {
    return (
        <>
            <BarraProgreso />
            <Navbar />
            <main>
                <Hero />
                <Servicios />
                <Proyectos />
                <Nosotros />
                <Equipo />
                <Contacto />
            </main>
            <Footer />
            <BotonWhatsApp />
        </>
    );
}
