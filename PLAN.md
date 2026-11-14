# DietaSuper UK — Arquitectura y Protocolo `/optimizacion`

## 1. Objetivo del Proyecto
App conjunta (PWA Mobile-First) para pareja en Reino Unido enfocada en comparar precios y optimizar la lista de la compra por presupuesto (£), calorías (kcal) y macronutrientes (proteínas, carbohidratos, grasas).

## 2. Supermercados y Fuentes de Datos (Estrategia Híbrida)
1. **Aldi UK (`aldi`)**: adaptador modular con fetch seguro + fallback a catálogo semilla realista en £.
2. **Lidl UK (`lidl`)**: catálogo y ofertas semanales + enriquecimiento nutricional.
3. **Asda (`asda`)**: adaptador modular con fetch seguro + fallback a catálogo semilla realista en £.
4. **Morrisons (`morrisons`)**: adaptador modular con fetch seguro + fallback a catálogo semilla realista en £.
5. **Open Food Facts UK (`https://uk.openfoodfacts.org/cgi/search.pl`)**: consulta en vivo de códigos de barras, calorías y macros por 100g.

## 3. Sincronización en Pareja
- Identidad activa en la sesión: `yo` | `pareja` (con nombres configurables en `CoupleGoals`).
- Sincronización inmediata entre pestañas/dispositivos locales mediante `BroadcastChannel` + `localStorage`.
- Preparado para sincronización en la nube en tiempo real con Supabase Realtime cuando se configuren `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 4. Protocolo `/optimizacion` y Guardia del 50% en Argon
- **Orquestador (`coordinator`)**: inicia en `Orchestrator (Argon)` (`gemini-pro-orchestrator-g1-pro`).
- **Regla de corte al 50%**: tras cada fase o ronda de swarm se consulta `swarm{action:"models", all:true}`. Si `gemini-pro-orchestrator-g1-pro` o `gemini-4-argon-high` baja a `<= 50%`, el coordinador cambia inmediatamente a `gemini-4-hydrogen-xhigh` (Pool Hydrogen, Intelligence Index 54) mediante `swarm{action:"model", name:"coordinator", model:"gemini-4-hydrogen-xhigh"}`, o a `claude-opus-5-5-high` (Pool Claude) si Hydrogen queda por debajo del 20%.
- **Workers del swarm**: ninguno hereda Argon (0% de consumo de Pool Argon en subagentes):
  - `connectors` → `gemini-4-hydrogen-high`
  - `optimizer` → `gemini-4-hydrogen-high`
  - `ui-app` → `claude-sonnet-5-5-high`
  - `verifier` → `gemini-4-hydrogen-medium`
  - `monitor` → `gemini-4-hydrogen-low`
