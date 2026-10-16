# FuncionarYo? · Paquete de publicación

Esta carpeta contiene el juego listo para colgar en internet como app instalable (PWA) y los archivos para convertirlo en app de Android con Capacitor.

```
funcionaryo/
├── index.html             el juego (con sonido, ajustes y modo sin conexión)
├── manifest.webmanifest   nombre, colores e iconos para "instalar"
├── sw.js                  permite jugar sin conexión
├── privacidad.html        borrador de política de privacidad (rellenar los [corchetes])
├── icons/                 iconos 192, 512, maskable, Apple y 1024 para las tiendas
└── capacitor/             capacitor.config.json y ads.js para la app de Android
```

## 1. Probarlo en tu ordenador

El modo sin conexión solo funciona servido desde una web (no abriendo el archivo con doble clic). Para probar en local, abre una terminal en esta carpeta y ejecuta:

```
python3 -m http.server 8000
```

Luego entra en http://localhost:8000 con Chrome.

## 2. Colgarlo como app instalable

**En tu web.** Sube la carpeta entera (sin `capacitor/` ni este LEEME) a una subcarpeta, por ejemplo `tudominio.com/funcionaryo/`. Tiene que ser con HTTPS. En Android, Chrome mostrará el botón “Instalar en el móvil” en el menú del juego. En iPhone, la gente lo instala desde Safari con Compartir y luego “Añadir a pantalla de inicio”.

**En itch.io.** Comprime en un zip el contenido de la carpeta (que `index.html` quede en la raíz del zip). Al crear el proyecto:

- Tipo: HTML.
- Marca “This file will be played in the browser”.
- Tamaño del marco: 360 × 640 y activa “Mobile friendly” y el botón de pantalla completa.
- Precio: “No payments” o “Paga lo que quieras”, con 0 € como mínimo.

**Cada vez que actualices el juego**, cambia `VERSION` en `sw.js` (v1 → v2…), o los móviles seguirán con la versión guardada.

**Textos.** Si los cambias con el editor del juego, exporta el JSON y pásamelo para dejarlos fijos en `index.html`.

## 3. Política de privacidad

Rellena los corchetes de `privacidad.html` y publícala en tu web: Google Play exige una URL pública. Cuando tengas la URL definitiva, el enlace “Política de privacidad” de Ajustes ya apunta a ella si está en la misma carpeta. Es un borrador: revísalo con un asesor antes de publicar en las tiendas.

## 4. App de Android con Capacitor

**Necesitas:** Node.js (versión LTS) y Android Studio. Ambos son gratuitos.

```
mkdir funcionaryo-app && cd funcionaryo-app
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/android
```

Copia `capacitor/capacitor.config.json` a esta carpeta y cambia `com.tudominio.funcionaryo` por un identificador tuyo. Usa tu dominio al revés: será permanente en Google Play. Crea una carpeta `www` y copia dentro `index.html`, `privacidad.html` e `icons/`. El `sw.js` y el `manifest` no hacen falta en la app.

```
npx cap add android
npx cap sync
```

**Icono de la app:** crea una carpeta `assets`, copia dentro `icons/icon-1024.png` con el nombre `icon.png` y ejecuta:

```
npm i -D @capacitor/assets
npx capacitor-assets generate --android
```

**Solo vertical:** en Android Studio abre `android/app/src/main/AndroidManifest.xml` y añade `android:screenOrientation="portrait"` a la etiqueta `<activity>`.

**Probar:** `npx cap open android` abre Android Studio. Conecta tu móvil con la depuración USB activada y pulsa ▶.

**Generar el archivo para Google Play:** en Android Studio, Build → Generate Signed App Bundle → Android App Bundle. Crea la clave de firma, guárdala en un sitio seguro y apunta la contraseña: sin ella no podrás actualizar la app. En cada actualización sube `versionCode` en `android/app/build.gradle`.

**Cada vez que cambies el juego:** copia el nuevo `index.html` a `www` y ejecuta `npx cap sync`.

## 5. Google Play

1. Crea la cuenta de desarrollador en play.google.com/console. Cuesta 25 $ una vez y te pedirá verificar tu identidad.
2. Crea la app y completa la ficha:
   - Descripción corta y larga.
   - Icono de 512 (`icons/icon-512.png`).
   - Gráfico destacado de 1024 × 500.
   - Al menos 2 capturas de pantalla.
3. Rellena los formularios:
   - Clasificación de contenido.
   - Público objetivo: mayores de edad, para no entrar en las normas de apps infantiles.
   - Seguridad de los datos.
   - "Contiene anuncios", cuando los actives.
   - URL de la política de privacidad.
4. **Prueba cerrada obligatoria:** sube el `.aab` a Pruebas → Prueba cerrada y consigue al menos 12 testers que se apunten con el enlace y sigan dentro 14 días seguidos. Invita a más de 12 por si alguien se da de baja, porque si bajas de 12 el contador vuelve a empezar.
5. Pasados los 14 días aparece “Solicitar acceso a producción”. Tras la revisión, ya puedes publicar.

## 6. Anuncios con AdMob (cuando quieras activarlos)

El juego ya tiene los huecos preparados y en la web no hacen nada:

- **Otro café:** al quemarte en la jornada, un botón opcional para ver un anuncio y seguir con ánimo Cansado. Una vez por partida.
- **Intersticial:** un anuncio entre partidas, cada tres jornadas a partir de la cuarta. Nunca durante la partida ni en el tutorial.

Pasos:

1. Crea una cuenta en admob.google.com, añade la app y crea dos bloques de anuncios, uno bonificado y otro intersticial.
2. En AdMob, ve a Privacidad y mensajes y crea el mensaje de consentimiento RGPD para Europa.
3. Instala el plugin:
   ```
   npm i @capacitor-community/admob
   npx cap sync
   ```
4. En `AndroidManifest.xml`, dentro de `<application>`, añade tu ID de aplicación de AdMob:
   ```
   <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-XXXXXXXX~YYYYYYYY"/>
   ```
5. Copia `capacitor/ads.js` a `www/` y añade esta línea en `www/index.html`, justo antes de `</head>`:
   ```
   <script src="ads.js" defer></script>
   ```
6. Prueba con los IDs de prueba que ya trae `ads.js`. Para la versión final, pon tus IDs reales y `TESTING = false`.
7. Sube un archivo `app-ads.txt` a la raíz de tu web con la línea que te da AdMob.

Revisa los nombres de los métodos en el README del plugin que instales, porque cambian entre versiones.

## 7. Antes de cobrar

- Consulta con tu unidad de personal si la actividad es compatible con tu puesto y guarda la respuesta por escrito.
- Habla con un gestor sobre el alta en Hacienda y, si procede, en autónomos antes del primer pago de Google.
