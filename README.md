UberClone — Aplicación Móvil de Transporte

"Tus viajes más parchados"
Proyecto Final — Desarrollo Móvil 2026-1
Tecnológico de Antioquia · Docente: Paula Andrea Muñoz Correa


📋 Descripción
Aplicación móvil multiplataforma inspirada en Uber, construida con React Native CLI para iOS y Android. Integra un ecosistema completo de APIs de Google y Firebase para ofrecer una experiencia de movilidad fluida y en tiempo real.

⚙️ Requisitos previos
Antes de clonar el proyecto, asegúrate de tener instalado:
HerramientaVersión recomendadaNode.jsv18 o superiorJDK17Android StudioFlamingo o superiorReact Native CLIúltima versiónGitcualquier versión reciente
Configurar variables de entorno (Windows)
Agrega estas variables en las Variables de entorno del sistema:
ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
Agrega al PATH:
%ANDROID_HOME%\emulator
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin

📥 Clonar el repositorio
bashgit clone https://github.com/JnJsCortVas23/uberClone.git
cd uberClone

📦 Instalar dependencias
bashnpm install

🔥 Configurar Firebase
El proyecto usa Firebase para autenticación y base de datos. Debes agregar el archivo de configuración:

Solicita el archivo google-services.json a tu compañero de equipo
Colócalo en la ruta: android/app/google-services.json


⚠️ Este archivo no está en el repositorio por seguridad. Sin él la app no compilará correctamente.


🌿 Crear tu rama de trabajo
Cada integrante debe trabajar en su propia rama:
bashgit checkout -b feature/munos
Por ejemplo:
bashgit checkout -b feature/munos
Confirma que estás en tu rama:
bashgit branch

▶️ Correr la app
Necesitas dos terminales abiertas al mismo tiempo:
Terminal 1 — Iniciar Metro (espera a que diga "Metro waiting on port 8081"):
bashnpx react-native start --reset-cache
Terminal 2 — Compilar e instalar en el dispositivo:
bashnpx react-native run-android

💡 Si usas dispositivo físico, activa la Depuración USB en Opciones de desarrollador y conecta el cable antes de correr el comando.

Verifica que el dispositivo es detectado:
bashadb devices

📁 Estructura del proyecto
uberClone/
├── android/
│   └── app/
│       └── google-services.json   ← va aquí (no está en el repo)
├── src/
│   ├── assets/                    # Imágenes, fuentes
│   ├── components/                # Componentes reutilizables
│   ├── constants/                 # Colores y constantes globales
│   ├── hooks/                     # Custom hooks
│   ├── navigation/                # Configuración de navegación
│   ├── redux/                     # Estado global
│   ├── screens/                   # Pantallas de la app
│   └── services/                  # Servicios (Firebase, APIs)
├── App.js
└── babel.config.js

🎨 Paleta de colores
ColorHexAzul principal#1A73E8Azul oscuro#0D47A1Blanco#FFFFFFFondo#F5F8FF

🛠️ Tecnologías utilizadas

React Native CLI — UI multiplataforma
Firebase Auth — Autenticación de usuarios
Firebase Firestore — Base de datos no relacional
Redux Toolkit — Estado global
React Navigation — Navegación entre pantallas (Stack + Bottom Tabs)
Google Maps API — Mapas y rutas
Google Places API — Búsqueda de destinos
Stripe / MercadoPago — Pasarela de pagos
Git — Control de versiones


📌 Flujo de trabajo Git
bash# Siempre trabaja en tu rama
git checkout feature/tu-nombre

# Guarde sus cambios
git add .
git commit -m "feat: descripción de lo que hiciste, pero en ingles maricon"
git push

# Cuando su parte esté mela, hace merge a main

⚠️ Nunca vaya a hacer push directo a main. Suba sus cambios a tu rama y revise bien.


📲 Pantallas implementadas

 Login
 Registro con validación de campos
 Perfil de usuario
 Solicitud de viaje
 Seguimiento en tiempo real
 Pasarela de pagos
 Historial de viajes

📞 Contacto
Cualquier duda sobre la configuración me habla al interno.