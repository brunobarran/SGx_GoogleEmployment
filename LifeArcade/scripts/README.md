# LifeArcade Kiosk Scripts

Scripts para crear y ejecutar LifeArcade en modo kiosk en Mac Mini M4.

## 📁 Archivos

### `launch.sh`
Script principal que:
1. Inicia contenedor Docker
2. Espera a que el servidor responda
3. Abre Chrome en modo kiosk (1200×1920)
4. Cleanup al cerrar

**Ubicación en App Bundle:** `LifeArcade.app/Contents/MacOS/launch.sh`

### `build.sh`
Construye el App Bundle de macOS (`LifeArcade.app`).

Crea la estructura:
```
LifeArcade.app/
├── Contents/
│   ├── MacOS/
│   │   └── launch.sh
│   └── Info.plist
```

## 🚀 Uso Rápido

```bash
# 1. Dar permisos
chmod +x scripts/*.sh

# 2. Construir app bundle
./scripts/build.sh

# 3. Probar localmente
open LifeArcade.app

# 4. Instalar
sudo mv LifeArcade.app /Applications/
```

## 📖 Documentación Completa

Ver `../INSTALL_MAC.md` para instrucciones detalladas de instalación.

## ✏️ Personalización

### Cambiar Ubicación del Proyecto

Editar `launch.sh` línea 9:
```bash
PROJECT_DIR="/Users/specialguestx/Documents/GitHub/SGx_GoogleEmployment/LifeArcade"
```

### Cambiar Puerto

Editar `launch.sh` línea 21 y `docker-compose.yml`.

### Cambiar Resolución

Editar `launch.sh` línea 27:
```bash
--window-size=1200,1920 \
```

## 🐛 Debug

Ver logs de ejecución:
```bash
# Durante ejecución, la terminal muestra:
Starting Docker container...
Waiting for server...
...
Server ready!
Launching Chrome in kiosk mode...
```

## 📝 Notas

- Scripts siguen principios KISS (Keep It Simple, Stupid)
- ~55 líneas de código total
- Sin dependencias externas (solo bash, docker, curl)
- Compatible con macOS 10.15+
