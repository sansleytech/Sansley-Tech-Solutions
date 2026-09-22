import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

// Colores de las partículas en formato RGB: azul cielo y verde lima
const COLORES = ["59,155,255", "142,224,74"];
const DISTANCIA_LINEA = 130; // hasta dónde se unen dos partículas
const DISTANCIA_RATON = 170; // hasta dónde reacciona al cursor

export default function Particulas({ sx }) {
    const lienzoRef = useRef(null);
    const sinMovimiento = useReducedMotion();

    useEffect(() => {
        const lienzo = lienzoRef.current;
        const ctx = lienzo.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const raton = { x: -9999, y: -9999 };
        let ancho = 0;
        let alto = 0;
        let particulas = [];
        let cuadro = 0;
        let visible = true;

        function crear() {
            const esMovil = ancho < 700;
            const maximo = esMovil ? 38 : 95;
            const cantidad = Math.min(
                maximo,
                Math.round((ancho * alto) / (esMovil ? 14000 : 15000)),
            );

            particulas = Array.from({ length: cantidad }, () => ({
                x: Math.random() * ancho,
                y: Math.random() * alto,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radio: Math.random() * 1.7 + 0.6,
                color: COLORES[Math.random() < 0.72 ? 0 : 1],
            }));
        }

        function medir() {
            const caja = lienzo.getBoundingClientRect();
            ancho = caja.width;
            alto = caja.height;
            lienzo.width = Math.round(ancho * dpr);
            lienzo.height = Math.round(alto * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            crear();
            dibujar(false);
        }

        function dibujar(mover) {
            ctx.clearRect(0, 0, ancho, alto);

            for (let i = 0; i < particulas.length; i++) {
                const p = particulas[i];

                if (mover) {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > ancho) p.vx *= -1;
                    if (p.y < 0 || p.y > alto) p.vy *= -1;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color},.85)`;
                ctx.fill();

                // Líneas hacia las partículas cercanas
                for (let j = i + 1; j < particulas.length; j++) {
                    const q = particulas[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < DISTANCIA_LINEA * DISTANCIA_LINEA) {
                        const opacidad =
                            (1 - d2 / (DISTANCIA_LINEA * DISTANCIA_LINEA)) *
                            0.3;
                        ctx.strokeStyle = `rgba(${p.color},${opacidad})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }

                // Líneas hacia el cursor
                const rx = p.x - raton.x;
                const ry = p.y - raton.y;
                const dr2 = rx * rx + ry * ry;
                if (dr2 < DISTANCIA_RATON * DISTANCIA_RATON) {
                    const opacidad =
                        (1 - dr2 / (DISTANCIA_RATON * DISTANCIA_RATON)) * 0.6;
                    ctx.strokeStyle = `rgba(255,255,255,${opacidad})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(raton.x, raton.y);
                    ctx.stroke();
                }
            }
        }

        function bucle() {
            if (visible) dibujar(true);
            cuadro = requestAnimationFrame(bucle);
        }

        function moverRaton(evento) {
            const caja = lienzo.getBoundingClientRect();
            raton.x = evento.clientX - caja.left;
            raton.y = evento.clientY - caja.top;
        }

        const observadorTamano = new ResizeObserver(medir);
        observadorTamano.observe(lienzo);

        // Solo se anima mientras el lienzo está a la vista
        const observadorVista = new IntersectionObserver(([entrada]) => {
            visible = entrada.isIntersecting;
        });
        observadorVista.observe(lienzo);

        if (!sinMovimiento) {
            window.addEventListener("pointermove", moverRaton, {
                passive: true,
            });
            cuadro = requestAnimationFrame(bucle);
        }

        return () => {
            cancelAnimationFrame(cuadro);
            observadorTamano.disconnect();
            observadorVista.disconnect();
            window.removeEventListener("pointermove", moverRaton);
        };
    }, [sinMovimiento]);

    return (
        <canvas
            ref={lienzoRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                ...sx,
            }}
        />
    );
}
