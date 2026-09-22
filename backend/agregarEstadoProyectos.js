import "dotenv/config";
import mysql from "mysql2/promise";

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

try {
    const [columna] = await db.query(
        "SHOW COLUMNS FROM proyectos LIKE 'estado'",
    );
    if (columna.length === 0) {
        await db.query(
            "ALTER TABLE proyectos ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'finalizado' AFTER publicado",
        );
        console.log(
            "OK  Se agregó la columna estado (los proyectos existentes quedaron como finalizado)",
        );
    } else {
        console.log("--  La columna estado ya existía");
    }

    const [resumen] = await db.query(
        "SELECT estado, COUNT(*) AS total FROM proyectos GROUP BY estado ORDER BY estado",
    );
    console.log("\nProyectos por estado:");
    console.table(
        resumen.map((f) => ({ estado: f.estado, total: Number(f.total) })),
    );
} catch (error) {
    console.error(`FALLO ${error.code ?? "ERROR"}: ${error.message}`);
    process.exitCode = 1;
} finally {
    await db.end();
}
