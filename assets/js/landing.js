/* Landing de anfitriones: titular A/B, selector de rol, maqueta, formulario y medición.
   Los textos y datos editables están en contenido.js. */
(function () {
  'use strict';

  var C = window.ENOSFERA || {};
  var Q = new URLSearchParams(location.search);
  var DEMO = Q.get('demo'); // ?demo=ok o ?demo=error: prueba el formulario sin enviar nada
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var guardar = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var leer = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var el = function (tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  var icono = function (nombre) { var i = el('i', 'eno-icon icon-' + nombre); i.setAttribute('aria-hidden', 'true'); return i; };

  /* ---------- Origen de la visita (UTM) ---------- */
  var origen = {};
  try { origen = JSON.parse(sessionStorage.getItem('eno_origen') || '{}'); } catch (e) {}
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    if (Q.get(k)) origen[k] = Q.get(k).slice(0, 120);
  });
  if (!origen.referente && document.referrer && document.referrer.indexOf(location.host) === -1) {
    origen.referente = document.referrer.split('?')[0].slice(0, 200);
  }
  try { sessionStorage.setItem('eno_origen', JSON.stringify(origen)); } catch (e) {}

  var visita = leer('eno_visita');
  if (!visita) { visita = Math.random().toString(36).slice(2, 10) + Date.now().toString(36); guardar('eno_visita', visita); }

  /* ---------- Titular A/B ---------- */
  var titulares = C.titulares || {};
  var claves = Object.keys(titulares);
  var titular = (Q.get('h') || '').toLowerCase();
  if (!titulares[titular]) titular = C.titularFijo && titulares[C.titularFijo] ? C.titularFijo : (leer('eno_titular') || '');
  if (!titulares[titular] && claves.length) titular = claves[Math.floor(Math.random() * claves.length)];
  if (titulares[titular]) { $('#titular').textContent = titulares[titular]; guardar('eno_titular', titular); }

  /* ---------- Medición ---------- */
  window.dataLayer = window.dataLayer || [];
  if (C.ga4) {
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.ga4);
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', C.ga4);
  }
  function medir(evento, datos) {
    var d = Object.assign({ titular: titular }, datos || {});
    window.dataLayer.push(Object.assign({ event: evento }, d));
    if (window.gtag) window.gtag('event', evento, d);
    if (C.formularioUrl && !DEMO && navigator.sendBeacon) {
      var cuerpo = JSON.stringify(Object.assign({ tipo: 'evento', evento: evento, visita: visita, pagina: 'anfitriones' }, d, origen));
      try { navigator.sendBeacon(C.formularioUrl, new Blob([cuerpo], { type: 'text/plain;charset=utf-8' })); } catch (e) {}
    }
  }
  medir('pagina_vista');

  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () { medir('clic_quiero_ser_anfitrion', { lugar: a.dataset.cta }); });
  });

  /* ---------- Comisión, contacto y equipo ---------- */
  if (C.comision) {
    $('#comision-txt').textContent = 'Es del ' + C.comision + ' sobre cada venta. Si no vendés, no pagás nada.';
  }
  var ct = C.contacto || {}, links = $('#pie-links');
  function link(href, ico, txt) {
    var a = el('a', 'pie__l focusable'); a.href = href; a.appendChild(icono(ico)); a.appendChild(document.createTextNode(txt));
    if (href.indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener'; }
    links.appendChild(a);
  }
  if (ct.email) link('mailto:' + ct.email, 'mail', ct.email);
  if (ct.instagram) link('https://www.instagram.com/' + ct.instagram.replace(/^@/, '') + '/', 'instagram', '@' + ct.instagram.replace(/^@/, ''));
  if (ct.privacidadUrl) link(ct.privacidadUrl, 'shield-check', 'Política de privacidad');

  function iniciales(nombre) {
    return String(nombre).split(' ').filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }
  function avatar(nombre, lado, foto) {
    var a = el('span', 'eno-avatar', foto ? '' : iniciales(nombre));
    a.style.width = a.style.height = lado + 'px'; a.style.fontSize = (lado * 0.4) + 'px';
    if (foto) { a.style.backgroundImage = 'url("' + foto + '")'; a.setAttribute('role', 'img'); a.setAttribute('aria-label', nombre); }
    return a;
  }
  if (C.equipo && C.equipo.length) {
    var cont = $('#equipo'); cont.textContent = '';
    var lista = el('div', 'equipo__l');
    C.equipo.forEach(function (p) {
      var d = el('div', 'persona');
      d.appendChild(avatar(p.nombre, 72, p.foto));
      d.appendChild(el('b', '', p.nombre));
      if (p.rol) d.appendChild(el('span', 'r', p.rol));
      lista.appendChild(d);
    });
    cont.appendChild(lista);
  }

  /* ---------- Selector de rol y maqueta ---------- */
  var roles = C.roles || [];
  var estado = { rol: 0, paso: 0, quedan: 0, reservado: false };
  var cajaRoles = $('#roles'), pantalla = $('#pantalla');

  function fila(ico, txt) { var f = el('div', 'p-fila'); f.appendChild(icono(ico)); f.appendChild(el('span', '', txt)); return f; }
  function pildoraCupo(n) { var c = el('span', 'p-cupo'); c.appendChild(icono('users')); c.appendChild(document.createTextNode(textoCupo(n))); return c; }
  function textoCupo(n) { return n === 1 ? 'Queda 1 lugar' : 'Quedan ' + n + ' lugares'; }
  function boton(txt, alHacerClic, variante) {
    var b = el('button', 'eno-btn eno-btn--' + (variante || 'primary') + ' eno-btn--block', txt);
    b.type = 'button'; b.addEventListener('click', alHacerClic); return b;
  }

  function pintar() {
    var r = roles[estado.rol]; if (!r) return;
    $('#demo-titulo').textContent = r.experiencia;
    $('#demo-fecha').textContent = r.fecha + ' · ' + r.hora;
    $('#demo-quedan').textContent = textoCupo(estado.quedan);
    $('#demo-de').textContent = 'de ' + r.cupos;
    $('#demo-barra').style.width = Math.round((r.cupos - estado.quedan) / r.cupos * 100) + '%';
    $$('.paso').forEach(function (b, i) { if (i === estado.paso) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    $$('.cel__puntos i').forEach(function (p, i) { p.classList.toggle('on', i === estado.paso); });
    $('#cel-atras').disabled = estado.paso === 0;
    $('#cel-sig').disabled = estado.paso === 2;

    pantalla.textContent = '';
    var lugar = fila(r.online ? 'video' : 'map-pin', r.lugar);
    if (estado.paso === 0) {
      var cab = el('div', 'p-perfil'); cab.appendChild(avatar(r.nombre, 56));
      var quien = el('div'); quien.appendChild(el('div', 'p-nombre', r.nombre)); quien.appendChild(el('div', 'p-baj', r.bajada)); cab.appendChild(quien);
      pantalla.appendChild(cab);
      pantalla.appendChild(el('p', 'p-frase', r.frase));
      pantalla.appendChild(el('div', 'p-tit', 'Próxima experiencia'));
      var card = el('div', 'p-card');
      card.appendChild(el('h4', '', r.experiencia));
      card.appendChild(fila('calendar-days', r.fecha + ' · ' + r.hora));
      card.appendChild(lugar);
      card.appendChild(pildoraCupo(estado.quedan));
      pantalla.appendChild(card);
      var pie0 = el('div', 'p-pie'); pie0.appendChild(boton(estado.reservado ? 'Ver mi reserva' : 'Reservar mi lugar', function () { ir(estado.reservado ? 2 : 1); }));
      pantalla.appendChild(pie0);
    } else if (estado.paso === 1) {
      pantalla.appendChild(el('div', 'p-tit', r.tipo + ' · con ' + r.nombre));
      var c1 = el('div', 'p-card');
      c1.appendChild(el('h4', '', r.experiencia));
      c1.appendChild(fila('calendar-days', r.fecha + ' · ' + r.hora));
      c1.appendChild(lugar);
      c1.appendChild(pildoraCupo(estado.quedan));
      var pr = el('div', 'p-precio'); pr.appendChild(el('small', '', 'Precio final, sin cargos extra')); pr.appendChild(el('b', '', r.precio)); c1.appendChild(pr);
      pantalla.appendChild(c1);
      pantalla.appendChild(fila('wallet', 'Se paga con Mercado Pago, en pesos.'));
      var pie1 = el('div', 'p-pie');
      pie1.appendChild(boton('Confirmar reserva', function () { ir(2); }));
      pie1.appendChild(el('small', '', 'Es una demostración: no se cobra nada.'));
      pantalla.appendChild(pie1);
    } else {
      var ok = el('div', 'p-ok');
      var ic = el('span', 'p-ok__ico'); ic.appendChild(icono('circle-check')); ok.appendChild(ic);
      ok.appendChild(el('h4', '', '¡Tenés tu lugar!'));
      ok.appendChild(el('p', '', r.experiencia + ', con ' + r.nombre + '.'));
      pantalla.appendChild(ok);
      var c2 = el('div', 'p-card');
      c2.appendChild(fila('calendar-days', r.fecha + ' · ' + r.hora));
      c2.appendChild(fila(r.online ? 'video' : 'map-pin', r.lugar));
      c2.appendChild(fila('mail', 'Te llega la confirmación por mail.'));
      pantalla.appendChild(c2);
      pantalla.appendChild(pildoraCupo(estado.quedan));
      var pie2 = el('div', 'p-pie'); pie2.appendChild(boton('Volver al perfil', function () { ir(0); }, 'secondary'));
      pantalla.appendChild(pie2);
    }
  }

  function ir(paso) {
    paso = Math.max(0, Math.min(2, paso));
    if (paso === 2 && !estado.reservado) { estado.reservado = true; estado.quedan = Math.max(0, estado.quedan - 1); }
    if (paso !== estado.paso) medir('maqueta_paso', { paso: paso + 1, rol: roles[estado.rol].id });
    estado.paso = paso;
    pintar();
  }

  function elegirRol(i, porUsuario) {
    estado.rol = i; estado.paso = 0; estado.reservado = false; estado.quedan = roles[i].quedan;
    $$('.rol', cajaRoles).forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    pintar();
    if (porUsuario) {
      medir('selector_rol', { rol: roles[i].id });
      var chipRol = $$('[data-chips="rol"] .chip')[i];
      if (chipRol && !elegidos('rol').length) marcar(chipRol, true);
    }
  }

  roles.forEach(function (r, i) {
    var b = el('button', 'rol', r.etiqueta); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { elegirRol(i, true); });
    cajaRoles.appendChild(b);
  });
  $$('.paso').forEach(function (b) { b.addEventListener('click', function () { ir(Number(b.dataset.paso)); }); });
  $('#cel-atras').addEventListener('click', function () { ir(estado.paso - 1); });
  $('#cel-sig').addEventListener('click', function () { ir(estado.paso + 1); });

  /* ---------- Preventas: "Avisame" ---------- */
  var interesPreventas = false;
  var prevAbrir = $('#prev-abrir'), prevPanel = $('#prev-panel');
  prevAbrir.addEventListener('click', function () {
    var abrir = prevPanel.hidden;
    prevPanel.hidden = !abrir; prevAbrir.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (abrir) medir('preventas_abrir');
  });
  $('#prev-avisame').addEventListener('click', function () {
    if (!interesPreventas) medir('preventas_avisame');
    interesPreventas = true;
    this.disabled = true; this.textContent = 'Anotado';
    $('#prev-ok').hidden = false;
  });

  /* ---------- Formulario ---------- */
  var OPCIONES = {
    rol: ['Sommelier', 'Enólogo/a', 'Productor/a', 'Bodega', 'Divulgador/a', 'Otro'],
    vende: ['Catas', 'Visitas', 'Cursos', 'Vino', 'Libros', 'Servicios', 'Nada todavía'],
    cobra: ['Transferencia', 'Mercado Pago', 'Efectivo', 'Otro'],
    recompra: ['Ninguna', 'Pocas', 'La mitad', 'La mayoría', 'No lo sé'],
    convocar: ['Una cata', 'Una visita', 'Un curso', 'Contenido', 'No lo tengo claro']
  };
  var PROVINCIAS = ['Buenos Aires', 'Ciudad de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'];
  var form = $('#form'), gracias = $('#gracias'), enviar = $('#enviar');
  var errores = {}, estadoForm = 'listo', empezado = false, enviado = false, ultimoCampo = '';

  PROVINCIAS.forEach(function (p) { var o = el('option', '', p); o.value = p; form.provincia.appendChild(o); });

  function marcar(chip, si) {
    chip.setAttribute('aria-pressed', si ? 'true' : 'false');
    var i = chip.querySelector('i'); if (i) i.className = 'eno-icon icon-' + (si ? 'check' : 'plus');
  }
  function elegidos(clave) {
    return $$('[data-chips="' + clave + '"] .chip[aria-pressed="true"]').map(function (c) { return c.dataset.valor; });
  }
  $$('[data-chips]').forEach(function (caja) {
    var clave = caja.dataset.chips, varios = caja.dataset.modo === 'varios';
    OPCIONES[clave].forEach(function (txt) {
      var b = el('button', 'chip'); b.type = 'button'; b.dataset.valor = txt; b.setAttribute('aria-pressed', 'false');
      if (varios) b.appendChild(icono('plus'));
      b.appendChild(document.createTextNode(txt));
      b.addEventListener('click', function () {
        tocarCampo(clave);
        if (varios) {
          var si = b.getAttribute('aria-pressed') !== 'true';
          marcar(b, si);
          if (si) $$('.chip', caja).forEach(function (c) { // "Nada todavía" no convive con las demás
            if (c !== b && (txt === 'Nada todavía' || c.dataset.valor === 'Nada todavía')) marcar(c, false);
          });
        } else {
          $$('.chip', caja).forEach(function (c) { marcar(c, c === b); });
        }
        if (clave === 'rol') limpiar('rol');
      });
      caja.appendChild(b);
    });
  });

  function tocarCampo(nombre) {
    ultimoCampo = nombre;
    if (!empezado) { empezado = true; medir('formulario_inicio', { campo: nombre }); }
  }
  form.addEventListener('focusin', function (e) { if (e.target.name && e.target.name !== 'sitio') tocarCampo(e.target.name); });

  function mostrarError(clave, msj) {
    var w = $('[data-campo="' + clave + '"]', form); if (!w) return;
    var salida = $('.eno-field__hint, .err', w), input = $('input', w);
    w.classList.toggle('is-error', !!msj);
    if (input) input.setAttribute('aria-invalid', msj ? 'true' : 'false');
    salida.textContent = msj || ''; salida.hidden = !msj;
  }
  function limpiar(clave) { if (!errores[clave]) return; delete errores[clave]; mostrarError(clave, ''); avisos(); }
  function avisos() {
    $('#n-servidor').hidden = estadoForm !== 'error';
    $('#n-campos').hidden = estadoForm === 'error' || !Object.keys(errores).length;
    enviar.disabled = estadoForm === 'enviando';
    enviar.textContent = estadoForm === 'enviando' ? 'Enviando…' : estadoForm === 'error' ? 'Probar de nuevo' : 'Quiero ser de los primeros';
  }
  ['nombre', 'red', 'contacto'].forEach(function (k) { form[k].addEventListener('input', function () { limpiar(k); }); });

  function valores() {
    return {
      formulario: 'anfitriones',
      nombre: form.nombre.value.trim(),
      rol: elegidos('rol')[0] || '',
      red: form.red.value.trim(),
      contacto: form.contacto.value.trim(),
      provincia: form.provincia.value,
      ciudad: form.ciudad.value.trim(),
      vende: elegidos('vende'),
      cobra: elegidos('cobra'),
      recompra: elegidos('recompra')[0] || '',
      convocar: elegidos('convocar')[0] || '',
      que_es: form.que_es.value.trim(),
      quiere_contacto: form.quiere_contacto.checked,
      interes_preventas: interesPreventas,
      rol_explorado: roles[estado.rol] ? roles[estado.rol].id : '',
      titular: titular,
      visita: visita,
      sitio: form.sitio.value
    };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (estadoForm === 'enviando') return;
    if (!empezado) tocarCampo('enviar');
    var v = valores(), err = {};
    var esMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.contacto), esTel = v.contacto.replace(/\D/g, '').length >= 8;
    if (!v.nombre) err.nombre = 'Contanos cómo te llamás.';
    if (!v.rol) err.rol = 'Elegí la opción que más se parezca a lo que hacés.';
    if (v.red.length < 3) err.red = 'Pasanos tu Instagram o tu web, así te conocemos.';
    if (!v.contacto) err.contacto = 'Dejanos un WhatsApp o un mail para poder escribirte.';
    else if (!esMail && !esTel) err.contacto = 'Fijate: no parece un WhatsApp ni un mail completo.';
    ['nombre', 'rol', 'red', 'contacto'].forEach(function (k) { mostrarError(k, err[k]); });
    errores = err; estadoForm = 'listo'; avisos();
    if (Object.keys(err).length) {
      medir('formulario_error', { campos: Object.keys(err).join(',') });
      var primero = $('[data-campo="' + Object.keys(err)[0] + '"]', form);
      if (primero) { primero.scrollIntoView({ block: 'center' }); var inp = $('input, .chip', primero); if (inp) inp.focus({ preventScroll: true }); }
      return;
    }
    estadoForm = 'enviando'; avisos();
    mandar(Object.assign(v, origen)).then(function () {
      enviado = true; estadoForm = 'ok';
      medir('formulario_envio', { rol: v.rol, opcionales: ['provincia', 'ciudad', 'recompra', 'convocar', 'que_es'].filter(function (k) { return v[k]; }).length + (v.vende.length ? 1 : 0) + (v.cobra.length ? 1 : 0) });
      form.hidden = true; gracias.hidden = false;
      $('#g-nombre').textContent = ', ' + v.nombre.split(' ')[0];
      $('#hoja').scrollIntoView({ block: 'start' }); gracias.focus({ preventScroll: true });
    }, function () {
      estadoForm = 'error'; avisos();
      medir('formulario_fallo');
      $('#n-servidor').scrollIntoView({ block: 'center' });
    });
  });

  function mandar(v) {
    if (DEMO) return new Promise(function (ok, no) { setTimeout(DEMO === 'error' ? no : ok, 800); });
    if (!C.formularioUrl) return new Promise(function (_, no) { setTimeout(no, 500); });
    // Apps Script no acepta el preflight de CORS: el JSON viaja como text/plain.
    return fetch(C.formularioUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(v) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (res) { if (!res || res.ok !== true) throw new Error('rechazado'); });
  }

  // Abandono: empezó el formulario y se fue sin enviar. Se registra una sola vez.
  var abandonoMedido = false;
  function abandono() {
    if (empezado && !enviado && !abandonoMedido) { abandonoMedido = true; medir('formulario_abandono', { ultimo_campo: ultimoCampo }); }
  }
  window.addEventListener('pagehide', abandono);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') abandono(); });

  /* ---------- Compartir ---------- */
  var urlCompartir = location.origin + location.pathname + '?utm_source=anfitrion&utm_medium=compartir';
  var textoCompartir = 'Mirá esto: están armando Enosfera, una comunidad del vino para anfitriones. Te puede servir.';
  $('#compartir-wa').href = 'https://wa.me/?text=' + encodeURIComponent(textoCompartir + ' ' + urlCompartir);
  $('#compartir-wa').addEventListener('click', function () { medir('compartir', { medio: 'whatsapp' }); });
  $('#compartir').addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({ title: 'Enosfera para anfitriones', text: textoCompartir, url: urlCompartir }).then(function () { medir('compartir', { medio: 'nativo' }); }, function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(urlCompartir).then(function () { $('#copiado').hidden = false; medir('compartir', { medio: 'copiar' }); }, function () {});
    }
  });

  /* ---------- Botón fijo y entradas al hacer scroll ---------- */
  var fijo = $('#fijo');
  if ('IntersectionObserver' in window) {
    var veo = { hero: true, form: false };
    var obs = new IntersectionObserver(function (items) {
      items.forEach(function (it) { veo[it.target.id === 'inicio' ? 'hero' : 'form'] = it.isIntersecting; });
      fijo.hidden = veo.hero || veo.form;
    });
    obs.observe($('#inicio')); obs.observe($('#sumate'));

    var rev = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) { it.target.classList.add('visto'); rev.unobserve(it.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (n) { rev.observe(n); });
  } else {
    $$('.reveal').forEach(function (n) { n.classList.add('visto'); });
  }

  if (roles.length) elegirRol(0, false);
  avisos();
})();
