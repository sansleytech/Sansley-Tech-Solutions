import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import sharp from 'sharp'

// backend/uploads (este archivo vive en backend/src)
export const RAIZ_UPLOADS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads')

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 10 // límite de la foto ORIGINAL antes de comprimir (la que subes desde el celular, por ejemplo)
const ANCHO_MAXIMO = 1200 // px — de sobra para verse nítida en cualquier tarjeta o banner del sitio
const CALIDAD_JPEG = 82

// Middleware que recibe UNA imagen en el campo indicado, la redimensiona/comprime y la guarda en uploads/<carpeta>.
// Sin importar qué tan pesada llegue la foto original (una foto de celular puede pesar varios MB), lo que se
// guarda en el servidor siempre queda liviano, para que el sitio cargue rápido y no sature el navegador.
export function subirUna(carpeta, campo = 'foto') {
    const destino = path.join(RAIZ_UPLOADS, carpeta)
    fs.mkdirSync(destino, { recursive: true })

    // Recibimos el archivo en memoria (no directo a disco) para poder procesarlo con sharp antes de guardarlo
    const subir = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: MAX_MB * 1024 * 1024 },
        fileFilter: (req, archivo, cb) => {
            if (TIPOS_PERMITIDOS.includes(archivo.mimetype)) cb(null, true)
            else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'))
        },
    }).single(campo)

    return (req, res, next) => {
        subir(req, res, async (error) => {
            if (error) {
                const mensaje =
                    error.code === 'LIMIT_FILE_SIZE'
                        ? `La imagen supera los ${MAX_MB} MB`
                        : error.message
                return res.status(400).json({ mensaje })
            }
            if (!req.file) return next()

            try {
                // Convertimos todo a JPEG: reduce el peso muchísimo y se ve igual de bien para fotos y banners.
                // "rotate()" respeta la orientación real de fotos tomadas con el celular (evita que salgan giradas).
                // "withoutEnlargement" evita agrandar una imagen que ya sea más pequeña que el ancho máximo.
                const nombreArchivo = `${crypto.randomUUID()}.jpg`
                const buffer = await sharp(req.file.buffer)
                    .rotate()
                    .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
                    .jpeg({ quality: CALIDAD_JPEG, mozjpeg: true })
                    .toBuffer()

                fs.writeFileSync(path.join(destino, nombreArchivo), buffer)
                req.file.filename = nombreArchivo
                next()
            } catch {
                res.status(400).json({ mensaje: 'No pudimos procesar la imagen. Intenta con otra foto.' })
            }
        })
    }
}

// Igual que subirUna, pero para varias imágenes a la vez (por ejemplo, la galería de un proyecto).
// Cada imagen se procesa (rota, redimensiona y comprime) exactamente igual, una por una.
export function subirVarias(carpeta, campo = 'imagenes', maximo = 12) {
    const destino = path.join(RAIZ_UPLOADS, carpeta)
    fs.mkdirSync(destino, { recursive: true })

    const subir = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: MAX_MB * 1024 * 1024 },
        fileFilter: (req, archivo, cb) => {
            if (TIPOS_PERMITIDOS.includes(archivo.mimetype)) cb(null, true)
            else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'))
        },
    }).array(campo, maximo)

    return (req, res, next) => {
        subir(req, res, async (error) => {
            if (error) {
                const mensaje =
                    error.code === 'LIMIT_FILE_SIZE'
                        ? `Cada imagen debe pesar como máximo ${MAX_MB} MB`
                        : error.code === 'LIMIT_UNEXPECTED_FILE'
                          ? `Puedes subir máximo ${maximo} imágenes a la vez`
                          : error.message
                return res.status(400).json({ mensaje })
            }
            if (!req.files || req.files.length === 0) return next()

            try {
                for (const archivo of req.files) {
                    const nombreArchivo = `${crypto.randomUUID()}.jpg`
                    const buffer = await sharp(archivo.buffer)
                        .rotate()
                        .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
                        .jpeg({ quality: CALIDAD_JPEG, mozjpeg: true })
                        .toBuffer()

                    fs.writeFileSync(path.join(destino, nombreArchivo), buffer)
                    archivo.filename = nombreArchivo
                }
                next()
            } catch {
                res.status(400).json({ mensaje: 'No pudimos procesar alguna de las imágenes. Intenta de nuevo.' })
            }
        })
    }
}

// Ruta que se guarda en la base de datos y que el navegador usa para pedir la imagen
export function rutaPublica(carpeta, nombreArchivo) {
    return `/uploads/${carpeta}/${nombreArchivo}`
}

// Borra del disco una imagen subida. Ignora rutas que no sean de /uploads
export function borrarImagen(ruta) {
    if (!ruta?.startsWith('/uploads/')) return
    const archivo = path.join(RAIZ_UPLOADS, ruta.replace('/uploads/', ''))
    if (!archivo.startsWith(RAIZ_UPLOADS)) return
    fs.rm(archivo, { force: true }, () => {})
}