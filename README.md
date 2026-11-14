# DietaSuper UK 🛒🇬🇧

Web app y PWA diseñada para planificar la compra semanal en el Reino Unido optimizando tanto el bolsillo como la nutrición. Permite comparar precios reales en libras (£) y perfiles nutricionales (calorías, proteínas, carbohidratos y grasas) entre las principales cadenas de supermercados británicas: **Aldi, Lidl, Asda y Morrisons UK**, con búsqueda integrada en vivo sobre la base de datos de **Open Food Facts UK**.

---

## 📱 Acceso móvil y enlace directo

La aplicación está desplegada en GitHub Pages lista para usar desde cualquier navegador o añadir a la pantalla de inicio:

👉 **[https://adriansg25.github.io/dieta-super/](https://adriansg25.github.io/dieta-super/)**

---

## 📲 Cómo instalarla como app en tu móvil (PWA)

DietaSuper UK funciona como Progressive Web App (PWA). No necesitas pasar por la App Store ni Google Play:

### En iPhone (Safari)
1. Abre el enlace [https://adriansg25.github.io/dieta-super/](https://adriansg25.github.io/dieta-super/) en **Safari**.
2. Pulsa el botón **Compartir** (icono de cuadrado con flecha hacia arriba en la barra inferior).
3. Desliza hacia abajo y selecciona **"Añadir a pantalla de inicio"** (Add to Home Screen).
4. Confirma el nombre y pulsa **Añadir**. La app se abrirá a pantalla completa sin barras de navegador.

### En Android (Chrome)
1. Abre el enlace en **Google Chrome**.
2. Pulsa en el menú de los tres puntos verticales (arriba a la derecha) o en el banner inferior si aparece.
3. Elige **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
4. Acepta la instalación. Tendrás el icono en tu cajón de aplicaciones.

---

## 👥 Lista de la compra compartida en pareja

DietaSuper UK incluye un sistema pensado para organizar la lista entre dos personas sin complicaciones:

1. **Selector de autor:** Usa el conmutador **"Yo" / "Pareja"** en la parte superior para asignar quién añade cada artículo o marcar quién compra qué.
2. **Código de sala compartido:** Ambos dispositivos deben usar el mismo código de sala (por defecto: `DIETA-UK`) para mantener las listas alineadas.
3. **Modo local y sincronización en la nube (Supabase):**
   - Por defecto, la app guarda todo en el almacenamiento local del dispositivo (`localStorage`) con soporte offline total.
   - Si quieres sincronización en tiempo real entre móviles distintos mediante la nube gratuita de Supabase, basta con configurar las variables de entorno:
     ```env
     NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
     ```
   - Al definirlas en tu despliegue o en el archivo `.env.local`, el gestor de estado conmuta de forma transparente al backend de Supabase.

---

## 💻 Desarrollo y pruebas en local

Si quieres ejecutar el proyecto en tu máquina con Windows y PowerShell:

1. **Instalar dependencias:**
   ```powershell
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```powershell
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

3. **Verificar compilación y exportación estática:**
   ```powershell
   npm run build
   ```
   Genera la carpeta `out/` lista para hospedar como sitio estático en GitHub Pages.
