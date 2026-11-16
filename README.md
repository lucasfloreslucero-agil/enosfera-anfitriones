# Enosfera · Landing para anfitriones

Landing de una sola página para validar el interés de anfitriones del vino (sommeliers, enólogos, productores, bodegas, divulgadores) en sumarse a Enosfera. La única conversión es el formulario "Quiero ser de los primeros".

- **Sitio publicado:** https://lucasfloreslucero-agil.github.io/enosfera-anfitriones/
- **Publicación:** GitHub Pages desde la rama `main`. Cada push actualiza el sitio en un minuto, aproximadamente.
- **Estado:** en revisión. Lleva `noindex` para que los buscadores no la listen todavía.

## Cómo editar sin saber programar

Casi todo lo que cambia seguido está en **`contenido.js`**, con instrucciones adentro:

| Qué | Dónde en `contenido.js` |
|---|---|
| Los tres titulares del hero | `titulares` |
| Dejar un titular fijo para todos | `titularFijo` |
| La comisión de Enosfera | `comision` |
| Mail, Instagram y link de privacidad | `contacto` |
| Fotos y nombres del equipo y los primeros anfitriones | `equipo` |
| Los ejemplos por rol (nombre, cata, fecha, cupos, precio) | `roles` |

Los textos fijos de cada sección están en `index.html`, ordenados y con un comentario que marca cada sección. Las fotos van en `assets/img/`.

## Prueba A/B de titulares

Cada visitante ve uno de los tres titulares al azar y siempre el mismo. El titular que vio queda guardado junto a sus datos del formulario y en cada evento.

- A: "Tu comunidad del vino, reunida en un solo lugar."
- B: "Reuní a tu gente del vino. Convocala cuando quieras."
- C: "Detrás de tu vino hay gente. Juntala en un lugar tuyo."

Para ver uno en particular: agregar `?h=a`, `?h=b` o `?h=c` al link.

## Medición

Los links que se compartan conviene armarlos con UTM, por ejemplo `?utm_source=instagram&utm_medium=historia&utm_campaign=lanzamiento`. La página guarda esos datos y los suma al formulario y a los eventos.

Eventos que se registran: `pagina_vista`, `clic_quiero_ser_anfitrion` (con `lugar`: hero, fijo o encabezado), `selector_rol`, `maqueta_paso`, `preventas_abrir`, `preventas_avisame`, `formulario_inicio`, `formulario_error`, `formulario_envio`, `formulario_fallo`, `formulario_abandono` (con `ultimo_campo`) y `compartir`.

Van a tres lugares: `window.dataLayer` (siempre), la hoja "Eventos" de la planilla (si `formularioUrl` está cargado) y Google Analytics 4 (si se carga un ID en `ga4`). No se guarda ningún dato personal en los eventos.

## Formulario

Los datos se envían al script de Google Sheets (`scripts/google-sheets/Code.gs`), que los guarda en la hoja "Anfitriones" de la planilla "Enosfera · Postulaciones de creadores". Mientras `formularioUrl` esté vacío, el formulario valida pero no envía nada y muestra el aviso de error.

Para probar los estados sin enviar: `?demo=ok` o `?demo=error`.

## Variables a completar por el equipo

- [ ] **Comisión** (`comision`): sin confirmar. Mientras esté vacía, la página dice que se está definiendo.
- [ ] **Mail de contacto e Instagram** (`contacto`): vacíos, no se muestran.
- [ ] **Política de privacidad** (`contacto.privacidadUrl`): hoy hay solo un aviso breve en el pie.
- [ ] **Equipo y primeros anfitriones** (`equipo`): fotos y nombres reales, con su permiso.
- [ ] **Fechas de los ejemplos** (`roles`): son de diciembre de 2026 y hay que renovarlas cuando pasen.
- [ ] **Titular ganador** (`titularFijo`): cuando la prueba A/B tenga resultado.
- [ ] **Google Analytics** (`ga4`): opcional.
- [ ] **Sacar `noindex`** de `index.html` cuando esté lista para difundir.

## Vocabulario

"Anfitrión" (nunca creador ni influencer), "miembro" (nunca suscriptor, seguidor ni cliente), "comunidad". Voseo, frases cortas, sin jerga de startup. Todo ejemplo se rotula "Ejemplo ilustrativo". Las preventas son compra anticipada con recompensa y van como "Próximamente". Sin métricas, testimonios ni logos inventados.

## Estructura

- `index.html` — la página.
- `contenido.js` — textos y datos editables.
- `assets/css/tokens.css` — colores, tipografías y componentes del sistema de diseño de Enosfera (no editar a mano).
- `assets/css/landing.css` — estilos de esta landing.
- `assets/js/landing.js` — titular A/B, selector de rol, maqueta, formulario y medición.
- `scripts/dev-server.js` — vista previa local: `node scripts/dev-server.js` → http://localhost:4326
