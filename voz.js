/* =====================================================================
 *  VOZ — convierte lo que decís en texto. Tres motores:
 *
 *  1. nativo  : el dictado del sistema (Web Speech API). El mejor y el
 *               más rápido, pero en iPhone NO funciona cuando la app está
 *               instalada en la pantalla de inicio (bug de WebKit 225298).
 *  2. whisper : Whisper de OpenAI, código abierto, corriendo en el propio
 *               teléfono con transformers.js. Se baja una vez (~77 MB) y
 *               después funciona sin internet y sin costo.
 *  3. teclado : el micrófono del teclado del iPhone. Siempre funciona.
 * ===================================================================== */
(function (global) {
  'use strict';

  var TRANSFORMERS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
  var MODELOS = {
    base: { id: 'onnx-community/whisper-base', mb: 77, nombre: 'Whisper base' },
    small: { id: 'onnx-community/whisper-small', mb: 250, nombre: 'Whisper small (más preciso)' }
  };

  var ua = navigator.userAgent || '';
  var esIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var esStandalone = (global.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var Reconocedor = global.SpeechRecognition || global.webkitSpeechRecognition || null;

  var asr = null, cargandoAsr = null, modeloCargado = null;
  var grabacion = null;

  function nativoUsable() { return !!Reconocedor && !(esIOS && esStandalone); }
  function whisperUsable() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && global.MediaRecorder); }

  /** Motor efectivo según el ajuste ('auto' | 'nativo' | 'whisper' | 'teclado'). */
  function motor(pref) {
    if (pref === 'teclado') return 'teclado';
    if (pref === 'nativo') return Reconocedor ? 'nativo' : 'teclado';
    if (pref === 'whisper') return whisperUsable() ? 'whisper' : 'teclado';
    if (nativoUsable() && localStorage.getItem('nativoFalla') !== '1') return 'nativo';
    if (whisperUsable() && localStorage.getItem('whisperListo') === '1') return 'whisper';
    if (whisperUsable()) return 'whisper-sin-bajar';
    return 'teclado';
  }

  /* ---------------- 1. nativo ---------------- */
  function escucharNativo(cb) {
    var rec = new Reconocedor();
    rec.lang = 'es-AR';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    var final = '', parcial = '', arrancó = false, terminado = false;
    var vigia = setTimeout(function () {
      if (!arrancó && !terminado) { terminado = true; try { rec.abort(); } catch (e) { /* nada */ } cb.error('no-arranca'); }
    }, 5000);
    rec.onstart = function () { arrancó = true; cb.estado && cb.estado('escuchando'); };
    rec.onresult = function (e) {
      arrancó = true; parcial = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var r = e.results[i];
        if (r.isFinal) final += r[0].transcript; else parcial += r[0].transcript;
      }
      cb.parcial && cb.parcial((final + ' ' + parcial).trim());
    };
    rec.onerror = function (e) {
      if (terminado) return;
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      terminado = true; clearTimeout(vigia); cb.error(e.error || 'error');
    };
    rec.onend = function () {
      clearTimeout(vigia);
      if (terminado) return;
      terminado = true;
      cb.final((final + ' ' + parcial).trim());
    };
    try { rec.start(); } catch (e) { clearTimeout(vigia); cb.error('no-arranca'); return null; }
    return { detener: function () { try { rec.stop(); } catch (e) { /* nada */ } } };
  }

  /* ---------------- 2. whisper (código abierto, en el teléfono) ---------------- */
  async function cargarWhisper(tamano, alProgreso) {
    var m = MODELOS[tamano] || MODELOS.base;
    if (asr && modeloCargado === m.id) return asr;
    if (cargandoAsr) return cargandoAsr;
    cargandoAsr = (async function () {
      var T;
      try { T = await import(TRANSFORMERS); } catch (e) { T = await import(TRANSFORMERS + '/+esm'); }
      T.env.allowLocalModels = false;
      var progreso = {};
      var cb = function (p) {
        if (p.status === 'progress' && p.total) {
          progreso[p.file] = [p.loaded, p.total];
          var a = 0, b = 0;
          for (var k in progreso) { a += progreso[k][0]; b += progreso[k][1]; }
          alProgreso && alProgreso(b ? a / b : 0, Math.round(b / 1e6));
        }
      };
      var dispositivo = 'wasm';
      try {
        if (navigator.gpu && !esIOS) { var ad = await navigator.gpu.requestAdapter(); if (ad) dispositivo = 'webgpu'; }
      } catch (e) { /* sin WebGPU */ }
      var opciones = { progress_callback: cb, device: dispositivo,
        dtype: dispositivo === 'webgpu' ? { encoder_model: 'fp32', decoder_model_merged: 'q4' } : 'q8' };
      try { asr = await T.pipeline('automatic-speech-recognition', m.id, opciones); }
      catch (e) {
        if (dispositivo !== 'wasm') { opciones.device = 'wasm'; opciones.dtype = 'q8'; asr = await T.pipeline('automatic-speech-recognition', m.id, opciones); }
        else throw e;
      }
      modeloCargado = m.id;
      localStorage.setItem('whisperListo', '1');
      localStorage.setItem('whisperModelo', tamano || 'base');
      return asr;
    })();
    try { return await cargandoAsr; } finally { cargandoAsr = null; }
  }

  async function grabarWhisper(cb) {
    var stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    var tipo = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', ''].filter(function (t) { return !t || MediaRecorder.isTypeSupported(t); })[0];
    var mr = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined);
    var trozos = [];
    mr.ondataavailable = function (e) { if (e.data && e.data.size) trozos.push(e.data); };
    var AC = global.AudioContext || global.webkitAudioContext;
    var ac = new AC(), fuente = ac.createMediaStreamSource(stream), an = ac.createAnalyser();
    an.fftSize = 1024; fuente.connect(an);
    var buf = new Float32Array(an.fftSize), hablo = false, silencioDesde = 0, inicio = Date.now(), vivo = true;
    function medir() {
      if (!vivo) return;
      an.getFloatTimeDomainData(buf);
      var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      var rms = Math.sqrt(s / buf.length);
      cb.nivel && cb.nivel(Math.min(1, rms * 9));
      var ahora = Date.now();
      if (rms > 0.03) { hablo = true; silencioDesde = 0; }
      else if (hablo) { if (!silencioDesde) silencioDesde = ahora; else if (ahora - silencioDesde > 1600) return terminar(); }
      if (ahora - inicio > 25000) return terminar();
      requestAnimationFrame(medir);
    }
    function terminar() { if (!vivo) return; vivo = false; try { mr.stop(); } catch (e) { /* nada */ } }
    var listo = new Promise(function (ok) { mr.onstop = ok; });
    mr.start(250);
    cb.estado && cb.estado('escuchando');
    requestAnimationFrame(medir);
    var control = { detener: terminar };
    (async function () {
      await listo;
      stream.getTracks().forEach(function (t) { t.stop(); });
      try { ac.close(); } catch (e) { /* nada */ }
      cb.nivel && cb.nivel(0);
      if (!hablo && Date.now() - inicio < 1200) { cb.final(''); return; }
      cb.estado && cb.estado('procesando');
      try {
        var blob = new Blob(trozos, { type: mr.mimeType || tipo || 'audio/mp4' });
        var audio = await a16k(await blob.arrayBuffer());
        var modelo = await cargarWhisper(localStorage.getItem('whisperModelo') || 'base');
        var out = await modelo(audio, { language: 'spanish', task: 'transcribe', chunk_length_s: 30 });
        var texto = (out && out.text ? out.text : '').replace(/^\s*[\[(].*?[\])]\s*/, '').trim();
        cb.final(texto);
      } catch (e) { cb.error('whisper: ' + (e.message || e)); }
    })();
    return control;
  }

  /** Decodifica el audio grabado y lo pasa a 16 kHz mono (lo que espera Whisper). */
  async function a16k(arrayBuffer) {
    var AC = global.AudioContext || global.webkitAudioContext;
    var ac = new AC();
    var dec = await new Promise(function (ok, mal) { ac.decodeAudioData(arrayBuffer, ok, mal); });
    try { ac.close(); } catch (e) { /* nada */ }
    var largo = Math.ceil(dec.duration * 16000);
    var off = new (global.OfflineAudioContext || global.webkitOfflineAudioContext)(1, largo, 16000);
    var src = off.createBufferSource(); src.buffer = dec; src.connect(off.destination); src.start(0);
    var r = await off.startRendering();
    return r.getChannelData(0);
  }

  /* ---------------- API ---------------- */
  /**
   * cb = { parcial(texto), final(texto), error(codigo), estado('escuchando'|'procesando'), nivel(0..1) }
   * Devuelve { detener() } o null si hay que usar el teclado.
   */
  async function escuchar(pref, cb) {
    var m = motor(pref);
    if (m === 'nativo') {
      var errorOriginal = cb.error;
      return escucharNativo(Object.assign({}, cb, {
        error: function (codigo) {
          // si el dictado del sistema no anda, la próxima vez usamos Whisper
          if (/no-arranca|service-not-allowed|not-allowed/.test(codigo)) localStorage.setItem('nativoFalla', '1');
          errorOriginal(codigo);
        }
      }));
    }
    if (m === 'whisper') return grabarWhisper(cb);
    return null;
  }

  global.Voz = {
    motor: motor, escuchar: escuchar, cargarWhisper: cargarWhisper, MODELOS: MODELOS,
    esIOS: esIOS, esStandalone: esStandalone, hayNativo: !!Reconocedor, nativoUsable: nativoUsable, whisperUsable: whisperUsable,
    whisperListo: function () { return localStorage.getItem('whisperListo') === '1'; }
  };
})(window);
