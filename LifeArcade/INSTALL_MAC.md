# LifeArcade - Instrucciones de Instalación para Mac Mini M4

Guía completa para instalar y configurar LifeArcade en modo kiosk en Mac Mini M4.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### 1. Docker Desktop

```bash
# Verificar si Docker está instalado
docker --version

# Si no está instalado, descargar desde:
# https://www.docker.com/products/docker-desktop
```

**Importante:** Docker Desktop debe estar corriendo antes de ejecutar LifeArcade.

### 2. Google Chrome

```bash
# Verificar si Chrome está instalado
ls /Applications/Google\ Chrome.app

# Si no está instalado, descargar desde:
# https://www.google.com/chrome/
```

### 3. Git (para clonar el repositorio)

```bash
# Verificar si Git está instalado
git --version

# Si no está instalado:
xcode-select --install
```

---

## 🚀 Instalación Paso a Paso

### PASO 1: Clonar el Repositorio

```bash
# Navegar al directorio de GitHub
cd ~/Documents/GitHub

# Clonar el repositorio
git clone https://github.com/brunobarran/SGx_GoogleEmployment.git

# Entrar al subdirectorio LifeArcade
cd SGx_GoogleEmployment/LifeArcade
```

**Importante:** El proyecto está configurado para `/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade`.

---

### PASO 2: Construir la Imagen Docker

```bash
# Desde el directorio del proyecto, construir la imagen
docker compose build
```

**Salida esperada:**
```
[+] Building 45.2s (15/15) FINISHED
 => [builder 1/6] FROM docker.io/library/node:22-alpine
 => [builder 6/6] RUN npm run build
 => [production 1/3] COPY package*.json ./
 => exporting to image
 => => naming to docker.io/library/lifearcade-kiosk
```

**Tiempo estimado:** 1-3 minutos (primera vez)

---

### PASO 3: Probar el Contenedor Docker

```bash
# Iniciar el contenedor
docker compose up -d

# Verificar que está corriendo
docker ps

# Debería mostrar:
# CONTAINER ID   IMAGE           PORTS                NAMES
# abc123def456   lifearcade...   0.0.0.0:80->4173/tcp lifearcade-kiosk

# Probar en el navegador
curl http://localhost/installation.html

# Debería devolver HTML (código 200)

# Ver logs (opcional)
docker compose logs -f

# Detener el contenedor
docker compose down
```

---

### PASO 4: Dar Permisos a los Scripts

```bash
# Desde ~/LifeArcade
chmod +x scripts/launch.sh
chmod +x scripts/build.sh
```

---

### PASO 5: Construir el App Bundle

```bash
# Ejecutar el script de build
./scripts/build.sh
```

**Salida esperada:**
```
🔨 Building LifeArcade.app...
✅ Built: LifeArcade.app

📦 To install on Mac Mini:
   sudo mv LifeArcade.app /Applications/

🧪 To test locally:
   open LifeArcade.app
```

**Resultado:** Se crea la carpeta `LifeArcade.app` en el directorio actual.

---

### PASO 6: Probar Localmente (Opcional pero Recomendado)

```bash
# Abrir la app SIN instalar
open LifeArcade.app
```

**Qué debe pasar:**
1. Terminal muestra "Starting Docker container..."
2. Espera ~5-10 segundos
3. Chrome se abre en pantalla completa (modo kiosk)
4. Muestra la instalación de LifeArcade (pantalla de bienvenida)
5. Al cerrar Chrome, pregunta si detener Docker

**Si algo falla:**
- Verificar que Docker Desktop esté corriendo
- Verificar logs: `docker compose logs`
- Revisar que el proyecto esté en la ruta correcta

---

### PASO 7: Instalar en /Applications

```bash
# Mover la app a /Applications (requiere contraseña)
sudo mv LifeArcade.app /Applications/

# Verificar instalación
ls -la /Applications/LifeArcade.app
```

---

### PASO 8: Primera Ejecución desde Finder

1. Abrir **Finder**
2. Ir a **Aplicaciones**
3. Buscar **LifeArcade**
4. **Doble clic** en LifeArcade.app

**macOS puede mostrar alerta de seguridad (Gatekeeper):**

Si aparece: *"LifeArcade.app no se puede abrir porque proviene de un desarrollador no identificado"*

**Solución:**
1. Ir a **System Settings** → **Privacy & Security**
2. Scroll hasta abajo
3. Buscar mensaje sobre LifeArcade bloqueado
4. Click en **"Open Anyway"**
5. Confirmar con contraseña
6. Intentar abrir LifeArcade de nuevo

**Esto solo es necesario la primera vez.**

---

### PASO 9: Configurar Auto-inicio (Opcional)

Para que LifeArcade se ejecute automáticamente al encender el Mac:

#### Método 1: Login Items (Recomendado - GUI)

1. Ir a **System Settings**
2. Click en **General**
3. Click en **Login Items**
4. Click en el botón **"+"** (abajo a la izquierda)
5. Navegar a **Applications** → **LifeArcade**
6. Click **"Add"**
7. Verificar que aparezca en la lista con ✓

**Resultado:** LifeArcade se abrirá automáticamente al iniciar sesión.

#### Método 2: LaunchAgent (Avanzado - Terminal)

```bash
# Crear archivo LaunchAgent
cat > ~/Library/LaunchAgents/com.google.lifearcade.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.google.lifearcade</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/open</string>
        <string>/Applications/LifeArcade.app</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
EOF

# Cargar el LaunchAgent
launchctl load ~/Library/LaunchAgents/com.google.lifearcade.plist

# Para desactivar auto-inicio:
# launchctl unload ~/Library/LaunchAgents/com.google.lifearcade.plist
```

---

## 🎮 Uso Diario

### Iniciar LifeArcade

**Opción 1: Desde Finder**
- Doble clic en **Aplicaciones** → **LifeArcade**

**Opción 2: Desde Terminal**
```bash
open /Applications/LifeArcade.app
```

**Opción 3: Auto-inicio**
- Si configuraste Login Items, se inicia solo al encender

---

### Cerrar LifeArcade

1. Presionar **Cmd + Q** o cerrar ventana de Chrome
2. Terminal preguntará: `Stop Docker container? (y/N):`
   - **y** = Detiene el contenedor (libera puerto 80)
   - **N** = Deja el contenedor corriendo (inicio más rápido siguiente vez)

---

### Detener Docker Manualmente

```bash
# Si dejaste el contenedor corriendo
cd ~/LifeArcade
docker compose down
```

---

## 🔧 Mantenimiento

### Actualizar el Código

```bash
# Desde el directorio del proyecto
cd ~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade
git pull origin main

# Reconstruir imagen Docker
docker compose down
docker compose build

# Reconstruir app bundle (si cambió launch.sh)
./scripts/build.sh
sudo mv LifeArcade.app /Applications/
```

---

### Ver Logs

```bash
# Logs del contenedor Docker
cd ~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade
docker compose logs -f

# Logs de Chrome (si lo lanzaste desde Terminal)
cat /tmp/chrome-kiosk.log
```

---

### Reiniciar Todo

```bash
# Detener contenedor
cd ~/Documents/GitHub/SGx_GoogleEmployment/LifeArcade
docker compose down

# Limpiar build de Docker
docker compose build --no-cache

# Reiniciar Docker Desktop (si es necesario)
# Quit Docker Desktop desde el menú
# Volver a abrir Docker Desktop

# Reconstruir e instalar
./scripts/build.sh
sudo mv LifeArcade.app /Applications/
```

---

## ❌ Solución de Problemas

### Problema: "Docker no está instalado"

**Síntoma:** Al abrir LifeArcade aparece alerta de error.

**Solución:**
1. Instalar Docker Desktop
2. Abrir Docker Desktop (debe estar corriendo)
3. Verificar: `docker info`

---

### Problema: "Servidor no respondió a tiempo"

**Síntoma:** Chrome no se abre, script se queda esperando.

**Causas posibles:**
1. Puerto 80 ocupado
2. Build de Docker falló
3. Código tiene errores

**Solución:**
```bash
# Verificar puerto
lsof -i :80

# Si hay otro proceso, detenerlo o cambiar puerto en docker-compose.yml

# Ver logs de Docker
docker compose logs

# Reconstruir
docker compose down
docker compose build
docker compose up -d
```

---

### Problema: Chrome se abre pero pantalla en blanco

**Síntoma:** Chrome en kiosk pero no muestra contenido.

**Solución:**
```bash
# Verificar que servidor responde
curl http://localhost/installation.html

# Debería devolver HTML, no error 404

# Si da 404, verificar build de Vite
cd ~/LifeArcade
docker compose down
docker compose build
docker compose up -d
```

---

### Problema: Resolución incorrecta (no 1200×1920)

**Síntoma:** Juego se ve estirado o no en portrait.

**Solución:**

La resolución se configura con `--window-size=1200,1920` en `launch.sh`.

Si el monitor físico NO es 1200×1920:

1. Identificar resolución del monitor:
   - System Settings → Displays → Resolution

2. Editar `scripts/launch.sh`:
```bash
# Cambiar esta línea:
--window-size=1200,1920 \

# Por la resolución de tu monitor (ejemplo para 1080×1920):
--window-size=1080,1920 \
```

3. Reconstruir app:
```bash
./scripts/build.sh
sudo mv LifeArcade.app /Applications/
```

---

### Problema: Auto-inicio no funciona

**Síntoma:** Mac reinicia pero LifeArcade no se abre.

**Solución:**
1. Verificar en **System Settings** → **Login Items**
2. LifeArcade debe estar en la lista con ✓
3. Si no está, agregarlo de nuevo
4. Reiniciar Mac para probar

**Si sigue sin funcionar:**
- Docker Desktop también debe estar en Login Items
- Agregar primero Docker Desktop, luego LifeArcade

---

## 📊 Especificaciones del Sistema

### Configuración Óptima para Mac Mini M4

| Componente | Especificación |
|------------|----------------|
| **Monitor** | 1200×1920 (portrait/vertical) |
| **Memoria RAM** | Mínimo 8GB |
| **Docker Resources** | 2GB RAM, 2 CPUs |
| **Disco** | Mínimo 5GB libres |
| **macOS** | 10.15 Catalina o superior |
| **Chrome** | Versión más reciente |

---

### Configurar Recursos de Docker

Si experimentas lentitud:

1. Abrir **Docker Desktop**
2. Settings → Resources
3. Ajustar:
   - **CPUs:** 2-4 (dependiendo de tu Mac)
   - **Memory:** 2-4 GB
   - **Swap:** 1 GB
4. Click **Apply & Restart**

---

## 🎯 Checklist de Instalación Completa

- [ ] Docker Desktop instalado y corriendo
- [ ] Google Chrome instalado
- [ ] Repositorio clonado en `/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade`
- [ ] `docker compose build` completado sin errores
- [ ] `docker compose up -d` inicia correctamente
- [ ] `curl http://localhost/installation.html` devuelve HTML
- [ ] Scripts tienen permisos de ejecución (`chmod +x`)
- [ ] `./scripts/build.sh` genera `LifeArcade.app`
- [ ] Prueba local exitosa (`open LifeArcade.app`)
- [ ] App instalada en `/Applications/`
- [ ] Primera ejecución exitosa (bypass Gatekeeper)
- [ ] Resolución correcta (1200×1920)
- [ ] Auto-inicio configurado (opcional)
- [ ] Juegos funcionan correctamente

---

## 📞 Soporte

Si encuentras problemas no cubiertos en esta guía:

1. Revisar logs:
   ```bash
   docker compose logs -f
   ```

2. Verificar estado de Docker:
   ```bash
   docker ps
   docker images
   ```

3. Crear issue en GitHub con:
   - Descripción del problema
   - Logs de Docker
   - Versión de macOS
   - Modelo de Mac

---

## 🎨 Personalización (Avanzado)

### Cambiar Puerto

Si el puerto 80 está ocupado:

1. Editar `docker-compose.yml`:
```yaml
ports:
  - "8080:4173"  # Cambiar 80 por 8080
```

2. Editar `scripts/launch.sh`:
```bash
# Cambiar:
http://localhost/installation.html
# Por:
http://localhost:8080/installation.html
```

3. Reconstruir:
```bash
docker compose down
docker compose build
./scripts/build.sh
sudo mv LifeArcade.app /Applications/
```

---

### Agregar Icono Personalizado

1. Crear icono `.icns` (1024×1024px)
2. Colocar en `LifeArcade.app/Contents/Resources/AppIcon.icns`
3. El Finder lo detectará automáticamente

**Herramientas para crear .icns:**
- https://cloudconvert.com/png-to-icns
- https://www.img2icnsconverter.com/

---

## ✅ ¡Listo!

LifeArcade ahora está instalado y listo para usar en modo kiosk.

**Para iniciar:** Doble clic en **LifeArcade** en Aplicaciones.

**Disfruta del arcade! 🎮**
