import { motion, useScroll, useSpring } from "motion/react";

// Línea fina arriba de la pantalla que se llena mientras bajas por la página
export default function BarraProgreso() {
    const { scrollYProgress } = useScroll();
    const escala = useSpring(scrollYProgress, {
        stiffness: 140,
        damping: 26,
        restDelta: 0.001,
    });

    return (
        <motion.div
            aria-hidden="true"
            style={{
                scaleX: escala,
                transformOrigin: "0 50%",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                zIndex: 1400,
                background: "linear-gradient(90deg, #3B9BFF, #8EE04A)",
            }}
        />
    );
}