# UberClone — Aplicación Móvil de Transporte

> **"Tus viajes más parchados"**  
> Proyecto Final — Desarrollo Móvil 2026-1  
> Tecnológico de Antioquia · Docente: Paula Andrea Muñoz Correa

---

## 📋 Descripción

Aplicación móvil multiplataforma inspirada en Uber, construida con **React Native CLI** para iOS y Android. Integra un ecosistema completo de APIs de Google y Firebase para ofrecer una experiencia de movilidad fluida y en tiempo real.

---

## ⚙️ Requisitos previos

Antes de clonar el proyecto, asegúrate de tener instalado:
| Herramienta | Versión recomendada |
|---|---|
| Node.js | v18 o superior |
| JDK | 17 |
| Android Studio | Flamingo o superior |
| React Native CLI | última versión |
| Git | cualquier versión reciente |

### Configurar variables de entorno (Windows)

Agrega estas variables en las **Variables de entorno del sistema**:

```
ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

Agrega al **PATH**:
```
%ANDROID_HOME%\emulator
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

---

## 📥 Clonar el repositorio

```bash
git clone https://github.com/JnJsCortVas23/uberClone.git
cd uberClone
```

---

## 📦 Instalar dependencias

Ejecuta estos comandos en orden:

**1. Dependencias principales de navegación y estado:**
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-vector-icons redux @reduxjs/toolkit react-redux
```

**2. Firebase (Auth + Firestore):**
```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

**3. Google Maps y Places:**
```bash
npm install react-native-maps react-native-google-places-autocomplete
```

**4. Geolocalización:**
```bash
npm install @react-native-community/geolocation
```

**5. Permisos en Android:**
```bash
npm install react-native-permissions
```

---

## 🔥 Configurar Firebase

El proyecto usa Firebase para autenticación y base de datos. Debes agregar el archivo de configuración:

1. Solicita el archivo `google-services.json` a tu compañero de equipo
2. Colócalo en la ruta: `android/app/google-services.json`

> ⚠️ Este archivo **no está en el repositorio** por seguridad. Sin él la app no compilará correctamente.

---

## 🗺️ Configurar Google Maps API

El proyecto usa Google Maps, Places y Directions API. Necesitas agregar la API Key:

1. Solicita la API Key al equipo
2. Abre `android/app/src/main/AndroidManifest.xml`
3. Busca esta línea y reemplaza el valor:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="TU_API_KEY_AQUI"/>
```

4. Abre `src/screens/TripRequestScreen.js` y reemplaza:

```js
const GOOGLE_API_KEY = 'TU_API_KEY_AQUI';
```

> ⚠️ Sin la API Key el mapa y el buscador de destinos no funcionarán.

---

## 🌿 Crear tu rama de trabajo

Cada integrante debe trabajar en su propia rama:

```bash
git checkout -b feature/tu-nombre
```

Confirma que estás en tu rama:
```bash
git branch
```

---

## ▶️ Correr la app

Necesitas **dos terminales abiertas al mismo tiempo**:

**Terminal 1 — Iniciar Metro (espera a que diga "Metro waiting on port 8081"):**
```bash
npx react-native start --reset-cache
```

**Terminal 2 — Compilar e instalar en el dispositivo:**
```bash
npx react-native run-android
```

> 💡 Si usas dispositivo físico, activa la **Depuración USB** en Opciones de desarrollador y conecta el cable antes de correr el comando.

Verifica que el dispositivo es detectado:
```bash
adb devices
```

---

## 📁 Estructura del proyecto

```
uberClone/
├── android/
│   └── app/
│       ├── google-services.json        ← va aquí (no está en el repo)
│       └── src/main/AndroidManifest.xml  ← aquí va la API Key de Google
├── src/
│   ├── constants/
│   │   ├── colors.js              # Paleta de colores de la app
│   │   └── index.js
│   ├── navigation/
│   │   └── AppNavigator.js        # Stack + Bottom Tab Navigator
│   ├── screens/
│   │   ├── LoginScreen.js         # ✅ Login con validación
│   │   ├── RegisterScreen.js      # ✅ Registro con validación
│   │   ├── HomeScreen.js          # ✅ Pantalla principal
│   │   ├── ProfileScreen.js       # ✅ Perfil editable
│   │   ├── TripRequestScreen.js   # ✅ Mapa + solicitud de viaje + tarifas dinámicas
│   │   └── TripHistoryScreen.js   # 🔜 Historial de viajes
│   └── services/
│       └── authService.js         # Firebase Auth + Firestore
├── App.js
└── babel.config.js
```

---

## 🎨 Paleta de colores

| Color | Hex |
|---|---|
| Azul principal | `#1A73E8` |
| Azul oscuro | `#0D47A1` |
| Blanco | `#FFFFFF` |
| Fondo | `#F5F8FF` |

---

## 🛠️ Tecnologías utilizadas

- **React Native CLI** — UI multiplataforma
- **Firebase Auth** — Autenticación de usuarios
- **Firebase Firestore** — Base de datos no relacional
- **Redux Toolkit** — Estado global
- **React Navigation** — Navegación entre pantallas (Stack + Bottom Tabs)
- **Google Maps API** — Mapas y rutas
- **Google Places API** — Búsqueda de destinos con Autocomplete
- **Google Directions API** — Cálculo y dibujado de rutas
- **Google Distance Matrix API** — Estimación de tiempo y tarifas dinámicas
- **Stripe / MercadoPago** — Pasarela de pagos (próximamente)
- **Git** — Control de versiones

---

## 💰 Lógica de tarifas dinámicas

Los precios se calculan en tiempo real según la distancia de la ruta:

| Categoría | Tarifa base | Por km |
|---|---|---|
| Económico | $3.500 | $1.200 |
| XL | $5.000 | $1.800 |
| Premium | $8.000 | $2.500 |

---

## 📌 Flujo de trabajo Git

```bash
# Siempre trabaja en tu rama
git checkout feature/Nombre_Rama #Normalmete su nombre

# Guarda tus cambios
git add .
git commit -m "feat: descripción de lo que hiciste, pero en inglés"
git push

# Cuando su parte esté lista, avise para subirlo al main
```

> ⚠️ **No haga push directo a `main`**. Suba sus cambios a su rama.

---

## 📲 Pantallas implementadas

- [x] Login con validación de campos
- [x] Registro con validación de campos
- [x] Perfil de usuario editable (sincronizado con Firestore)
- [x] Solicitud de viaje con Google Maps + Places Autocomplete + rutas
- [x] Tarifas dinámicas según distancia real
- [ ] Seguimiento en tiempo real
- [ ] Pasarela de pagos
- [ ] Historial de viajes
- [ ] Cambiar el README.md por una documentacion actulalizada y en inglés

---

## 👥 Equipo

| Nombre | Rama |
|---|---|
| Cortes | `feature/Cortes` |
| Muñoz | `feature/munos` |
