/* =====================================================================
 *  DATOS — guardado local (IndexedDB), sincronización con Drive y cálculos
 *  Todo vive en el teléfono; la nube es un respaldo que se sincroniza solo.
 * ===================================================================== */
(function (global) {
  'use strict';

  var STORES = ['movimientos', 'categorias', 'cuentas', 'proyectos'];
  var db = null;
  var soloMemoria = false; // navegación privada o almacenamiento bloqueado: funciona igual, sin guardar
  var mem = { movimientos: {}, categorias: {}, cuentas: {}, proyectos: {}, meta: {} };
  var oyentes = {};

  function on(ev, fn) { (oyentes[ev] = oyentes[ev] || []).push(fn); }
  function emitir(ev, x) { (oyentes[ev] || []).forEach(function (fn) { try { fn(x); } catch (e) { console.error(e); } }); }

  function uuid() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }

  /* ---------------- IndexedDB ---------------- */
  function abrir() {
    return new Promise(function (ok, mal) {
      var r = indexedDB.open('finanzas', 1);
      r.onupgradeneeded = function () {
        var d = r.result;
        STORES.forEach(function (s) { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' }); });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'k' });
      };
      r.onsuccess = function () { db = r.result; ok(db); };
      r.onerror = function () { mal(r.error); };
    });
  }
  function tx(store, modo) { return db.transaction(store, modo).objectStore(store); }
  function todos(store) {
    if (soloMemoria) return Promise.resolve([]);
    return new Promise(function (ok, mal) { var q = tx(store, 'readonly').getAll(); q.onsuccess = function () { ok(q.result || []); }; q.onerror = function () { mal(q.error); }; });
  }
  function put(store, rec) {
    if (soloMemoria) return Promise.resolve();
    return new Promise(function (ok, mal) { var q = tx(store, 'readwrite').put(rec); q.onsuccess = function () { ok(); }; q.onerror = function () { mal(q.error); }; });
  }
  function putVarios(store, recs) {
    if (soloMemoria) return Promise.resolve();
    return new Promise(function (ok, mal) {
      if (!recs.length) return ok();
      var t = db.transaction(store, 'readwrite'), os = t.objectStore(store);
      recs.forEach(function (r) { os.put(r); });
      t.oncomplete = function () { ok(); }; t.onerror = function () { mal(t.error); };
    });
  }

  async function cargar() {
    try {
      if (!global.indexedDB) throw new Error('sin IndexedDB');
      await Promise.race([abrir(), new Promise(function (_, mal) { setTimeout(function () { mal(new Error('timeout')); }, 4000); })]);
    } catch (e) { soloMemoria = true; console.warn('Sin almacenamiento local:', e.message); }
    for (var i = 0; i < STORES.length; i++) {
      var s = STORES[i], lista = await todos(s);
      lista.forEach(function (r) { mem[s][r.id] = r; });
    }
    (await todos('meta')).forEach(function (m) { mem.meta[m.k] = m.v; });
    await sembrar();
    if (navigator.storage && navigator.storage.persist) { try { await navigator.storage.persist(); } catch (e) { /* nada */ } }
  }

  async function sembrar() {
    var base = Motor.catalogoBase();
    var pares = [['categorias', base.categorias], ['cuentas', base.cuentas], ['proyectos', base.proyectos]];
    for (var i = 0; i < pares.length; i++) {
      var s = pares[i][0], nuevos = pares[i][1].filter(function (r) { return !mem[s][r.id]; });
      nuevos.forEach(function (r) { r.dirty = 0; mem[s][r.id] = r; });
      await putVarios(s, nuevos);
    }
    if (!mem.meta.ajustes) await meta('ajustes', {
      nombre: 'Juani', voz: 'auto', ia: false, confirmar: false, casaDolar: 'oficial',
      cotizaciones: { USD: 1545, BRL: 280, EUR: 1750 }, cotizacionesAuto: true
    });
    if (!mem.meta.dispositivo) await meta('dispositivo', uuid().slice(0, 8));
  }

  /* ---------------- lectura / escritura ---------------- */
  function lista(store, conBorrados) {
    var out = [];
    var o = mem[store];
    for (var k in o) if (conBorrados || !o[k].deleted) out.push(o[k]);
    return out;
  }
  function uno(store, id) { var r = mem[store][id]; return r && !r.deleted ? r : null; }

  async function guardar(store, rec, opciones) {
    rec = Object.assign({}, rec);
    if (!rec.id) rec.id = uuid();
    var ahora = Date.now();
    if (!rec.createdAt) rec.createdAt = ahora;
    rec.updatedAt = Math.max(ahora, (mem[store][rec.id] && mem[store][rec.id].updatedAt || 0) + 1);
    rec.dirty = 1;
    mem[store][rec.id] = rec;
    await put(store, rec);
    if (!(opciones && opciones.silencioso)) emitir('cambio', { store: store, rec: rec });
    Sync.programar();
    return rec;
  }
  async function guardarVarios(store, recs) {
    var ahora = Date.now();
    var listos = recs.map(function (r, i) {
      r = Object.assign({}, r);
      if (!r.id) r.id = uuid();
      if (!r.createdAt) r.createdAt = ahora + i;
      r.updatedAt = ahora + i; r.dirty = 1;
      mem[store][r.id] = r;
      return r;
    });
    await putVarios(store, listos);
    emitir('cambio', { store: store });
    Sync.programar();
    return listos;
  }
  async function borrar(store, id) {
    var r = mem[store][id];
    if (!r) return;
    var c = Object.assign({}, r, { deleted: true });
    return guardar(store, c);
  }
  /** Lectura sincrónica (meta('x')) y escritura que devuelve una promesa (meta('x', valor)). */
  function meta(k, v) {
    if (v === undefined) return mem.meta[k];
    mem.meta[k] = v;
    return put('meta', { k: k, v: v }).then(function () { return v; });
  }
  function ajustes() { return mem.meta.ajustes || {}; }
  async function cambiarAjustes(cambios) {
    var a = Object.assign({}, ajustes(), cambios);
    await meta('ajustes', a);
    emitir('ajustes', a);
    return a;
  }

  /* ---------------- contexto para el motor ---------------- */
  var ctxCache = null, ctxClave = '';
  function contextoMotor() {
    var movs = lista('movimientos');
    var clave = movs.length + ':' + maxUpdated('movimientos') + ':' + maxUpdated('categorias') + ':' + maxUpdated('cuentas') + ':' + maxUpdated('proyectos');
    if (ctxCache && clave === ctxClave) return ctxCache;
    var a = ajustes();
    ctxCache = Motor.prepararContexto({
      categorias: lista('categorias'), cuentas: lista('cuentas'), proyectos: lista('proyectos'),
      movimientos: movs, estado: Motor.calcularEstado(movs),
      ajustes: { cotizaciones: a.cotizaciones, cuentaGasto: a.cuentaGasto, cuentaIngreso: a.cuentaIngreso }
    });
    ctxClave = clave;
    return ctxCache;
  }
  function maxUpdated(store) { var m = 0, o = mem[store]; for (var k in o) if (o[k].updatedAt > m) m = o[k].updatedAt; return m; }

  /* ---------------- cálculos ---------------- */
  function montoARS(m) { return Number(m.montoARS != null ? m.montoARS : m.monto) || 0; }
  function mesDe(fecha) { return (fecha || '').slice(0, 7); }

  function resumenMes(mes, hoyISO) {
    var movs = lista('movimientos');
    var r = { mes: mes, ingresos: 0, gastos: 0, invertido: 0, rescatado: 0, prestado: 0, cobrado: 0, cats: {}, catsIng: {}, porDia: {},
      nd: { Necesidad: 0, Deseo: 0 }, hoy: 0, hoyN: 0, cantidad: 0, movs: [] };
    movs.forEach(function (m) {
      var mm = mesDe(m.fecha), v = montoARS(m);
      if (m.tipo === 'gasto') r.porDia[m.fecha] = (r.porDia[m.fecha] || 0) + v;
      if (m.fecha === hoyISO) { if (m.tipo === 'gasto') r.hoy += v; r.hoyN++; }
      if (mm !== mes) return;
      r.cantidad++; r.movs.push(m);
      if (m.tipo === 'gasto') {
        r.gastos += v; r.cats[m.categoria || 'cat-otros-gastos'] = (r.cats[m.categoria || 'cat-otros-gastos'] || 0) + v;
        if (m.nd === 'Deseo') r.nd.Deseo += v; else if (m.nd === 'Necesidad') r.nd.Necesidad += v;
      } else if (m.tipo === 'ingreso') { r.ingresos += v; r.catsIng[m.categoria || 'cat-otros-ingresos'] = (r.catsIng[m.categoria || 'cat-otros-ingresos'] || 0) + v; }
      else if (m.tipo === 'inversion' || m.tipo === 'compra_activo') r.invertido += v;
      else if (m.tipo === 'rescate' || m.tipo === 'venta_activo') r.rescatado += v;
      else if (m.tipo === 'prestamo_dado') r.prestado += v;
      else if (m.tipo === 'cobro_prestamo') r.cobrado += v;
    });
    r.balance = r.ingresos - r.gastos;
    r.tasaAhorro = r.ingresos > 0 ? r.balance / r.ingresos : null;
    var p = mes.split('-'), y = +p[0], mo = +p[1];
    r.diasMes = new Date(y, mo, 0).getDate();
    var hoyMes = mesDe(hoyISO) === mes;
    r.diaActual = hoyMes ? +hoyISO.slice(8, 10) : r.diasMes;
    r.ritmo = r.diaActual ? r.gastos / r.diaActual : 0;
    r.proyeccion = hoyMes ? r.ritmo * r.diasMes : r.gastos;
    return r;
  }

  function saldosCuentas() {
    var cuentas = lista('cuentas'), saldo = {};
    cuentas.forEach(function (c) { saldo[c.id] = Number(c.saldoInicial) || 0; });
    lista('movimientos').forEach(function (m) {
      var v = montoARS(m), o = m.cuenta, d = m.cuentaDestino;
      function mas(id, x) { if (id && saldo[id] !== undefined) saldo[id] += x; }
      switch (m.tipo) {
        case 'gasto': if (!m.financiadoPor) mas(o, -v); break;
        case 'ingreso': case 'cobro_prestamo': case 'prestamo_recibido': case 'rescate': case 'venta_activo': mas(o, v); break;
        case 'prestamo_dado': case 'pago_deuda': case 'inversion': case 'compra_activo': mas(o, -v); break;
        case 'transferencia': mas(o, -v); mas(d, v); break;
      }
    });
    return saldo;
  }

  function cartera() {
    var movs = lista('movimientos');
    var est = Motor.calcularEstado(movs);
    var instr = {};
    movs.forEach(function (m) {
      if (m.tipo !== 'inversion' && m.tipo !== 'rescate') return;
      var k = m.categoria || 'cat-plazo-fijo';
      instr[k] = instr[k] || { categoria: k, aportado: 0, rescatado: 0, ganancia: 0, ultimo: '' };
      var v = montoARS(m);
      if (m.tipo === 'inversion') instr[k].aportado += v;
      else { instr[k].rescatado += (m.capital || v); instr[k].ganancia += (m.ganancia || 0); }
      if (m.fecha > instr[k].ultimo) instr[k].ultimo = m.fecha;
    });
    Object.keys(instr).forEach(function (k) { instr[k].saldo = instr[k].aportado - instr[k].rescatado; });
    return { posiciones: est.posiciones, instrumentos: instr, personas: est.personas, plazosFijos: est.plazosFijos };
  }

  /* ---------------- cotizaciones (dolarapi.com, gratis) ---------------- */
  async function actualizarCotizaciones(forzar) {
    var a = ajustes();
    if (!a.cotizacionesAuto && !forzar) return null;
    var ult = mem.meta.cotizacionesFecha || 0;
    if (!forzar && Date.now() - ult < 6 * 3600 * 1000) return null;
    try {
      var casa = a.casaDolar || 'oficial';
      var r = await fetch('https://dolarapi.com/v1/dolares/' + casa);
      var j = await r.json();
      var nuevas = Object.assign({}, a.cotizaciones || {});
      if (j && j.venta) nuevas.USD = j.venta;
      try {
        var rb = await fetch('https://dolarapi.com/v1/cotizaciones/brl'); var jb = await rb.json(); if (jb && jb.venta) nuevas.BRL = jb.venta;
        var re = await fetch('https://dolarapi.com/v1/cotizaciones/eur'); var je = await re.json(); if (je && je.venta) nuevas.EUR = je.venta;
      } catch (e) { /* opcionales */ }
      await meta('cotizacionesFecha', Date.now());
      await cambiarAjustes({ cotizaciones: nuevas, cotizacionFuente: (j && j.nombre) || casa });
      return nuevas;
    } catch (e) { return null; }
  }

  /* ---------------- respaldo: exportar / importar ---------------- */
  function exportarJSON() {
    var o = { app: 'finanzas', version: 1, exportado: new Date().toISOString() };
    STORES.forEach(function (s) { o[s] = lista(s, true).map(limpiar); });
    o.ajustes = ajustes();
    return JSON.stringify(o, null, 1);
  }
  function exportarCSV() {
    var cats = {}, ctas = {};
    lista('categorias', true).forEach(function (c) { cats[c.id] = c.nombre; });
    lista('cuentas', true).forEach(function (c) { ctas[c.id] = c.nombre; });
    var filas = [['Fecha', 'Tipo', 'Monto', 'Moneda', 'Monto ARS', 'Categoría', 'Cuenta', 'Cuenta destino', 'Persona', 'Activo', 'Cantidad', 'Precio', 'Necesidad/Deseo', 'Descripción']];
    lista('movimientos').sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; }).forEach(function (m) {
      filas.push([m.fecha, (Motor.TIPOS[m.tipo] || {}).nombre || m.tipo, m.monto, m.moneda || 'ARS', montoARS(m), cats[m.categoria] || '',
        ctas[m.cuenta] || '', ctas[m.cuentaDestino] || '', m.persona || m.financiadoPor || '', m.activo ? m.activo.ticker : '',
        m.activo ? m.activo.cantidad : '', m.activo ? m.activo.precio : '', m.nd || '', m.descripcion || '']);
    });
    return filas.map(function (f) { return f.map(function (x) { x = x == null ? '' : String(x); return /[",;\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(';'); }).join('\n');
  }
  async function importarJSON(texto) {
    var o = JSON.parse(texto);
    var n = 0;
    for (var i = 0; i < STORES.length; i++) {
      var s = STORES[i], recs = (o[s] || []).filter(function (r) {
        var loc = mem[s][r.id];
        return r && r.id && (!loc || (r.updatedAt || 0) > (loc.updatedAt || 0));
      });
      recs.forEach(function (r) { r.dirty = 1; mem[s][r.id] = r; });
      await putVarios(s, recs);
      n += recs.length;
    }
    emitir('cambio', {});
    Sync.programar();
    return n;
  }
  function limpiar(r) { var c = Object.assign({}, r); delete c.dirty; return c; }

  /* =====================================================================
   *  SINCRONIZACIÓN con el respaldo en Google Drive (Apps Script)
   * ===================================================================== */
  var Sync = {
    estado: 'sin-vincular', error: null, enCurso: false, timer: null,
    vinculo: function () { return mem.meta.vinculo || null; },
    /** Código para vincular otro dispositivo (o la app instalada, que en iPhone no comparte datos con Safari). */
    codigo: function () {
      var v = mem.meta.vinculo;
      if (!v) return null;
      return btoa(unescape(encodeURIComponent(JSON.stringify({ u: v.u, t: v.t })))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },
    vincular: async function (codigo) {
      var v = decodificarVinculo(codigo);
      if (!v) throw new Error('El código de vinculación no es válido.');
      var r = await llamar(v, { a: 'ping' });
      if (!r || !r.ok) throw new Error((r && r.error) || 'El respaldo no respondió.');
      await meta('vinculo', v);
      await meta('ultimoSync', 0);
      this.estado = 'pendiente'; emitir('sync', this);
      await this.sincronizar(true);
      return r;
    },
    desvincular: async function () { await meta('vinculo', null); this.estado = 'sin-vincular'; emitir('sync', this); },
    pendientes: function () {
      var n = 0; STORES.forEach(function (s) { lista(s, true).forEach(function (r) { if (r.dirty) n++; }); }); return n;
    },
    programar: function () {
      var self = this;
      if (!self.vinculo()) return;
      self.estado = 'pendiente'; emitir('sync', self);
      clearTimeout(self.timer);
      self.timer = setTimeout(function () { self.sincronizar(); }, 1800);
    },
    sincronizar: async function (forzar) {
      var v = this.vinculo();
      if (!v) { this.estado = 'sin-vincular'; emitir('sync', this); return; }
      // una sincronización colgada más de 50 s (app suspendida) no bloquea las siguientes
      if (this.enCurso && Date.now() - (this.inicio || 0) < 50000) { this.otraVez = true; return; }
      if (!navigator.onLine && !forzar) { this.estado = 'pendiente'; emitir('sync', this); return; }
      clearTimeout(this.timerReintento);
      this.enCurso = true; this.inicio = Date.now(); this.estado = 'sincronizando'; emitir('sync', this);
      try {
        var cambios = [];
        STORES.forEach(function (s) {
          lista(s, true).forEach(function (r) { if (r.dirty) { var c = limpiar(r); c._s = s; cambios.push(c); } });
        });
        var desde = mem.meta.ultimoSync || 0;
        var resp = await llamar(v, { a: 'sync', desde: desde, cambios: cambios, disp: mem.meta.dispositivo });
        if (!resp || !resp.ok) throw new Error((resp && resp.error) || 'sin respuesta');
        var porStore = {};
        (resp.cambios || []).forEach(function (r) {
          var s = r._s; delete r._s;
          if (STORES.indexOf(s) < 0) return;
          var loc = mem[s][r.id];
          if (loc && loc.dirty && (loc.updatedAt || 0) > (r.updatedAt || 0)) return;
          r.dirty = 0; mem[s][r.id] = r;
          (porStore[s] = porStore[s] || []).push(r);
        });
        for (var s in porStore) await putVarios(s, porStore[s]);
        var limpios = {};
        cambios.forEach(function (c) {
          var loc = mem[c._s][c.id];
          if (loc && loc.updatedAt === c.updatedAt && loc.dirty) { loc.dirty = 0; (limpios[c._s] = limpios[c._s] || []).push(loc); }
        });
        for (var s2 in limpios) await putVarios(s2, limpios[s2]);
        await meta('ultimoSync', resp.ahora || Date.now());
        await meta('ultimoSyncLocal', Date.now());
        this.estado = this.pendientes() ? 'pendiente' : 'ok'; this.error = null; this.fallos = 0;
        if (Object.keys(porStore).length) emitir('cambio', { remoto: true });
      } catch (e) {
        this.estado = 'error'; this.error = e.message || String(e);
        // reintento solo, cada vez más espaciado: 10 s, 30 s, 2 min, 5 min
        var self = this; this.fallos = (this.fallos || 0) + 1;
        this.timerReintento = setTimeout(function () { self.sincronizar(); }, [10, 30, 120, 300][Math.min(this.fallos - 1, 3)] * 1000);
      } finally {
        this.enCurso = false; emitir('sync', this);
        if (this.otraVez) { this.otraVez = false; this.programar(); }
      }
    }
  };

  /** Llama al respaldo con un tope de 40 s: si el teléfono suspende la app a mitad de camino, no queda colgada para siempre. */
  async function llamar(v, cuerpo) {
    cuerpo.t = v.t;
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var corte = setTimeout(function () { if (ctrl) ctrl.abort(); }, 40000);
    try {
      var r = await fetch(v.u, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(cuerpo), redirect: 'follow', signal: ctrl ? ctrl.signal : undefined });
      var txt = await r.text();
      try { return JSON.parse(txt); } catch (e) { throw new Error('Google devolvió algo raro (' + r.status + '). Se reintenta solo.'); }
    } catch (e) {
      if (e && (e.name === 'AbortError' || e.name === 'TypeError')) throw new Error('No hubo conexión con el respaldo. Se reintenta solo.');
      throw e;
    } finally { clearTimeout(corte); }
  }

  function decodificarVinculo(codigo) {
    if (!codigo) return null;
    var s = String(codigo).trim();
    var m = /[#&?]v=([A-Za-z0-9_\-]+)/.exec(s);
    if (m) s = m[1];
    try {
      var b = s.replace(/-/g, '+').replace(/_/g, '/');
      while (b.length % 4) b += '=';
      var o = JSON.parse(decodeURIComponent(escape(atob(b))));
      if (o && o.u && o.t && /^https:\/\/script\.google(usercontent)?\.com\//.test(o.u)) return { u: o.u, t: o.t };
    } catch (e) { /* no es base64 */ }
    return null;
  }

  global.Datos = {
    soloMemoria: function () { return soloMemoria; },
    cargar: cargar, lista: lista, uno: uno, guardar: guardar, guardarVarios: guardarVarios, borrar: borrar,
    meta: meta, ajustes: ajustes, cambiarAjustes: cambiarAjustes, on: on, emitir: emitir, uuid: uuid,
    contextoMotor: contextoMotor, resumenMes: resumenMes, saldosCuentas: saldosCuentas, cartera: cartera,
    montoARS: montoARS, actualizarCotizaciones: actualizarCotizaciones,
    exportarJSON: exportarJSON, exportarCSV: exportarCSV, importarJSON: importarJSON,
    decodificarVinculo: decodificarVinculo, Sync: Sync
  };
})(typeof window !== 'undefined' ? window : globalThis);
