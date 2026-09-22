-- Crea un usuario de MySQL dedicado para la app (en vez de usar root sin contraseña).
-- Corre esto UNA vez, con un cliente de MySQL (MySQL Workbench, phpMyAdmin, o el comando `mysql`),
-- conectado como root (o quien tenga permisos de administrador).
--
-- 1) Cambia 'una_contraseña_segura_aqui' por una contraseña fuerte tuya (no la compartas conmigo).
-- 2) Ejecuta las 3 líneas siguientes:

CREATE USER IF NOT EXISTS 'sansley_app'@'localhost' IDENTIFIED BY 'una_contraseña_segura_aqui';
GRANT SELECT, INSERT, UPDATE, DELETE ON sansley_db.* TO 'sansley_app'@'localhost';
FLUSH PRIVILEGES;

-- 3) Después, en backend/.env, cambia estas dos líneas (no me muestres el resultado, solo edítalo tú):
--    DB_USER=sansley_app
--    DB_PASSWORD=la_misma_contraseña_que_pusiste_arriba
--
-- 4) Reinicia el backend (npm run dev) y prueba que el sitio y el panel admin sigan funcionando.
--
-- Notas:
-- - Este usuario SOLO puede leer, insertar, actualizar y borrar filas en la base sansley_db.
--   No puede crear ni borrar tablas, ni tocar otras bases de datos del servidor. Así, si algún día
--   se filtra la contraseña de la app, el daño posible es mucho menor que con la cuenta root.
-- - Si en algún momento necesitas correr de nuevo un script de migración (como agregarContable.js
--   o agregarEstadoProyectos.js) y usa ALTER TABLE, este usuario no tiene permiso para eso.
--   En ese caso corre el script una vez conectado como root, o agrégale el permiso ALTER así:
--   GRANT ALTER ON sansley_db.* TO 'sansley_app'@'localhost';