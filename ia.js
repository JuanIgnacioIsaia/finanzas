/* =====================================================================
 *  IA ABIERTA OPCIONAL — un modelo de lenguaje de código abierto que
 *  corre en el propio teléfono con WebLLM (sin API, sin costo).
 *
 *  No reemplaza al motor: solo lo ayuda con las frases que el motor no
 *  entendió con seguridad. El monto siempre lo toma el motor (es exacto);
 *  la IA aporta tipo, categoría y persona cuando el motor dudaba.
 *  Necesita WebGPU (Safari 26 / iOS 26 en adelante, Chrome en la compu).
 * ===================================================================== */
(function (global) {
  'use strict';

  var WEBLLM = 'https://esm.run/@mlc-ai/web-llm@0.2.84';
  var WEBLLM_2 = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.84/+esm';
  var PREFERIDOS = [/^Qwen2\.5-1\.5B-Instruct-q4f16_1/, /^Qwen3-1\.7B-q4f16_1/, /^Llama-3\.2-1B-Instruct-q4f16_1/,
    /^Qwen2\.5-0\.5B-Instruct-q4f16_1/, /^Qwen3-0\.6B-q4f16_1/, /^SmolLM2-1\.7B-Instruct-q4f16_1/];

  var motor = null, cargando = null, modeloId = null;

  async function disponible() {
    if (!navigator.gpu) return false;
    try { return !!(await navigator.gpu.requestAdapter()); } catch (e) { return false; }
  }

  async function cargar(alProgreso, liviano) {
    if (motor) return motor;
    if (cargando) return cargando;
    cargando = (async function () {
      var W;
      try { W = await import(WEBLLM); } catch (e) { W = await import(WEBLLM_2); }
      var lista = (W.prebuiltAppConfig && W.prebuiltAppConfig.model_list) || [];
      var prefs = liviano ? PREFERIDOS.slice(3) : PREFERIDOS;
      var elegido = null;
      for (var i = 0; i < prefs.length && !elegido; i++) {
        elegido = lista.filter(function (m) { return prefs[i].test(m.model_id) && (!m.vram_required_MB || m.vram_required_MB < 2300); })[0] || null;
      }
      if (!elegido) elegido = lista.filter(function (m) { return m.low_resource_required; })[0] || lista[0];
      if (!elegido) throw new Error('No encontré un modelo compatible.');
      modeloId = elegido.model_id;
      motor = await W.CreateMLCEngine(modeloId, {
        initProgressCallback: function (p) { alProgreso && alProgreso(p.progress || 0, p.text || ''); }
      });
      localStorage.setItem('iaModelo', modeloId);
      localStorage.setItem('iaLista', '1');
      return motor;
    })();
    try { return await cargando; } finally { cargando = null; }
  }

  function sistema(ctx, hoy) {
    var cats = ctx.categorias.map(function (c) { return c.nombre + ' (' + c.tipo + ')'; }).join(', ');
    var ctas = ctx.cuentas.map(function (c) { return c.nombre; }).join(', ');
    return 'Convertís frases en castellano rioplatense sobre movimientos de plata en JSON. Hoy es ' + hoy + '.\n' +
      'Respondé SOLO con un objeto JSON, sin texto extra, con esta forma:\n' +
      '{"movimientos":[{"tipo":"gasto|ingreso|transferencia|prestamo_dado|cobro_prestamo|prestamo_recibido|pago_deuda|inversion|rescate|compra_activo|venta_activo",' +
      '"monto":number,"moneda":"ARS|USD|BRL|EUR","categoria":"nombre exacto de la lista","cuenta":"nombre exacto de la lista o null",' +
      '"persona":"nombre o null","descripcion":"texto corto","fecha":"YYYY-MM-DD o null","activo":{"ticker":"","cantidad":number,"precio":number} o null}]}\n' +
      'Jerga: "luca"=1000 pesos, "palo"=1.000.000, "k"=mil. "le presté a X"=prestamo_dado, "X me devolvió"=cobro_prestamo, ' +
      '"X me prestó"=prestamo_recibido, "le devolví a X"=pago_deuda, plazo fijo/FCI=inversion, comprar acciones/cedears/dólares=compra_activo.\n' +
      'Categorías: ' + cats + '.\nCuentas: ' + ctas + '.';
  }

  var EJEMPLOS = [
    ['me clavé 12 lucas en birras con los pibes', '{"movimientos":[{"tipo":"gasto","monto":12000,"moneda":"ARS","categoria":"Bar y salidas","cuenta":null,"persona":null,"descripcion":"Birras con los pibes","fecha":null,"activo":null}]}'],
    ['el gordo me tiró 30 mil que le había dejado el mes pasado', '{"movimientos":[{"tipo":"cobro_prestamo","monto":30000,"moneda":"ARS","categoria":null,"cuenta":null,"persona":"Gordo","descripcion":"Me devolvió","fecha":null,"activo":null}]}']
  ];

  function extraerJSON(txt) {
    var i = txt.indexOf('{'), j = txt.lastIndexOf('}');
    if (i < 0 || j <= i) return null;
    try { return JSON.parse(txt.slice(i, j + 1)); } catch (e) { return null; }
  }

  /** Pregunta al modelo y devuelve su lectura cruda (o null). */
  async function leer(texto, ctx, hoyISO) {
    if (!motor) return null;
    var mensajes = [{ role: 'system', content: sistema(ctx, hoyISO) }];
    EJEMPLOS.forEach(function (e) { mensajes.push({ role: 'user', content: e[0] }); mensajes.push({ role: 'assistant', content: e[1] }); });
    mensajes.push({ role: 'user', content: texto });
    var r = await motor.chat.completions.create({ messages: mensajes, temperature: 0, max_tokens: 320 });
    var contenido = r && r.choices && r.choices[0] && r.choices[0].message ? r.choices[0].message.content : '';
    var j = extraerJSON(contenido || '');
    return j && Array.isArray(j.movimientos) ? j.movimientos : null;
  }

  function idPorNombre(lista, nombre) {
    if (!nombre) return null;
    var n = Motor._.norm(nombre).trim();
    var x = lista.filter(function (c) { return Motor._.norm(c.nombre) === n; })[0];
    return x ? x.id : null;
  }

  /** Mejora un movimiento dudoso del motor con la lectura de la IA. */
  function fusionar(movMotor, leido, ctx) {
    if (!leido) return movMotor;
    var m = Object.assign({}, movMotor);
    var tipos = Object.keys(Motor.TIPOS);
    if (leido.tipo && tipos.indexOf(leido.tipo) >= 0 && (m.confianza < 0.6 || m.dudas.some(function (d) { return d.campo === 'tipo'; }))) {
      m.tipo = leido.tipo;
      m.dudas = m.dudas.filter(function (d) { return d.campo !== 'tipo'; });
    }
    if (!m.monto && typeof leido.monto === 'number' && leido.monto > 0) {
      m.monto = leido.monto; m.montoARS = leido.monto; m.moneda = leido.moneda || 'ARS';
      m.dudas = m.dudas.filter(function (d) { return d.campo !== 'monto'; });
    }
    var cat = idPorNombre(ctx.categorias, leido.categoria);
    if (cat && (!m.categoria || /otros/.test(m.categoria) || m.confianza < 0.6)) m.categoria = cat;
    if (leido.persona && /^(prestamo_|cobro_|pago_deuda)/.test(m.tipo) && !m.persona) {
      m.persona = leido.persona;
      m.dudas = m.dudas.filter(function (d) { return d.campo !== 'persona'; });
    }
    if (leido.descripcion && (!m.descripcion || m.descripcion.length < 3)) m.descripcion = leido.descripcion;
    if (m.tipo !== 'gasto') m.nd = null;
    m.confianza = Math.max(m.confianza, 0.7);
    m.porIA = true;
    return m;
  }

  global.IA = {
    disponible: disponible, cargar: cargar, leer: leer, fusionar: fusionar,
    lista: function () { return !!motor; }, modelo: function () { return modeloId || localStorage.getItem('iaModelo'); },
    descargada: function () { return localStorage.getItem('iaLista') === '1'; }
  };
})(window);
