// Prepara la base de datos para los servicios contables y tributarios.
// Se ejecuta UNA vez desde la carpeta backend con:  node agregarContable.js
// Es seguro repetirlo: no duplica nada.
import 'dotenv/config'
import mysql from 'mysql2/promise'

const nuevos = [
    {
        nombre: 'Gestión contable integral',
        descripcion:
            'Llevamos tu contabilidad al día: registros, estados financieros e informes claros para que tomes decisiones con información confiable.',
    },
    {
        nombre: 'Auditoría y certificación financiera',
        descripcion:
            'Revisamos y certificamos tu información financiera para generar confianza ante socios, bancos y entidades de control.',
    },
    {
        nombre: 'Liquidación de nómina y obligaciones',
        descripcion:
            'Calculamos nómina, prestaciones y aportes de seguridad social, y te ayudamos a cumplir a tiempo con tus obligaciones laborales.',
    },
    {
        nombre: 'Declaraciones tributarias y planeación fiscal',
        descripcion:
            'Preparamos y presentamos tus declaraciones de impuestos y planeamos tu carga fiscal para pagar lo justo y evitar sanciones.',
    },
    {
        nombre: 'Representación ante autoridades tributarias',
        descripcion:
            'Te acompañamos y respondemos por ti ante la DIAN y otras entidades: requerimientos, emplazamientos y procesos de fiscalización.',
    },
    {
        nombre: 'Recuperación de cartera y asesoría fiscal',
        descripcion:
            'Diseñamos estrategias para recuperar tu cartera vencida y te orientamos en lo fiscal para proteger la liquidez de tu negocio.',
    },
]

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

try {
    // 1. Columna "categoria": los que ya existen quedan como "tecnologia"
    const [columna] = await db.query("SHOW COLUMNS FROM servicios LIKE 'categoria'")
    if (columna.length === 0) {
        await db.query(
            "ALTER TABLE servicios ADD COLUMN categoria VARCHAR(20) NOT NULL DEFAULT 'tecnologia' AFTER descripcion"
        )
        console.log('OK  Se agregó la columna categoria (los servicios actuales quedaron como tecnologia)')
    } else {
        console.log('--  La columna categoria ya existía')
    }

    // 2. Los 6 servicios contables, al final de la lista
    const [[{ mayor }]] = await db.query('SELECT COALESCE(MAX(orden), 0) AS mayor FROM servicios')
    let orden = Number(mayor)

    for (const servicio of nuevos) {
        const [existe] = await db.query('SELECT id FROM servicios WHERE nombre = ?', [servicio.nombre])
        if (existe.length > 0) {
            console.log(`--  Ya existía: ${servicio.nombre}`)
            continue
        }
        orden += 1
        await db.execute(
            "INSERT INTO servicios (nombre, descripcion, categoria, orden, activo) VALUES (?, ?, 'contable', ?, 1)",
            [servicio.nombre, servicio.descripcion, orden]
        )
        console.log(`OK  Agregado: ${servicio.nombre}`)
    }

    // 3. Resumen
    const [resumen] = await db.query(
        'SELECT categoria, COUNT(*) AS total FROM servicios GROUP BY categoria ORDER BY categoria'
    )
    console.log('\nServicios por categoría:')
    console.table(resumen.map((f) => ({ categoria: f.categoria, total: Number(f.total) })))
} catch (error) {
    console.error(`FALLO ${error.code ?? 'ERROR'}: ${error.message}`)
    process.exitCode = 1
} finally {
    await db.end()
}
