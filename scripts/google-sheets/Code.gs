/**
 * Recibe los datos de las landings de Enosfera y los guarda en esta planilla.
 *  - Landing de creadores (repo enosfera)            → hoja "Postulaciones"
 *  - Landing de anfitriones (repo enosfera-anfitriones) → hoja "Anfitriones"
 *  - Eventos de uso de la landing de anfitriones      → hoja "Eventos"
 *
 * Para publicar un cambio: pegar este archivo en Apps Script, guardar, y en
 * Implementar → Administrar las implementaciones → Editar → Versión: Nueva → Implementar.
 * La URL /exec no cambia.
 */
const HOJAS = {
  postulaciones: { nombre: 'Postulaciones', columnas: ['Fecha', 'Nombre', 'Email', 'WhatsApp', 'Provincia', 'Tipo de creador',
    'Red principal', 'Seguidores', 'Intereses', 'Preventa: producto y fecha', 'Cómo vende hoy'] },
  anfitriones: { nombre: 'Anfitriones', columnas: ['Fecha', 'Nombre', 'Qué es', 'Instagram o web', 'WhatsApp o mail', 'Provincia',
    'Ciudad', 'Qué vende hoy', 'Cómo cobra hoy', 'Recompra', 'Qué convocaría primero', 'Qué cree que es Enosfera',
    'Quiere que le escriban', 'Interés en preventas', 'Rol explorado', 'Titular', 'utm_source', 'utm_medium', 'utm_campaign',
    'utm_content', 'Referente', 'Visita'] },
  eventos: { nombre: 'Eventos', columnas: ['Fecha', 'Evento', 'Visita', 'Titular', 'Detalle', 'utm_source', 'utm_medium',
    'utm_campaign', 'utm_content', 'Referente'] }
};

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    // Campo trampa: las personas no lo ven; si viene con algo, es un bot. Se responde ok y no se guarda.
    if (d.sitio) return responder({ ok: true });

    if (d.tipo === 'evento') {
      if (!/^[a-z_]{3,40}$/.test(String(d.evento || ''))) return responder({ ok: false, error: 'evento inválido' });
      const detalle = ['lugar', 'rol', 'paso', 'campo', 'campos', 'ultimo_campo', 'medio', 'opcionales']
        .filter(function (k) { return d[k] !== undefined && d[k] !== ''; })
        .map(function (k) { return k + '=' + d[k]; }).join(' · ');
      agregar(HOJAS.eventos, [new Date(), texto(d.evento), texto(d.visita), texto(d.titular), texto(detalle),
        texto(d.utm_source), texto(d.utm_medium), texto(d.utm_campaign), texto(d.utm_content), texto(d.referente)]);
      return responder({ ok: true });
    }

    if (d.formulario === 'anfitriones') {
      const contacto = String(d.contacto || '');
      const contactoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto) || contacto.replace(/\D/g, '').length >= 8;
      if (!texto(d.nombre) || !texto(d.rol) || !texto(d.red) || !contactoOk) return responder({ ok: false, error: 'datos incompletos' });
      agregar(HOJAS.anfitriones, [new Date(), texto(d.nombre), texto(d.rol), texto(d.red), texto(d.contacto), texto(d.provincia),
        texto(d.ciudad), texto(lista(d.vende)), texto(lista(d.cobra)), texto(d.recompra), texto(d.convocar), texto(d.que_es),
        d.quiere_contacto === true ? 'Sí' : 'No', d.interes_preventas === true ? 'Sí' : 'No', texto(d.rol_explorado), texto(d.titular),
        texto(d.utm_source), texto(d.utm_medium), texto(d.utm_campaign), texto(d.utm_content), texto(d.referente), texto(d.visita)]);
      return responder({ ok: true });
    }

    // Landing de creadores
    if (!texto(d.nombre) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email || '')) || d.acepta !== true) {
      return responder({ ok: false, error: 'datos incompletos' });
    }
    agregar(HOJAS.postulaciones, [new Date(), texto(d.nombre), texto(d.email), texto(d.whatsapp), texto(d.provincia), texto(d.tipo),
      texto(d.red), texto(d.seguidores), texto(lista(d.intereses)), texto(d.preventa), texto(d.hoy)]);
    return responder({ ok: true });
  } catch (err) {
    return responder({ ok: false, error: 'no se pudo guardar' });
  }
}

function agregar(def, fila) {
  const candado = LockService.getScriptLock();
  candado.waitLock(10000);
  try {
    const libro = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = libro.getSheetByName(def.nombre) || libro.insertSheet(def.nombre);
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(def.columnas);
      hoja.setFrozenRows(1);
      hoja.getRange(1, 1, 1, def.columnas.length).setFontWeight('bold');
    }
    hoja.appendRow(fila);
  } finally {
    candado.releaseLock();
  }
}

function lista(v) { return Array.isArray(v) ? v.join(', ') : (v || ''); }

/** Recorta el texto y evita que la planilla lo interprete como fórmula (por ejemplo "+54..."). */
function texto(v) {
  const s = String(v == null ? '' : v).trim().slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
