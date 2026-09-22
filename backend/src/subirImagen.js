import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import multer from 'multer'

// backend/uploads (este archivo vive en backend/src)
export const RAIZ_UPLOADS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads')

const EXTENSIONES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }
const MAX_MB = 3

// Middleware que recibe UNA imagen en el campo indicado y la guarda en uploads/<carpeta>
export function subirUna(carpeta, campo = 'foto') {
    const destino = path.join(RAIZ_UPLOADS, carpeta)
    fs.mkdirSync(destino, { recursive: true })

    const subir = multer({
        storage: multer.diskStorage({
            destination: destino,
            filename: (req, archivo, cb) =>
                cb(null, crypto.randomUUID() + EXTENSIONES[archivo.mimetype]),
        }),
        limits: { fileSize: MAX_MB * 1024 * 1024 },
        fileFilter: (req, archivo, cb) => {
            if (EXTENSIONES[archivo.mimetype]) cb(null, true)
            else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'))
        },
    }).single(campo)

    // Si la subida falla (muy pesada, formato no permitido) respondemos 400 con un mensaje claro
    return (req, res, next) => {
        subir(req, res, (error) => {
            if (!error) return next()
            const mensaje =
                error.code === 'LIMIT_FILE_SIZE'
                    ? `La imagen supera los ${MAX_MB} MB`
                    : error.message
            res.status(400).json({ mensaje })
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