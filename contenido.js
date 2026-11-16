/* ============================================================
   CONTENIDO EDITABLE DE LA LANDING DE ANFITRIONES
   ------------------------------------------------------------
   Este archivo se puede editar sin saber programar.
   - Cambiá solo el texto que está entre comillas.
   - No borres comas, comillas, llaves ni corchetes.
   - Guardá y subí el archivo: la página se actualiza sola.
   Los textos fijos de cada sección están en index.html.
   ============================================================ */
window.ENOSFERA = {

  /* ---------- 1. Titulares del hero (prueba A/B) ----------
     Cada visitante ve uno de los tres al azar y siempre el mismo.
     Para forzar uno, agregá ?h=a, ?h=b o ?h=c al link.
     Para dejar uno fijo para todos, escribí "a", "b" o "c" en titularFijo. */
  titulares: {
    a: 'Tu comunidad del vino, reunida en un solo lugar.',
    b: 'Reuní a tu gente del vino. Convocala cuando quieras.',
    c: 'Detrás de tu vino hay gente. Juntala en un lugar tuyo.'
  },
  titularFijo: '',

  /* ---------- 2. Comisión de Enosfera ----------
     DATO SIN CONFIRMAR. Mientras esté vacío, la página dice que el
     porcentaje se está definiendo. Cuando se confirme, escribilo así: '10 %' */
  comision: '',

  /* ---------- 3. Contacto ----------
     Mientras un dato esté vacío, ese link no se muestra. */
  contacto: {
    email: '',            // por ejemplo: 'hola@enosfera.com'
    instagram: '',        // solo el usuario, sin @. Por ejemplo: 'enosfera'
    privacidadUrl: ''     // link a la política de privacidad completa, cuando exista
  },

  /* ---------- 4. Quiénes la estamos armando ----------
     Personas reales, con su permiso. Mientras la lista esté vacía,
     la página muestra un espacio reservado.
     Ejemplo de una persona:
       { nombre: 'Nombre Apellido', rol: 'Sommelier · Mendoza', foto: 'assets/img/nombre.jpg' }
     La foto es opcional; sin foto se muestran las iniciales. */
  equipo: [
  ],

  /* ---------- 5. Ejemplos por rol (todos ficticios) ----------
     Se muestran en "Cómo se ve Enosfera para un anfitrión".
     cupos = lugares totales · quedan = lugares libres al abrir la página. */
  roles: [
    { id: 'sommelier', etiqueta: 'Sommelier',
      nombre: 'Lucía Barrera', bajada: 'Sommelier · Luján de Cuyo, Mendoza',
      frase: 'Catas chicas, sin solemnidad, para probar y preguntar tranquilos.',
      experiencia: 'Cata de malbec de altura', tipo: 'Cata presencial',
      fecha: 'Sáb 12 de diciembre', hora: '19:00', lugar: 'Chacras de Coria',
      cupos: 12, quedan: 6, precio: '$ 38.000' },

    { id: 'enologo', etiqueta: 'Enólogo',
      nombre: 'Tomás Ibarra', bajada: 'Enólogo · Valle de Uco, Mendoza',
      frase: 'Te cuento cómo se hace el vino, con la copa en la mano.',
      experiencia: 'Un mismo vino, cuatro cosechas', tipo: 'Cata presencial',
      fecha: 'Vie 11 de diciembre', hora: '20:00', lugar: 'Tunuyán',
      cupos: 10, quedan: 6, precio: '$ 45.000' },

    { id: 'productor', etiqueta: 'Productor',
      nombre: 'Marta Quiroga', bajada: 'Productora · Lavalle, Mendoza',
      frase: 'Un parral de familia y vinos que hacemos en casa.',
      experiencia: 'Recorrida por el parral y cata al pie de la viña', tipo: 'Visita',
      fecha: 'Dom 13 de diciembre', hora: '10:30', lugar: 'Lavalle',
      cupos: 15, quedan: 6, precio: '$ 30.000' },

    { id: 'bodega', etiqueta: 'Bodega',
      nombre: 'Finca Dos Acequias', bajada: 'Bodega familiar · Maipú, Mendoza',
      frase: 'Abrimos la bodega para los que quieren ver cómo trabajamos.',
      experiencia: 'Visita a la bodega con degustación de tanque', tipo: 'Visita a bodega',
      fecha: 'Sáb 19 de diciembre', hora: '11:00', lugar: 'Maipú',
      cupos: 20, quedan: 6, precio: '$ 35.000' },

    { id: 'divulgador', etiqueta: 'Divulgador',
      nombre: 'Julián Robles', bajada: 'Divulgador del vino · Córdoba',
      frase: 'Explico el vino fácil, para los que recién empiezan.',
      experiencia: 'Cómo leer una etiqueta sin marearte', tipo: 'Cata online en vivo',
      fecha: 'Jue 10 de diciembre', hora: '19:30', lugar: 'Online, desde tu casa',
      cupos: 30, quedan: 6, precio: '$ 12.000', online: true }
  ],

  /* ---------- 6. Formulario y medición (parte técnica) ----------
     formularioUrl: dirección que recibe los datos del formulario y los
       eventos de uso (el script de Google Sheets). Vacío = no se envía nada.
     ga4: ID de Google Analytics 4 (por ejemplo 'G-XXXXXXXXXX'). Opcional. */
  formularioUrl: '',
  ga4: ''
};
