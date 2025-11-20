# Verificación de Configuración - LifeArcade

Guía rápida para verificar que todo está correctamente configurado.

---

## ✅ Verificación en Mac Mini

### 1. Verificar Ruta del Proyecto

```bash
# La ruta correcta debe ser:
cd /Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade

# Si funciona, estás en la ubicación correcta
pwd
# Debe mostrar: /Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade
```

---

### 2. Verificar Script de Lanzamiento

```bash
# Ver la configuración del PROJECT_DIR
grep "PROJECT_DIR=" scripts/launch.sh

# Debe mostrar:
# PROJECT_DIR="/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade"
```

**Si muestra una ruta diferente:**
```bash
# Editar el archivo
nano scripts/launch.sh

# Cambiar línea 9 a:
PROJECT_DIR="/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade"

# Guardar: Ctrl+O, Enter, Ctrl+X
```

---

### 3. Verificar Permisos de Scripts

```bash
# Ver permisos
ls -la scripts/

# Debe mostrar algo como:
# -rwxr-xr-x  1 specialguestx  staff  build.sh
# -rwxr-xr-x  1 specialguestx  staff  launch.sh

# Si NO tienen 'x' (ejecutable), dar permisos:
chmod +x scripts/*.sh
```

---

### 4. Verificar Docker

```bash
# Docker instalado
docker --version
# Debe mostrar: Docker version 24.x.x o superior

# Docker corriendo
docker info
# Debe mostrar información del sistema, NO error

# Si da error "Cannot connect to Docker daemon":
open -a Docker
# Esperar ~30 segundos hasta que aparezca el icono en la barra superior
```

---

### 5. Verificar Chrome

```bash
# Chrome instalado
ls -la /Applications/Google\ Chrome.app

# Debe mostrar:
# drwxr-xr-x  3 specialguestx  admin  96 Nov 20 12:00 Google Chrome.app
```

---

### 6. Verificar Estructura del Proyecto

```bash
# Verificar archivos esenciales
ls -1 | grep -E "(Dockerfile|docker-compose.yml|installation.html)"

# Debe mostrar:
# Dockerfile
# docker-compose.yml
# installation.html

# Verificar scripts
ls scripts/

# Debe mostrar:
# build.sh
# launch.sh
# README.md
```

---

## 🧪 Prueba Completa del Sistema

### Test 1: Build de Docker

```bash
# Construir imagen
docker compose build

# Verificar que se creó
docker images | grep lifearcade

# Debe mostrar algo como:
# lifearcade-kiosk  latest  abc123def456  2 minutes ago  250MB
```

**Tiempo esperado:** 1-3 minutos (primera vez)

---

### Test 2: Servidor Docker

```bash
# Iniciar contenedor
docker compose up -d

# Verificar que está corriendo
docker ps

# Debe mostrar:
# CONTAINER ID  IMAGE            PORTS               NAMES
# abc123def456  lifearcade...    0.0.0.0:80->4173    lifearcade-kiosk

# Probar el servidor
curl -I http://localhost/installation.html

# Debe mostrar:
# HTTP/1.1 200 OK
# Content-Type: text/html

# Ver logs (opcional)
docker compose logs --tail=20

# Detener
docker compose down
```

---

### Test 3: App Bundle

```bash
# Construir app
./scripts/build.sh

# Verificar que se creó
ls -la LifeArcade.app/

# Debe mostrar:
# drwxr-xr-x  3 specialguestx  staff   96 Nov 20 ...  .
# drwxr-xr-x  ... specialguestx  staff  ... Nov 20 ...  ..
# drwxr-xr-x  4 specialguestx  staff  128 Nov 20 ...  Contents

# Verificar estructura interna
ls -R LifeArcade.app/

# Debe mostrar:
# LifeArcade.app/Contents:
# Info.plist  MacOS
#
# LifeArcade.app/Contents/MacOS:
# launch.sh
```

---

### Test 4: Ejecución Local

```bash
# Abrir app (ANTES de instalar en /Applications)
open LifeArcade.app
```

**Qué debe pasar:**
1. ✅ Terminal muestra "Starting Docker container..."
2. ✅ Muestra "Waiting for server..." con puntos (...)
3. ✅ Muestra "Server ready!"
4. ✅ Muestra "Launching Chrome in kiosk mode..."
5. ✅ Chrome se abre en pantalla completa
6. ✅ Muestra la pantalla de bienvenida de LifeArcade
7. ✅ Al cerrar Chrome, pregunta si detener Docker

**Si falla en algún paso:**
- Ver logs: `docker compose logs`
- Verificar ruta en `launch.sh`
- Verificar que Docker esté corriendo

---

## 🔧 Troubleshooting Rápido

### Error: "cd: no such file or directory"

**Causa:** Ruta incorrecta en `launch.sh`

**Solución:**
```bash
# Editar launch.sh
nano scripts/launch.sh

# Cambiar línea 9 a la ruta correcta
# Guardar y probar de nuevo
```

---

### Error: "docker: command not found"

**Causa:** Docker no instalado o no en PATH

**Solución:**
```bash
# Instalar Docker Desktop
# https://www.docker.com/products/docker-desktop

# O verificar PATH
echo $PATH | grep -i docker
```

---

### Error: "Cannot connect to Docker daemon"

**Causa:** Docker Desktop no está corriendo

**Solución:**
```bash
# Abrir Docker Desktop
open -a Docker

# Esperar 30 segundos
sleep 30

# Verificar
docker info
```

---

### Chrome no abre en kiosk

**Causa 1:** Chrome no instalado

**Solución:**
```bash
# Instalar desde:
# https://www.google.com/chrome/
```

**Causa 2:** Ruta de Chrome incorrecta

**Solución:**
```bash
# Verificar ruta real
ls -la /Applications/ | grep -i chrome

# Si está en otra ubicación, editar launch.sh línea 10
```

---

## ✅ Checklist Final

- [ ] Proyecto en `/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade`
- [ ] `PROJECT_DIR` en `launch.sh` tiene la ruta correcta
- [ ] Scripts tienen permisos de ejecución (`chmod +x`)
- [ ] Docker Desktop instalado y corriendo
- [ ] Google Chrome instalado
- [ ] `docker compose build` completa sin errores
- [ ] `docker compose up -d` inicia correctamente
- [ ] `curl http://localhost/installation.html` devuelve HTTP 200
- [ ] `./scripts/build.sh` genera `LifeArcade.app`
- [ ] `open LifeArcade.app` abre Chrome en kiosk
- [ ] Aplicación muestra pantalla de bienvenida correctamente

---

## 📞 Si Todo Falla

1. **Detener todo:**
   ```bash
   docker compose down
   pkill -f "Google Chrome"
   ```

2. **Limpiar y reiniciar:**
   ```bash
   docker system prune -f
   docker compose build --no-cache
   ```

3. **Verificar logs:**
   ```bash
   docker compose logs -f
   ```

4. **Reiniciar Docker Desktop:**
   - Quit Docker Desktop
   - Abrir Docker Desktop de nuevo
   - Esperar 1 minuto

5. **Intentar de nuevo:**
   ```bash
   docker compose up -d
   open LifeArcade.app
   ```

---

## ✅ Todo Correcto

Si todos los tests pasan, el sistema está listo para:

1. **Instalar en /Applications:**
   ```bash
   sudo mv LifeArcade.app /Applications/
   ```

2. **Configurar auto-inicio** (ver `INSTALL_MAC.md`)

3. **¡Usar LifeArcade!**
   - Doble clic en Aplicaciones → LifeArcade
