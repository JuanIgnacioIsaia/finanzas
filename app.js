/* =====================================================================
 *  FINANZAS — interfaz
 * ===================================================================== */
(function () {
  'use strict';

  /* ================= utilidades ================= */
  var $ = function (s) { return document.querySelector(s); };
  var ICO = {
    inicio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    lista: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/></svg>',
    mas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    analisis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/></svg>',
    inversion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M5 16l5-5 4 3 6-7"/><path d="M15 7h5v5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="3.5" width="7" height="7" rx="2.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2.2"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3.5"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="3"/></svg>',
    enviar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    atras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12A8 8 0 0 1 18.3 7.1"/><path d="M18.5 3v4.5H14M5.5 21v-4.5H10"/></svg>',
    teclado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/></svg>'
  };
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var COLORES = ['#85BB65', '#A9DC86', '#5E9A44', '#D4AF37', '#C9A227', '#3FA796', '#4F9D69', '#6FA8DC', '#5B7DB1', '#9B8AE6',
    '#C76B79', '#E7695C', '#E3A64B', '#C07A4A', '#8E9093', '#686A6C', '#7D6B57', '#B5838D'];
  var EMOJIS = ['🛒', '🍽️', '🛵', '🍻', '🎟️', '🥐', '🍫', '🥩', '⛽', '🟢', '🚕', '🚇', '🔧', '🩺', '👕', '🛋️', '📚', '🎁', '✈️', '💻',
    '💈', '🏋️', '🧾', '⚠️', '💸', '🏠', '💡', '🌐', '📱', '🔁', '🛡️', '💳', '💼', '🎄', '⏱️', '🎯', '🧑‍💻', '🏪', '🏷️', '📈',
    '↩️', '🏘️', '💵', '🏦', '💧', '📊', '🔐', '🌎', '📜', '🏢', '₿', '🏗️', '🎧', '🇧🇷', '🐶', '🎮', '🍺', '☕', '🍕', '🚗', '🏍️', '💊', '🎓', '🧴'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function hoyISO() { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function isoDe(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function mesActual() { return hoyISO().slice(0, 7); }
  function mesLargo(m) { var p = m.split('-'); return MESES[+p[1] - 1] + ' ' + p[0]; }
  function sumarMes(m, k) { var p = m.split('-'); var d = new Date(+p[0], +p[1] - 1 + k, 1); return d.getFullYear() + '-' + p2(d.getMonth() + 1); }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function plata(n, mon) { return Motor.formatoPesos(n, mon); }
  function corta(n) {
    var a = Math.abs(n || 0), s = n < 0 ? '−' : '';
    if (a >= 1e6) return s + '$ ' + (a / 1e6).toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' M';
    if (a >= 1e5) return s + '$ ' + Math.round(a / 1e3).toLocaleString('es-AR') + ' mil';
    return s + plata(Math.round(a));
  }
  function etiquetaDia(iso) {
    var h = hoyISO(), d = new Date(iso + 'T12:00:00'), ay = new Date(); ay.setDate(ay.getDate() - 1);
    if (iso === h) return 'Hoy';
    if (iso === isoDe(ay)) return 'Ayer';
    return cap(DIAS[d.getDay()]) + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + (iso.slice(0, 4) !== h.slice(0, 4) ? '/' + iso.slice(2, 4) : '');
  }
  function fechaCorta(iso) { var d = new Date(iso + 'T12:00:00'); return d.getDate() + '/' + (d.getMonth() + 1); }
  function cat(id) { return Datos.uno('categorias', id) || null; }
  function cta(id) { return Datos.uno('cuentas', id) || null; }
  function pry(id) { return Datos.uno('proyectos', id) || null; }
  function nombreCat(id) { var c = cat(id); return c ? c.nombre : ''; }

  var TIPO_UI = {
    gasto: { cls: 't-gasto', signo: -1, color: 'neg' },
    ingreso: { cls: 't-ingreso', signo: 1, color: 'pos' },
    transferencia: { cls: 't-transferencia', signo: 0, color: 'neu' },
    prestamo_dado: { cls: 't-prestamo', signo: -1, color: 'neu' },
    cobro_prestamo: { cls: 't-prestamo', signo: 1, color: 'pos' },
    prestamo_recibido: { cls: 't-prestamo', signo: 1, color: 'neu' },
    pago_deuda: { cls: 't-prestamo', signo: -1, color: 'neu' },
    inversion: { cls: 't-inversion', signo: -1, color: 'oro' },
    rescate: { cls: 't-inversion', signo: 1, color: 'oro' },
    compra_activo: { cls: 't-inversion', signo: -1, color: 'oro' },
    venta_activo: { cls: 't-inversion', signo: 1, color: 'oro' }
  };
  function nombreTipo(t) { return (Motor.TIPOS[t] || {}).nombre || t; }
  function iconoMov(m) {
    if (m.tipo === 'transferencia') return '⇄';
    if (/prestamo|cobro_|pago_deuda/.test(m.tipo)) return '🤝';
    if (m.activo) return { usd: '💵', cripto: '₿', accion: '📈', cedear: '🌎', bono: '📜', on: '🏢' }[m.activo.clase] || '📈';
    var c = cat(m.categoria); return c ? c.icono : '💸';
  }
  function colorMov(m) { var c = cat(m.categoria); return c ? c.color : '#686A6C'; }
  function subtitulo(m) {
    var partes = [];
    if (m.tipo === 'transferencia') partes.push((cta(m.cuenta) || {}).nombre || '?', '→ ' + ((cta(m.cuentaDestino) || {}).nombre || '?'));
    else {
      if (/prestamo|cobro_|pago_deuda/.test(m.tipo)) partes.push(nombreTipo(m.tipo));
      else if (m.categoria) partes.push(nombreCat(m.categoria));
      var c = cta(m.cuenta); if (c) partes.push(c.nombre);
    }
    if (m.financiadoPor) partes.push('pagó ' + m.financiadoPor);
    var p = pry(m.proyecto); if (p) partes.push(p.icono + ' ' + p.nombre);
    return partes.join(' · ');
  }
  function cifraMov(m) {
    var ui = TIPO_UI[m.tipo] || TIPO_UI.gasto;
    var signo = ui.signo > 0 ? '+' : ui.signo < 0 ? '−' : '';
    var txt = signo + plata(m.monto, m.moneda || 'ARS');
    var extra = m.moneda && m.moneda !== 'ARS' && m.montoARS ? '<small>' + plata(m.montoARS) + '</small>' : '';
    return '<div class="cifra ' + ui.color + ' num">' + txt + extra + '</div>';
  }
  function filaMov(m) {
    return '<button class="fila" data-a="editar-mov" data-id="' + esc(m.id) + '">' +
      '<div class="ico" style="background:' + esc(colorMov(m)) + '22">' + iconoMov(m) + '</div>' +
      '<div class="cuerpo"><div class="t1">' + esc(m.descripcion || nombreTipo(m.tipo)) + '</div><div class="t2">' + esc(subtitulo(m)) + '</div></div>' +
      cifraMov(m) + '</button>';
  }
  function listaAgrupada(movs) {
    if (!movs.length) return '<div class="lista"><div class="vacio"><div class="grande">🌱</div>No hay movimientos acá todavía.</div></div>';
    var grupos = {}, orden = [];
    movs.forEach(function (m) { if (!grupos[m.fecha]) { grupos[m.fecha] = []; orden.push(m.fecha); } grupos[m.fecha].push(m); });
    var h = '<div class="lista">';
    orden.forEach(function (f) {
      var gasto = grupos[f].reduce(function (s, m) { return s + (m.tipo === 'gasto' ? Datos.montoARS(m) : 0); }, 0);
      h += '<div class="dia-cab"><span>' + esc(etiquetaDia(f)) + '</span><span class="num">' + (gasto ? '−' + plata(gasto) : '') + '</span></div>';
      grupos[f].forEach(function (m) { h += filaMov(m); });
    });
    return h + '</div>';
  }
  function ordenar(movs) {
    return movs.slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : (b.createdAt || 0) - (a.createdAt || 0); });
  }

  var toastT = null;
  function toast(msg, accion, fn) {
    var t = $('#toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (accion ? '<button id="toast-b">' + esc(accion) + '</button>' : '');
    t.classList.add('on');
    if (accion) $('#toast-b').onclick = function () { t.classList.remove('on'); fn(); };
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('on'); }, accion ? 5000 : 2600);
  }
  function vibrar(ms) { try { navigator.vibrate && navigator.vibrate(ms || 12); } catch (e) { /* nada */ } }

  /* ================= estado ================= */
  var S = { tab: 'inicio', sub: null, subId: null, mes: mesActual(), filtro: 'todos', busqueda: '', barraSel: null,
    chat: { abierto: false, mensajes: [], escuchando: null, fichas: {} } };

  /* ================= arranque ================= */
  async function iniciar() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        reg.addEventListener('updatefound', function () {
          var nw = reg.installing;
          nw && nw.addEventListener('statechange', function () {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) toast('Hay una versión nueva', 'Actualizar', function () { location.reload(); });
          });
        });
      }).catch(function () { /* sin SW */ });
    }
    try { await Datos.cargar(); }
    catch (e) { $('#app').innerHTML = '<div class="tarjeta"><b>No pude abrir el almacenamiento.</b><p>' + esc(e.message) + '</p></div>'; return; }
    await tomarVinculoDeLaURL();
    montarNav();
    render();
    var pendRender = null;
    Datos.on('cambio', function () { clearTimeout(pendRender); pendRender = setTimeout(render, 60); });
    Datos.on('sync', function (s) { pintarSync(s); if (S.sub === 'respaldo' && !$('#hoja').classList.contains('on')) render(); });
    Datos.on('ajustes', function () { if (S.tab === 'mas') render(); });
    document.addEventListener('click', alClick);
    document.addEventListener('input', alInput);
    document.addEventListener('change', alCambio);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { Datos.Sync.sincronizar(); Datos.actualizarCotizaciones(); } });
    window.addEventListener('online', function () { Datos.Sync.sincronizar(); });
    setInterval(function () { if (!document.hidden) Datos.Sync.sincronizar(); }, 90000);
    Datos.Sync.sincronizar();
    Datos.actualizarCotizaciones();
    pintarSync(Datos.Sync);
    if (location.hash === '#registrar') abrirChat();
  }

  async function tomarVinculoDeLaURL() {
    var h = location.hash || '';
    if (!/[#&]v=/.test(h)) return;
    history.replaceState(null, '', location.pathname + location.search);
    try {
      await Datos.Sync.vincular(h);
      toast('Respaldo vinculado: bajando tu historial…');
    } catch (e) { toast('No pude vincular: ' + e.message); }
  }

  function montarNav() {
    var n = document.createElement('nav');
    n.className = 'nav';
    n.innerHTML =
      '<button class="nav-item" data-a="tab" data-tab="inicio">' + ICO.inicio + 'Inicio</button>' +
      '<button class="nav-item" data-a="tab" data-tab="movimientos">' + ICO.lista + 'Movimientos</button>' +
      '<button class="fab" data-a="abrir-chat" aria-label="Registrar">' + ICO.mas + '<span class="moneda">$</span></button>' +
      '<button class="nav-item" data-a="tab" data-tab="analisis">' + ICO.analisis + 'Análisis</button>' +
      '<button class="nav-item" data-a="tab" data-tab="mas">' + ICO.menu + 'Más</button>';
    document.body.appendChild(n);
  }
  function pintarNav() {
    document.querySelectorAll('.nav-item').forEach(function (b) { b.classList.toggle('sel', b.dataset.tab === S.tab); });
  }
  function pintarSync(s) {
    var p = document.querySelectorAll('.punto-sync');
    p.forEach(function (el) {
      el.className = 'punto-sync ' + (s.estado === 'ok' ? 'ok' : s.estado === 'pendiente' ? 'pend' : s.estado === 'sincronizando' ? 'pend girando' : '');
      el.title = { ok: 'Respaldado en Drive', pendiente: 'Cambios por respaldar', sincronizando: 'Sincronizando…', error: 'Error: ' + (s.error || ''), 'sin-vincular': 'Sin respaldo vinculado' }[s.estado] || '';
    });
  }

  /* ================= render ================= */
  function render() {
    var html = '';
    if (S.sub) html = subvista();
    else if (S.tab === 'inicio') html = vistaInicio();
    else if (S.tab === 'movimientos') html = vistaMovimientos();
    else if (S.tab === 'analisis') html = vistaAnalisis();
    else html = vistaMas();
    var scroll = window.scrollY;
    $('#app').innerHTML = html;
    pintarNav();
    pintarSync(Datos.Sync);
    animarNumeros();
    if (S.mantenerScroll) window.scrollTo(0, scroll);
    S.mantenerScroll = false;
  }

  function encabezado(sup, titulo, derecha) {
    return '<div class="encabezado"><div><div class="saludo">' + esc(sup) + '</div><div class="titulo-pantalla">' + titulo + '</div></div>' +
      '<div class="acciones-enc">' + (derecha || '') + '</div></div>';
  }
  function selectorMes() {
    return '<div class="selector-mes"><button data-a="mes" data-k="-1">‹</button><span>' + esc(mesLargo(S.mes)) + '</span><button data-a="mes" data-k="1">›</button></div>';
  }
  function botonSync() { return '<button class="boton-icono" data-a="ir" data-tab="mas" data-sub="respaldo" aria-label="Respaldo"><span class="punto-sync"></span></button>'; }
  function saludo() {
    var h = new Date().getHours(), n = Datos.ajustes().nombre || '';
    return (h < 6 ? 'Buenas noches' : h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches') + (n ? ', ' + n : '');
  }

  /* ---------------- piezas comunes ---------------- */
  function pctTxt(x) { return x == null ? '—' : Math.round(x * 100) + '%'; }
  function usd(n, dec) { return 'US$ ' + (Number(n) || 0).toLocaleString('es-AR', { maximumFractionDigits: dec == null ? 2 : dec }); }
  /** Variación contra otro período. En gastos subir es malo (rojo); en ingresos y ahorro, bueno. */
  function delta(act, ant, subirEsBueno) {
    if (!ant || ant <= 0 || act == null) return '';
    var p = (act - ant) / ant;
    if (Math.abs(p) < 0.005) return '<span class="delta igual">= igual</span>';
    var bueno = subirEsBueno ? p > 0 : p < 0;
    var txt = p >= 2 ? '× ' + (act / ant).toLocaleString('es-AR', { maximumFractionDigits: act / ant >= 10 ? 0 : 1 }) : Math.abs(Math.round(p * 100)) + '%';
    return '<span class="delta ' + (bueno ? 'bien' : 'mal') + '">' + (p > 0 ? '▲ ' : '▼ ') + txt + '</span>';
  }
  function colorDe(nombre) { var h = 0; String(nombre).split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) % 997; }); return COLORES[h % COLORES.length]; }
  function avatar(nombre) {
    var ini = String(nombre || '?').trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
    return '<span class="avatar" style="background:' + colorDe(nombre) + '33;color:' + colorDe(nombre) + '">' + esc(ini) + '</span>';
  }
  function diasDesde(iso) { return iso ? Math.max(0, Math.round((Date.parse(hoyISO() + 'T12:00:00') - Date.parse(iso + 'T12:00:00')) / 86400000)) : null; }
  function haceTxt(iso) { var d = diasDesde(iso); return d == null ? '' : d === 0 ? 'hoy' : d === 1 ? 'ayer' : d < 60 ? 'hace ' + d + ' días' : 'hace ' + Math.round(d / 30) + ' meses'; }
  function mesCorto(k) { return MESES[+k.slice(5) - 1].slice(0, 3); }
  function linkSub(sub, txt, id) { return '<a data-a="sub" data-sub="' + sub + '"' + (id ? ' data-id="' + esc(id) + '"' : '') + '>' + txt + '</a>'; }
  /** Gasto acumulado hasta el mismo día del mes anterior (para comparar "a esta altura"). */
  function gastoHastaDia(r, mes, dia) {
    var tot = 0, p = mes.split('-'), ult = new Date(+p[0], +p[1], 0).getDate();
    for (var d = 1; d <= Math.min(dia, ult); d++) tot += r.porDia[mes + '-' + p2(d)] || 0;
    return tot;
  }

  /* ---------------- INICIO ---------------- */
  function vistaInicio() {
    var hoy = hoyISO(), r = Datos.resumenMes(S.mes, hoy), ant = Datos.resumenMes(sumarMes(S.mes, -1), hoy);
    var movs = Datos.lista('movimientos'), nombreMes = MESES[+S.mes.slice(5) - 1];
    var h = encabezado(saludo(), '<span class="signo">$</span>Finanzas', selectorMes() + botonSync());
    if (Voz.esIOS && !Voz.esStandalone && !localStorage.getItem('ocultarInstalar')) {
      h += '<div class="tarjeta" style="border-color:rgba(133,187,101,.35)"><div class="cabeza-tarjeta"><span class="etiqueta">Instalala en tu iPhone</span><button class="link" data-a="ocultar-instalar">Ocultar</button></div>' +
        '<div class="saludo" style="line-height:1.6">Compartir <b>⬆︎</b> › <b>Agregar a pantalla de inicio</b>. ' + (Datos.Sync.vinculo() ? 'Antes, copiá el código y pegalo en la app instalada: en iPhone no comparte datos con Safari.' : '') + '</div>' +
        (Datos.Sync.vinculo() ? '<div class="pastillas"><button class="btn btn-sec" data-a="copiar-codigo">Copiar código</button></div>' : '') + '</div>';
    }
    if (!Datos.Sync.vinculo()) {
      h += '<button class="aviso" data-a="sub" data-sub="respaldo"><span class="aviso-ico">☁️</span><span class="aviso-txt"><b>Tus datos están solo en este dispositivo</b>Vinculá el respaldo de Drive para no perderlos y verlos en todos lados.</span><span class="flecha">›</span></button>';
    }
    if (!movs.length) {
      h += '<div class="tarjeta heroe"><div class="marca-agua">$</div><div class="etiqueta">Empecemos</div>' +
        '<div class="valor" style="font-size:28px">Tocá el <span style="color:var(--verde-brillo)">+</span> y contame un movimiento</div>' +
        '<div class="sub">Hablale como a un amigo: “gasté 8 lucas en el súper con débito”, “le presté 50 mil a Nacho”, “compré 300 dólares con 450 lucas”.</div>' +
        '<div class="pastillas"><button class="btn btn-pri" data-a="abrir-chat">Registrar el primero</button>' +
        (Datos.Sync.vinculo() ? '' : Voz.esStandalone ? '<button class="btn btn-sec" data-a="pegar-y-vincular">Pegar código y vincular</button>' : '') + '</div></div>';
      return h + pie();
    }
    if (!r.cantidad) {
      h += '<div class="tarjeta heroe"><div class="marca-agua">$</div><div class="etiqueta">' + esc(cap(nombreMes)) + '</div>' +
        '<div class="valor" style="font-size:24px;line-height:1.25">Todavía no hay movimientos este mes</div>' +
        '<div class="sub">Tocá el + y dictá lo primero: el sueldo, un gasto o una compra de dólares.</div>' +
        '<div class="pastillas"><button class="btn btn-pri" data-a="abrir-chat">Registrar</button>' + (S.mes !== sumarMes(mesActual(), -1) ? '' : '') +
        '<button class="btn btn-sec" data-a="mes" data-k="-1">Ver ' + esc(MESES[+sumarMes(S.mes, -1).slice(5) - 1]) + '</button></div></div>';
    } else {
      h += heroeBalance(r, nombreMes);
      h += tiraMes(r, ant, hoy);
    }
    h += tarjetaDolares(r);
    h += panelDeudas();
    h += tarjetaTopCategorias(r, ant);
    var ult = ordenar(movs).slice(0, 5);
    h += '<div class="cabeza-tarjeta" style="margin:22px 4px 10px"><span class="etiqueta">Últimos movimientos</span><a data-a="tab" data-tab="movimientos">Ver todos</a></div>';
    h += '<div class="lista">' + ult.map(filaMov).join('') + '</div>';
    return h + pie();
  }

  function heroeBalance(r, nombreMes) {
    var bal = r.balance, ahorro = Math.max(0, r.ahorro);
    var base = Math.max(r.ingresos, r.gastos + ahorro, 1);
    var pG = r.gastos * 100 / base, pA = ahorro * 100 / base, pL = Math.max(0, bal) * 100 / base;
    var sub = r.ingresos > 0
      ? 'Gastaste el ' + pctTxt(r.tasaGasto) + ' de lo que entró' + (ahorro > 0 ? ' y ahorraste el ' + pctTxt(r.tasaAhorro) : '')
      : 'Todavía no registraste ingresos en ' + nombreMes;
    var col = function (dot, et, v, cls) { return '<div><span><span class="punto ' + dot + '"></span>' + et + '</span><b class="num ' + cls + '">' + v + '</b></div>'; };
    bal = Math.round(bal);
    return '<div class="tarjeta heroe"><div class="marca-agua">$</div>' +
      '<div class="etiqueta">Balance de ' + esc(nombreMes) + '</div>' +
      '<div class="valor num ' + (bal >= 0 ? 'pos' : 'neg') + '" data-n="' + bal + '">' + (bal < 0 ? '−' : '') + plata(bal) + '</div>' +
      '<div class="sub">' + esc(sub) + '</div>' +
      ((r.ingresos || r.gastos) ? '<div class="flujo-barra"><i class="g" style="width:' + pG.toFixed(1) + '%"></i><i class="a" style="width:' + pA.toFixed(1) + '%"></i><i class="l" style="width:' + pL.toFixed(1) + '%"></i></div>' : '') +
      '<div class="flujo-ley">' + col('ing', 'Entró', '+' + corta(r.ingresos), 'pos') + col('gas', 'Gastaste', '−' + corta(r.gastos), 'neg') +
      (r.ahorro >= 0 ? col('aho', 'Ahorraste', corta(r.ahorro), 'oro') : col('aho', 'Sacaste de ahorros', '+' + corta(-r.ahorro), 'oro')) + '</div>' +
      '<div class="nota-heroe">Balance = lo que entró − lo que gastaste − lo que pasaste a dólares o inversiones.</div></div>';
  }

  function tiraMes(r, ant, hoy) {
    var esActual = S.mes === mesActual(), h = '<div class="tarjeta tira">';
    if (esActual) {
      h += '<div><small>Hoy</small><b class="num ' + (r.hoy ? 'neg' : '') + '">' + corta(r.hoy) + '</b></div>' +
        '<div><small>Por día</small><b class="num">' + corta(r.ritmo) + '</b></div>' +
        '<div><small>Cerrarías en</small><b class="num">' + corta(r.proyeccion) + '</b></div>';
    } else {
      h += '<div><small>Gastos</small><b class="num">' + r.nGastos + '</b></div>' +
        '<div><small>Por día</small><b class="num">' + corta(r.ritmo) + '</b></div>' +
        '<div><small>Ticket prom.</small><b class="num">' + corta(r.ticket) + '</b></div>';
    }
    h += '</div>';
    var antHasta = esActual ? gastoHastaDia(ant, ant.mes, r.diaActual) : ant.gastos;
    if (antHasta > 0 && r.gastos > 0) {
      var p = (r.gastos - antHasta) / antHasta, nom = MESES[+ant.mes.slice(5) - 1];
      h += '<div class="comparo ' + (p > 0.03 ? 'mal' : p < -0.03 ? 'bien' : '') + '">' +
        (Math.abs(p) <= 0.03 ? 'Vas parecido a ' + nom : 'Vas ' + Math.abs(Math.round(p * 100)) + '% ' + (p > 0 ? 'arriba' : 'abajo') + ' de ' + nom) +
        (esActual ? ' a esta altura del mes' : '') + ' <span class="num">(' + corta(antHasta) + ')</span></div>';
    }
    return h;
  }

  function tarjetaDolares(r) {
    var D = Datos.dolares();
    if (D.total <= 0.0001 && !r.usdComprado) {
      return '<button class="tarjeta dolar vacia" data-a="abrir-chat" data-sug="dolares"><div class="cabeza-tarjeta"><span class="etiqueta">💵 Dólares ahorrados</span></div>' +
        '<div class="sub">Cuando compres, decí “compré 300 dólares con 450 lucas”: anoto los pesos que pusiste y los dólares que recibiste, y los voy sumando mes a mes.</div></button>';
    }
    var ult6 = D.meses.slice(-6), max = Math.max.apply(null, ult6.map(function (x) { return x.acumulado; }).concat([1]));
    var barras = ult6.length > 1 ? '<div class="mini-barras">' + ult6.map(function (x) {
      return '<i style="height:' + Math.max(8, Math.round(x.acumulado * 100 / max)) + '%" title="' + esc(mesCorto(x.mes) + ': ' + usd(x.acumulado, 0)) + '"></i>';
    }).join('') + '</div>' : '';
    var esteMes = r.usdComprado || r.usdVendido
      ? (r.usdComprado ? '+' + usd(r.usdComprado) + ' este mes por ' + plata(r.pesosDolares) + ' (a ' + plata(Math.round(r.pesosDolares / r.usdComprado)) + ')' : '') +
        (r.usdVendido ? (r.usdComprado ? ' · ' : '') + 'vendiste ' + usd(r.usdVendido) : '')
      : 'Este mes todavía no compraste';
    return '<button class="tarjeta dolar" data-a="sub" data-sub="ahorro"><div class="cabeza-tarjeta"><span class="etiqueta">💵 Dólares ahorrados</span><span class="link">Ver</span></div>' +
      '<div class="dolar-fila"><div><div class="dolar-valor num">' + usd(D.total) + '</div>' +
      '<div class="sub">' + esc(esteMes) + '</div>' +
      '<div class="sub tenue">Valen ≈ ' + plata(Math.round(D.valorHoy)) + ' al dólar ' + esc(Datos.ajustes().casaDolar || 'oficial') + '</div></div>' + barras + '</div></button>';
  }

  /** Préstamos y deudas por persona, con el detalle para el panel. */
  function detallePersonas() {
    var per = Datos.cartera().personas, out = {};
    Object.keys(per).forEach(function (k) { out[k] = { nombre: k, meDebe: per[k].meDebe, leDebo: per[k].leDebo, prestado: 0, cobrado: 0, debia: 0, pagado: 0, desde: null, ultimo: null }; });
    Datos.lista('movimientos').forEach(function (m) {
      var n = m.persona || m.financiadoPor; if (!n || !out[n]) return;
      var p = out[n], v = Datos.montoARS(m);
      if (m.tipo === 'prestamo_dado') { p.prestado += v; if (!p.desde || m.fecha < p.desde) p.desde = m.fecha; }
      else if (m.tipo === 'cobro_prestamo') p.cobrado += v;
      else if (m.tipo === 'prestamo_recibido' || (m.tipo === 'gasto' && m.financiadoPor === n)) { p.debia += v; if (!p.desde || m.fecha < p.desde) p.desde = m.fecha; }
      else if (m.tipo === 'pago_deuda') p.pagado += v;
      if (!p.ultimo || m.fecha > p.ultimo) p.ultimo = m.fecha;
    });
    return out;
  }

  function panelDeudas() {
    var P = detallePersonas(), deben = [], debo = [], tDeben = 0, tDebo = 0;
    Object.keys(P).forEach(function (k) {
      if (P[k].meDebe > 0.5) { deben.push(P[k]); tDeben += P[k].meDebe; }
      if (P[k].leDebo > 0.5) { debo.push(P[k]); tDebo += P[k].leDebo; }
    });
    if (!deben.length && !debo.length) return '';
    var abiertos = Object.keys(P).map(function (k) { return P[k]; }).filter(prestamoAbierto)
      .map(function (p) { p.neto = Math.max(0, p.meDebe) - Math.max(0, p.leDebo); return p; })
      .sort(function (a, b) { return Math.abs(b.neto) - Math.abs(a.neto); });
    var chips = abiertos.map(function (p) {
      return '<button class="persona-chip" data-a="ver-persona" data-p="' + esc(p.nombre) + '">' + avatar(p.nombre) + '<span>' + esc(p.nombre) + '</span><b class="num ' + (p.neto >= 0 ? 'pos' : 'neg') + '">' + (p.neto >= 0 ? '+' : '−') + corta(Math.abs(p.neto)) + '</b></button>';
    }).join('');
    return '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Préstamos y deudas</span>' + linkSub('prestamos', 'Ver todo') + '</div>' +
      '<div class="deuda-tiles"><button class="dt pos" data-a="sub" data-sub="prestamos"><small>Te deben</small><b class="num">' + plata(tDeben) + '</b><em>' + deben.length + ' persona' + (deben.length === 1 ? '' : 's') + '</em></button>' +
      '<button class="dt neg" data-a="sub" data-sub="prestamos"><small>Debés</small><b class="num">' + plata(tDebo) + '</b><em>' + debo.length + ' persona' + (debo.length === 1 ? '' : 's') + '</em></button></div>' +
      '<div class="personas-chips">' + chips + '</div></div>';
  }

  function filaCategoria(id, v, total, n, vAnt) {
    var c = cat(id) || { nombre: 'Sin categoría', icono: '💸', color: '#686A6C' };
    var pc = total ? v * 100 / total : 0;
    return '<button class="cat-fila" data-a="ver-cat" data-id="' + esc(id) + '"><span class="cat-ico" style="background:' + esc(c.color) + '24">' + c.icono + '</span>' +
      '<div class="cat-cuerpo"><div class="cat-top"><span>' + esc(c.nombre) + '</span><b class="num">' + plata(Math.round(v)) + '</b></div>' +
      '<div class="cat-barra"><i style="width:' + Math.max(2, pc).toFixed(1) + '%;background:' + esc(c.color) + '"></i></div>' +
      '<div class="cat-pie"><span>' + n + (n === 1 ? ' gasto' : ' gastos') + ' · ' + Math.round(pc) + '% del total</span>' + delta(v, vAnt, false) + '</div></div></button>';
  }
  function tarjetaTopCategorias(r, ant) {
    var arr = Object.keys(r.cats).map(function (k) { return { id: k, v: r.cats[k] }; }).sort(function (a, b) { return b.v - a.v; });
    if (!arr.length) return '';
    return '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">En qué gastaste</span><a data-a="tab" data-tab="analisis">Análisis</a></div>' +
      arr.slice(0, 6).map(function (x) { return filaCategoria(x.id, x.v, r.gastos, r.catsN[x.id] || 0, ant.cats[x.id] || 0); }).join('') +
      (arr.length > 6 ? '<a class="ver-mas" data-a="tab" data-tab="analisis">Ver las ' + arr.length + ' categorías</a>' : '') + '</div>';
  }

  function pie() {
    var u = Datos.meta('ultimoSyncLocal');
    return '<div class="pie-app">' + Datos.lista('movimientos').length + ' movimientos · motor v' + Motor.VERSION +
      (u ? ' · respaldado ' + new Date(u).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '') + '</div>';
  }

  function animarNumeros() {
    document.querySelectorAll('.heroe .valor[data-n]').forEach(function (el) {
      var fin = Number(el.dataset.n), t0 = performance.now(), dur = 650;
      if (!isFinite(fin) || Math.abs(fin) < 1) return;
      function paso(t) {
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3), v = fin * e;
        el.textContent = (v < 0 ? '−' : '') + plata(Math.round(v));
        if (k < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    });
  }

  function barras30(r, hoy) {
    var fin = S.mes === mesActual() ? new Date(hoy + 'T12:00:00') : new Date(+S.mes.slice(0, 4), +S.mes.slice(5), 0, 12);
    var dias = [];
    for (var i = 29; i >= 0; i--) { var d = new Date(fin); d.setDate(d.getDate() - i); dias.push(isoDe(d)); }
    var max = 0; dias.forEach(function (d) { max = Math.max(max, r.porDia[d] || 0); });
    var sel = S.barraSel && dias.indexOf(S.barraSel) >= 0 ? S.barraSel : null;
    var h = '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Gastos día por día</span><span class="placa num">' +
      (sel ? esc(fechaCorta(sel)) + ': ' + plata(r.porDia[sel] || 0) : 'máx ' + corta(max)) + '</span></div><div class="barras">';
    dias.forEach(function (d) {
      var v = r.porDia[d] || 0, alto = max ? Math.max(3, Math.round(v * 100 / max)) : 3;
      h += '<div class="barra' + (d === hoy ? ' hoy' : v ? ' con' : '') + (sel === d ? ' sel' : '') + '" data-a="barra" data-d="' + d + '" style="height:' + alto + '%"></div>';
    });
    return h + '</div><div class="ejes"><span>' + fechaCorta(dias[0]) + '</span><span>tocá una barra</span><span>' + fechaCorta(dias[29]) + '</span></div></div>';
  }

  /* ---------------- MOVIMIENTOS ---------------- */
  var FILTROS = [['todos', 'Todos'], ['gasto', 'Gastos'], ['ingreso', 'Ingresos'], ['prestamos', 'Préstamos'], ['inversiones', 'Ahorro e inversión'], ['transferencia', 'Entre cuentas']];
  function pasaFiltro(m) {
    var f = S.filtro;
    if (f === 'gasto' || f === 'ingreso' || f === 'transferencia') return m.tipo === f;
    if (f === 'prestamos') return /prestamo|cobro_|pago_deuda/.test(m.tipo) || !!m.financiadoPor;
    if (f === 'inversiones') return /inversion|rescate|_activo/.test(m.tipo);
    if (f.indexOf('cat:') === 0) return m.categoria === f.slice(4);
    return true;
  }
  function vistaMovimientos() {
    var q = Motor._.norm(S.busqueda).trim();
    var movs = Datos.lista('movimientos').filter(function (m) {
      if (!q && m.fecha.slice(0, 7) !== S.mes) return false;
      if (!pasaFiltro(m)) return false;
      if (!q) return true;
      var txt = Motor._.norm([m.descripcion, nombreCat(m.categoria), m.persona, m.financiadoPor, m.activo && m.activo.ticker, (cta(m.cuenta) || {}).nombre, m.texto].join(' '));
      return txt.indexOf(q) >= 0;
    });
    var tot = { ent: 0, sal: 0 };
    movs.forEach(function (m) { var s = (TIPO_UI[m.tipo] || {}).signo; if (s > 0) tot.ent += Datos.montoARS(m); else if (s < 0) tot.sal += Datos.montoARS(m); });
    var h = encabezado(q ? 'Buscando en todo el historial' : mesLargo(S.mes), 'Movimientos', q ? '' : selectorMes());
    h += '<div class="buscador"><input type="search" placeholder="Buscar: súper, Nacho, dólares…" value="' + esc(S.busqueda) + '" data-i="buscar" enterkeyhint="search"></div>';
    h += '<div class="chips">' + FILTROS.map(function (f) { return '<button class="chip' + (S.filtro === f[0] ? ' sel' : '') + '" data-a="filtro" data-f="' + f[0] + '">' + f[1] + '</button>'; }).join('');
    if (S.filtro.indexOf('cat:') === 0) h += '<button class="chip sel" data-a="filtro" data-f="todos">' + esc(nombreCat(S.filtro.slice(4))) + ' ✕</button>';
    h += '</div>';
    h += '<div class="tarjeta tira"><div><small>Movimientos</small><b class="num">' + movs.length + '</b></div><div><small>Entró</small><b class="num pos">' + corta(tot.ent) + '</b></div><div><small>Salió</small><b class="num neg">' + corta(tot.sal) + '</b></div></div>';
    h += listaAgrupada(ordenar(movs));
    return h;
  }

  /* ---------------- ANÁLISIS ---------------- */
  function vistaAnalisis() {
    var hoy = hoyISO(), r = Datos.resumenMes(S.mes, hoy), ant = Datos.resumenMes(sumarMes(S.mes, -1), hoy);
    var hist = Datos.historial(6, S.mes, hoy);
    var h = encabezado(mesLargo(S.mes), 'Análisis', selectorMes());
    if (!r.cantidad) return h + '<div class="lista"><div class="vacio"><div class="grande">📊</div>No hay movimientos en ' + esc(mesLargo(S.mes)) + '.</div></div>' + tendencia(hist);
    var esActual = S.mes === mesActual();
    var antComparable = esActual ? gastoHastaDia(ant, ant.mes, r.diaActual) : ant.gastos;
    // KPIs
    h += '<div class="kpis">' +
      kpi('Gastos', corta(r.gastos), delta(r.gastos, antComparable, false), esActual ? 'vs. ' + MESES[+ant.mes.slice(5) - 1] + ' a esta altura' : 'vs. ' + MESES[+ant.mes.slice(5) - 1]) +
      kpi('Ingresos', corta(r.ingresos), delta(r.ingresos, ant.ingresos, true), r.ingresos ? 'ahorrás el ' + pctTxt(r.tasaAhorro) : 'sin ingresos') +
      kpi('Por día', corta(r.ritmo), '', esActual ? 'cerrarías en ' + corta(r.proyeccion) : r.diasMes + ' días') +
      kpi('Ticket promedio', corta(r.ticket), '', r.nGastos + ' gastos') +
      (r.mayor ? kpi('El más grande', corta(Datos.montoARS(r.mayor)), '', (r.mayor.descripcion || nombreCat(r.mayor.categoria) || '').slice(0, 28), 'editar-mov', r.mayor.id) : '') +
      kpi('Ahorro e inversión', corta(Math.max(0, r.ahorro)), '', r.usdComprado ? '+' + usd(r.usdComprado, 0) : 'en el mes') +
      '</div>';
    h += tendencia(hist);
    // categorías
    var arr = Object.keys(r.cats).map(function (k) { return { id: k, v: r.cats[k] }; }).sort(function (a, b) { return b.v - a.v; });
    if (arr.length) h += '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Categorías</span><span class="placa">tocá una para ver su historia</span></div>' +
      arr.map(function (x) { return filaCategoria(x.id, x.v, r.gastos, r.catsN[x.id] || 0, ant.cats[x.id] || 0); }).join('') + '</div>';
    // necesidad / deseo
    var nd = r.nd.Necesidad + r.nd.Deseo;
    if (nd > 0) {
      var pn = Math.round(r.nd.Necesidad * 100 / nd);
      h += '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Necesidad o deseo</span></div>' +
        '<div class="nd-barra"><i class="nd-n" style="width:' + pn + '%"></i><i class="nd-d" style="width:' + (100 - pn) + '%"></i></div>' +
        '<div class="kv"><span>Necesidad · ' + pn + '%</span><b class="num">' + plata(r.nd.Necesidad) + '</b></div>' +
        '<div class="kv"><span>Deseo · ' + (100 - pn) + '%</span><b class="num">' + plata(r.nd.Deseo) + '</b></div></div>';
    }
    // día de la semana
    var dn = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], orden = [1, 2, 3, 4, 5, 6, 0];
    var maxS = Math.max.apply(null, r.porSemana.concat([1])), top = r.porSemana.indexOf(Math.max.apply(null, r.porSemana));
    if (r.gastos) h += '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Qué día gastás más</span><span class="placa">' + ['los domingos', 'los lunes', 'los martes', 'los miércoles', 'los jueves', 'los viernes', 'los sábados'][top] + '</span></div>' +
      '<div class="semana">' + orden.map(function (i) {
        return '<div class="col' + (i === top ? ' top' : '') + '"><div class="pista"><i style="height:' + Math.max(4, Math.round(r.porSemana[i] * 100 / maxS)) + '%"></i></div><small>' + dn[i] + '</small><em class="num">' + (r.porSemana[i] ? corta(r.porSemana[i]).replace('$ ', '') : '') + '</em></div>';
      }).join('') + '</div></div>';
    // medios de pago
    var ctas = Object.keys(r.porCuenta).sort(function (a, b) { return r.porCuenta[b] - r.porCuenta[a]; });
    if (ctas.length) h += '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Con qué pagaste</span></div>' + ctas.map(function (k) {
      var c = cta(k) || { nombre: 'Sin cuenta', icono: '💳', color: '#686A6C' }, pc = r.porCuenta[k] * 100 / r.gastos;
      return '<div class="medio"><span>' + c.icono + ' ' + esc(c.nombre) + '</span><div class="cat-barra"><i style="width:' + pc.toFixed(1) + '%;background:' + esc(c.color) + '"></i></div><b class="num">' + corta(r.porCuenta[k]) + '</b></div>';
    }).join('') + (r.financiado ? '<div class="saludo" style="margin-top:8px">' + plata(r.financiado) + ' los pagó otra persona (quedaron como deuda).</div>' : '') + '</div>';
    h += barras30(r, hoy);
    return h;
  }
  function kpi(et, v, d, sub, accion, id) {
    return '<' + (accion ? 'button data-a="' + accion + '" data-id="' + esc(id) + '"' : 'div') + ' class="kpi"><small>' + esc(et) + '</small><b class="num">' + esc(v) + '</b>' +
      '<div class="kpi-pie">' + (d || '') + '<span>' + esc(sub || '') + '</span></div></' + (accion ? 'button' : 'div') + '>';
  }
  function tendencia(hist) {
    var max = Math.max.apply(null, hist.map(function (x) { return Math.max(x.ingresos, x.gastos + Math.max(0, x.ahorro)); }).concat([1]));
    if (max <= 1) return '';
    return '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Últimos 6 meses</span>' +
      '<span class="ley-mini"><i class="ing"></i>Entró <i class="gas"></i>Gastos <i class="aho"></i>Ahorro</span></div>' +
      '<div class="tendencia">' + hist.map(function (x) {
        var a = function (v) { return Math.max(v ? 3 : 0, Math.round(v * 100 / max)); };
        return '<button class="mes-col' + (x.mes === S.mes ? ' sel' : '') + '" data-a="ir-mes" data-m="' + x.mes + '"><div class="pares">' +
          '<i class="ing" style="height:' + a(x.ingresos) + '%"></i><i class="gas" style="height:' + a(x.gastos) + '%"></i><i class="aho" style="height:' + a(Math.max(0, x.ahorro)) + '%"></i></div>' +
          '<small>' + mesCorto(x.mes) + '</small><em class="num ' + (x.balance >= 0 ? 'pos' : 'neg') + '">' + (x.ingresos || x.gastos ? (x.balance < 0 ? '−' : '') + corta(x.balance).replace('$ ', '').replace('−', '') : '') + '</em></button>';
      }).join('') + '</div><div class="ejes"><span>abajo: balance de cada mes</span></div></div>';
  }

  /* ---------------- detalle de una categoría ---------------- */
  function vistaCategoria(id) {
    var c = cat(id) || Datos.lista('categorias', true).filter(function (x) { return x.id === id; })[0] || { nombre: 'Sin categoría', icono: '💸', color: '#686A6C', tipo: 'gasto' };
    var st = Datos.statsCategoria(id, S.mes), esteMes = st.serie[st.serie.length - 1].v, antMes = st.serie[st.serie.length - 2].v;
    var h = cabSub(c.icono + ' ' + c.nombre, 'Análisis');
    h += '<div class="tarjeta heroe"><div class="marca-agua">' + c.icono + '</div><div class="etiqueta">En ' + esc(mesLargo(S.mes)) + '</div>' +
      '<div class="valor num" data-n="' + esteMes + '">' + plata(esteMes) + '</div>' +
      '<div class="sub">' + (antMes ? 'El mes anterior: ' + plata(antMes) + ' ' + delta(esteMes, antMes, c.tipo !== 'gasto') : 'El mes anterior no hubo') + '</div></div>';
    h += '<div class="kpis">' + kpi('Promedio por mes', corta(st.promedioMensual), '', 'en los meses que hubo') + kpi('Total ' + S.mes.slice(0, 4), corta(st.totalAnio), '', st.veces + ' veces en total') +
      (st.ultimo ? kpi('La última vez', etiquetaDia(st.ultimo.fecha), '', plata(Datos.montoARS(st.ultimo))) : '') + '</div>';
    var max = Math.max.apply(null, st.serie.map(function (x) { return x.v; }).concat([1]));
    h += '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Mes a mes</span></div><div class="tendencia">' + st.serie.map(function (x) {
      return '<div class="mes-col' + (x.mes === S.mes ? ' sel' : '') + '"><div class="pares"><i style="height:' + Math.max(x.v ? 4 : 0, Math.round(x.v * 100 / max)) + '%;background:' + esc(c.color) + ';width:60%"></i></div>' +
        '<small>' + mesCorto(x.mes) + '</small><em class="num">' + (x.v ? corta(x.v).replace('$ ', '') : '') + '</em></div>';
    }).join('') + '</div></div>';
    h += '<div class="pastillas" style="margin:0 0 12px"><button class="btn btn-sec" data-a="editar-cat" data-id="' + esc(id) + '">Editar categoría</button></div>';
    h += '<div class="seccion-tit">Todos los movimientos</div>' + listaAgrupada(ordenar(st.movimientos).slice(0, 60));
    return h;
  }

  /* ---------------- AHORRO E INVERSIONES ---------------- */
  function vistaAhorro() {
    var D = Datos.dolares(), a = Datos.ajustes();
    var h = cabSub('Ahorro e inversiones');
    h += '<div class="tarjeta heroe dolar-heroe"><div class="marca-agua">US$</div><div class="etiqueta">Dólares ahorrados</div>' +
      '<div class="valor num">' + usd(D.total) + '</div>' +
      (D.total > 0 ? '<div class="sub">Pagaste ' + plata(Math.round(D.costo)) + (D.promedio ? ' · promedio ' + plata(Math.round(D.promedio)) + ' por dólar' : '') + '</div>' +
        '<div class="pastillas"><span class="pastilla">Hoy valen <b class="num">' + plata(Math.round(D.valorHoy)) + '</b></span>' +
        '<span class="pastilla">Dólar ' + esc(a.casaDolar || 'oficial') + ' <b class="num">' + plata(D.cotizacion) + '</b></span>' +
        (D.costo ? '<span class="pastilla">' + (D.resultado >= 0 ? 'Ganás' : 'Perdés') + ' <b class="num ' + (D.resultado >= 0 ? 'pos' : 'neg') + '">' + plata(Math.round(Math.abs(D.resultado))) + '</b></span>' : '') + '</div>'
        : '<div class="sub">Todavía no registraste compras de dólares. Decí “compré 300 dólares con 450 lucas” o “puse 450 lucas en dólares, me dieron 310”.</div>') + '</div>';
    if (D.meses.length) {
      h += '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Mes a mes</span></div><div class="tabla-dolar"><div class="cab"><span>Mes</span><span>Compraste</span><span>Pagaste</span><span>Acumulado</span></div>' +
        D.meses.slice().reverse().map(function (x) {
          return '<div><span>' + esc(cap(mesLargo(x.mes))) + '</span><span class="num pos">+' + usd(x.comprados, 0) + (x.vendidos ? '<small class="neg">−' + usd(x.vendidos, 0) + '</small>' : '') + '</span>' +
            '<span class="num">' + corta(x.pesos) + (x.tc ? '<small>a ' + plata(Math.round(x.tc)) + '</small>' : '') + '</span><span class="num oro">' + usd(x.acumulado, 0) + '</span></div>';
        }).join('') + '</div></div>';
    }
    h += '<button class="btn btn-pri btn-ancho" style="margin:4px 0 18px" data-a="abrir-chat" data-sug="dolares">Registrar una compra de dólares</button>';
    // resto de las inversiones (sin los dólares, que van arriba)
    var c = Datos.cartera(), precios = Datos.meta('precios') || {};
    var pos = Object.keys(c.posiciones).map(function (k) { return c.posiciones[k]; }).filter(function (p) { return p.cantidad > 1e-9 && p.ticker !== 'USD'; });
    var ins = Object.keys(c.instrumentos).map(function (k) { return c.instrumentos[k]; }).filter(function (x) { return Math.abs(x.saldo) > 0.5 || x.ganancia; });
    h += '<div class="seccion-tit">Acciones, CEDEARs y cripto</div>';
    if (!pos.length) h += '<div class="lista"><div class="vacio">Decí “compré 10 CEDEARs de Apple a 18.500” y aparece acá.</div></div>';
    else h += '<div class="lista">' + pos.sort(function (x, y) { return y.costo - x.costo; }).map(function (p) {
      var ppc = p.costo / p.cantidad, pa = precios[p.ticker], res = pa ? pa * p.cantidad - p.costo : null;
      return '<button class="fila" data-a="precio-activo" data-t="' + esc(p.ticker) + '"><div class="ico">' + ({ cripto: '₿', accion: '📈', cedear: '🌎', bono: '📜', on: '🏢' }[p.clase] || '📈') + '</div>' +
        '<div class="cuerpo"><div class="t1">' + esc(p.ticker) + ' <span style="color:var(--texto-3);font-weight:500">× ' + p.cantidad.toLocaleString('es-AR', { maximumFractionDigits: 8 }) + '</span></div>' +
        '<div class="t2">Precio promedio ' + plata(ppc) + (pa ? ' · hoy ' + plata(pa) : ' · tocá para poner el precio de hoy') + '</div></div>' +
        '<div class="cifra num oro">' + plata(p.costo) + (res !== null ? '<small class="' + (res >= 0 ? 'pos' : 'neg') + '">' + (res >= 0 ? '+' : '−') + plata(res) + '</small>' : '') + '</div></button>';
    }).join('') + '</div>';
    h += '<div class="seccion-tit">Plazos fijos, fondos y proyectos</div>';
    if (!ins.length) h += '<div class="lista"><div class="vacio">Decí “puse 500 mil en plazo fijo a 30 días” y aparece acá.</div></div>';
    else h += '<div class="lista">' + ins.map(function (x) {
      var c2 = cat(x.categoria) || { icono: '🏦', nombre: 'Inversión' };
      return '<div class="fila"><div class="ico">' + c2.icono + '</div><div class="cuerpo"><div class="t1">' + esc(c2.nombre) + '</div><div class="t2">Aportado ' + plata(x.aportado) + (x.rescatado ? ' · rescatado ' + plata(x.rescatado) : '') + (x.ganancia ? ' · ganaste ' + plata(x.ganancia) : '') + '</div></div>' +
        '<div class="cifra num oro">' + plata(Math.max(0, x.saldo)) + '</div></div>';
    }).join('') + '</div>';
    var invMov = ordenar(Datos.lista('movimientos').filter(function (m) { return /inversion|rescate|_activo/.test(m.tipo); })).slice(0, 15);
    if (invMov.length) h += '<div class="seccion-tit">Últimas operaciones</div>' + listaAgrupada(invMov);
    return h;
  }

  /* ---------------- PRÉSTAMOS Y DEUDAS ---------------- */
  function prestamoAbierto(p) { return p.meDebe > 0.5 || p.leDebo > 0.5; }
  function vistaPrestamos() {
    var P = detallePersonas(), deben = [], debo = [], saldados = [], tDeben = 0, tDebo = 0;
    Object.keys(P).forEach(function (k) {
      var p = P[k];
      if (p.meDebe > 0.5) { deben.push(p); tDeben += p.meDebe; }
      if (p.leDebo > 0.5) { debo.push(p); tDebo += p.leDebo; }
      if (!prestamoAbierto(p)) saldados.push(p);
    });
    var h = cabSub('Préstamos y deudas');
    var neto = tDeben - tDebo;
    h += '<div class="deuda-tiles grande"><div class="dt pos"><small>Te deben</small><b class="num">' + plata(tDeben) + '</b><em>' + deben.length + ' persona' + (deben.length === 1 ? '' : 's') + '</em></div>' +
      '<div class="dt neg"><small>Debés</small><b class="num">' + plata(tDebo) + '</b><em>' + debo.length + ' persona' + (debo.length === 1 ? '' : 's') + '</em></div></div>';
    if (deben.length || debo.length) h += '<div class="comparo ' + (neto >= 0 ? 'bien' : 'mal') + '" style="margin:-4px 4px 14px">' + (neto >= 0 ? 'A tu favor: ' : 'En contra: ') + '<b class="num">' + plata(Math.abs(neto)) + '</b></div>';
    var fila = function (p, lado) {
      var total = lado === 'deben' ? p.prestado : p.debia, devuelto = lado === 'deben' ? p.cobrado : p.pagado, saldo = lado === 'deben' ? p.meDebe : p.leDebo;
      var pc = total > 0 ? Math.min(100, devuelto * 100 / total) : 0;
      var detalle = lado === 'deben'
        ? 'Le prestaste ' + corta(total) + (devuelto ? ' · te devolvió ' + corta(devuelto) : '')
        : 'Te prestó ' + corta(total) + (devuelto ? ' · le devolviste ' + corta(devuelto) : '');
      return '<button class="deuda-fila" data-a="ver-persona" data-p="' + esc(p.nombre) + '">' + avatar(p.nombre) +
        '<div class="cuerpo"><div class="t1">' + esc(p.nombre) + '</div><div class="t2">' + esc(detalle) + '</div>' +
        '<div class="cat-barra"><i style="width:' + pc.toFixed(1) + '%;background:' + (lado === 'deben' ? 'var(--verde)' : 'var(--rojo)') + '"></i></div>' +
        '<div class="t2 tenue">' + (p.desde ? 'Desde el ' + fechaCorta(p.desde) + ' · ' + haceTxt(p.desde) : '') + '</div></div>' +
        '<div class="cifra num ' + (lado === 'deben' ? 'pos' : 'neg') + '">' + plata(saldo) + '</div></button>';
    };
    h += '<div class="seccion-tit">Te deben</div>' + (deben.length ? '<div class="lista">' + deben.sort(function (a, b) { return b.meDebe - a.meDebe; }).map(function (p) { return fila(p, 'deben'); }).join('') + '</div>'
      : '<div class="lista"><div class="vacio">Nadie te debe nada.</div></div>');
    h += '<div class="seccion-tit">Les debés</div>' + (debo.length ? '<div class="lista">' + debo.sort(function (a, b) { return b.leDebo - a.leDebo; }).map(function (p) { return fila(p, 'debo'); }).join('') + '</div>'
      : '<div class="lista"><div class="vacio">No le debés a nadie. 🙌</div></div>');
    if (saldados.length) {
      h += '<div class="seccion-tit">Saldados</div><div class="lista">' + saldados.map(function (p) {
        var nota = p.leDebo < -0.5 ? 'pagaste ' + plata(-p.leDebo) + ' más de lo anotado' : p.meDebe < -0.5 ? 'te devolvió ' + plata(-p.meDebe) + ' más de lo anotado' : 'todo en cero';
        return '<button class="fila" data-a="ver-persona" data-p="' + esc(p.nombre) + '">' + avatar(p.nombre) + '<div class="cuerpo"><div class="t1">' + esc(p.nombre) + '</div><div class="t2">' + esc(nota) + '</div></div><div class="cifra" style="color:var(--nardo);font-size:13px;font-weight:600">✓ saldado</div></button>';
      }).join('') + '</div>';
    }
    h += '<div class="botonera"><button class="btn btn-pri" data-a="abrir-chat" data-sug="prestamo">Registrar préstamo o cobro</button></div>';
    return h;
  }
  /* compatibilidad: la lista vieja de préstamos */
  function tarjetaPrestamos() { return panelDeudas(); }

  /* ---------------- MÁS ---------------- */
  function vistaMas() {
    if (S.sub) return subvista();
    var per = Datos.cartera().personas, abiertos = Object.keys(per).filter(function (k) { return prestamoAbierto(per[k]); }).length;
    var s = Datos.Sync, v = Voz.motor(Datos.ajustes().voz);
    var item = function (sub, ico, t1, t2) {
      return '<button class="fila" data-a="ir" data-tab="mas" data-sub="' + sub + '"><div class="ico">' + ico + '</div><div class="cuerpo"><div class="t1">' + t1 + '</div><div class="t2">' + esc(t2) + '</div></div><span class="flecha">›</span></button>';
    };
    var h = encabezado('Todo lo demás', 'Más', botonSync());
    h += '<div class="seccion-tit">Tu plata</div><div class="lista menu">' +
      item('prestamos', '🤝', 'Préstamos', abiertos ? abiertos + ' persona' + (abiertos > 1 ? 's' : '') + ' con saldo abierto' : 'Sin saldos abiertos') +
      item('cuentas', '🏦', 'Cuentas', Datos.lista('cuentas').length + ' cuentas · saldos y alias') +
      item('ahorro', '💵', 'Ahorro e inversiones', (function () { var D = Datos.dolares(); return D.total > 0 ? usd(D.total) + ' ahorrados' : 'Dólares, plazos fijos, acciones'; })()) +
      item('proyectos', '🗂️', 'Proyectos', Datos.lista('proyectos').map(function (p) { return p.nombre; }).join(', ')) + '</div>';
    h += '<div class="seccion-tit">Cómo entiende lo que decís</div><div class="lista menu">' +
      item('categorias', '🏷️', 'Categorías', Datos.lista('categorias').filter(function (c) { return !c.archivada; }).length + ' categorías editables') +
      item('aprendido', '🧠', 'Lo que aprendió', 'Palabras tuyas que ya reconoce') +
      item('voz', '🎙️', 'Voz e IA', { nativo: 'Dictado del sistema', whisper: 'Whisper en el teléfono', 'whisper-sin-bajar': 'Whisper (falta bajarlo)', teclado: 'Micrófono del teclado' }[v] + (Datos.ajustes().ia ? ' · IA abierta activada' : '')) + '</div>';
    h += '<div class="seccion-tit">Configuración</div><div class="lista menu">' +
      item('respaldo', '☁️', 'Respaldo y sincronización', { ok: 'Todo respaldado en Drive', pendiente: 'Hay cambios por respaldar', sincronizando: 'Sincronizando…', error: 'Error al sincronizar', 'sin-vincular': 'Sin vincular' }[s.estado] || '') +
      item('cotizaciones', '💱', 'Cotizaciones', 'Dólar ' + (Datos.ajustes().casaDolar || 'oficial') + ' ' + plata((Datos.ajustes().cotizaciones || {}).USD || 0)) +
      item('ajustes', '⚙️', 'Ajustes', 'Nombre, cuentas por defecto, confirmación') +
      item('instalar', '📲', 'Instalar en el iPhone', Voz.esStandalone ? 'Ya está instalada' : 'Agregala a la pantalla de inicio') + '</div>';
    return h + pie();
  }

  function cabSub(titulo, sup) {
    return '<div class="encabezado"><div style="display:flex;gap:12px;align-items:center"><button class="boton-icono" data-a="volver">' + ICO.atras + '</button>' +
      '<div><div class="saludo">' + esc(sup || { inicio: 'Inicio', movimientos: 'Movimientos', analisis: 'Análisis' }[S.tab] || 'Más') + '</div><div class="titulo-pantalla" style="font-size:22px">' + esc(titulo) + '</div></div></div></div>';
  }

  function subvista() {
    switch (S.sub) {
      case 'prestamos': return vistaPrestamos();
      case 'ahorro': return vistaAhorro();
      case 'categoria': return vistaCategoria(S.subId);
      case 'persona': return vistaPersona(S.subId);
      case 'categorias': return vistaCategorias();
      case 'cuentas': return vistaCuentas();
      case 'proyectos': return vistaProyectos();
      case 'aprendido': return vistaAprendido();
      case 'voz': return vistaVoz();
      case 'respaldo': return vistaRespaldo();
      case 'cotizaciones': return vistaCotizaciones();
      case 'ajustes': return vistaAjustes();
      case 'instalar': return vistaInstalar();
    }
    S.sub = null; return vistaMas();
  }

  function vistaPersona(nombre) {
    var movs = ordenar(Datos.lista('movimientos').filter(function (m) { return m.persona === nombre || m.financiadoPor === nombre; }));
    var p = Datos.cartera().personas[nombre] || { meDebe: 0, leDebo: 0 };
    var h = cabSub(nombre, 'Préstamos');
    h += '<div class="tarjeta"><div class="kv"><span>Te debe</span><b class="num pos">' + plata(Math.max(0, p.meDebe)) + '</b></div><div class="kv"><span>Le debés</span><b class="num neg">' + plata(Math.max(0, p.leDebo)) + '</b></div>' +
      (p.leDebo < -0.5 ? '<p class="saludo" style="margin-top:8px">Le pagaste ' + plata(-p.leDebo) + ' más de lo anotado. Si era una deuda de antes de la app, está saldada.</p>' : '') +
      (p.meDebe < -0.5 ? '<p class="saludo" style="margin-top:8px">Te devolvió ' + plata(-p.meDebe) + ' más de lo anotado.</p>' : '') + '</div>';
    h += '<div class="pastillas" style="margin:0 0 12px">' +
      (p.meDebe > 0.5 ? '<button class="btn btn-pri" data-a="abrir-chat" data-texto="' + esc(nombre) + ' me devolvió ">Me devolvió</button>' : '') +
      (p.leDebo > 0.5 ? '<button class="btn btn-pri" data-a="abrir-chat" data-texto="le devolví a ' + esc(nombre) + ' ">Le pagué</button>' : '') +
      '<button class="btn btn-sec" data-a="abrir-chat" data-texto="le presté a ' + esc(nombre) + ' ">Le presté</button></div>';
    return h + listaAgrupada(movs);
  }

  function vistaCategorias() {
    var cats = Datos.lista('categorias').sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
    var grupos = [['gasto', 'Gastos'], ['ingreso', 'Ingresos'], ['inversion', 'Inversiones']];
    var h = cabSub('Categorías');
    h += '<p class="saludo" style="margin:-6px 4px 12px">Tocá una para cambiarle el nombre, el ícono, el color o las palabras con las que la reconoce.</p>';
    grupos.forEach(function (g) {
      var lista = cats.filter(function (c) { return c.tipo === g[0]; });
      h += '<div class="seccion-tit">' + g[1] + '</div><div class="lista">' + lista.map(function (c) {
        return '<button class="fila" data-a="editar-cat" data-id="' + esc(c.id) + '"' + (c.archivada ? ' style="opacity:.45"' : '') + '><div class="ico" style="background:' + esc(c.color) + '26">' + c.icono + '</div>' +
          '<div class="cuerpo"><div class="t1">' + esc(c.nombre) + (c.archivada ? ' · archivada' : '') + '</div><div class="t2">' + esc((c.palabras || []).slice(0, 6).join(', ') || 'sin palabras clave') + '</div></div><span class="flecha" style="color:var(--texto-3)">›</span></button>';
      }).join('') + '</div>';
    });
    h += '<button class="btn btn-pri btn-ancho" data-a="nueva-cat">Nueva categoría</button>';
    return h;
  }

  function vistaCuentas() {
    var saldos = Datos.saldosCuentas(), a = Datos.ajustes();
    var h = cabSub('Cuentas');
    h += '<p class="saludo" style="margin:-6px 4px 12px">Cargá el saldo que tenía cada cuenta al empezar y la app lleva la cuenta sola.</p><div class="lista">';
    Datos.lista('cuentas').sort(function (x, y) { return (x.orden || 0) - (y.orden || 0); }).forEach(function (c) {
      var def = a.cuentaGasto === c.id || (!a.cuentaGasto && c.id === 'cta-mp') ? ' · por defecto en gastos' : '';
      h += '<button class="fila" data-a="editar-cuenta" data-id="' + esc(c.id) + '"><div class="ico">' + c.icono + '</div><div class="cuerpo"><div class="t1">' + esc(c.nombre) + '</div>' +
        '<div class="t2">' + esc((c.alias || []).slice(0, 5).join(', ')) + esc(def) + '</div></div><div class="cifra num ' + (saldos[c.id] >= 0 ? '' : 'neg') + '">' + (saldos[c.id] < 0 ? '−' : '') + plata(saldos[c.id] || 0) + '</div></button>';
    });
    h += '</div><button class="btn btn-sec btn-ancho" data-a="nueva-cuenta">Nueva cuenta</button>';
    return h;
  }

  function vistaProyectos() {
    var movs = Datos.lista('movimientos'), h = cabSub('Proyectos');
    h += '<p class="saludo" style="margin:-6px 4px 12px">Agrupan movimientos de un mismo objetivo: una obra, un negocio, un viaje.</p><div class="lista">';
    Datos.lista('proyectos').forEach(function (p) {
      var tot = movs.filter(function (m) { return m.proyecto === p.id; }).reduce(function (s, m) { return s + Datos.montoARS(m) * (TIPO_UI[m.tipo].signo || 0); }, 0);
      h += '<button class="fila" data-a="editar-proy" data-id="' + esc(p.id) + '"><div class="ico">' + p.icono + '</div><div class="cuerpo"><div class="t1">' + esc(p.nombre) + '</div>' +
        '<div class="t2">' + (p.esInversion ? 'Cuenta como inversión · ' : '') + esc((p.palabras || []).slice(0, 4).join(', ')) + '</div></div><div class="cifra num ' + (tot >= 0 ? 'pos' : 'neg') + '">' + (tot < 0 ? '−' : '+') + plata(tot) + '</div></button>';
    });
    return h + '</div><button class="btn btn-sec btn-ancho" data-a="nuevo-proy">Nuevo proyecto</button>';
  }

  function vistaAprendido() {
    var ctx = Datos.contextoMotor(), olv = Datos.meta('olvidadas') || [];
    var reglas = Object.keys(ctx.reglas).filter(function (k) { return olv.indexOf(k) < 0 && k.indexOf(' ') < 0; })
      .map(function (k) { return { k: k, r: ctx.reglas[k] }; }).sort(function (a, b) { return b.r.n - a.r.n; }).slice(0, 80);
    var h = cabSub('Lo que aprendió');
    h += '<p class="saludo" style="margin:-6px 4px 12px">Sale de cómo categorizaste tus movimientos. Cada vez que corregís uno, aprende. Si alguna palabra la lleva a un lugar equivocado, olvidala.</p>';
    if (!reglas.length) return h + '<div class="lista"><div class="vacio">Todavía no hay suficientes movimientos para aprender.</div></div>';
    h += '<div class="lista">' + reglas.map(function (x) {
      var c = cat(x.r.cat) || { icono: '•', nombre: x.r.cat };
      return '<div class="fila"><div class="ico">' + c.icono + '</div><div class="cuerpo"><div class="t1">“' + esc(x.k) + '”</div><div class="t2">→ ' + esc(c.nombre) + (x.r.nd ? ' · ' + x.r.nd : '') + ' · visto ' + Math.round(x.r.n) + ' ' + (Math.round(x.r.n) === 1 ? 'vez' : 'veces') + '</div></div>' +
        '<button class="btn btn-sec" style="height:34px;font-size:12.5px" data-a="olvidar" data-k="' + esc(x.k) + '">Olvidar</button></div>';
    }).join('') + '</div>';
    return h;
  }

  function vistaVoz() {
    var a = Datos.ajustes(), m = Voz.motor(a.voz);
    var opcion = function (v, t, d) {
      return '<button class="fila" data-a="voz-pref" data-v="' + v + '"><div class="ico">' + (a.voz === v || (!a.voz && v === 'auto') ? '✅' : '◻️') + '</div><div class="cuerpo"><div class="t1">' + t + '</div><div class="t2" style="white-space:normal">' + d + '</div></div></button>';
    };
    var h = cabSub('Voz e IA');
    h += '<div class="tarjeta"><div class="etiqueta">Ahora el micrófono usa</div><div style="font-size:19px;font-weight:700;margin-top:6px">' +
      { nativo: '🎙️ Dictado del sistema', whisper: '🧠 Whisper en el teléfono', 'whisper-sin-bajar': '🧠 Whisper (hay que bajarlo)', teclado: '⌨️ Micrófono del teclado' }[m] + '</div>' +
      '<div class="saludo" style="margin-top:6px">' + (Voz.esIOS && Voz.esStandalone ? 'Estás en la app instalada: en iPhone, el dictado del sistema no funciona dentro de apps instaladas, por eso se usa Whisper o el teclado.' : 'En Safari o en la compu, el dictado del sistema es el más rápido.') + '</div></div>';
    h += '<div class="seccion-tit">Motor de voz</div><div class="lista">' +
      opcion('auto', 'Automático', 'Usa el dictado del sistema cuando funciona y Whisper cuando no.') +
      opcion('nativo', 'Dictado del sistema', 'El de Apple o Google. Rapidísimo; en iPhone solo anda abriendo la app desde Safari.') +
      opcion('whisper', 'Whisper (código abierto)', 'Reconocimiento de voz de OpenAI corriendo en tu teléfono. Gratis, sin internet una vez bajado.') +
      opcion('teclado', 'Micrófono del teclado', 'El botón te lleva al cuadro de texto y dictás con el 🎤 del teclado.') + '</div>';
    var wl = Voz.whisperListo();
    h += '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Whisper</span><span class="placa">' + (wl ? '✓ bajado' : 'sin bajar') + '</span></div>' +
      '<div class="saludo">Se baja una sola vez y queda guardado. Base: ~77 MB, bueno para frases cortas. Small: ~250 MB, más preciso con números y nombres.</div>' +
      '<div class="pastillas"><button class="btn btn-pri" data-a="bajar-whisper" data-m="base">' + (wl && (localStorage.getItem('whisperModelo') || 'base') === 'base' ? 'Volver a cargar base' : 'Bajar base (77 MB)') + '</button>' +
      '<button class="btn btn-sec" data-a="bajar-whisper" data-m="small">Bajar small (250 MB)</button></div>' +
      '<div class="barra-progreso oculto" id="prog-whisper"><i></i></div><div class="saludo" id="prog-whisper-t"></div></div>';
    h += '<div class="seccion-tit">IA de código abierto</div><div class="tarjeta"><div style="display:flex;gap:12px;align-items:center;justify-content:space-between">' +
      '<div><div style="font-weight:700">Ayuda de IA para frases difíciles</div><div class="saludo" style="margin-top:4px">Un modelo abierto (Qwen o Llama) corriendo en tu teléfono. Solo entra en juego cuando el motor no está seguro. Necesita iOS 26 o una compu con Chrome.</div></div>' +
      '<button class="interruptor' + (a.ia ? ' on' : '') + '" data-a="toggle-ia" aria-label="IA"></button></div>' +
      '<div class="saludo" id="ia-estado" style="margin-top:10px">' + (IA.lista() ? '✓ Cargada: ' + esc(IA.modelo()) : IA.descargada() ? 'Bajada (' + esc(IA.modelo() || '') + '). Se carga cuando la necesites.' : 'No bajada todavía.') + '</div>' +
      '<div class="barra-progreso oculto" id="prog-ia"><i></i></div></div>';
    return h;
  }

  function vistaRespaldo() {
    var s = Datos.Sync, v = s.vinculo(), u = Datos.meta('ultimoSyncLocal');
    var h = cabSub('Respaldo y sincronización');
    if (!v) {
      h += '<div class="tarjeta"><div class="etiqueta">Sin vincular</div><p class="saludo">Tus datos están solo en este teléfono. Vinculá el respaldo en tu Google Drive para no perder nada y verlos también en la compu.</p>' +
        '<div class="campo"><label>Código de vinculación</label><textarea id="codigo-vinculo" placeholder="Pegá acá el link o el código"></textarea></div>' +
        '<button class="btn btn-pri btn-ancho" data-a="vincular">Vincular</button>' +
        '<button class="btn btn-sec btn-ancho" style="margin-top:8px" data-a="pegar-vinculo">Pegar desde el portapapeles</button></div>';
    } else {
      h += '<div class="tarjeta"><div class="cabeza-tarjeta"><span class="etiqueta">Google Drive</span><span class="punto-sync"></span></div>' +
        '<div class="kv"><span>Estado</span><b>' + ({ ok: 'Todo respaldado', pendiente: 'Cambios por respaldar', sincronizando: 'Sincronizando…', error: 'Error', 'sin-vincular': '—' }[s.estado] || s.estado) + '</b></div>' +
        '<div class="kv"><span>Último respaldo</span><b>' + (u ? new Date(u).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'nunca') + '</b></div>' +
        '<div class="kv"><span>Pendientes</span><b>' + s.pendientes() + '</b></div>' +
        (s.error ? '<div class="kv"><span>Detalle</span><b style="color:var(--rojo);font-weight:500;text-align:right;max-width:60%">' + esc(s.error) + '</b></div>' : '') +
        '<div class="botonera"><button class="btn btn-pri" data-a="sincronizar">Sincronizar ahora</button></div></div>' +
        '<div class="tarjeta"><div class="etiqueta">Vincular otro dispositivo</div><p class="saludo">Mostrá el QR y escanealo con la cámara del otro teléfono: se abre la app ya vinculada.</p>' +
        (S.verQR ? '<div class="qr-caja" id="qr-vinculo"><span>Generando…</span></div>' : '') +
        '<div class="botonera"><button class="btn btn-sec" data-a="ver-qr">' + (S.verQR ? 'Ocultar QR' : 'Mostrar QR') + '</button><button class="btn btn-sec" data-a="copiar-codigo">Copiar código</button></div>' +
        '<p class="saludo" style="font-size:12.5px;margin-top:10px">En iPhone, la app de la pantalla de inicio no comparte datos con Safari: copiá el código en Safari y pegalo en la app instalada (Más › Respaldo).</p></div>';
      if (S.verQR) setTimeout(pintarQR, 0);
    }
    h += '<div class="seccion-tit">Copias en archivo</div><div class="lista menu">' +
      '<button class="fila" data-a="exportar" data-f="json"><div class="ico">💾</div><div class="cuerpo"><div class="t1">Copia completa (JSON)</div><div class="t2">Para restaurar todo en otro teléfono</div></div><span class="flecha">›</span></button>' +
      '<button class="fila" data-a="exportar" data-f="csv"><div class="ico">📄</div><div class="cuerpo"><div class="t1">Planilla (CSV)</div><div class="t2">Se abre en Excel o Google Sheets</div></div><span class="flecha">›</span></button>' +
      '<label class="fila" style="cursor:pointer"><div class="ico">📥</div><div class="cuerpo"><div class="t1">Restaurar una copia</div><div class="t2">Elegí un archivo JSON exportado</div></div><input type="file" accept="application/json,.json" data-i="importar" class="oculto"></label></div>';
    if (v) h += '<button class="btn btn-peligro btn-ancho" style="margin-top:8px" data-a="desvincular">Desvincular este teléfono</button>';
    return h;
  }

  /* QR de vinculación: se genera en el propio teléfono (la clave no sale a ningún servicio de QR). */
  var QR_LIB = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js', qrLib = null;
  function cargarQR() {
    if (window.qrcode) return Promise.resolve();
    if (!qrLib) qrLib = new Promise(function (ok, mal) {
      var s = document.createElement('script'); s.src = QR_LIB; s.onload = ok;
      s.onerror = function () { qrLib = null; mal(new Error('sin conexión')); };
      document.head.appendChild(s);
    });
    return qrLib;
  }
  async function pintarQR() {
    var caja = $('#qr-vinculo'), codigo = Datos.Sync.codigo();
    if (!caja || !codigo) return;
    try {
      await cargarQR();
      var qr = window.qrcode(0, 'M');
      qr.addData(location.origin + location.pathname + '#v=' + codigo);
      qr.make();
      caja.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    } catch (e) { caja.innerHTML = '<span>No pude generar el QR (¿sin internet?). Usá “Copiar código”.</span>'; }
  }

  function vistaCotizaciones() {
    var a = Datos.ajustes(), c = a.cotizaciones || {}, f = Datos.meta('cotizacionesFecha');
    var h = cabSub('Cotizaciones');
    h += '<p class="saludo" style="margin:-6px 4px 12px">Se usan para pasar a pesos lo que gastás en dólares, reales o euros. Se actualizan solas desde dolarapi.com (gratis).</p>';
    h += '<div class="tarjeta"><div class="campo"><label>Dólar de referencia</label><div class="seg">' +
      [['oficial', 'Oficial'], ['blue', 'Blue'], ['bolsa', 'MEP'], ['tarjeta', 'Tarjeta']].map(function (x) {
        return '<button class="' + ((a.casaDolar || 'oficial') === x[0] ? 'sel' : '') + '" data-a="casa-dolar" data-v="' + x[0] + '">' + x[1] + '</button>';
      }).join('') + '</div></div>' +
      '<div class="tres"><div class="campo"><label>Dólar</label><input inputmode="decimal" data-i="cot" data-m="USD" value="' + esc(c.USD || '') + '"></div>' +
      '<div class="campo"><label>Real</label><input inputmode="decimal" data-i="cot" data-m="BRL" value="' + esc(c.BRL || '') + '"></div>' +
      '<div class="campo"><label>Euro</label><input inputmode="decimal" data-i="cot" data-m="EUR" value="' + esc(c.EUR || '') + '"></div></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><span>Actualizar automáticamente</span><button class="interruptor' + (a.cotizacionesAuto !== false ? ' on' : '') + '" data-a="toggle-cot"></button></div>' +
      '<div class="saludo" style="margin-top:10px">' + (f ? 'Última actualización: ' + new Date(f).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '') + '</div>' +
      '<button class="btn btn-sec btn-ancho" style="margin-top:10px" data-a="actualizar-cot">Actualizar ahora</button></div>';
    return h;
  }

  function vistaAjustes() {
    var a = Datos.ajustes(), ctas = Datos.lista('cuentas');
    var sel = function (campo, def) {
      return '<select data-i="ajuste" data-k="' + campo + '">' + ctas.map(function (c) { return '<option value="' + esc(c.id) + '"' + ((a[campo] || def) === c.id ? ' selected' : '') + '>' + esc(c.nombre) + '</option>'; }).join('') + '</select>';
    };
    var h = cabSub('Ajustes');
    h += '<div class="tarjeta"><div class="campo"><label>Tu nombre</label><input data-i="ajuste" data-k="nombre" value="' + esc(a.nombre || '') + '"></div>' +
      '<div class="dos"><div class="campo"><label>Cuenta para gastos</label>' + sel('cuentaGasto', 'cta-mp') + '</div><div class="campo"><label>Cuenta para ingresos</label>' + sel('cuentaIngreso', 'cta-bbva') + '</div></div>' +
      '<div style="display:flex;gap:12px;justify-content:space-between;align-items:center"><div><div style="font-weight:650">Confirmar antes de guardar</div><div class="saludo">Si está apagado, guarda al instante y te deja corregir.</div></div>' +
      '<button class="interruptor' + (a.confirmar ? ' on' : '') + '" data-a="toggle-confirmar"></button></div></div>';
    h += '<div class="pie-app">Finanzas · motor v' + Motor.VERSION + ' · todo corre en tu teléfono</div>';
    return h;
  }

  function vistaInstalar() {
    var h = cabSub('Instalar en el iPhone');
    if (Voz.esStandalone) return h + '<div class="tarjeta"><b>Ya está instalada ✓</b><p class="saludo">Para dictar dentro de la app se usa Whisper (bajalo desde Voz e IA) o el micrófono del teclado.</p></div>';
    h += '<div class="tarjeta"><ol style="margin:0;padding-left:20px;line-height:1.9">' +
      '<li>Abrí esta página en <b>Safari</b>.</li><li>Tocá el botón <b>Compartir</b> (el cuadrado con la flecha).</li>' +
      '<li>Elegí <b>Agregar a pantalla de inicio</b>.</li><li>Dejá activado <b>Abrir como app web</b> y tocá <b>Agregar</b>.</li></ol>' +
      '<p class="saludo" style="margin-top:12px">Un detalle de Apple: dentro de la app instalada el dictado del sistema no funciona, así que el micrófono usa Whisper (código abierto, corre en el teléfono). Si preferís el dictado de Apple, apagá “Abrir como app web” y se abre en Safari.</p></div>';
    return h;
  }

  /* ================= CHAT DE REGISTRO ================= */
  var SUGERENCIAS = {
    general: ['gasté 8 lucas en el súper con débito', 'cobré el sueldo, 1.323.228', 'le presté 50 mil a Nacho', 'compré 10 CEDEARs de Apple a 18.500', 'puse 500 mil en plazo fijo a 30 días'],
    dolares: ['compré 300 dólares con 450 mil pesos', 'puse 450 lucas en dólares, me dieron 310', 'compré 200 dólares a 1480 con mercado pago', 'vendí 100 dólares a 1500'],
    inversion: ['compré 10 CEDEARs de Apple a 18.500', 'compré 200 dólares a 1.450', 'puse 500 mil en plazo fijo a 30 días', 'vendí 5 acciones de YPF a 42 mil', 'metí 200 lucas en el money market'],
    prestamo: ['le presté 50 lucas a Nacho', 'Gonza me devolvió 20 mil', 'mi viejo me prestó 100 mil', 'le devolví 30 lucas a Fer', 'Nacho me pagó la birra, le debo 5 lucas']
  };

  function abrirChat(sug, texto) {
    var c = $('#chat');
    c.classList.add('abierto');
    S.chat.abierto = true;
    document.body.style.overflow = 'hidden';
    if (!S.chat.mensajes.length) {
      S.chat.mensajes.push({ de: 'app', html: '¿Qué movimiento querés registrar? Tocá el micrófono y decímelo como te salga.' +
        '<div class="ejemplos">' + (SUGERENCIAS[sug] || SUGERENCIAS.general).map(function (s) { return '<button class="ejemplo" data-a="ejemplo">' + esc(s) + '</button>'; }).join('') + '</div>' });
    } else if (sug && SUGERENCIAS[sug]) {
      S.chat.mensajes.push({ de: 'app', html: 'Por ejemplo:<div class="ejemplos">' + SUGERENCIAS[sug].map(function (s) { return '<button class="ejemplo" data-a="ejemplo">' + esc(s) + '</button>'; }).join('') + '</div>' });
    }
    pintarChat();
    pintarPieChat();
    var e = $('#entrada');
    if (texto) { e.value = texto; autoAltura(e); setTimeout(function () { e.focus(); e.setSelectionRange(texto.length, texto.length); }, 350); }
    history.pushState({ chat: 1 }, '');
  }
  function cerrarChat(desdeHistorial) {
    detenerEscucha();
    $('#chat').classList.remove('abierto');
    S.chat.abierto = false;
    document.body.style.overflow = '';
    if (!desdeHistorial && history.state && history.state.chat) history.back();
    render();
  }
  window.addEventListener('popstate', function () { if (S.chat.abierto) cerrarChat(true); else if ($('#hoja').classList.contains('on')) cerrarHoja(); });

  function pintarChat() {
    var cuerpo = $('#chat-cuerpo');
    cuerpo.innerHTML = S.chat.mensajes.map(function (m) {
      if (m.ficha) return fichaHTML(S.chat.fichas[m.ficha]);
      return '<div class="burbuja ' + (m.de === 'yo' ? 'yo' : 'app') + '">' + (m.html || esc(m.texto)) + '</div>';
    }).join('');
    cuerpo.scrollTop = cuerpo.scrollHeight;
  }
  function pintarPieChat() {
    var a = Datos.ajustes(), m = Voz.motor(a.voz), aviso = $('#aviso-voz');
    var esc_ = S.chat.escuchando;
    var mic = $('#mic');
    mic.classList.toggle('escuchando', !!esc_ && esc_.estado === 'escuchando');
    mic.classList.toggle('procesando', !!esc_ && esc_.estado === 'procesando');
    mic.innerHTML = esc_ ? (esc_.estado === 'procesando' ? ICO.mic : ICO.stop) : (m === 'teclado' ? ICO.teclado : ICO.mic);
    $('#chat-estado').textContent = esc_ ? (esc_.estado === 'procesando' ? 'Entendiendo lo que dijiste…' : 'Te escucho…') : 'Hablá o escribí';
    aviso.classList.toggle('oculto', !(m === 'teclado' || m === 'whisper-sin-bajar') || !!esc_);
    if (m === 'teclado') aviso.textContent = 'Tocá el cuadro de texto y usá el 🎤 del teclado para dictar.';
    if (m === 'whisper-sin-bajar') aviso.textContent = 'Para dictar dentro de la app, la primera vez bajo el reconocedor de voz (77 MB). Tocá el micrófono.';
    var hayTexto = $('#entrada').value.trim().length > 0;
    $('#enviar').classList.toggle('oculto', !hayTexto);
    $('#nivel').classList.toggle('oculto', !(esc_ && m === 'whisper'));
  }
  function autoAltura(e) { e.style.height = 'auto'; e.style.height = Math.min(140, e.scrollHeight) + 'px'; }

  /* ---- micrófono ---- */
  async function alternarMic() {
    if (S.chat.escuchando) { detenerEscucha(true); return; }
    var a = Datos.ajustes(), m = Voz.motor(a.voz);
    if (m === 'teclado') { var e = $('#entrada'); e.focus(); toast('Tocá el 🎤 del teclado y dictá'); return; }
    if (m === 'whisper-sin-bajar') {
      if (!confirm('Para usar el micrófono dentro de la app instalada bajo Whisper, un reconocedor de voz de código abierto que corre en tu teléfono (unos 77 MB, una sola vez). ¿Lo bajo ahora?')) { $('#entrada').focus(); return; }
      var ok = await bajarWhisper('base', true);
      if (!ok) return;
    }
    vibrar(15);
    var burbujaParcial = null;
    S.chat.escuchando = { estado: 'escuchando', control: null };
    pintarPieChat();
    try {
      var control = await Voz.escuchar(a.voz, {
        estado: function (st) { if (S.chat.escuchando) { S.chat.escuchando.estado = st; pintarPieChat(); } },
        nivel: function (n) { var i = document.querySelector('#nivel i'); if (i) i.style.width = Math.round(n * 100) + '%'; },
        parcial: function (t) {
          if (!burbujaParcial) { burbujaParcial = { de: 'yo', html: '' }; S.chat.mensajes.push(burbujaParcial); }
          burbujaParcial.html = '<span class="provisorio">' + esc(t) + '</span>';
          pintarChat();
        },
        final: function (t) {
          if (burbujaParcial) { S.chat.mensajes.splice(S.chat.mensajes.indexOf(burbujaParcial), 1); }
          S.chat.escuchando = null; pintarPieChat();
          if (t) procesar(t, 'voz');
          else { pintarChat(); toast('No te escuché. Probá de nuevo, más cerca del teléfono.'); }
        },
        error: function (codigo) {
          if (burbujaParcial) { S.chat.mensajes.splice(S.chat.mensajes.indexOf(burbujaParcial), 1); pintarChat(); }
          S.chat.escuchando = null; pintarPieChat();
          if (/not-allowed|service-not-allowed|no-arranca/.test(codigo)) {
            if (Voz.whisperUsable()) toast('El dictado del sistema no está disponible acá. Tocá el micrófono otra vez para usar Whisper.');
            else { $('#entrada').focus(); toast('Usá el 🎤 del teclado para dictar'); }
          } else if (/whisper/.test(codigo)) toast('No pude transcribir: ' + codigo.replace('whisper: ', ''));
          else toast('Error del micrófono: ' + codigo);
        }
      });
      if (!control) { S.chat.escuchando = null; pintarPieChat(); $('#entrada').focus(); return; }
      if (S.chat.escuchando) S.chat.escuchando.control = control;
    } catch (e) {
      S.chat.escuchando = null; pintarPieChat();
      toast(/Permission|NotAllowed/i.test(e.name || e.message) ? 'Necesito permiso para usar el micrófono (Ajustes del iPhone › Safari › Micrófono).' : 'No pude abrir el micrófono: ' + (e.message || e));
    }
  }
  function detenerEscucha(conResultado) {
    var e = S.chat.escuchando;
    if (!e) return;
    if (e.control && e.control.detener) e.control.detener();
    if (!conResultado) { S.chat.escuchando = null; pintarPieChat(); }
  }

  async function bajarWhisper(tamano, desdeChat) {
    var prog = $('#prog-whisper'), t = $('#prog-whisper-t');
    if (desdeChat) {
      S.chat.mensajes.push({ de: 'app', html: '<b>Bajando el reconocedor de voz…</b><div class="barra-progreso"><i id="prog-chat"></i></div><div class="saludo" id="prog-chat-t">Esto pasa una sola vez.</div>' });
      pintarChat();
    }
    if (prog) prog.classList.remove('oculto');
    try {
      await Voz.cargarWhisper(tamano, function (k, mb) {
        var w = Math.round(k * 100) + '%';
        var i1 = document.querySelector('#prog-whisper i'), i2 = $('#prog-chat');
        if (i1) i1.style.width = w; if (i2) i2.style.width = w;
        var txt = w + (mb ? ' de ' + mb + ' MB' : '');
        if (t) t.textContent = txt; var t2 = $('#prog-chat-t'); if (t2) t2.textContent = txt;
      });
      if (Datos.ajustes().voz === 'teclado') await Datos.cambiarAjustes({ voz: 'auto' });
      toast('Whisper listo: ya podés dictar');
      if (desdeChat) { S.chat.mensajes.push({ de: 'app', texto: 'Listo. Tocá el micrófono y hablá.' }); pintarChat(); pintarPieChat(); }
      else render();
      return true;
    } catch (e) {
      toast('No pude bajar Whisper: ' + (e.message || e));
      if (desdeChat) { S.chat.mensajes.push({ de: 'app', texto: 'No pude bajarlo (' + (e.message || e) + '). Mientras tanto, usá el 🎤 del teclado.' }); pintarChat(); }
      return false;
    }
  }

  /* ---- interpretación ---- */
  var BLOQUEANTES = { monto: 1, persona: 1, tipo: 1, cuentas: 1, activo: 1 };

  async function procesar(texto, origen) {
    texto = String(texto || '').trim();
    if (!texto) return;
    S.chat.mensajes.push({ de: 'yo', texto: texto });
    pintarChat();
    var ctx = Datos.contextoMotor();
    var olv = Datos.meta('olvidadas'); if (!Array.isArray(olv)) olv = [];
    olv.forEach(function (k) { delete ctx.reglas[k]; });
    var r = Motor.interpretar(texto, ctx);
    var movs = r.movimientos;
    var a = Datos.ajustes();
    // ¿no entendí nada?
    var nada = !movs.length || (movs.length === 1 && !movs[0].monto && (movs[0].categoria === 'cat-otros-gastos' || !movs[0].categoria) && movs[0].confianza < 0.5);
    if (a.ia && (nada || movs.some(function (m) { return m.confianza < 0.6; }))) {
      var pensando = { de: 'app', html: '<span class="saludo">🧠 Pensándolo con la IA…</span>' };
      S.chat.mensajes.push(pensando); pintarChat();
      try {
        if (!IA.lista()) await IA.cargar(null);
        var leidos = await IA.leer(texto, ctx, hoyISO());
        if (leidos && leidos.length) {
          if (nada && !movs.length) movs = leidos.map(function () { return { tipo: 'gasto', monto: null, moneda: 'ARS', fecha: hoyISO(), dudas: [{ campo: 'monto', texto: '¿Cuánto fue?' }], notas: [], confianza: 0.4, descripcion: '' }; });
          movs = movs.map(function (m, i) { return IA.fusionar(m, leidos[i] || leidos[0], ctx); });
          nada = false;
        }
      } catch (e) { /* sigue sin IA */ }
      S.chat.mensajes.splice(S.chat.mensajes.indexOf(pensando), 1);
    }
    if (nada) {
      S.chat.mensajes.push({ de: 'app', html: 'No encontré un movimiento en eso. Probá algo como <b>“gasté 5 lucas en la panadería”</b> o <b>“cobré 200 mil de una changa”</b>.' });
      pintarChat(); return;
    }
    for (var i = 0; i < movs.length; i++) {
      var f = { id: Datos.uuid(), mov: movs[i], texto: movs[i].texto || texto, origen: origen || 'texto', estado: 'pendiente', regIds: [] };
      S.chat.fichas[f.id] = f;
      S.chat.mensajes.push({ ficha: f.id });
      var bloquea = f.mov.dudas.some(function (d) { return BLOQUEANTES[d.campo]; });
      if (!bloquea && !a.confirmar) await guardarFicha(f, true);
    }
    pintarChat();
    vibrar(10);
  }

  function aRegistros(f) {
    return Motor.aRegistros(f.mov, { texto: f.texto, origen: f.origen, cotizaciones: Datos.ajustes().cotizaciones, hoy: hoyISO() });
  }

  async function guardarFicha(f, silencioso) {
    if (f.estado === 'guardada') {
      // actualizar los registros existentes
      var recs = aRegistros(f);
      for (var i = 0; i < f.regIds.length && i < recs.length; i++) {
        var actual = Datos.uno('movimientos', f.regIds[i]) || {};
        await Datos.guardar('movimientos', Object.assign({}, actual, recs[i], { id: f.regIds[i], corregido: true }), { silencioso: true });
      }
      return;
    }
    await crearCategoriaPedida(f.mov);
    var nuevos = await Datos.guardarVarios('movimientos', aRegistros(f));
    f.regIds = nuevos.map(function (r) { return r.id; });
    f.estado = 'guardada';
    if (!silencioso) { pintarChat(); vibrar(10); }
  }

  /** "categoría mascotas": si no existe, la creo y la dejo aprendida. */
  async function crearCategoriaPedida(m) {
    if (!m.categoriaNueva) return;
    var tipoCat = m.tipo === 'ingreso' ? 'ingreso' : 'gasto', nom = m.categoriaNueva;
    var ex = Datos.lista('categorias').filter(function (c) { return c.tipo === tipoCat && Motor._.norm(c.nombre) === Motor._.norm(nom); })[0];
    if (!ex) {
      ex = await Datos.guardar('categorias', { id: 'cat-' + Motor._.slug(nom), nombre: nom, tipo: tipoCat, grupo: tipoCat === 'gasto' ? 'variable' : null,
        icono: '🏷️', color: COLORES[Datos.lista('categorias').length % COLORES.length], nd: null, palabras: [Motor._.norm(nom)], orden: 300, archivada: false });
      toast('Creé la categoría “' + nom + '”');
    }
    m.categoria = ex.id; m.notas = (m.notas || []).filter(function (x) { return !/^categoría nueva/.test(x); }); delete m.categoriaNueva;
  }

  async function deshacerFicha(f) {
    for (var i = 0; i < f.regIds.length; i++) await Datos.borrar('movimientos', f.regIds[i]);
    f.estado = 'deshecha';
    pintarChat();
    toast('Listo, lo borré');
  }

  function fichaHTML(f) {
    if (!f) return '';
    var m = f.mov, ui = TIPO_UI[m.tipo] || TIPO_UI.gasto;
    var dudas = m.dudas.filter(function (d) { return BLOQUEANTES[d.campo]; });
    var chips = [];
    var c = cat(m.categoria);
    if (c && !/prestamo|cobro_|pago_deuda|transferencia/.test(m.tipo)) chips.push('<button class="fchip ed" data-a="f-cat" data-f="' + f.id + '">' + c.icono + ' ' + esc(c.nombre) + '</button>');
    if (m.tipo === 'transferencia') chips.push('<button class="fchip ed" data-a="f-editar" data-f="' + f.id + '">' + esc((cta(m.cuenta) || {}).nombre || '¿?') + ' → ' + esc((cta(m.cuentaDestino) || {}).nombre || '¿?') + '</button>');
    else if (m.cuenta) chips.push('<button class="fchip ed" data-a="f-cuenta" data-f="' + f.id + '">' + ((cta(m.cuenta) || {}).icono || '') + ' ' + esc((cta(m.cuenta) || {}).nombre || '') + '</button>');
    chips.push('<button class="fchip ed" data-a="f-fecha" data-f="' + f.id + '">📅 ' + esc(etiquetaDia(m.fecha || hoyISO())) + '</button>');
    if (m.activo && m.activo.ticker === 'USD') chips.push('<button class="fchip ed oro" data-a="f-editar" data-f="' + f.id + '">💵 ' + usd(m.activo.cantidad || 0) + (m.activo.precio ? ' a ' + plata(Math.round(m.activo.precio * 100) / 100) : '') + '</button>');
    if (m.persona) chips.push('<span class="fchip">👤 ' + esc(m.persona) + '</span>');
    if (m.financiadoPor) chips.push('<span class="fchip">👤 lo pagó ' + esc(m.financiadoPor) + '</span>');
    var p = pry(m.proyecto); if (p) chips.push('<span class="fchip">' + p.icono + ' ' + esc(p.nombre) + '</span>');
    if (m.tipo === 'gasto') chips.push('<button class="fchip ed" data-a="f-nd" data-f="' + f.id + '">' + (m.nd === 'Deseo' ? '✨ Deseo' : m.nd === 'Necesidad' ? '✅ Necesidad' : '¿Necesidad o deseo?') + '</button>');
    if (m.porIA) chips.push('<span class="fchip">🧠 con IA</span>');
    var signo = ui.signo > 0 ? '+' : ui.signo < 0 ? '−' : '';
    var monto = m.monto != null ? signo + plata(m.monto, m.moneda) : '$ ¿?';
    var equiv = m.moneda && m.moneda !== 'ARS' && m.montoARS ? ' <span style="font-size:15px;color:var(--texto-3);font-weight:600">≈ ' + plata(m.montoARS) + '</span>' : '';
    var estado = f.estado === 'guardada' ? '<span class="estado-ficha ok">✓ Guardado</span>' : f.estado === 'deshecha' ? '<span class="estado-ficha">Deshecho</span>' : '<span class="estado-ficha">Falta un dato</span>';
    var h = '<div class="ficha ' + (f.estado === 'guardada' ? 'guardada' : f.estado === 'deshecha' ? 'deshecha' : 'pendiente') + '">' +
      '<div class="ficha-top"><span class="tipo-chip ' + ui.cls + '">' + esc(nombreTipo(m.tipo)) + '</span>' + estado + '</div>' +
      '<div class="ficha-monto num ' + ui.color + '">' + monto + equiv + '</div>' +
      '<div class="ficha-desc">' + esc(m.descripcion || '') + '</div>' +
      '<div class="ficha-chips">' + chips.join('') + '</div>';
    if (m.notas && m.notas.length) h += '<div class="ficha-notas">' + esc(m.notas.join(' · ')) + '</div>';
    if (m.resultado != null) h += '<div class="ficha-notas">Resultado de la venta: <b class="' + (m.resultado >= 0 ? 'pos' : 'neg') + '">' + (m.resultado >= 0 ? '+' : '−') + plata(m.resultado) + '</b></div>';
    if (f.estado !== 'deshecha' && dudas.length) {
      var d = dudas[0];
      h += '<div class="burbuja app" style="max-width:100%;margin-top:12px;padding:10px 12px">' + esc(d.texto);
      if (d.opciones && d.opciones.length) h += '<div class="chips">' + d.opciones.map(function (o, i) { return '<button class="chip" data-a="f-opcion" data-f="' + f.id + '" data-campo="' + d.campo + '" data-i="' + i + '">' + esc(o.etiqueta) + '</button>'; }).join('') + '</div>';
      else if (d.campo === 'monto') h += '<div class="campo-duda"><input inputmode="decimal" placeholder="Ej: 8000 u 8 lucas" id="dm-' + f.id + '"><button class="btn btn-pri" data-a="f-monto" data-f="' + f.id + '">Listo</button></div>';
      else if (d.campo === 'persona') {
        var conocidas = Object.keys(Datos.cartera().personas).slice(0, 6);
        h += (conocidas.length ? '<div class="chips">' + conocidas.map(function (n) { return '<button class="chip" data-a="f-persona" data-f="' + f.id + '" data-p="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') + '</div>' : '') +
          '<div class="campo-duda"><input placeholder="Nombre" id="dp-' + f.id + '"><button class="btn btn-pri" data-a="f-persona" data-f="' + f.id + '">Listo</button></div>';
      } else if (d.campo === 'activo') h += '<div class="campo-duda"><input placeholder="Ej: YPF, AAPL, GGAL" id="da-' + f.id + '" autocapitalize="characters"><button class="btn btn-pri" data-a="f-activo" data-f="' + f.id + '">Listo</button></div>';
      else h += '<div class="chips"><button class="chip" data-a="f-editar" data-f="' + f.id + '">Completar</button></div>';
      h += '</div>';
    }
    if (f.estado !== 'deshecha') {
      h += '<div class="ficha-acciones">';
      if (f.estado === 'pendiente' && !dudas.length) h += '<button class="btn btn-pri" data-a="f-guardar" data-f="' + f.id + '">Guardar</button>';
      h += '<button class="btn btn-sec" data-a="f-editar" data-f="' + f.id + '">Editar todo</button>';
      if (f.estado === 'guardada') h += '<button class="btn btn-sec" data-a="f-deshacer" data-f="' + f.id + '">Deshacer</button>';
      h += '</div>';
    }
    return h + '</div>';
  }

  async function resolverDuda(f, campo, valor) {
    var m = f.mov;
    if (campo === 'monto') {
      var n = typeof valor === 'number' ? valor : leerMonto(valor);
      if (!n) { toast('No entendí el monto'); return; }
      m.monto = n; m.montoARS = m.moneda && m.moneda !== 'ARS' ? Math.round(n * (m.tc || (Datos.ajustes().cotizaciones || {})[m.moneda] || 1)) : n;
      if (m.activo && m.activo.cantidad && !m.activo.precio) m.activo.precio = Math.round(n / m.activo.cantidad * 100) / 100;
    } else if (campo === 'tipo') {
      m.tipo = valor;
      if (/prestamo|cobro_|pago_deuda/.test(valor)) {
        m.persona = m.persona || m.personaMencionada || null; m.categoria = null; m.nd = null;
        m.descripcion = { prestamo_dado: 'Préstamo a ', cobro_prestamo: '', prestamo_recibido: 'Préstamo de ', pago_deuda: 'Le pagué a ' }[valor] + (m.persona || '') + (valor === 'cobro_prestamo' ? ' me devolvió' : '');
        if (!m.persona) m.dudas.push({ campo: 'persona', texto: '¿Con quién?' });
      } else if (valor === 'ingreso' && (!m.categoria || cat(m.categoria).tipo !== 'ingreso')) m.categoria = 'cat-otros-ingresos';
      else if (valor === 'gasto' && (!m.categoria || cat(m.categoria).tipo !== 'gasto')) m.categoria = 'cat-otros-gastos';
      else if (valor === 'transferencia') { m.categoria = null; m.cuentaDestino = m.cuentaDestino || null; m.dudas.push({ campo: 'cuentas', texto: '¿De qué cuenta a qué cuenta?' }); }
    } else if (campo === 'persona') {
      m.persona = valor;
      if (/prestamo_dado/.test(m.tipo)) m.descripcion = 'Préstamo a ' + valor;
      if (/prestamo_recibido/.test(m.tipo)) m.descripcion = 'Préstamo de ' + valor;
      if (/cobro_prestamo/.test(m.tipo)) m.descripcion = valor + ' me devolvió';
      if (/pago_deuda/.test(m.tipo)) m.descripcion = 'Le pagué a ' + valor;
    } else if (campo === 'activo') {
      m.activo = Object.assign({}, m.activo, { ticker: String(valor).toUpperCase().trim() });
      m.descripcion = m.descripcion.replace(/acciones|CEDEARs|bonos|ON|\?/, m.activo.ticker);
    }
    m.dudas = m.dudas.filter(function (d) { return d.campo !== campo; });
    if (campo === 'tipo') m.dudas = m.dudas.filter(function (d) { return d.campo !== 'tipo'; });
    var quedan = m.dudas.some(function (d) { return BLOQUEANTES[d.campo]; });
    if (!quedan && (f.estado === 'guardada' || !Datos.ajustes().confirmar)) await guardarFicha(f);
    pintarChat();
  }

  function leerMonto(txt) {
    var r = Motor.interpretar('gasté ' + txt, Datos.contextoMotor()).movimientos[0];
    return r && r.monto ? r.monto : null;
  }

  /* ================= HOJAS ================= */
  function abrirHoja(html) {
    $('#hoja').innerHTML = '<div class="asa"></div>' + html;
    $('#velo').classList.add('on'); $('#hoja').classList.add('on');
    history.pushState({ hoja: 1 }, '');
  }
  function cerrarHoja(desdeBoton) {
    $('#velo').classList.remove('on'); $('#hoja').classList.remove('on');
    if (desdeBoton && history.state && history.state.hoja) history.back();
  }

  /* ---- selector de categoría ---- */
  function hojaCategorias(tipo, actual, alElegir) {
    var tipoCat = /ingreso/.test(tipo) ? 'ingreso' : /inversion|rescate|_activo/.test(tipo) ? 'inversion' : 'gasto';
    var cats = Datos.lista('categorias').filter(function (c) { return c.tipo === tipoCat && !c.archivada; }).sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
    S.alElegirCat = alElegir;
    abrirHoja('<h3>Categoría</h3><div class="grilla-cat">' + cats.map(function (c) {
      return '<button class="gcat' + (c.id === actual ? ' sel' : '') + '" data-a="elegir-cat" data-id="' + esc(c.id) + '"><span class="e">' + c.icono + '</span>' + esc(c.nombre) + '</button>';
    }).join('') + '<button class="gcat" data-a="nueva-cat" data-tipo="' + tipoCat + '"><span class="e">＋</span>Nueva</button></div>');
  }
  function hojaCuentas(actual, alElegir) {
    S.alElegirCta = alElegir;
    abrirHoja('<h3>¿Con qué cuenta?</h3><div class="lista">' + Datos.lista('cuentas').map(function (c) {
      return '<button class="fila" data-a="elegir-cta" data-id="' + esc(c.id) + '"><div class="ico">' + c.icono + '</div><div class="cuerpo"><div class="t1">' + esc(c.nombre) + '</div></div>' + (c.id === actual ? '<span class="pos">✓</span>' : '') + '</button>';
    }).join('') + '</div>');
  }
  function hojaFecha(actual, alElegir) {
    S.alElegirFecha = alElegir;
    var h = hoyISO(), ay = new Date(); ay.setDate(ay.getDate() - 1); var ant = new Date(); ant.setDate(ant.getDate() - 2);
    abrirHoja('<h3>Fecha</h3><div class="chips" style="flex-wrap:wrap"><button class="chip" data-a="elegir-fecha" data-v="' + h + '">Hoy</button>' +
      '<button class="chip" data-a="elegir-fecha" data-v="' + isoDe(ay) + '">Ayer</button><button class="chip" data-a="elegir-fecha" data-v="' + isoDe(ant) + '">Anteayer</button></div>' +
      '<div class="campo"><label>Otra fecha</label><input type="date" id="fecha-otra" value="' + esc(actual || h) + '" max="' + h + '"></div>' +
      '<button class="btn btn-pri btn-ancho" data-a="elegir-fecha-otra">Listo</button>');
  }

  /* ---- editor completo de un movimiento ---- */
  var TIPOS_ORDEN = ['gasto', 'ingreso', 'transferencia', 'prestamo_dado', 'cobro_prestamo', 'prestamo_recibido', 'pago_deuda', 'inversion', 'rescate', 'compra_activo', 'venta_activo'];
  function hojaEditor(m, alGuardar, alBorrar) {
    S.ed = { m: JSON.parse(JSON.stringify(m)), alGuardar: alGuardar, alBorrar: alBorrar };
    pintarEditor();
  }
  function pintarEditor() {
    var m = S.ed.m, tipoCat = /ingreso/.test(m.tipo) ? 'ingreso' : /inversion|rescate|_activo/.test(m.tipo) ? 'inversion' : 'gasto';
    var esPrest = /prestamo|cobro_|pago_deuda/.test(m.tipo), esActivo = /_activo/.test(m.tipo);
    var cats = Datos.lista('categorias').filter(function (c) { return c.tipo === tipoCat && !c.archivada; });
    var ctas = Datos.lista('cuentas'), proys = Datos.lista('proyectos');
    var optCta = function (sel, vacia) { return (vacia ? '<option value="">—</option>' : '') + ctas.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(c.nombre) + '</option>'; }).join(''); };
    var h = '<h3>' + (S.ed.alBorrar ? 'Editar movimiento' : 'Completar') + '</h3>';
    h += '<div class="campo"><label>Tipo</label><select data-i="ed" data-k="tipo">' + TIPOS_ORDEN.map(function (t) { return '<option value="' + t + '"' + (t === m.tipo ? ' selected' : '') + '>' + esc(nombreTipo(t)) + '</option>'; }).join('') + '</select></div>';
    h += '<div class="tres"><div class="campo"><label>Monto</label><input class="monto-grande" inputmode="decimal" data-i="ed" data-k="monto" value="' + esc(m.monto != null ? m.monto : '') + '"></div>' +
      '<div class="campo"><label>Moneda</label><select data-i="ed" data-k="moneda">' + ['ARS', 'USD', 'BRL', 'EUR'].map(function (x) { return '<option' + ((m.moneda || 'ARS') === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label>Fecha</label><input type="date" data-i="ed" data-k="fecha" value="' + esc(m.fecha || hoyISO()) + '"></div></div>';
    if (m.moneda && m.moneda !== 'ARS') h += '<div class="campo"><label>Cotización (pesos por ' + esc(m.moneda) + ')</label><input inputmode="decimal" data-i="ed" data-k="tc" value="' + esc(m.tc || (Datos.ajustes().cotizaciones || {})[m.moneda] || '') + '"></div>';
    if (esActivo) {
      var a = m.activo || {};
      if (a.ticker === 'USD') h += '<div class="saludo" style="margin:-4px 2px 10px">Monto = los pesos que pagaste. Cantidad = los dólares que recibiste.</div>';
      h += '<div class="tres"><div class="campo"><label>Activo</label><input data-i="ed" data-k="activo.ticker" value="' + esc(a.ticker || '') + '" autocapitalize="characters"></div>' +
        '<div class="campo"><label>Cantidad</label><input inputmode="decimal" data-i="ed" data-k="activo.cantidad" value="' + esc(a.cantidad != null ? a.cantidad : '') + '"></div>' +
        '<div class="campo"><label>Precio</label><input inputmode="decimal" data-i="ed" data-k="activo.precio" value="' + esc(a.precio != null ? a.precio : '') + '"></div></div>';
    }
    if (!esPrest && m.tipo !== 'transferencia') {
      h += '<div class="campo"><label>Categoría</label><div class="grilla-cat">' + cats.map(function (c) {
        return '<button class="gcat' + (c.id === m.categoria ? ' sel' : '') + '" data-a="ed-cat" data-id="' + esc(c.id) + '"><span class="e">' + c.icono + '</span>' + esc(c.nombre) + '</button>';
      }).join('') + '</div></div>';
    }
    if (m.tipo === 'transferencia') h += '<div class="dos"><div class="campo"><label>Desde</label><select data-i="ed" data-k="cuenta">' + optCta(m.cuenta, true) + '</select></div><div class="campo"><label>Hacia</label><select data-i="ed" data-k="cuentaDestino">' + optCta(m.cuentaDestino, true) + '</select></div></div>';
    else h += '<div class="campo"><label>Cuenta</label><select data-i="ed" data-k="cuenta">' + optCta(m.cuenta, true) + '</select></div>';
    if (esPrest) h += '<div class="campo"><label>Persona</label><input data-i="ed" data-k="persona" value="' + esc(m.persona || '') + '" list="personas"><datalist id="personas">' + Object.keys(Datos.cartera().personas).map(function (p) { return '<option value="' + esc(p) + '">'; }).join('') + '</datalist></div>';
    if (m.tipo === 'gasto') {
      h += '<div class="campo"><label>Necesidad o deseo</label><div class="seg"><button class="' + (m.nd === 'Necesidad' ? 'sel' : '') + '" data-a="ed-nd" data-v="Necesidad">Necesidad</button><button class="' + (m.nd === 'Deseo' ? 'sel' : '') + '" data-a="ed-nd" data-v="Deseo">Deseo</button><button class="' + (!m.nd ? 'sel' : '') + '" data-a="ed-nd" data-v="">—</button></div></div>';
      h += '<div class="campo"><label>¿Lo pagó otra persona? (queda como deuda)</label><input data-i="ed" data-k="financiadoPor" value="' + esc(m.financiadoPor || '') + '" placeholder="Nombre, o vacío si lo pagaste vos"></div>';
    }
    h += '<div class="campo"><label>Proyecto</label><select data-i="ed" data-k="proyecto"><option value="">Ninguno</option>' + proys.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === m.proyecto ? ' selected' : '') + '>' + p.icono + ' ' + esc(p.nombre) + '</option>'; }).join('') + '</select></div>';
    h += '<div class="campo"><label>Descripción</label><input data-i="ed" data-k="descripcion" value="' + esc(m.descripcion || '') + '"></div>';
    if (m.texto) h += '<div class="saludo" style="margin:-4px 2px 10px">Dijiste: “' + esc(m.texto) + '”</div>';
    h += '<div class="botonera">' + (S.ed.alBorrar ? '<button class="btn btn-peligro" data-a="ed-borrar">Borrar</button>' : '') + '<button class="btn btn-pri" data-a="ed-guardar">Guardar</button></div>';
    $('#hoja').innerHTML = '<div class="asa"></div>' + h;
    if (!$('#hoja').classList.contains('on')) { $('#velo').classList.add('on'); $('#hoja').classList.add('on'); history.pushState({ hoja: 1 }, ''); }
  }
  function leerNumero(v) {
    if (v === '' || v == null) return null;
    var s = String(v).trim();
    if (/^\d+([.,]\d+)?$/.test(s)) return Number(s.replace(',', '.'));
    return leerMonto(s);
  }

  /* ---- editor de categoría ---- */
  function hojaCategoria(c, tipo) {
    S.edCat = c ? JSON.parse(JSON.stringify(c)) : { nombre: '', tipo: tipo || 'gasto', grupo: 'variable', icono: '🏷️', color: COLORES[Math.floor(Math.random() * COLORES.length)], nd: null, palabras: [], orden: 999 };
    pintarHojaCategoria();
  }
  function pintarHojaCategoria() {
    var c = S.edCat;
    var h = '<h3>' + (c.id ? 'Editar categoría' : 'Nueva categoría') + '</h3>';
    h += '<div class="dos"><div class="campo"><label>Nombre</label><input data-i="cat" data-k="nombre" value="' + esc(c.nombre) + '" placeholder="Ej: Mascotas"></div>' +
      '<div class="campo"><label>Es de</label><select data-i="cat" data-k="tipo"><option value="gasto"' + (c.tipo === 'gasto' ? ' selected' : '') + '>Gastos</option><option value="ingreso"' + (c.tipo === 'ingreso' ? ' selected' : '') + '>Ingresos</option><option value="inversion"' + (c.tipo === 'inversion' ? ' selected' : '') + '>Inversiones</option></select></div></div>';
    h += '<div class="campo"><label>Ícono</label><div class="emojis">' + EMOJIS.map(function (e) { return '<button class="' + (e === c.icono ? 'sel' : '') + '" data-a="cat-emoji" data-v="' + e + '">' + e + '</button>'; }).join('') + '</div></div>';
    h += '<div class="campo"><label>Color</label><div class="paleta">' + COLORES.map(function (col) { return '<button class="' + (col === c.color ? 'sel' : '') + '" style="background:' + col + '" data-a="cat-color" data-v="' + col + '"></button>'; }).join('') + '</div></div>';
    if (c.tipo === 'gasto') h += '<div class="campo"><label>Por defecto es</label><div class="seg"><button class="' + (c.nd === 'Necesidad' ? 'sel' : '') + '" data-a="cat-nd" data-v="Necesidad">Necesidad</button><button class="' + (c.nd === 'Deseo' ? 'sel' : '') + '" data-a="cat-nd" data-v="Deseo">Deseo</button><button class="' + (!c.nd ? 'sel' : '') + '" data-a="cat-nd" data-v="">Depende</button></div></div>';
    h += '<div class="campo"><label>Palabras con las que la reconoce</label><div class="palabras">' + (c.palabras || []).map(function (p, i) { return '<span class="palabra">' + esc(p) + '<button data-a="cat-quitar" data-i="' + i + '">✕</button></span>'; }).join('') + '</div>' +
      '<div class="campo-duda"><input id="cat-palabra" placeholder="Ej: veterinaria, alimento"><button class="btn btn-sec" data-a="cat-agregar">Agregar</button></div></div>';
    h += '<div class="botonera">' + (c.id ? '<button class="btn btn-peligro" data-a="cat-borrar">' + (c.archivada ? 'Restaurar' : 'Archivar') + '</button>' : '') + '<button class="btn btn-pri" data-a="cat-guardar">Guardar</button></div>';
    if ($('#hoja').classList.contains('on')) $('#hoja').innerHTML = '<div class="asa"></div>' + h; else abrirHoja(h);
  }

  function hojaCuenta(c) {
    S.edCta = c ? JSON.parse(JSON.stringify(c)) : { nombre: '', tipo: 'banco', icono: '🏦', color: '#5B7DB1', alias: [], saldoInicial: 0, orden: 99 };
    var x = S.edCta;
    abrirHoja('<h3>' + (x.id ? 'Editar cuenta' : 'Nueva cuenta') + '</h3>' +
      '<div class="dos"><div class="campo"><label>Nombre</label><input data-i="cta" data-k="nombre" value="' + esc(x.nombre) + '"></div><div class="campo"><label>Ícono</label><input data-i="cta" data-k="icono" value="' + esc(x.icono) + '"></div></div>' +
      '<div class="campo"><label>Saldo al empezar a usar la app</label><input inputmode="decimal" data-i="cta" data-k="saldoInicial" value="' + esc(x.saldoInicial || 0) + '"></div>' +
      '<div class="campo"><label>Palabras que la identifican (separadas por coma)</label><textarea data-i="cta" data-k="alias">' + esc((x.alias || []).join(', ')) + '</textarea></div>' +
      '<div class="botonera">' + (x.id && !x.base ? '<button class="btn btn-peligro" data-a="cta-borrar">Borrar</button>' : '') + '<button class="btn btn-pri" data-a="cta-guardar">Guardar</button></div>');
  }
  function hojaProyecto(p) {
    S.edPry = p ? JSON.parse(JSON.stringify(p)) : { nombre: '', icono: '🗂️', color: '#85BB65', esInversion: false, palabras: [], orden: 99 };
    var x = S.edPry;
    abrirHoja('<h3>' + (x.id ? 'Editar proyecto' : 'Nuevo proyecto') + '</h3>' +
      '<div class="dos"><div class="campo"><label>Nombre</label><input data-i="pry" data-k="nombre" value="' + esc(x.nombre) + '"></div><div class="campo"><label>Ícono</label><input data-i="pry" data-k="icono" value="' + esc(x.icono) + '"></div></div>' +
      '<div class="campo"><label>Palabras que lo identifican (separadas por coma)</label><textarea data-i="pry" data-k="palabras">' + esc((x.palabras || []).join(', ')) + '</textarea></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div><div style="font-weight:650">Cuenta como inversión</div><div class="saludo">Lo que gastes en él suma a tu capital invertido (como una obra).</div></div><button class="interruptor' + (x.esInversion ? ' on' : '') + '" data-a="pry-inv"></button></div>' +
      '<div class="botonera">' + (x.id ? '<button class="btn btn-peligro" data-a="pry-borrar">Archivar</button>' : '') + '<button class="btn btn-pri" data-a="pry-guardar">Guardar</button></div>');
  }

  /* ================= EVENTOS ================= */
  async function alClick(e) {
    var el = e.target.closest('[data-a]');
    if (!el) {
      if (e.target.id === 'velo') cerrarHoja(true);
      return;
    }
    var a = el.dataset.a, f = el.dataset.f ? S.chat.fichas[el.dataset.f] : null;
    switch (a) {
      case 'tab':
        S.tab = el.dataset.tab; S.sub = null;
        if (el.dataset.filtro) S.filtro = el.dataset.filtro;
        render(); window.scrollTo(0, 0); break;
      case 'ir': S.tab = el.dataset.tab; S.sub = el.dataset.sub || null; render(); window.scrollTo(0, 0); break;
      case 'volver': S.verQR = false; S.sub = S.sub === 'persona' ? 'prestamos' : null; render(); window.scrollTo(0, 0); break;
      case 'ver-qr': S.verQR = !S.verQR; S.mantenerScroll = true; render(); break;
      case 'mes': S.mes = sumarMes(S.mes, Number(el.dataset.k)); render(); break;
      case 'filtro': S.filtro = el.dataset.f; render(); break;
      case 'barra': S.barraSel = S.barraSel === el.dataset.d ? null : el.dataset.d; S.mantenerScroll = true; render(); break;
      case 'editar-mov': {
        var mov = Datos.uno('movimientos', el.dataset.id);
        if (mov) hojaEditor(mov, async function (nuevo) {
          var corr = nuevo.categoria !== mov.categoria;
          await Datos.guardar('movimientos', Object.assign({}, mov, nuevo, { corregido: corr || mov.corregido || false }));
          toast('Guardado');
        }, async function () { await Datos.borrar('movimientos', mov.id); toast('Borrado', 'Deshacer', function () { Datos.guardar('movimientos', Object.assign({}, mov, { deleted: false })); }); });
        break;
      }
      case 'sub': S.sub = el.dataset.sub; S.subId = el.dataset.id || null; render(); window.scrollTo(0, 0); break;
      case 'ver-cat': S.sub = 'categoria'; S.subId = el.dataset.id; render(); window.scrollTo(0, 0); break;
      case 'ir-mes': S.mes = el.dataset.m; S.mantenerScroll = true; render(); break;
      case 'ver-persona': S.sub = 'persona'; S.subId = el.dataset.p; render(); window.scrollTo(0, 0); break;
      case 'precio-activo': {
        var pr = Datos.meta('precios') || {}, t = el.dataset.t;
        var v = prompt('Precio de hoy de ' + (t === 'USD' ? 'un dólar' : t) + ' (en pesos):', pr[t] || '');
        if (v !== null) { var n = leerNumero(v); if (n) pr[t] = n; else delete pr[t]; await Datos.meta('precios', pr); render(); }
        break;
      }
      // ---- chat
      case 'abrir-chat': abrirChat(el.dataset.sug, el.dataset.texto); break;
      case 'cerrar-chat': cerrarChat(); break;
      case 'ejemplo': procesar(el.textContent, 'texto'); break;
      case 'mic': alternarMic(); break;
      case 'enviar': enviarEntrada(); break;
      case 'f-guardar': await guardarFicha(f); pintarChat(); break;
      case 'f-deshacer': await deshacerFicha(f); break;
      case 'f-cat': hojaCategorias(f.mov.tipo, f.mov.categoria, async function (id) { f.mov.categoria = id; var c = cat(id); if (c && f.mov.tipo === 'gasto' && c.nd) f.mov.nd = c.nd; f.corregida = true; if (f.estado === 'guardada') await guardarFicha(f); pintarChat(); }); break;
      case 'f-cuenta': hojaCuentas(f.mov.cuenta, async function (id) { f.mov.cuenta = id; if (f.estado === 'guardada') await guardarFicha(f); pintarChat(); }); break;
      case 'f-fecha': hojaFecha(f.mov.fecha, async function (iso) { f.mov.fecha = iso; if (f.estado === 'guardada') await guardarFicha(f); pintarChat(); }); break;
      case 'f-nd': f.mov.nd = f.mov.nd === 'Deseo' ? 'Necesidad' : 'Deseo'; if (f.estado === 'guardada') await guardarFicha(f); pintarChat(); break;
      case 'f-opcion': {
        var d = f.mov.dudas.filter(function (x) { return x.campo === el.dataset.campo; })[0];
        if (d) await resolverDuda(f, d.campo, d.opciones[Number(el.dataset.i)].valor);
        break;
      }
      case 'f-monto': await resolverDuda(f, 'monto', $('#dm-' + f.id).value); break;
      case 'f-persona': await resolverDuda(f, 'persona', el.dataset.p || ($('#dp-' + f.id).value || '').trim()); break;
      case 'f-activo': await resolverDuda(f, 'activo', ($('#da-' + f.id).value || '').trim()); break;
      case 'f-editar': {
        var base = Object.assign({}, f.mov, { texto: f.texto });
        hojaEditor(base, async function (nuevo) {
          Object.assign(f.mov, nuevo);
          f.mov.dudas = [];
          if (f.mov.moneda === 'ARS') f.mov.montoARS = f.mov.monto;
          await guardarFicha(f); pintarChat();
        }, f.estado === 'guardada' ? function () { return deshacerFicha(f); } : null);
        break;
      }
      // ---- hojas
      case 'cerrar-hoja': cerrarHoja(true); break;
      case 'elegir-cat': { var fn = S.alElegirCat; cerrarHoja(true); fn && fn(el.dataset.id); break; }
      case 'elegir-cta': { var fn2 = S.alElegirCta; cerrarHoja(true); fn2 && fn2(el.dataset.id); break; }
      case 'elegir-fecha': { var fn3 = S.alElegirFecha; cerrarHoja(true); fn3 && fn3(el.dataset.v); break; }
      case 'elegir-fecha-otra': { var fn4 = S.alElegirFecha, v4 = $('#fecha-otra').value; cerrarHoja(true); if (v4 && fn4) fn4(v4); break; }
      case 'ed-cat': S.ed.m.categoria = el.dataset.id; var cc = cat(el.dataset.id); if (cc && S.ed.m.tipo === 'gasto' && cc.nd && !S.ed.m.nd) S.ed.m.nd = cc.nd; pintarEditor(); break;
      case 'ed-nd': S.ed.m.nd = el.dataset.v || null; pintarEditor(); break;
      case 'ed-guardar': {
        var m = S.ed.m;
        if (!m.monto || isNaN(m.monto)) { toast('Falta el monto'); break; }
        if (m.moneda && m.moneda !== 'ARS') { m.tc = m.tc || (Datos.ajustes().cotizaciones || {})[m.moneda]; m.montoARS = Math.round(m.monto * (m.tc || 1) * 100) / 100; }
        else if (!(m.activo && m.activo.clase === 'usd' && m.moneda === 'ARS')) m.montoARS = m.monto; else m.montoARS = m.monto;
        if (m.tipo !== 'gasto') { m.nd = null; m.financiadoPor = null; }
        if (/_activo/.test(m.tipo) && m.activo && m.activo.cantidad && S.ed.montoTocado) m.activo.precio = Math.round(m.monto / m.activo.cantidad * 100) / 100;
        if (/_activo/.test(m.tipo) && m.activo && m.activo.cantidad && m.activo.precio && !S.ed.montoTocado) m.monto = m.montoARS = Math.round(m.activo.cantidad * m.activo.precio * 100) / 100;
        var g = S.ed.alGuardar; cerrarHoja(true); await g(m); render(); break;
      }
      case 'ed-borrar': { var b = S.ed.alBorrar; cerrarHoja(true); await b(); render(); break; }
      // ---- categorías
      case 'editar-cat': hojaCategoria(cat(el.dataset.id) || Datos.lista('categorias', true).filter(function (c) { return c.id === el.dataset.id; })[0]); break;
      case 'nueva-cat': hojaCategoria(null, el.dataset.tipo); break;
      case 'cat-emoji': S.edCat.icono = el.dataset.v; pintarHojaCategoria(); break;
      case 'cat-color': S.edCat.color = el.dataset.v; pintarHojaCategoria(); break;
      case 'cat-nd': S.edCat.nd = el.dataset.v || null; pintarHojaCategoria(); break;
      case 'cat-agregar': { var w = ($('#cat-palabra').value || '').split(',').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean); S.edCat.palabras = (S.edCat.palabras || []).concat(w); pintarHojaCategoria(); break; }
      case 'cat-quitar': S.edCat.palabras.splice(Number(el.dataset.i), 1); pintarHojaCategoria(); break;
      case 'cat-guardar': {
        if (!S.edCat.nombre.trim()) { toast('Ponele un nombre'); break; }
        var nueva = !S.edCat.id;
        if (nueva) S.edCat.id = 'cat-' + Motor._.slug(S.edCat.nombre) + '-' + Datos.uuid().slice(0, 4);
        var guardada = await Datos.guardar('categorias', S.edCat);
        var fnc = S.alElegirCat; cerrarHoja(true);
        toast(nueva ? 'Categoría creada' : 'Categoría guardada');
        if (nueva && fnc && S.chat.abierto) fnc(guardada.id);
        render(); break;
      }
      case 'cat-borrar': S.edCat.archivada = !S.edCat.archivada; await Datos.guardar('categorias', S.edCat); cerrarHoja(true); render(); break;
      // ---- cuentas y proyectos
      case 'editar-cuenta': hojaCuenta(cta(el.dataset.id)); break;
      case 'nueva-cuenta': hojaCuenta(null); break;
      case 'cta-guardar': {
        var x = S.edCta; if (!x.nombre.trim()) { toast('Ponele un nombre'); break; }
        if (!x.id) x.id = 'cta-' + Motor._.slug(x.nombre) + '-' + Datos.uuid().slice(0, 4);
        x.saldoInicial = leerNumero(x.saldoInicial) || 0;
        if (typeof x.alias === 'string') x.alias = x.alias.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
        await Datos.guardar('cuentas', x); cerrarHoja(true); render(); break;
      }
      case 'cta-borrar': await Datos.borrar('cuentas', S.edCta.id); cerrarHoja(true); render(); break;
      case 'editar-proy': hojaProyecto(pry(el.dataset.id)); break;
      case 'nuevo-proy': hojaProyecto(null); break;
      case 'pry-inv': S.edPry.esInversion = !S.edPry.esInversion; el.classList.toggle('on', S.edPry.esInversion); break;
      case 'pry-guardar': {
        var y = S.edPry; if (!y.nombre.trim()) { toast('Ponele un nombre'); break; }
        if (!y.id) y.id = 'pry-' + Motor._.slug(y.nombre) + '-' + Datos.uuid().slice(0, 4);
        if (typeof y.palabras === 'string') y.palabras = y.palabras.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
        await Datos.guardar('proyectos', y); cerrarHoja(true); render(); break;
      }
      case 'pry-borrar': S.edPry.archivado = true; await Datos.guardar('proyectos', S.edPry); cerrarHoja(true); render(); break;
      case 'olvidar': { var ol = Datos.meta('olvidadas') || []; ol.push(el.dataset.k); await Datos.meta('olvidadas', ol); toast('Olvidé “' + el.dataset.k + '”'); render(); break; }
      // ---- voz e IA
      case 'voz-pref': await Datos.cambiarAjustes({ voz: el.dataset.v }); localStorage.removeItem('nativoFalla'); render(); break;
      case 'bajar-whisper': bajarWhisper(el.dataset.m); break;
      case 'toggle-ia': {
        var activar = !Datos.ajustes().ia;
        if (activar) {
          if (!(await IA.disponible())) { toast('Tu teléfono todavía no tiene WebGPU (hace falta iOS 26). En la compu, con Chrome, sí funciona.'); break; }
          if (!IA.descargada() && !confirm('Voy a bajar un modelo de IA de código abierto para que corra en tu teléfono (entre 400 MB y 1 GB, una sola vez). Conviene hacerlo con Wi-Fi. ¿Sigo?')) break;
          await Datos.cambiarAjustes({ ia: true }); render();
          var bar = document.querySelector('#prog-ia'), est = $('#ia-estado');
          if (bar) bar.classList.remove('oculto');
          try {
            await IA.cargar(function (k, txt) { var i = document.querySelector('#prog-ia i'); if (i) i.style.width = Math.round(k * 100) + '%'; var e2 = $('#ia-estado'); if (e2) e2.textContent = txt; });
            toast('IA lista'); render();
          } catch (err) { await Datos.cambiarAjustes({ ia: false }); if (est) est.textContent = 'No pude cargarla: ' + (err.message || err); toast('No pude cargar la IA'); }
        } else { await Datos.cambiarAjustes({ ia: false }); render(); }
        break;
      }
      // ---- respaldo
      case 'vincular': {
        var cod = ($('#codigo-vinculo').value || '').trim();
        try { el.disabled = true; el.textContent = 'Vinculando…'; await Datos.Sync.vincular(cod); toast('Vinculado: bajando tu historial'); render(); }
        catch (err) { toast(err.message); el.disabled = false; el.textContent = 'Vincular'; }
        break;
      }
      case 'pegar-y-vincular': {
        var pegado = null;
        try { pegado = await navigator.clipboard.readText(); } catch (err) { /* sin permiso */ }
        if (!pegado || !Datos.decodificarVinculo(pegado)) { toast('No encontré un código copiado: pegalo a mano acá'); S.tab = 'mas'; S.sub = 'respaldo'; render(); break; }
        try { el.disabled = true; el.textContent = 'Vinculando…'; await Datos.Sync.vincular(pegado); toast('Vinculado: bajando tu historial'); render(); }
        catch (err) { toast(err.message); el.disabled = false; el.textContent = 'Pegar código y vincular'; }
        break;
      }
      case 'pegar-vinculo': {
        try { var txt = await navigator.clipboard.readText(); $('#codigo-vinculo').value = txt; } catch (err) { toast('No pude leer el portapapeles: pegalo a mano'); }
        break;
      }
      case 'copiar-codigo': {
        var codigo = Datos.Sync.codigo();
        try { await navigator.clipboard.writeText(codigo); toast('Código copiado: pegalo en la app instalada (Más › Respaldo)'); }
        catch (err) { prompt('Copiá este código:', codigo); }
        break;
      }
      case 'ocultar-instalar': localStorage.setItem('ocultarInstalar', '1'); render(); break;
      case 'sincronizar': await Datos.Sync.sincronizar(true); toast(Datos.Sync.estado === 'error' ? 'Error: ' + Datos.Sync.error : 'Sincronizado'); render(); break;
      case 'desvincular': if (confirm('¿Desvincular este teléfono del respaldo? Tus datos quedan en el teléfono.')) { await Datos.Sync.desvincular(); render(); } break;
      case 'exportar': descargar(el.dataset.f); break;
      // ---- cotizaciones y ajustes
      case 'casa-dolar': await Datos.cambiarAjustes({ casaDolar: el.dataset.v }); await Datos.actualizarCotizaciones(true); render(); break;
      case 'toggle-cot': await Datos.cambiarAjustes({ cotizacionesAuto: !(Datos.ajustes().cotizacionesAuto !== false) }); render(); break;
      case 'actualizar-cot': { var res = await Datos.actualizarCotizaciones(true); toast(res ? 'Cotizaciones actualizadas' : 'No pude actualizar (¿sin internet?)'); render(); break; }
      case 'toggle-confirmar': await Datos.cambiarAjustes({ confirmar: !Datos.ajustes().confirmar }); render(); break;
    }
  }

  function alInput(e) {
    var el = e.target, i = el.dataset ? el.dataset.i : null;
    if (el.id === 'entrada') { autoAltura(el); pintarPieChat(); return; }
    if (!i) return;
    if (i === 'buscar') { S.busqueda = el.value; clearTimeout(S.tBusca); S.tBusca = setTimeout(function () { var pos = el.selectionStart; render(); var nuevo = document.querySelector('[data-i="buscar"]'); if (nuevo) { nuevo.focus(); try { nuevo.setSelectionRange(pos, pos); } catch (er) { /* nada */ } } }, 220); return; }
    if (i === 'ed') {
      var k = el.dataset.k, v = el.value;
      if (k.indexOf('activo.') === 0) { S.ed.m.activo = S.ed.m.activo || {}; var kk = k.slice(7); S.ed.m.activo[kk] = kk === 'ticker' ? v.toUpperCase() : leerNumero(v); return; }
      if (k === 'monto') { S.ed.m.monto = leerNumero(v); S.ed.montoTocado = true; return; }
      if (k === 'tc') { S.ed.m.tc = leerNumero(v); return; }
      S.ed.m[k] = v || null;
      return;
    }
    if (i === 'cat') { S.edCat[el.dataset.k] = el.value; return; }
    if (i === 'cta') { S.edCta[el.dataset.k] = el.value; return; }
    if (i === 'pry') { S.edPry[el.dataset.k] = el.value; return; }
  }
  async function alCambio(e) {
    var el = e.target, i = el.dataset ? el.dataset.i : null;
    if (!i) return;
    if (i === 'ed' && (el.dataset.k === 'tipo' || el.dataset.k === 'moneda')) {
      S.ed.m[el.dataset.k] = el.value;
      if (el.dataset.k === 'tipo') {
        var t = el.value, tipoCat = /ingreso/.test(t) ? 'ingreso' : /inversion|rescate|_activo/.test(t) ? 'inversion' : 'gasto';
        var c = cat(S.ed.m.categoria); if (!c || c.tipo !== tipoCat) S.ed.m.categoria = tipoCat === 'gasto' ? 'cat-otros-gastos' : tipoCat === 'ingreso' ? 'cat-otros-ingresos' : null;
        if (/_activo/.test(t) && !S.ed.m.activo) S.ed.m.activo = { ticker: '', clase: 'cedear', cantidad: null, precio: null };
      }
      pintarEditor(); return;
    }
    if (i === 'ajuste') { var o = {}; o[el.dataset.k] = el.value; await Datos.cambiarAjustes(o); return; }
    if (i === 'cot') {
      var cot = Object.assign({}, Datos.ajustes().cotizaciones || {}); var n = leerNumero(el.value); if (n) cot[el.dataset.m] = n;
      await Datos.cambiarAjustes({ cotizaciones: cot, cotizacionesAuto: false }); toast('Guardado. Apagué la actualización automática.'); return;
    }
    if (i === 'importar' && el.files && el.files[0]) {
      var txt = await el.files[0].text();
      try { var n2 = await Datos.importarJSON(txt); toast('Restauré ' + n2 + ' registros'); render(); } catch (err) { toast('El archivo no es una copia válida'); }
    }
  }

  function enviarEntrada() {
    var e = $('#entrada'), t = e.value.trim();
    if (!t) return;
    e.value = ''; autoAltura(e); pintarPieChat();
    procesar(t, 'texto');
  }

  function descargar(formato) {
    var hoy = hoyISO(), contenido = formato === 'csv' ? '﻿' + Datos.exportarCSV() : Datos.exportarJSON();
    var blob = new Blob([contenido], { type: formato === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' });
    var nombre = 'finanzas-' + hoy + '.' + formato;
    if (navigator.canShare && navigator.share) {
      try {
        var file = new File([blob], nombre, { type: blob.type });
        if (navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: nombre }).catch(function () { /* cancelado */ }); return; }
      } catch (e) { /* sigue */ }
    }
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* teclado: Enter envía, Shift+Enter salta de línea */
  document.addEventListener('keydown', function (e) {
    if (e.target && e.target.id === 'entrada' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarEntrada(); }
    if (e.key === 'Escape') { if ($('#hoja').classList.contains('on')) cerrarHoja(true); else if (S.chat.abierto) cerrarChat(); }
  });

  window.App = { procesar: procesar, abrirChat: abrirChat, S: S, render: render };
  document.addEventListener('DOMContentLoaded', iniciar);
})();
