# LifeArcade - Guía Rápida de Instalación (Mac Mini)

Instalación en 5 minutos. Para guía completa ver `INSTALL_MAC.md`.

---

## ⚡ Instalación Rápida

### Requisitos
- ✅ Docker Desktop corriendo
- ✅ Google Chrome instalado
- ✅ Terminal abierta

---

### Paso 1: Clonar Repositorio

```bash
cd ~
git clone https://github.com/brunobarran/SGx_GoogleEmployment.git LifeArcade
cd LifeArcade
```

---

### Paso 2: Construir Docker

```bash
docker compose build
```

⏱️ **Tiempo:** 1-3 minutos

---

### Paso 3: Probar Docker

```bash
docker compose up -d
curl http://localhost/installation.html
docker compose down
```

✅ **Debe devolver:** HTML (código 200)

---

### Paso 4: Construir App

```bash
chmod +x scripts/*.sh
./scripts/build.sh
```

✅ **Resultado:** Se crea `LifeArcade.app`

---

### Paso 5: Probar Localmente

```bash
open LifeArcade.app
```

✅ **Debe pasar:**
1. Terminal muestra "Starting Docker..."
2. Chrome se abre en pantalla completa
3. Muestra pantalla de bienvenida de LifeArcade

🔴 **Si falla:** Ver sección "Solución de Problemas" en `INSTALL_MAC.md`

---

### Paso 6: Instalar

```bash
sudo mv LifeArcade.app /Applications/
```

🔐 **Requiere:** Contraseña de administrador

---

### Paso 7: Abrir desde Finder

1. **Finder** → **Aplicaciones**
2. **Doble clic** en **LifeArcade**

⚠️ **Primera vez:** macOS puede pedir permiso (Gatekeeper)
- **System Settings** → **Privacy & Security** → **"Open Anyway"**

---

## 🎮 Uso

**Iniciar:**
```bash
open /Applications/LifeArcade.app
```

O doble clic en Finder.

**Cerrar:**
- Cerrar Chrome (Cmd+Q)
- Pregunta si detener Docker: `y` (sí) o `N` (no)

---

## 🔄 Auto-inicio al Encender (Opcional)

**System Settings** → **General** → **Login Items** → **+** → Agregar **LifeArcade**

---

## 🐛 Problemas Comunes

### Error: "Docker no está instalado"
```bash
# Solución: Iniciar Docker Desktop
open -a Docker
# Esperar que aparezca icono en barra superior
```

### Error: "Servidor no responde"
```bash
# Solución: Ver logs
cd ~/LifeArcade
docker compose logs
```

### Chrome no se abre
```bash
# Solución: Verificar que Chrome esté instalado
ls /Applications/Google\ Chrome.app
```

---

## 📁 Estructura Creada

```
~/LifeArcade/                        # Proyecto
├── scripts/
│   ├── launch.sh                    # Script de lanzamiento
│   └── build.sh                     # Constructor de app
├── LifeArcade.app/                  # App bundle (generado)
│   └── Contents/
│       ├── MacOS/launch.sh
│       └── Info.plist
└── docker-compose.yml               # Config de Docker

/Applications/LifeArcade.app         # Instalación final
```

---

## 🎯 Checklist Rápido

- [ ] Docker Desktop corriendo
- [ ] Repositorio clonado en `~/LifeArcade`
- [ ] `docker compose build` sin errores
- [ ] `curl http://localhost/installation.html` devuelve HTML
- [ ] `./scripts/build.sh` genera app
- [ ] Prueba local exitosa
- [ ] Instalado en `/Applications/`
- [ ] Doble clic funciona

---

## 📖 Documentación Completa

- **Instalación detallada:** `INSTALL_MAC.md`
- **Scripts:** `scripts/README.md`
- **Desarrollo:** `CLAUDE.md`

---

## ✅ ¡Listo!

**Para ejecutar:** Doble clic en **LifeArcade** en Aplicaciones

🎮 **¡Disfruta del arcade!**
