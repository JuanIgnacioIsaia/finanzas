/* =====================================================================
 *  MOTOR DE INTERPRETACIÓN — Finanzas
 *  ---------------------------------------------------------------------
 *  Entiende movimientos de plata dictados en castellano rioplatense y los
 *  convierte en registros estructurados. No usa ninguna API: es código
 *  puro que corre en el teléfono, en Node (pruebas) y en Apps Script.
 *
 *    Motor.interpretar("gasté 8 lucas en el súper con débito", contexto)
 *
 *  Piezas:
 *    1. Tokenizador que conserva el texto original (para descripciones).
 *    2. Lector de números: dígitos, palabras, jerga (lucas, palos, k),
 *       "palo y medio", "media luca", "1,5 millones".
 *    3. Roles de cada número: monto, cantidad, precio, fecha, medida, cuota.
 *    4. Separación de varias operaciones en una misma frase.
 *    5. Tipo de movimiento: gasto, ingreso, préstamos, inversiones,
 *       compra/venta de activos, transferencias entre cuentas propias.
 *    6. Entidades: cuenta, persona, activo, fecha, proyecto, categoría.
 *    7. Aprendizaje: reglas que salen del historial y de las correcciones.
 *    8. Resolución con contexto: deudas abiertas, plazos fijos, posiciones.
 * ===================================================================== */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Motor = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var VERSION = '1.0.0';

  /* ================================================================
   *  CATÁLOGO BASE (ids fijos: los comparten la app y el backend)
   * ================================================================ */

  var TIPOS = {
    gasto:             { nombre: 'Gasto',              signo: -1, resultado: true,  icono: '↘' },
    ingreso:           { nombre: 'Ingreso',            signo:  1, resultado: true,  icono: '↗' },
    transferencia:     { nombre: 'Entre mis cuentas',  signo:  0, resultado: false, icono: '⇄' },
    prestamo_dado:     { nombre: 'Préstamo que di',    signo: -1, resultado: false, icono: '🤝' },
    cobro_prestamo:    { nombre: 'Me devolvieron',     signo:  1, resultado: false, icono: '🤝' },
    prestamo_recibido: { nombre: 'Préstamo que pedí',  signo:  1, resultado: false, icono: '🏦' },
    pago_deuda:        { nombre: 'Pagué una deuda',    signo: -1, resultado: false, icono: '✔' },
    inversion:         { nombre: 'Inversión',          signo: -1, resultado: false, icono: '📈' },
    rescate:           { nombre: 'Rescate',            signo:  1, resultado: false, icono: '💰' },
    compra_activo:     { nombre: 'Compra de activo',   signo: -1, resultado: false, icono: '🟢' },
    venta_activo:      { nombre: 'Venta de activo',    signo:  1, resultado: false, icono: '🔴' }
  };

  // [id, nombre, tipo, grupo, icono, color, nd, palabras]
  var CAT = [
    // ---- gastos fijos
    ['alquiler', 'Alquiler', 'gasto', 'fijo', '🏠', '#5E8B4A', 'Necesidad', 'alquiler,expensas,inmobiliaria'],
    ['servicios', 'Servicios', 'gasto', 'fijo', '💡', '#C9A227', 'Necesidad', 'luz,edesur,edenor,agua,aysa,metrogas,naturgy,servicios,factura de luz,factura del gas,pague el gas,boleta,abl'],
    ['internet', 'Internet', 'gasto', 'fijo', '🌐', '#3FA796', 'Necesidad', 'internet,wifi,fibertel,telecentro,flow,starlink'],
    ['celular', 'Celular', 'gasto', 'fijo', '📱', '#4F9D69', 'Necesidad', 'plan del celu,plan del celular,tuenti,personal,claro,movistar,recarga,carga del celu,credito del celu'],
    ['suscripciones', 'Suscripciones', 'gasto', 'fijo', '🔁', '#8C7AE6', 'Deseo', 'suscripcion,netflix,spotify,youtube premium,disney,star plus,hbo,max,prime video,amazon prime,paramount,meli+,meli plus,nivel 6,claude,chatgpt,openai,icloud,google one,game pass,ps plus,apple music,deezer,tidal,beatport,soundcloud,crunchyroll'],
    ['seguro', 'Seguro', 'gasto', 'fijo', '🛡️', '#686A6C', 'Necesidad', 'seguro,poliza,sancor,mapfre,rivadavia,federacion patronal,la segunda,zurich'],
    ['cuotas', 'Cuotas', 'gasto', 'fijo', '💳', '#7A7C7E', 'Necesidad', 'cuota del,cuotas de'],
    ['transporte-fijo', 'Transporte fijo', 'gasto', 'fijo', '🚇', '#557A95', 'Necesidad', 'abono,cochera,patente,vtv,transferencia del auto,transferencia del tiida,registro automotor'],
    // ---- gastos variables
    ['supermercado', 'Supermercado', 'gasto', 'variable', '🛒', '#85BB65', 'Necesidad', 'super,supermercado,chino,coto,disco,jumbo,carrefour,vea,changomas,almacen,despensa,mayorista,makro,vital,maxiconsumo,la anonima,verduleria,verdura,fruta,compras de la semana,mercaderia para casa'],
    ['comida', 'Comida', 'gasto', 'variable', '🍽️', '#A8D58B', 'Necesidad', 'comida,almuerzo,almorce,almorzamos,cena,cene,cenamos,desayuno,desayune,merienda,merende,morfi,vianda,menu,milanesa,milanga,empanada,pizza,hamburguesa,sandwich,sanguche,lomito,choripan,chori,parrilla,parrillada,tortilla,tarta,pasta,ravioles,noquis,locro,guiso,comedor,resto,restaurante,restaurant,bodegon,cantina,picada,helado,heladeria,cafe,cafecito,medialunas con cafe,gaseosa,coca,agua,sushi,wok,poke,taco,burrito,kebab,shawarma,ramen,chivito,pancho,papas fritas,ensalada,omelette,pollo al spiedo,rotiseria'],
    ['delivery', 'Delivery', 'gasto', 'variable', '🛵', '#C07A4A', 'Deseo', 'delivery,pedidos ya,pedidosya,rappi,pedi comida,pedimos comida,por app'],
    ['bar-y-salidas', 'Bar y salidas', 'gasto', 'variable', '🍻', '#D4AF37', 'Deseo', 'bar,birra,cerveza,pinta,fernet,trago,after,afterwork,previa,salida,salimos,vino,gin,cerveceria,ronda'],
    ['ocio', 'Ocio', 'gasto', 'variable', '🎟️', '#C76B79', 'Deseo', 'entrada,recital,show,cine,teatro,fiesta,evento,festival,boliche,joda,juego,steam,playstation,bowling,paintball,karting,escape room,cumple,cumpleanos'],
    ['panaderia', 'Panadería', 'gasto', 'variable', '🥐', '#E0B36A', 'Deseo', 'panaderia,factura,medialuna,bizcochito,criollito,pan,docena de facturas,media docena,tortita,chipa,sanguchitos de miga,masas,budin'],
    ['kiosco', 'Kiosco', 'gasto', 'variable', '🍫', '#B5838D', 'Deseo', 'kiosco,golosina,alfajor,chicle,chocolate,caramelo,pucho,cigarrillo,atado,marlboro,malboro,philip morris,lucky,camel,crafted,encendedor,vicio'],
    ['carniceria', 'Carnicería', 'gasto', 'variable', '🥩', '#B4533A', 'Necesidad', 'carniceria,carnicero,carne,churrasco,bife,vacio,kilo de asado,chorizo,morcilla,pollo,polleria'],
    ['combustible', 'Combustible', 'gasto', 'variable', '⛽', '#6B8F3A', 'Necesidad', 'nafta,combustible,gasoil,diesel,tanque,shell,axion,puma,estacion de servicio,infinia,v-power,cargue nafta'],
    ['gnc', 'GNC', 'gasto', 'variable', '🟢', '#4E9F3D', 'Necesidad', 'gnc,cargue gas,gas natural'],
    ['transporte', 'Transporte', 'gasto', 'variable', '🚕', '#5B7DB1', 'Necesidad', 'uber,didi,cabify,taxi,remis,colectivo,bondi,subte,tren,sube,peaje,estacionamiento,estacione,parking'],
    ['mantenimiento', 'Mantenimiento', 'gasto', 'variable', '🔧', '#8E9093', 'Necesidad', 'mantenimiento,reparacion,arreglo,arregle,repuesto,taller,mecanico,service,gomeria,cubierta,aceite,filtro,bateria,stereo,cooler,lavadero,herramienta'],
    ['salud', 'Salud', 'gasto', 'variable', '🩺', '#3E8E7E', 'Necesidad', 'salud,prepaga,obra social,swiss medical,osde,galeno,medife,medico,doctor,turno,consulta,farmacia,remedio,medicamento,ibuprofeno,dentista,odontologo,psicologo,terapia,analisis,estudio medico,kinesiologo,oculista,anteojo'],
    ['ropa', 'Ropa', 'gasto', 'variable', '👕', '#9AAE5B', 'Deseo', 'ropa,remera,pantalon,jean,zapatilla,zapato,buzo,campera,camisa,media,calzoncillo,short,malla,gorra,vestimenta'],
    ['hogar', 'Hogar', 'gasto', 'variable', '🛋️', '#7FA650', 'Necesidad', 'hogar,mueble,electrodomestico,heladera,lavarropas,microondas,colchon,sabana,toalla,limpieza,lavandina,detergente,ferreteria,bazar,cargador,lampara,mudanza'],
    ['educacion', 'Educación', 'gasto', 'variable', '📚', '#6C8EBF', 'Necesidad', 'curso,facultad,universidad,libro,clase,capacitacion,seminario,udemy,platzi,coderhouse,fotocopia,apunte'],
    ['regalos-y-festejos', 'Regalos y festejos', 'gasto', 'variable', '🎁', '#D98C5F', 'Deseo', 'regalo,regale,festejo,torta,cotillon'],
    ['viajes', 'Viajes', 'gasto', 'variable', '✈️', '#4AA3A2', 'Deseo', 'viaje,vuelo,pasaje,aerolineas,flybondi,jetsmart,latam,hotel,hostel,airbnb,alojamiento,excursion,valija'],
    ['tecnologia', 'Tecnología', 'gasto', 'variable', '💻', '#5F7FA8', 'Deseo', 'notebook,computadora,auricular,parlante,monitor,teclado,mouse,tablet,ipad,iphone,samsung,joystick,consola,controladora,pendrive,ssd,smartwatch'],
    ['cuidado-personal', 'Cuidado personal', 'gasto', 'variable', '💈', '#A47FB0', 'Necesidad', 'peluqueria,barberia,corte de pelo,me corte el pelo,perfume,desodorante,shampoo,crema,afeitadora'],
    ['deporte', 'Deporte', 'gasto', 'variable', '🏋️', '#5DA271', 'Necesidad', 'gimnasio,gym,pileta,natacion,padel,futbol 5,cancha de futbol,club'],
    ['impuestos', 'Impuestos', 'gasto', 'variable', '🧾', '#7D6B57', 'Necesidad', 'impuesto,monotributo,afip,arca,ganancias,ingresos brutos,iibb,rentas,multa,sellos'],
    ['imprevistos', 'Imprevistos', 'gasto', 'variable', '⚠️', '#C2554A', 'Necesidad', 'imprevisto,emergencia,urgencia,accidente'],
    ['otros-gastos', 'Otros gastos', 'gasto', 'variable', '💸', '#686A6C', null, 'varios,otros'],
    // ---- ingresos
    ['sueldo', 'Sueldo', 'ingreso', null, '💼', '#85BB65', null, 'sueldo,salario,haberes,recibo de sueldo,quincena,autonomy'],
    ['aguinaldo', 'Aguinaldo', 'ingreso', null, '🎄', '#A8D58B', null, 'aguinaldo,sac'],
    ['horas-extra', 'Horas extra', 'ingreso', null, '⏱️', '#6B8F3A', null, 'horas extra,horas extras,extras,guardia'],
    ['bono', 'Bono', 'ingreso', null, '🎯', '#D4AF37', null, 'bono,premio,bonus,incentivo'],
    ['freelance', 'Freelance', 'ingreso', null, '🧑‍💻', '#3FA796', null, 'freelance,changa,trabajo extra,laburo extra,cliente,cache,toque en'],
    ['negocio', 'Negocio', 'ingreso', null, '🏪', '#4E9F3D', null, 'negocio,ventas del kiosco,caja del kiosco,recaudacion,ventas del dia'],
    ['venta', 'Venta', 'ingreso', null, '🏷️', '#C9A227', null, 'venta,vendi'],
    ['intereses', 'Intereses', 'ingreso', null, '📈', '#2E7D32', null, 'intereses,interes,rendimiento,dividendo,cupon,renta'],
    ['reintegro', 'Reintegro', 'ingreso', null, '↩️', '#5B7DB1', null, 'reintegro,reembolso,cashback,juicio,indemnizacion,devolucion de la compra'],
    ['regalo-recibido', 'Regalo', 'ingreso', null, '🎁', '#D98C5F', null, 'me regalaron,regalo de'],
    ['alquileres', 'Alquileres', 'ingreso', null, '🏘️', '#7FA650', null, 'cobre el alquiler,inquilino,alquiler del depto'],
    ['otros-ingresos', 'Otros ingresos', 'ingreso', null, '💵', '#686A6C', null, ''],
    // ---- inversión
    ['plazo-fijo', 'Plazo fijo', 'inversion', null, '🏦', '#2E7D32', null, 'plazo fijo,plazos fijos,pf'],
    ['money-market', 'Fondo money market', 'inversion', null, '💧', '#3FA796', null, 'money market,fondo comun,fondo de liquidez'],
    ['fci', 'FCI', 'inversion', null, '📊', '#4F9D69', null, 'fci,fondo'],
    ['caucion', 'Caución', 'inversion', null, '🔐', '#557A95', null, 'caucion'],
    ['acciones', 'Acciones', 'inversion', null, '📈', '#85BB65', null, 'acciones,accion'],
    ['cedear', 'CEDEAR', 'inversion', null, '🌎', '#A8D58B', null, 'cedear'],
    ['bonos', 'Bonos', 'inversion', null, '📜', '#C9A227', null, 'bono,bonos'],
    ['on', 'ON', 'inversion', null, '🏢', '#8E9093', null, 'obligaciones negociables,ons'],
    ['dolares', 'Dólares', 'inversion', null, '💵', '#6B8F3A', null, 'dolares'],
    ['cripto', 'Cripto', 'inversion', null, '₿', '#D4AF37', null, 'cripto,bitcoin'],
    ['proyecto-2006', 'Proyecto 2006', 'inversion', null, '🏗️', '#7D6B57', null, '']
  ];

  // [id, nombre, tipo, icono, color, alias]
  var CTA = [
    ['mp', 'Mercado Pago', 'billetera', '🟦', '#00A3E0', 'mercado pago,mercadopago,mp,qr,con el qr,billetera'],
    ['bbva', 'BBVA', 'banco', '🏦', '#1464A5', 'bbva,debito,tarjeta de debito,banco,frances,transferencia,cbu,caja de ahorro,homebanking'],
    ['tarjeta', 'Tarjeta BBVA', 'credito', '💳', '#8E9093', 'credito,tarjeta de credito,con la tarjeta,con tarjeta,visa,mastercard,master,en cuotas'],
    ['efectivo', 'Efectivo', 'efectivo', '💵', '#85BB65', 'efectivo,en efectivo,cash,en mano,billete,contado'],
    ['broker', 'Broker', 'broker', '📊', '#D4AF37', 'broker,cocos,iol,invertir online,balanz,ppi,bull market,eco valores,allaria,comitente']
  ];

  // [id, nombre, icono, color, esInversion, categoriaInversion, palabras]
  var PRY = [
    ['2006', 'Proyecto 2006', '🏗️', '#7D6B57', true, 'proyecto-2006', 'proyecto 2006,el 2006,del 2006,para el 2006,depto,deptos,departamento,departamentos,obra,inodoro,bidet,calefon,porcellanato,porcelanato,ceramico,ceramica,materiales,albanil,plomero,electricista,sanitario,griferia,revestimiento,cemento,ladrillo,corralon,sodimac'],
    ['kiosco', 'Kiosco (negocio)', '🏪', '#4E9F3D', false, null, 'mi kiosco,el negocio,para el kiosco,del kiosco,mercaderia del kiosco,proveedor,reposicion,distribuidora'],
    ['dj', 'DJ', '🎧', '#8C7AE6', false, null, 'dj,controladora,ddj,flx4,pioneer,mixxx,rekordbox,beatport,curso de dj,vinilo,bandcamp'],
    ['brasil', 'Viaje a Brasil', '🇧🇷', '#4AA3A2', false, null, 'brasil,reales,florianopolis,floripa,buzios,rio de janeiro,salvador,porto seguro,maceio,natal,recife,arraial']
  ];

  function catalogoBase() {
    var ahora = 0; // fecha cero: cualquier edición del usuario le gana
    return {
      categorias: CAT.map(function (c, i) {
        return { id: 'cat-' + c[0], nombre: c[1], tipo: c[2], grupo: c[3], icono: c[4], color: c[5], nd: c[6],
                 palabras: c[7] ? c[7].split(',') : [], orden: i, archivada: false, base: true, updatedAt: ahora };
      }),
      cuentas: CTA.map(function (c, i) {
        return { id: 'cta-' + c[0], nombre: c[1], tipo: c[2], icono: c[3], color: c[4], alias: c[5].split(','),
                 moneda: 'ARS', saldoInicial: 0, orden: i, archivada: false, base: true, updatedAt: ahora };
      }),
      proyectos: PRY.map(function (p, i) {
        return { id: 'pry-' + p[0], nombre: p[1], icono: p[2], color: p[3], esInversion: p[4],
                 categoriaInversion: p[5] ? 'cat-' + p[5] : null, palabras: p[6].split(','),
                 orden: i, archivado: false, base: true, updatedAt: ahora };
      })
    };
  }

  /* ================================================================
   *  UTILIDADES
   * ================================================================ */

  function sinTildes(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function norm(s) { return sinTildes(String(s == null ? '' : s).toLowerCase()); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function cap(s) { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function tituloNombre(s) {
    return String(s || '').trim().split(/\s+/).map(function (w) {
      return w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w;
    }).join(' ');
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function diaLocal(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0); }
  function sumarDias(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12, 0, 0); }
  function redondear(n) { return Math.round(n * 100) / 100; }
  function tiene(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function raiz(w) {
    // singular aproximado para comparar palabras sueltas
    if (w.length > 5 && /ces$/.test(w)) return w.slice(0, -3) + 'z';
    if (w.length > 4 && /(as|es|os)$/.test(w) && !/(mes|tres|seis)$/.test(w)) return w.slice(0, -1).replace(/e$/, '');
    if (w.length > 3 && /s$/.test(w) && !/(mas|tres|seis|mes|gas|plus|bus|chips)$/.test(w)) return w.slice(0, -1);
    return w;
  }

  function formatoPesos(n, moneda) {
    var s = Math.abs(Number(n) || 0);
    var dec = (Math.round(s * 100) % 100) !== 0;
    var txt = s.toLocaleString('es-AR', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: 2 });
    var pre = moneda === 'USD' ? 'US$ ' : moneda === 'BRL' ? 'R$ ' : moneda === 'EUR' ? '€ ' : '$ ';
    return pre + txt;
  }

  /* ================================================================
   *  1. TOKENIZADOR
   * ================================================================ */

  var RE_TOKEN = /u\$s|us\$|u\$d|r\$|\$|€|\d+(?:[.,]\d+)*(?:[a-z][a-z0-9]*)?|[\p{L}][\p{L}\p{M}0-9'’+]*|[^\s]/giu;

  function tokenizar(texto) {
    var out = [], m;
    RE_TOKEN.lastIndex = 0;
    while ((m = RE_TOKEN.exec(texto)) !== null) {
      var o = m[0];
      out.push({ o: o, n: norm(o), a: m.index, b: m.index + o.length, i: out.length, rol: null });
    }
    return out;
  }

  /* ================================================================
   *  2. NÚMEROS
   * ================================================================ */

  var U = { cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
    diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18,
    diecinueve: 19, veinte: 20, veintiun: 21, veintiuno: 21, veintiuna: 21, veintidos: 22, veintitres: 23,
    veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29 };
  var D = { treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };
  var C = { cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300,
    cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600,
    setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900 };
  var MULT = { mil: 1e3, luca: 1e3, lucas: 1e3, luka: 1e3, lukas: 1e3, k: 1e3, millon: 1e6, millones: 1e6,
    palo: 1e6, palos: 1e6, gamba: 100, gambas: 100 };

  function esMult(w) { return tiene(MULT, w); }

  /** "8.000" → 8000, "20,17" → 20.17, "112.603,34" → 112603.34, "8k" → {8, 'k'} */
  function digitos(t) {
    var m = /^(\d+(?:[.,]\d+)*)([a-z][a-z0-9]*)?$/.exec(t);
    if (!m) return null;
    var s = m[1], suf = m[2] || '';
    var p = s.lastIndexOf('.'), c = s.lastIndexOf(',');
    var v;
    if (p >= 0 && c >= 0) {
      var dec = p > c ? '.' : ',', mil = dec === '.' ? ',' : '.';
      v = Number(s.split(mil).join('').replace(dec, '.'));
    } else if (p >= 0 || c >= 0) {
      var sep = p >= 0 ? '.' : ',';
      var partes = s.split(sep);
      var ult = partes[partes.length - 1];
      if (partes.length > 2) v = Number(partes.join(''));
      else if (sep === '.' && ult.length === 3 && partes[0] !== '0') v = Number(partes.join(''));
      else v = Number(partes.join('.'));
    } else v = Number(s);
    if (isNaN(v)) return null;
    return { valor: v, suf: suf };
  }

  function leerNumero(toks, i) {
    var t = toks[i];
    if (!t || t.rol) return null;
    var seq = [], j = i;
    while (j < toks.length) {
      var tk = toks[j];
      if (tk.rol) break;
      var x = tk.n, prev = seq.length ? seq[seq.length - 1] : null;
      var sig = toks[j + 1] ? toks[j + 1].n : '';
      if (/^\d/.test(x)) {
        if (seq.length) break;
        var pd = digitos(x);
        if (!pd) break;
        if (pd.suf && pd.suf !== 'k') return { valor: pd.valor, i0: i, i1: j, medida: pd.suf, mult: false, palabra: false };
        seq.push({ t: 'dig', v: pd.valor });
        if (pd.suf === 'k') seq.push({ t: 'mult', v: 1e3, w: 'k' });
        j++; continue;
      }
      if (tiene(U, x)) {
        var esUn = x === 'un' || x === 'una' || x === 'uno';
        if (esUn && !esMult(sig)) { if (!seq.length) return null; break; }
        if (prev && (prev.t === 'u' || prev.t === 'dig' || prev.t === 'd')) break;
        if (prev && prev.t === 'y') {
          var antes = seq[seq.length - 2];
          if (!(antes && antes.t === 'd' && U[x] >= 1 && U[x] <= 9)) break;
        }
        seq.push({ t: 'u', v: U[x] }); j++; continue;
      }
      if (tiene(D, x)) {
        if (prev && prev.t !== 'c' && prev.t !== 'mult') break;
        seq.push({ t: 'd', v: D[x] }); j++; continue;
      }
      if (tiene(C, x)) {
        if (prev && prev.t !== 'mult') break;
        seq.push({ t: 'c', v: C[x] }); j++; continue;
      }
      if (esMult(x)) {
        if (!seq.length && x !== 'mil') {
          var sigY = sig === 'y' && toks[j + 2] && (toks[j + 2].n === 'medio' || toks[j + 2].n === 'media');
          var solo = (x === 'palo' || x === 'millon') || ((x === 'luca' || x === 'luka') && (sigY || tiene(MONEDA_DESPUES, sig)));
          if (!solo) return null;
        }
        if (prev && prev.t === 'mult' && !(MULT[x] > prev.v)) break;
        if (prev && prev.t === 'y') break;
        seq.push({ t: 'mult', v: MULT[x], w: x }); j++; continue;
      }
      if (x === 'y') {
        var n1 = toks[j + 1] ? toks[j + 1].n : '';
        if (prev && prev.t === 'd' && tiene(U, n1) && U[n1] >= 1 && U[n1] <= 9) { seq.push({ t: 'y' }); j++; continue; }
        if (prev && prev.t === 'mult' && (n1 === 'medio' || n1 === 'media')) { seq.push({ t: 'y' }); j++; continue; }
        break;
      }
      if (x === 'medio' || x === 'media') {
        if (prev && prev.t === 'y') { seq.push({ t: 'medio' }); j++; continue; }
        if (!seq.length && esMult(sig)) { seq.push({ t: 'u', v: 0.5 }); j++; continue; }
        break;
      }
      break;
    }
    while (seq.length && seq[seq.length - 1].t === 'y') { seq.pop(); j--; }
    if (!seq.length) return null;
    var mill = 0, tot = 0, grp = 0, ult = 0, conMult = false, palabra = false, ultMultW = '';
    for (var k = 0; k < seq.length; k++) {
      var e = seq[k];
      if (e.t === 'dig' || e.t === 'u' || e.t === 'd' || e.t === 'c') { grp += e.v; if (e.t !== 'dig') palabra = true; }
      else if (e.t === 'mult') {
        conMult = true; ultMultW = e.w;
        if (e.v === 1e6) { mill += (tot + grp) || 1; tot = 0; grp = 0; ult = 1e6; }
        else { tot += (grp || 1) * e.v; grp = 0; ult = e.v; }
      } else if (e.t === 'medio') {
        if (ult === 1e6) mill += 0.5; else tot += 0.5 * ult;
      }
    }
    return { valor: Math.round((mill * 1e6 + tot + grp) * 1e8) / 1e8, i0: i, i1: j - 1, mult: conMult, multV: ult, multW: ultMultW, palabra: palabra };
  }

  /* ================================================================
   *  3. VOCABULARIO
   * ================================================================ */

  var MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9,
    setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
  var DIAS_SEM = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };

  var MONEDA_ANTES = { '$': 'ARS', 'ars': 'ARS', 'u$s': 'USD', 'us$': 'USD', 'u$d': 'USD', 'usd': 'USD',
    'r$': 'BRL', '€': 'EUR', 'eur': 'EUR' };
  var MONEDA_DESPUES = { pesos: 'ARS', peso: 'ARS', mangos: 'ARS', mango: 'ARS', ars: 'ARS', '$': 'ARS',
    dolares: 'USD', dolar: 'USD', usd: 'USD', 'u$s': 'USD', verdes: 'USD', dolaritos: 'USD', dolarcitos: 'USD',
    reales: 'BRL', real: 'BRL', euros: 'EUR', euro: 'EUR' };

  var MEDIDAS = { litro: 1, litros: 1, lt: 1, lts: 1, l: 1, ml: 1, cc: 1, kilo: 1, kilos: 1, kg: 1, kgs: 1,
    gramo: 1, gramos: 1, gr: 1, grs: 1, g: 1, metro: 1, metros: 1, mts: 1, cm: 1, km: 1, kms: 1, hora: 1, horas: 1,
    hs: 1, h: 1, minuto: 1, minutos: 1, min: 1, dia: 1, dias: 1, semana: 1, semanas: 1, mes: 1, meses: 1, ano: 1,
    anos: 1, persona: 1, personas: 1, unidad: 1, unidades: 1, porcion: 1, porciones: 1, pulgadas: 1, gb: 1,
    megas: 1, watts: 1, w: 1, cuotas: 1, cuota: 1, veces: 1, vez: 1, noches: 1, noche: 1, entradas: 0 };

  var CLASES_ACTIVO = { acciones: 'accion', accion: 'accion', cedear: 'cedear', cedears: 'cedear',
    bono: 'bono', bonos: 'bono', on: 'on', ons: 'on', obligaciones: 'on', nominales: null, vn: null, papeles: null,
    cripto: 'cripto', criptos: 'cripto', criptomonedas: 'cripto', cuotapartes: 'fci' };

  // nombre o ticker → [ticker, clase, seguro]  (seguro=false: solo con contexto de inversión)
  var ACTIVOS = {
    ypf: ['YPF', 'accion', true], ypfd: ['YPFD', 'accion', true], galicia: ['GGAL', 'accion', true], ggal: ['GGAL', 'accion', true],
    pampa: ['PAMP', 'accion', true], pamp: ['PAMP', 'accion', true], macro: ['BMA', 'accion', true], bma: ['BMA', 'accion', true],
    bbar: ['BBAR', 'accion', true], supervielle: ['SUPV', 'accion', true], supv: ['SUPV', 'accion', true],
    telecom: ['TECO2', 'accion', true], teco2: ['TECO2', 'accion', true], aluar: ['ALUA', 'accion', true], alua: ['ALUA', 'accion', true],
    ternium: ['TXAR', 'accion', true], txar: ['TXAR', 'accion', true], cepu: ['CEPU', 'accion', true],
    loma: ['LOMA', 'accion', false], tgs: ['TGSU2', 'accion', true], tgsu2: ['TGSU2', 'accion', true],
    transener: ['TRAN', 'accion', true], edenor: ['EDN', 'accion', false], edn: ['EDN', 'accion', true],
    byma: ['BYMA', 'accion', true], mirgor: ['MIRG', 'accion', true], mirg: ['MIRG', 'accion', true],
    cresud: ['CRES', 'accion', true], irsa: ['IRSA', 'accion', true], holcim: ['HARG', 'accion', true],
    vista: ['VIST', 'cedear', false], vist: ['VIST', 'cedear', true], globant: ['GLOB', 'cedear', true], glob: ['GLOB', 'cedear', true],
    meli: ['MELI', 'cedear', false], apple: ['AAPL', 'cedear', true], aapl: ['AAPL', 'cedear', true],
    microsoft: ['MSFT', 'cedear', true], msft: ['MSFT', 'cedear', true], google: ['GOOGL', 'cedear', true],
    googl: ['GOOGL', 'cedear', true], alphabet: ['GOOGL', 'cedear', true], amazon: ['AMZN', 'cedear', false],
    amzn: ['AMZN', 'cedear', true], tesla: ['TSLA', 'cedear', true], tsla: ['TSLA', 'cedear', true],
    nvidia: ['NVDA', 'cedear', true], nvda: ['NVDA', 'cedear', true], meta: ['META', 'cedear', false],
    facebook: ['META', 'cedear', true], netflix: ['NFLX', 'cedear', false], nflx: ['NFLX', 'cedear', true],
    disney: ['DIS', 'cedear', false], ko: ['KO', 'cedear', true], pepsi: ['PEP', 'cedear', false],
    mcdonalds: ['MCD', 'cedear', false], walmart: ['WMT', 'cedear', false], jpmorgan: ['JPM', 'cedear', true],
    berkshire: ['BRKB', 'cedear', true], brkb: ['BRKB', 'cedear', true], spy: ['SPY', 'cedear', true],
    qqq: ['QQQ', 'cedear', true], dia: ['DIA', 'cedear', false], eem: ['EEM', 'cedear', true], ewz: ['EWZ', 'cedear', true],
    xle: ['XLE', 'cedear', true], gld: ['GLD', 'cedear', true], slv: ['SLV', 'cedear', true], arkk: ['ARKK', 'cedear', true],
    iwm: ['IWM', 'cedear', true], petrobras: ['PBR', 'cedear', true], pbr: ['PBR', 'cedear', true], vale: ['VALE', 'cedear', false],
    alibaba: ['BABA', 'cedear', true], baba: ['BABA', 'cedear', true], intel: ['INTC', 'cedear', false], amd: ['AMD', 'cedear', true],
    paypal: ['PYPL', 'cedear', true], nike: ['NKE', 'cedear', false], visa: ['V', 'cedear', false],
    bitcoin: ['BTC', 'cripto', true], btc: ['BTC', 'cripto', true], ethereum: ['ETH', 'cripto', true],
    eth: ['ETH', 'cripto', true], ether: ['ETH', 'cripto', true], usdt: ['USDT', 'cripto', true], tether: ['USDT', 'cripto', true],
    usdc: ['USDC', 'cripto', true], solana: ['SOL', 'cripto', true],
    al30: ['AL30', 'bono', true], gd30: ['GD30', 'bono', true], al35: ['AL35', 'bono', true], gd35: ['GD35', 'bono', true],
    ae38: ['AE38', 'bono', true], gd38: ['GD38', 'bono', true], al41: ['AL41', 'bono', true], gd41: ['GD41', 'bono', true],
    al29: ['AL29', 'bono', true], gd29: ['GD29', 'bono', true], gd46: ['GD46', 'bono', true]
  };
  var ACTIVOS_DOS = { 'coca cola': ['KO', 'cedear', false], 'mercado libre': ['MELI', 'cedear', false],
    'central puerto': ['CEPU', 'accion', true], 'loma negra': ['LOMA', 'accion', true], 'banco macro': ['BMA', 'accion', true],
    'grupo galicia': ['GGAL', 'accion', true], 'comercial del plata': ['COME', 'accion', true] };

  var PALABRAS_USD = { dolares: 1, dolar: 1, usd: 1, 'u$s': 1, 'us$': 1, 'u$d': 1, verdes: 1, dolaritos: 1,
    dolarcitos: 1, mep: 1, blue: 1 };

  var FAMILIA = [
    [/\b(mi viejo|el viejo|mi papa|mi padre|papa|padre|mi pa)\b/, 'Papá'],
    [/\b(mi vieja|la vieja|mi mama|mi madre|mama|madre|mi ma)\b/, 'Mamá'],
    [/\b(mi hermano)\b/, 'Hermano'], [/\b(mi hermana)\b/, 'Hermana'],
    [/\b(mi abuelo|el abuelo|abuelo)\b/, 'Abuelo'], [/\b(mi abuela|la abuela|abuela)\b/, 'Abuela'],
    [/\b(mi tio)\b/, 'Tío'], [/\b(mi tia)\b/, 'Tía'], [/\b(mi primo)\b/, 'Primo'], [/\b(mi prima)\b/, 'Prima'],
    [/\b(mi novia)\b/, 'Novia'], [/\b(mi novio)\b/, 'Novio'], [/\b(mi jefe)\b/, 'Jefe']
  ];

  var STOP = ('a,al,algo,ante,con,de,del,desde,el,ella,ellos,en,entre,es,esa,ese,eso,esta,este,esto,fue,hay,la,las,le,les,' +
    'lo,los,me,mi,mis,muy,mas,ni,nos,o,para,pero,por,que,se,si,sin,sobre,su,sus,te,tu,un,una,unas,unos,y,ya,e,u,' +
    'hoy,ayer,anoche,anteayer,manana,recien,ahora,tambien,ademas,despues,luego,aparte,encima,cada,todo,toda,todos,' +
    'varias,varios,otra,otro,otras,otros,cosas,cosa,mismo,misma,ahi,aca,alla,unos,tipo,como,cuando,donde,porque,' +
    'pesos,peso,plata,guita,mangos,lucas,luca,mil,palos,palo,millones,millon,dolares,dolar,total,pague,pago,gaste,' +
    'gasto,compre,cargue,tome,pedi,cobre,deposite,transferi,abone,sali,salio,costo,me,le,les,lo,la,nos,eh,bueno,' +
    'dale,listo,che,boludo,onda,etc,va,voy,fui,estuve,tengo,tuve,hice,hizo,habia,tenia,queda,quedo').split(',');
  var STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = 1; });

  var SEPARADORES = { ',': 1, '.': 1, ';': 1, y: 1, e: 1, despues: 1, luego: 1, tambien: 1, ademas: 1, aparte: 1,
    encima: 1, mas: 1, '+': 1 };

  var RE_GASTO = /\b(gaste|gastamos|gasto|gastaste|pague|pagamos|pago|compre|compramos|me compre|me salio|salio|costo|me costo|abone|cargue|recargue|tome|tomamos|pedi|pedimos|comi|comimos|almorce|almorzamos|cene|cenamos|desayune|merende|invite|regale|done|deje|di|aporte|contrate|alquile|reserve|se fue|se me fue|garpe|garpamos|largue|solte|me cobraron|me debitaron|se debito|me descontaron|puse|meti|llene)\b/;
  var RE_INGRESO = /\b(cobre|cobramos|me pagaron|me depositaron|me transfirieron|me acreditaron|se acredito|se acreditaron|me entro|me entraron|entraron|entro|ingreso|ingresaron|recibi|gane|ganamos|me llego|me llegaron|me giraron|facture|me regalaron|me dieron|me pago|me pasaron|me mandaron|recaude|recaudamos|recaudacion|hice de caja|hicimos de caja|cobramos)\b/;

  /* ================================================================
   *  4. CONTEXTO (catálogo + reglas aprendidas + estado)
   * ================================================================ */

  function compilarPalabras(lista) {
    var out = [];
    (lista || []).forEach(function (p) {
      var k = norm(p).trim();
      if (!k) return;
      var multi = k.indexOf(' ') >= 0;
      out.push({ k: k, multi: multi, raiz: multi ? null : raiz(k), re: new RegExp('(^|[^a-z0-9])' + escRe(k) + '(s|es)?(?=$|[^a-z0-9])') });
    });
    return out;
  }

  /**
   * datos = { categorias, cuentas, proyectos, movimientos (para aprender), ajustes, estado }
   */
  function prepararContexto(datos) {
    datos = datos || {};
    var base = catalogoBase();
    var categorias = (datos.categorias && datos.categorias.length ? datos.categorias : base.categorias)
      .filter(function (c) { return !c.deleted && !c.archivada; });
    var cuentas = (datos.cuentas && datos.cuentas.length ? datos.cuentas : base.cuentas)
      .filter(function (c) { return !c.deleted && !c.archivada; });
    var proyectos = (datos.proyectos && datos.proyectos.length ? datos.proyectos : base.proyectos)
      .filter(function (p) { return !p.deleted && !p.archivado; });
    var ajustes = datos.ajustes || {};
    var ctx = {
      categorias: categorias.map(function (c) {
        return { id: c.id, nombre: c.nombre, tipo: c.tipo, nd: c.nd, palabras: compilarPalabras((c.palabras || []).concat([c.nombre])) };
      }),
      cuentas: cuentas.map(function (c) {
        return { id: c.id, nombre: c.nombre, tipo: c.tipo, alias: compilarPalabras((c.alias || []).concat([c.nombre])) };
      }),
      proyectos: proyectos.map(function (p) {
        return { id: p.id, nombre: p.nombre, esInversion: !!p.esInversion, categoriaInversion: p.categoriaInversion,
                 palabras: compilarPalabras((p.palabras || []).concat([p.nombre])) };
      }),
      catPorId: {},
      reglas: datos.reglas || aprender(datos.movimientos || [], categorias),
      personas: {},
      estado: datos.estado || { personas: {}, plazosFijos: [], posiciones: {} },
      tc: Object.assign({ USD: 1450, BRL: 260, EUR: 1600 }, ajustes.cotizaciones || {}),
      cuentaGasto: ajustes.cuentaGasto || 'cta-mp',
      cuentaIngreso: ajustes.cuentaIngreso || 'cta-bbva',
      cuentaInversion: ajustes.cuentaInversion || 'cta-bbva',
      cuentaBroker: ajustes.cuentaBroker || 'cta-broker'
    };
    ctx.categorias.forEach(function (c) { ctx.catPorId[c.id] = c; });
    // personas conocidas: del estado de préstamos y de los movimientos
    Object.keys(ctx.estado.personas || {}).forEach(function (p) { ctx.personas[norm(p)] = p; });
    (datos.movimientos || []).forEach(function (m) {
      if (m.persona) ctx.personas[norm(m.persona)] = m.persona;
      if (m.financiadoPor) ctx.personas[norm(m.financiadoPor)] = m.financiadoPor;
    });
    (datos.personas || []).forEach(function (p) { ctx.personas[norm(p)] = p; });
    return ctx;
  }

  /* ================================================================
   *  5. APRENDIZAJE: reglas palabra → categoría a partir del historial
   * ================================================================ */

  function palabrasClave(texto) {
    var ws = norm(texto).replace(/[^a-z0-9+ ]+/g, ' ').split(/\s+/).filter(function (w) {
      return w.length >= 3 && !STOPSET[w] && !/^\d/.test(w) && !tiene(U, w) && !tiene(D, w) && !tiene(C, w);
    });
    var out = ws.map(raiz);
    for (var i = 0; i < ws.length - 1; i++) out.push(raiz(ws[i]) + ' ' + raiz(ws[i + 1]));
    return out;
  }

  function aprender(movimientos, categorias) {
    var validas = {};
    (categorias || []).forEach(function (c) { if (!c.deleted) validas[c.id] = c; });
    var cuenta = {}, ndCuenta = {};
    var hoy = Date.now();
    (movimientos || []).forEach(function (m) {
      if (m.deleted || !m.categoria || !m.descripcion) return;
      if (Object.keys(validas).length && !validas[m.categoria]) return;
      var peso = m.corregido ? 4 : (m.origen === 'manual' ? 2 : 1);
      var edad = m.fecha ? (hoy - new Date(m.fecha + 'T12:00:00').getTime()) / 864e5 : 365;
      peso *= edad < 60 ? 1.3 : edad < 180 ? 1 : 0.8;
      var vistos = {};
      palabrasClave(m.descripcion).forEach(function (k) {
        if (vistos[k]) return; vistos[k] = 1;
        cuenta[k] = cuenta[k] || {};
        cuenta[k][m.categoria] = (cuenta[k][m.categoria] || 0) + peso;
        if (m.nd) { ndCuenta[k] = ndCuenta[k] || {}; ndCuenta[k][m.nd] = (ndCuenta[k][m.nd] || 0) + peso; }
      });
    });
    var reglas = {};
    Object.keys(cuenta).forEach(function (k) {
      var porCat = cuenta[k], total = 0, mejor = null, mejorV = 0;
      Object.keys(porCat).forEach(function (c) { total += porCat[c]; if (porCat[c] > mejorV) { mejorV = porCat[c]; mejor = c; } });
      var share = mejorV / total;
      if (share < 0.6) return;
      if (total < 2 && (k.length < 5 || k.indexOf(' ') >= 0)) return;
      var nd = null;
      if (ndCuenta[k]) {
        var a = ndCuenta[k].Necesidad || 0, b = ndCuenta[k].Deseo || 0;
        if (a + b >= 2) nd = a > b * 1.5 ? 'Necesidad' : b > a * 1.5 ? 'Deseo' : null;
      }
      reglas[k] = { cat: mejor, peso: Math.min(3, 0.6 + Math.log(1 + mejorV) * share), nd: nd, n: total };
    });
    return reglas;
  }

  /* ================================================================
   *  6. INTERPRETACIÓN
   * ================================================================ */

  function texto(toks, i0, i1) {
    var s = '';
    for (var i = i0; i <= i1; i++) s += (i > i0 ? ' ' : '') + toks[i].n;
    return s;
  }

  function marcarFechasYHoras(toks) {
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      // 5/10  ó  5/10/2026
      if (/^\d{1,2}$/.test(t.n) && toks[i + 1] && toks[i + 1].n === '/' && toks[i + 2] && /^\d{1,2}$/.test(toks[i + 2].n)) {
        var fin = i + 2;
        if (toks[i + 3] && toks[i + 3].n === '/' && toks[i + 4] && /^\d{2,4}$/.test(toks[i + 4].n)) fin = i + 4;
        var dd = Number(t.n), mm = Number(toks[i + 2].n), aa = fin === i + 4 ? Number(toks[i + 4].n) : null;
        if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
          for (var k = i; k <= fin; k++) toks[k].rol = 'fecha';
          t.fecha = { d: dd, m: mm, a: aa && aa < 100 ? 2000 + aa : aa };
          i = fin; continue;
        }
      }
      // 21:30, 21hs
      if (/^\d{1,2}$/.test(t.n) && toks[i + 1] && toks[i + 1].n === ':' && toks[i + 2] && /^\d{2}$/.test(toks[i + 2].n)) {
        t.rol = 'hora'; toks[i + 1].rol = 'hora'; toks[i + 2].rol = 'hora'; i += 2; continue;
      }
      if (/^\d{1,2}hs?$/.test(t.n)) { t.rol = 'hora'; continue; }
      if ((t.n === 'las' || t.n === 'la') && toks[i - 1] && toks[i - 1].n === 'a' && toks[i + 1] && /^\d{1,2}$/.test(toks[i + 1].n)) {
        toks[i + 1].rol = 'hora';
      }
    }
  }

  function marcarProyectosConNumero(toks, ctx) {
    var s = toks.map(function (t) { return t.n; });
    ctx.proyectos.forEach(function (p) {
      p.palabras.forEach(function (w) {
        if (!/\d/.test(w.k)) return;
        var partes = w.k.split(' ');
        for (var i = 0; i + partes.length <= s.length; i++) {
          var ok = true;
          for (var k = 0; k < partes.length; k++) if (s[i + k] !== partes[k]) { ok = false; break; }
          if (ok) for (var k2 = 0; k2 < partes.length; k2++) if (/\d/.test(s[i + k2])) toks[i + k2].rol = 'proyecto';
        }
      });
    });
  }

  function leerTodosLosNumeros(toks) {
    var nums = [];
    for (var i = 0; i < toks.length; i++) {
      var r = leerNumero(toks, i);
      if (r) { nums.push(r); i = r.i1; }
    }
    return nums;
  }

  function asignarRoles(toks, nums) {
    nums.forEach(function (N) {
      var pv = toks[N.i0 - 1] ? toks[N.i0 - 1].n : '', pv2 = toks[N.i0 - 2] ? toks[N.i0 - 2].n : '';
      var nx = toks[N.i1 + 1] ? toks[N.i1 + 1].n : '', nx2 = toks[N.i1 + 2] ? toks[N.i1 + 2].n : '';
      // moneda
      if (tiene(MONEDA_ANTES, pv)) { N.moneda = MONEDA_ANTES[pv]; N.monedaTok = N.i0 - 1; }
      else if (tiene(MONEDA_DESPUES, nx)) { N.moneda = MONEDA_DESPUES[nx]; N.monedaTok = N.i1 + 1; }
      else if (nx === 'de' && tiene(MONEDA_DESPUES, nx2) && N.mult) { N.deMoneda = MONEDA_DESPUES[nx2]; }
      if (N.medida) { N.rol = 'medida'; return; }
      if (nx === '%' || (nx === 'por' && nx2 === 'ciento')) { N.rol = 'porcentaje'; return; }
      if (pv === 'cuota' || pv === 'cuotas') { N.rol = 'cuota_n'; return; }
      if (pv === 'de' && toks[N.i0 - 2] && /^\d+$/.test(toks[N.i0 - 2].n) && toks[N.i0 - 3] && /^cuotas?$/.test(toks[N.i0 - 3].n) && !N.mult && !N.moneda) { N.rol = 'cuota_total'; return; }
      if (nx === 'de' && tiene(MESES, nx2)) { N.rol = 'fecha_dia'; N.mes = MESES[nx2]; return; }
      if (!N.mult && !N.moneda && tiene(MEDIDAS, nx) && MEDIDAS[nx]) {
        N.rol = (nx === 'cuotas' || nx === 'cuota') ? 'cuotas' : 'medida'; N.unidad = nx; return;
      }
      if (!N.mult && !N.moneda && (tiene(CLASES_ACTIVO, nx) || (tiene(ACTIVOS, nx) && ACTIVOS[nx][2]) ||
          (nx === 'de' && (tiene(CLASES_ACTIVO, nx2) || (tiene(ACTIVOS, nx2) && ACTIVOS[nx2][2]))))) {
        N.rol = 'cantidad'; return;
      }
      if (pv === 'a' || pv === 'al' || pv === 'cotizacion' || pv === 'precio' || pv === 'tc' ||
          (pv === '$' && (pv2 === 'a' || pv2 === 'al'))) N.posiblePrecio = true;
      if (pv === 'el' && !N.mult && !N.moneda && N.valor >= 1 && N.valor <= 31 && Number.isInteger(N.valor)) N.posibleFecha = true;
      N.rol = 'monto';
    });
    nums.forEach(function (N) { for (var k = N.i0; k <= N.i1; k++) toks[k].rolNum = N.rol; });
  }

  function puntaje(N, toks) {
    var s = 0;
    var nx = toks[N.i1 + 1] ? toks[N.i1 + 1].n : '';
    if (N.mult) s += 5;
    if (N.moneda) s += 4;
    if (N.valor >= 1000) s += 2; else if (N.valor >= 100) s += 1;
    if (!N.mult && !N.moneda && N.valor < 100 && nx && /^[a-z]/.test(nx) && !SEPARADORES[nx] &&
        ['de', 'en', 'para', 'por', 'con', 'a', 'al'].indexOf(nx) < 0) s -= 3;
    if (N.posibleFecha) s -= 2;
    if (N.posiblePrecio) s -= 1;
    return s;
  }

  /** Corta la frase en cláusulas, una por operación. */
  function partirEnClausulas(toks, nums) {
    var montos = nums.filter(function (N) { return N.rol === 'monto'; });
    montos.forEach(function (N) { N.score = puntaje(N, toks); });
    // precio de un activo/moneda: no corta
    var anclas = [];
    montos.forEach(function (N, idx) {
      if (N.posiblePrecio) {
        // ¿hay una cantidad o un monto en moneda extranjera justo antes en la misma zona?
        var prev = nums.filter(function (M) { return M.i1 < N.i0 && N.i0 - M.i1 <= 6; }).pop();
        if (prev && (prev.rol === 'cantidad' || prev.moneda === 'USD' || prev.moneda === 'BRL' || prev.moneda === 'EUR' || prev.deMoneda)) {
          N.rol = 'precio'; return;
        }
        var zona = texto(toks, Math.max(0, N.i0 - 8), N.i0 - 1);
        if (/\b(dolares|dolar|usd|u\$s|verdes|mep|blue|acciones|cedears?|bonos?|bitcoin|btc|eth|usdt|cripto)\b/.test(zona)) { N.rol = 'precio'; return; }
      }
      if (N.score >= 1) anclas.push(N);
    });
    // promoción por herencia de multiplicador ("8 lucas de nafta y 3 de peaje")
    montos.forEach(function (N) {
      if (N.rol !== 'monto' || anclas.indexOf(N) >= 0 || N.mult || N.moneda || N.valor >= 1000) return;
      var prevAncla = anclas.filter(function (A) { return A.i1 < N.i0; }).pop();
      if (!prevAncla || !prevAncla.mult) return;
      var hayCorte = false;
      for (var k = prevAncla.i1 + 1; k < N.i0; k++) if (SEPARADORES[toks[k].n]) { hayCorte = true; break; }
      var nx = toks[N.i1 + 1] ? toks[N.i1 + 1].n : '';
      if (hayCorte && (!nx || ['de', 'en', 'para', 'por', 'con', 'al', 'a', ',', '.', 'y'].indexOf(nx) >= 0)) {
        N.valor = redondear(N.valor * prevAncla.multV); N.heredado = true; N.mult = true; N.score = 4;
        anclas.push(N);
      }
    });
    anclas.sort(function (a, b) { return a.i0 - b.i0; });
    if (anclas.length <= 1) return [{ i0: 0, i1: toks.length - 1 }];
    var cortes = [];
    for (var a = 0; a < anclas.length - 1; a++) {
      var A = anclas[a], B = anclas[a + 1];
      var corte = -1;
      for (var k = B.i0 - 1; k > A.i1; k--) {
        if (SEPARADORES[toks[k].n] && toks[k].n !== 'mas') { corte = k; break; }
        if (toks[k].n === 'mas' && corte < 0) corte = k;
      }
      if (corte < 0) {
        // sin conector: corto justo antes del segundo número (o del verbo que lo precede)
        corte = B.i0;
        var pv = toks[B.i0 - 1];
        if (pv && (tiene(MONEDA_ANTES, pv.n))) corte = B.i0 - 1;
        cortes.push({ en: corte, incluye: true });
      } else cortes.push({ en: corte, incluye: false });
    }
    var claus = [], ini = 0;
    cortes.forEach(function (c) {
      claus.push({ i0: ini, i1: c.incluye ? c.en - 1 : c.en - 1 });
      ini = c.incluye ? c.en : c.en + 1;
      // saltar conectores encadenados ("y después", "y también")
      while (ini < toks.length && SEPARADORES[toks[ini].n] && toks[ini].n !== '+') ini++;
    });
    claus.push({ i0: ini, i1: toks.length - 1 });
    return claus.filter(function (c) { return c.i1 >= c.i0; });
  }

  /* ---------- entidades dentro de una cláusula ---------- */

  function detectarActivo(toks, c0, c1) {
    var s = ' ' + texto(toks, c0, c1) + ' ';
    var orig = toks.slice(c0, c1 + 1);
    var claseExplicita = null;
    for (var i = c0; i <= c1; i++) {
      var w = toks[i].n;
      if (tiene(CLASES_ACTIVO, w) && CLASES_ACTIVO[w] && !(w === 'on' && !/\bons?\b/.test(toks[i].o) && toks[i].o !== 'ON')) {
        claseExplicita = CLASES_ACTIVO[w];
      }
    }
    if (/\bobligaciones negociables\b/.test(s)) claseExplicita = 'on';
    var verboInv = /\b(compre|compramos|vendi|vendimos|adquiri|inverti)\b/.test(s);
    // nombres de dos palabras
    var encontrado = null;
    Object.keys(ACTIVOS_DOS).forEach(function (k) {
      if (!encontrado && s.indexOf(' ' + k + ' ') >= 0) {
        var a = ACTIVOS_DOS[k];
        if (a[2] || claseExplicita || verboInv) encontrado = { ticker: a[0], clase: claseExplicita || a[1] };
      }
    });
    for (var j = c0; j <= c1 && !encontrado; j++) {
      var t = toks[j];
      if (tiene(ACTIVOS, t.n)) {
        var a = ACTIVOS[t.n];
        var mayus = /^[A-Z0-9]{2,6}$/.test(t.o);
        if (a[2] || claseExplicita || (verboInv && mayus)) encontrado = { ticker: a[0], clase: claseExplicita || a[1] };
      } else if (claseExplicita && /^[A-Z][A-Z0-9]{1,5}$/.test(t.o) && !tiene(MONEDA_ANTES, t.n) && t.n !== 'on') {
        encontrado = { ticker: t.o.toUpperCase(), clase: claseExplicita };
      }
    }
    if (!encontrado && claseExplicita && claseExplicita !== 'fci') {
      // "compré acciones de Galicia" con nombre no reconocido: tomo la palabra después de "de"
      var m = /\b(?:acciones|accion|cedears?|bonos?|ons?) de ([a-z0-9]+)/.exec(s);
      encontrado = { ticker: m ? m[1].toUpperCase() : '?', clase: claseExplicita };
    }
    if (!encontrado && verboInv) {
      // compra/venta de dólares: después del verbo solo hay números, artículos y la palabra "dólares"
      var tras = s.split(/\b(?:compre|compramos|vendi|vendimos|adquiri)\b/)[1] || '';
      var ws = tras.trim().split(/\s+/);
      var soloNumeros = true, hayUsd = false;
      for (var q = 0; q < ws.length && q < 8; q++) {
        var w2 = ws[q];
        if (PALABRAS_USD[w2]) { hayUsd = true; break; }
        if (!(/^[\d.,]+k?$/.test(w2) || tiene(U, w2) || tiene(D, w2) || tiene(C, w2) || esMult(w2) ||
              ['unos', 'unas', 'los', 'las', 'el', 'un', 'de', '$', 'ars', 'pesos', 'y', 'medio', 'media'].indexOf(w2) >= 0)) { soloNumeros = false; break; }
      }
      if (hayUsd && soloNumeros) encontrado = { ticker: 'USD', clase: 'usd' };
    }
    return encontrado;
  }

  function detectarInstrumento(s, ctx) {
    if (/\b(plazo fijo|plazos fijos|pf)\b/.test(s)) return { cat: 'cat-plazo-fijo', nombre: 'Plazo fijo' };
    if (/\bmoney market\b|\bfondo (comun|de liquidez)\b/.test(s)) return { cat: 'cat-money-market', nombre: 'Money market' };
    if (/\bfci\b|\bfondo\b/.test(s)) return { cat: 'cat-fci', nombre: 'FCI' };
    if (/\bcaucion\b/.test(s)) return { cat: 'cat-caucion', nombre: 'Caución' };
    if (/\bcuenta remunerada\b/.test(s)) return { cat: 'cat-money-market', nombre: 'Cuenta remunerada' };
    return null;
  }

  function detectarCuentas(s, ctx) {
    var hall = [];
    ctx.cuentas.forEach(function (c) {
      c.alias.forEach(function (al) {
        var m = al.re.exec(s);
        if (m) hall.push({ id: c.id, pos: m.index + m[1].length, len: al.k.length, k: al.k });
      });
    });
    // me quedo con el alias más largo por posición
    hall.sort(function (a, b) { return a.pos - b.pos || b.len - a.len; });
    var res = [];
    hall.forEach(function (h) {
      var pisa = res.some(function (r) { return h.pos < r.pos + r.len && r.pos < h.pos + h.len; });
      if (!pisa) res.push(h);
    });
    return res;
  }

  function detectarFecha(toks, c0, c1, nums, hoy, montoElegido) {
    var s = ' ' + texto(toks, c0, c1) + ' ';
    var h = diaLocal(hoy);
    for (var i = c0; i <= c1; i++) if (toks[i].fecha) {
      var f = toks[i].fecha;
      var anio = f.a || h.getFullYear();
      var d = new Date(anio, f.m - 1, f.d, 12);
      if (!f.a && d > sumarDias(h, 1)) d = new Date(anio - 1, f.m - 1, f.d, 12);
      return { fecha: iso(d), tokens: [i, i + (toks[i + 3] && toks[i + 3].rol === 'fecha' ? 4 : 2)] };
    }
    var dia = nums.filter(function (N) { return N.rol === 'fecha_dia' && N.i0 >= c0 && N.i1 <= c1; })[0];
    if (dia) {
      var d2 = new Date(h.getFullYear(), dia.mes - 1, dia.valor, 12);
      if (d2 > sumarDias(h, 1)) d2 = new Date(h.getFullYear() - 1, dia.mes - 1, dia.valor, 12);
      return { fecha: iso(d2), tokens: [dia.i0 - (toks[dia.i0 - 1] && toks[dia.i0 - 1].n === 'el' ? 1 : 0), dia.i1 + 2] };
    }
    var pf = nums.filter(function (N) { return N.posibleFecha && N !== montoElegido && N.i0 >= c0 && N.i1 <= c1; })[0];
    if (pf) {
      var d3 = new Date(h.getFullYear(), h.getMonth(), pf.valor, 12);
      if (d3 > sumarDias(h, 1)) d3 = new Date(h.getFullYear(), h.getMonth() - 1, pf.valor, 12);
      return { fecha: iso(d3), tokens: [pf.i0 - 1, pf.i1] };
    }
    var m;
    if ((m = /\b(antes de ayer|anteayer|antier)\b/.exec(s))) return { fecha: iso(sumarDias(h, -2)), frase: m[1] };
    if ((m = /\b(ayer)\b/.exec(s))) return { fecha: iso(sumarDias(h, -1)), frase: m[1] };
    if ((m = /\b(anoche)\b/.exec(s))) return { fecha: iso(hoy.getHours() < 14 ? sumarDias(h, -1) : h), frase: m[1] };
    if ((m = /\bhace (\d+|un|una|dos|tres|cuatro|cinco|seis|siete|diez|quince) (dias?|semanas?)\b/.exec(s))) {
      var n = /^\d+$/.test(m[1]) ? Number(m[1]) : (U[m[1]] || 1);
      return { fecha: iso(sumarDias(h, -n * (/semana/.test(m[2]) ? 7 : 1))), frase: m[0].trim() };
    }
    if ((m = /\b(la semana pasada)\b/.exec(s))) return { fecha: iso(sumarDias(h, -7)), frase: m[1], aprox: true };
    if ((m = /\b(el |este |el pasado )?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)( pasado)?\b/.exec(s))) {
      var obj = DIAS_SEM[m[2]], dif = (h.getDay() - obj + 7) % 7;
      if (m[3]) dif = dif === 0 ? 7 : dif;
      return { fecha: iso(sumarDias(h, -dif)), frase: m[0].trim() };
    }
    if ((m = /\b(hoy|esta manana|esta tarde|esta noche|recien|ahora)\b/.exec(s))) return { fecha: iso(h), frase: m[1] };
    return null;
  }

  function detectarPersona(toks, c0, c1, ctx, tipo) {
    var s = ' ' + texto(toks, c0, c1) + ' ';
    for (var f = 0; f < FAMILIA.length; f++) {
      var mf = FAMILIA[f][0].exec(s);
      if (mf) return { nombre: FAMILIA[f][1], frase: mf[1] };
    }
    // nombres conocidos
    for (var i = c0; i <= c1; i++) {
      var w = toks[i].n;
      if (ctx.personas[w] && !STOPSET[w]) return { nombre: ctx.personas[w], tok: i };
    }
    var vocab = function (w) {
      if (STOPSET[w] || tiene(MESES, w) || tiene(DIAS_SEM, w) || tiene(U, w) || tiene(D, w) || tiene(C, w) || esMult(w)) return true;
      if (tiene(MONEDA_DESPUES, w) || tiene(CLASES_ACTIVO, w) || tiene(ACTIVOS, w) || tiene(MEDIDAS, w)) return true;
      if (RE_GASTO.test(' ' + w + ' ') || RE_INGRESO.test(' ' + w + ' ')) return true;
      if (/^(preste|prestamos|presto|prestaron|devolvi|devolvio|devolvieron|debo|debia|cancele|salde|prestamo|deuda|plata|guita|nada|alguien|amigo|amiga|pibe|pibes)$/.test(w)) return true;
      var esCat = ctx.categorias.some(function (c) { return c.palabras.some(function (p) { return !p.multi && (p.k === w || p.raiz === raiz(w)); }); });
      var esCta = ctx.cuentas.some(function (c) { return c.alias.some(function (p) { return p.k === w; }); });
      return esCat || esCta;
    };
    // después de "a", "de", "con", "para" o antes de "me"
    for (var j = c0; j <= c1; j++) {
      var t = toks[j];
      if (!/^\p{L}/u.test(t.o) || vocab(t.n)) continue;
      var pv = toks[j - 1] ? toks[j - 1].n : '', nx = toks[j + 1] ? toks[j + 1].n : '';
      var propio = /^\p{Lu}/u.test(t.o);
      var antesDeMe = nx === 'me' || nx === 'nos';
      var trasPrep = ['a', 'al', 'de', 'con', 'para'].indexOf(pv) >= 0;
      var contexto = /^(prestamo_|cobro_|pago_deuda|financiado)/.test(tipo || '');
      if ((propio && (j > 0 || antesDeMe) && (trasPrep || antesDeMe || contexto)) || ((trasPrep || antesDeMe) && contexto)) {
        var nombre = t.o;
        if (toks[j + 1] && /^\p{Lu}/u.test(toks[j + 1].o) && !vocab(toks[j + 1].n)) nombre += ' ' + toks[j + 1].o;
        return { nombre: tituloNombre(nombre), tok: j };
      }
    }
    return null;
  }

  function puntuarPalabras(lista, s, palabrasTexto, pesoBase) {
    var p = 0, hits = [];
    lista.forEach(function (w) {
      if (w.multi) { if (w.re.test(s)) { p += pesoBase * 2.2; hits.push(w.k); } }
      else if (palabrasTexto[w.k] || palabrasTexto[w.raiz]) { p += pesoBase; hits.push(w.k); }
    });
    return { p: p, hits: hits };
  }

  function detectarCategoria(s, tipoGrupo, ctx, extra) {
    // la forma de pago no define la categoría: "en 12 cuotas", "con la tarjeta"
    s = s.replace(/\b(en|a) (\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|dieciocho|veinticuatro) cuotas?\b/g, ' ')
         .replace(/\b\d+ cuotas de\b/g, ' ');
    var ws = s.replace(/[^a-z0-9+ ]+/g, ' ').split(/\s+/).filter(Boolean);
    var bolsa = {};
    ws.forEach(function (w) { bolsa[w] = 1; bolsa[raiz(w)] = 1; });
    var puntos = {};
    ctx.categorias.forEach(function (c) {
      if (c.tipo !== tipoGrupo) return;
      var r = puntuarPalabras(c.palabras, ' ' + s + ' ', bolsa, 1);
      if (r.p) puntos[c.id] = (puntos[c.id] || 0) + r.p;
    });
    // reglas aprendidas (pesan más: reflejan cómo categorizás vos)
    var nd = null, ndPeso = 0;
    palabrasClave(s).forEach(function (k) {
      var r = ctx.reglas[k];
      if (!r || !ctx.catPorId[r.cat] || ctx.catPorId[r.cat].tipo !== tipoGrupo) return;
      var w = r.peso * (k.indexOf(' ') >= 0 ? 1.6 : 1.2);
      puntos[r.cat] = (puntos[r.cat] || 0) + w;
      if (r.nd && w > ndPeso) { nd = r.nd; ndPeso = w; }
    });
    if (extra) Object.keys(extra).forEach(function (k) { puntos[k] = (puntos[k] || 0) + extra[k]; });
    // "pedí / pedimos" + comida = delivery
    if (tipoGrupo === 'gasto' && puntos['cat-comida'] && ctx.catPorId['cat-delivery'] && /\b(pedi|pedimos|encargue|encargamos)\b/.test(s)) {
      puntos['cat-delivery'] = (puntos['cat-delivery'] || 0) + puntos['cat-comida'] + 0.5;
    }
    var mejor = null, mv = 0, seg = 0;
    Object.keys(puntos).forEach(function (k) {
      if (puntos[k] > mv) { seg = mv; mv = puntos[k]; mejor = k; } else if (puntos[k] > seg) seg = puntos[k];
    });
    return { id: mejor, puntaje: mv, margen: mv - seg, nd: nd };
  }

  function detectarProyecto(s, ctx, moneda) {
    var mejor = null, mv = 0;
    var ws = s.split(/\s+/), bolsa = {};
    ws.forEach(function (w) { bolsa[w] = 1; bolsa[raiz(w)] = 1; });
    ctx.proyectos.forEach(function (p) {
      var r = puntuarPalabras(p.palabras, ' ' + s + ' ', bolsa, 1);
      var pts = r.p;
      if (moneda === 'BRL' && /brasil/i.test(p.nombre)) pts += 1.5;
      if (pts > mv) { mv = pts; mejor = p; }
    });
    return mejor;
  }

  /** "cargué 50 mil en mercado pago", "pasé saldo a mp": entre el verbo y la billetera solo hay plata. */
  function cargaABilletera(s) {
    var m = /\b(cargue|recargue|ingrese|meti|pase|puse|transferi|mande|deposite)\b(.*?)\b(a|en|al) (mi |la )?(mercado pago|mercadopago|mp|billetera)\b/.exec(s);
    if (!m) return false;
    var medio = m[2].trim().split(/\s+/).filter(Boolean);
    return medio.every(function (w) {
      return /^[\d.,]+k?$/.test(w) || tiene(U, w) || tiene(D, w) || tiene(C, w) || esMult(w) || w === 'y' || w === 'medio' || w === 'media' ||
        ['plata', 'saldo', 'guita', 'dinero', 'pesos', '$', 'de', 'unos', 'unas', 'efectivo'].indexOf(w) >= 0;
    });
  }

  function detectarTipo(s, f) {
    if (/\b(me cobraron|me debitaron|se debito|me descontaron)\b/.test(s)) return { tipo: 'gasto', conf: 0.85 };
    if (/\b(pague|pagamos|cancele|abone|cubri|pago)\b.{0,30}\b(resumen|tarjeta|visa|master|mastercard|amex)\b/.test(s) &&
        !/\b(con|en) (la )?(tarjeta|visa|master|credito)\b/.test(s)) return { tipo: 'transferencia', sub: 'pago_tarjeta', conf: 0.85 };
    if (/\b(le |les )?(preste|prestamos)\b/.test(s) && !/\bme (presto|prestaron|presta)\b/.test(s)) return { tipo: 'prestamo_dado', conf: 0.9 };
    if (/\bme (presto|prestaron|presta|prestan|adelanto|adelantaron)\b|\bpedi (un )?prest(amo|ado)\b|\b(saque|tome|pedi) un (prestamo|credito)\b|\bme dieron un (prestamo|credito)\b/.test(s)) return { tipo: 'prestamo_recibido', conf: 0.9 };
    if (/\bme (devolvio|devolvieron|reintegro lo|saldo|cancelo)\b|\bme (pago|pagaron) lo que\b|\bcobre (el |lo )?(prestamo|prestado|que le preste)\b|\bme pago la deuda\b/.test(s)) return { tipo: 'cobro_prestamo', conf: 0.9 };
    if (/\b(le |les )?devolvi\b|\bcancele (la |mi |una |el )?(deuda|prestamo)\b|\bpague (la |mi |el )?(deuda|prestamo)\b|\bsalde\b|\ble pague lo que le debia\b/.test(s)) return { tipo: 'pago_deuda', conf: 0.85 };
    if (/\b(le|les) debo\b|\bquede debiendo\b|\bme lo banco\b|\bme lo pago\b|\bme (presto|bancaron|banco) para\b/.test(s)) return { tipo: 'gasto', sub: 'financiado', conf: 0.8 };
    if (f.proyectoInversion && RE_GASTO.test(s) && !f.instrumento && !f.activo) return { tipo: 'inversion', sub: 'proyecto', conf: 0.85 };
    if (f.instrumento) {
      if (/\b(rescate|saque|retire|vencio|cobre|liquide|se acredito|termino|cerre|levante|me pagaron|me depositaron|vencieron)\b/.test(s)) return { tipo: 'rescate', conf: 0.85 };
      return { tipo: 'inversion', conf: /\b(puse|meti|inverti|deposite|arme|hice|constitui|abri|renove|coloque|mande|aporte|sume|suscribi|pase)\b/.test(s) ? 0.9 : 0.7 };
    }
    if (f.activo) {
      if (/\bvend(i|imos|o|e)\b/.test(s)) return { tipo: 'venta_activo', conf: 0.9 };
      if (/\b(compre|compramos|adquiri|inverti|meti|puse|sume)\b/.test(s)) return { tipo: 'compra_activo', conf: 0.9 };
      return { tipo: 'compra_activo', conf: 0.6 };
    }
    if (f.cuentas >= 2 && /\b(pase|transferi|movi|mande|envie|cargue|ingrese|deposite|meti|puse)\b/.test(s)) return { tipo: 'transferencia', conf: 0.85 };
    if (cargaABilletera(s)) return { tipo: 'transferencia', sub: 'a_mp', conf: 0.8 };
    if (/\b(saque|retire|extraje)\b/.test(s) && /\b(cajero|banco|cuenta|efectivo|plata|guita)\b/.test(s)) return { tipo: 'transferencia', sub: 'extraccion', conf: 0.8 };
    if (/\bdeposite\b/.test(s) && /\b(efectivo|banco|cuenta)\b/.test(s)) return { tipo: 'transferencia', sub: 'deposito', conf: 0.8 };
    if (/\bvend(i|imos)\b/.test(s)) return { tipo: 'ingreso', sub: 'venta', conf: 0.85 };
    if (RE_INGRESO.test(s)) return { tipo: 'ingreso', conf: 0.85 };
    if (RE_GASTO.test(s)) return { tipo: 'gasto', conf: 0.85 };
    return { tipo: 'gasto', conf: 0.45, supuesto: true };
  }

  /* ---------- descripción legible ---------- */

  var VERBOS_DESC = /^(gaste|gastamos|gasto|pague|pagamos|pago|compre|compramos|me|le|les|se|cargue|recargue|tome|tomamos|pedi|pedimos|comi|comimos|almorce|almorzamos|cene|cenamos|desayune|merende|abone|cobre|cobramos|recibi|ingreso|entro|entraron|gane|deposite|transferi|pase|movi|puse|meti|inverti|vendi|vendimos|preste|prestamos|presto|devolvi|devolvio|cancele|salde|rescate|saque|retire|aporte|invite|regale|done|deje|di|salio|costo|fue|fueron|anote|anota|registra|registrame|anotame|hice|arme|constitui|garpe|largue|tengo|fui)$/;
  var RELLENO = /^(y|e|de|del|en|el|la|los|las|un|una|unos|unas|al|a|por|para|con|que|lo|total|unas|nomas|mas|tambien|despues|luego|ademas|,|\.|;|:|-|hoy|ayer|anoche|anteayer|recien)$/;

  var COMIDAS = { cene: 'cena', cenamos: 'cena', almorce: 'almuerzo', almorzamos: 'almuerzo', desayune: 'desayuno',
    desayunamos: 'desayuno', merende: 'merienda', merendamos: 'merienda', comi: 'comida', comimos: 'comida' };

  function armarDescripcion(toks, c0, c1, quitar) {
    var keep = [];
    for (var i = c0; i <= c1; i++) {
      if (quitar[i] || toks[i].rol === 'hora') continue;
      if ((toks[i].n === 'las' || toks[i].n === 'a') && toks[i + 1] && toks[i + 1].rol === 'hora') continue;
      if (toks[i].n === 'a' && toks[i + 1] && toks[i + 1].n === 'las' && toks[i + 2] && toks[i + 2].rol === 'hora') continue;
      keep.push(i);
    }
    var comida = null;
    keep = keep.filter(function (i) { if (COMIDAS[toks[i].n]) { comida = comida || COMIDAS[toks[i].n]; return false; } return true; });
    // recortar verbos y relleno al principio, relleno al final
    while (keep.length && (VERBOS_DESC.test(toks[keep[0]].n) || RELLENO.test(toks[keep[0]].n)) &&
           !(comida && /^(con|en)$/.test(toks[keep[0]].n) && keep.length > 1)) keep.shift();
    while (keep.length && RELLENO.test(toks[keep[keep.length - 1]].n)) keep.pop();
    var out = '';
    keep.forEach(function (i, k) {
      var t = toks[i];
      var pegado = k > 0 && toks[keep[k - 1]].b === t.a;
      out += (k > 0 && !pegado && !/^[,.;:]$/.test(t.o) ? ' ' : '') + t.o;
    });
    out = out.replace(/\s+([,.;:])/g, '$1').replace(/^[,.;:\s]+|[,.;:\s]+$/g, '').trim();
    if (comida) out = out ? comida + ' ' + out.charAt(0).toLowerCase() + out.slice(1) : comida;
    return cap(out);
  }

  function quitarRango(q, a, b) { for (var i = a; i <= b; i++) q[i] = 1; }

  function quitarFrases(toks, c0, c1, q, re) {
    // marca para quitar los tokens que forman una frase (regex sobre normalizados)
    var arr = [];
    for (var i = c0; i <= c1; i++) arr.push(toks[i].n);
    var s = arr.join(' ');
    var m, reg = new RegExp(re.source, 'g');
    while ((m = reg.exec(s)) !== null) {
      var antes = s.slice(0, m.index).split(' ').filter(Boolean).length;
      var len = m[0].trim().split(' ').filter(Boolean).length;
      quitarRango(q, c0 + antes, c0 + antes + len - 1);
      if (!m[0].length) reg.lastIndex++;
    }
  }

  /* ---------- una cláusula → un movimiento ---------- */

  function interpretarClausula(toks, c0, c1, nums, ctx, hoy, previo) {
    var s = texto(toks, c0, c1);
    var sEsp = ' ' + s + ' ';
    var numsC = nums.filter(function (N) { return N.i0 >= c0 && N.i1 <= c1; });
    var instrumento = detectarInstrumento(sEsp, ctx);
    var activo = instrumento ? null : detectarActivo(toks, c0, c1);
    var cuentas = detectarCuentas(sEsp, ctx);
    var proyecto = detectarProyecto(s, ctx, null);
    var tipoInfo = detectarTipo(sEsp, {
      instrumento: instrumento, activo: activo, cuentas: cuentas.length,
      proyectoInversion: proyecto && proyecto.esInversion
    });
    // una cláusula sin verbo hereda el tipo de la anterior ("... y 3500 en la panadería")
    if (tipoInfo.supuesto && previo) tipoInfo = { tipo: previo.tipo, sub: previo.sub, conf: 0.75, heredado: true };
    var tipo = tipoInfo.tipo;

    var mov = { tipo: tipo, monto: null, moneda: 'ARS', fecha: null, categoria: null, cuenta: null,
      cuentaDestino: null, persona: null, financiadoPor: null, activo: null, proyecto: null, nd: null,
      descripcion: '', confianza: tipoInfo.conf, dudas: [], notas: [] };
    var quitar = {};

    // ---- monto, cantidad, precio
    var montos = numsC.filter(function (N) { return N.rol === 'monto'; });
    var cantidades = numsC.filter(function (N) { return N.rol === 'cantidad'; });
    var precios = numsC.filter(function (N) { return N.rol === 'precio'; });
    montos.forEach(function (N) { if (N.score === undefined) N.score = puntaje(N, toks); });
    var elegido = montos.slice().sort(function (a, b) { return b.score - a.score || b.valor - a.valor; })[0] || null;
    var cuotas = numsC.filter(function (N) { return N.rol === 'cuotas'; })[0];

    if (activo) {
      var cant = cantidades[0] || null;
      if (!cant && activo.clase === 'usd') {
        // "compré 200 dólares a 1450": el 200 vino como monto en USD
        var usdN = montos.filter(function (N) { return N.moneda === 'USD'; })[0];
        if (usdN) { cant = usdN; montos = montos.filter(function (N) { return N !== usdN; }); elegido = montos.sort(function (a, b) { return b.score - a.score; })[0] || null; }
      }
      var precio = precios[0] || null;
      if (!precio && cant && elegido && elegido !== cant && /\b(a|al)\b/.test(texto(toks, cant.i1 + 1, elegido.i0 - 1) || '')) precio = elegido;
      mov.activo = { ticker: activo.ticker, clase: activo.clase, cantidad: cant ? cant.valor : null, precio: precio ? precio.valor : null };
      if (cant) quitarRango(quitar, cant.i0, cant.i1);
      if (precio) quitarRango(quitar, Math.max(c0, precio.i0 - 1), precio.i1);
      var total = null;
      var totalN = elegido && elegido !== precio && elegido !== cant ? elegido : null;
      if (mov.activo.cantidad && mov.activo.precio) total = mov.activo.cantidad * mov.activo.precio;
      else if (totalN) {
        total = totalN.valor;
        if (mov.activo.cantidad && !mov.activo.precio) mov.activo.precio = redondear(total / mov.activo.cantidad);
        quitarRango(quitar, totalN.i0, totalN.i1);
      } else if (mov.activo.cantidad && activo.clase === 'usd') {
        mov.activo.precio = ctx.tc.USD; total = mov.activo.cantidad * ctx.tc.USD; mov.notas.push('cotización de referencia');
        mov.confianza = Math.min(mov.confianza, 0.75);
      }
      if (activo.clase === 'usd' && !mov.activo.cantidad && total) {
        mov.activo.precio = ctx.tc.USD; mov.activo.cantidad = redondear(total / ctx.tc.USD); mov.notas.push('cotización de referencia');
      }
      mov.monto = total !== null ? redondear(total) : null;
      mov.moneda = 'ARS';
      if (precio && precio.moneda === 'USD') mov.moneda = 'USD';
      mov.categoria = { usd: 'cat-dolares', cripto: 'cat-cripto', accion: 'cat-acciones', cedear: 'cat-cedear', bono: 'cat-bonos', on: 'cat-on', fci: 'cat-fci' }[activo.clase] || 'cat-acciones';
      mov.cuenta = activo.clase === 'usd' ? ctx.cuentaInversion : ctx.cuentaBroker;
    } else if (elegido) {
      mov.monto = elegido.valor;
      mov.moneda = elegido.moneda || (elegido.deMoneda && tipo !== 'compra_activo' ? 'ARS' : 'ARS');
      quitarRango(quitar, elegido.i0, elegido.i1);
      if (elegido.monedaTok !== undefined) quitar[elegido.monedaTok] = 1;
      if (elegido.valor < 100 && !elegido.mult && !elegido.moneda && tipo !== 'compra_activo') {
        mov.dudas.push({ campo: 'monto', texto: '¿Fueron $' + elegido.valor + ' o $' + (elegido.valor * 1000).toLocaleString('es-AR') + '?',
          opciones: [{ etiqueta: formatoPesos(elegido.valor), valor: elegido.valor }, { etiqueta: formatoPesos(elegido.valor * 1000), valor: elegido.valor * 1000 }] });
        mov.confianza = Math.min(mov.confianza, 0.5);
      }
      if (cuotas && /\bde\b/.test(texto(toks, cuotas.i1 + 1, elegido.i0 - 1) || '')) {
        mov.notas.push(cuotas.valor + ' cuotas de ' + formatoPesos(elegido.valor));
        mov.cuotas = cuotas.valor;
        mov.monto = redondear(elegido.valor * cuotas.valor);
      } else if (cuotas) { mov.cuotas = cuotas.valor; }
      // tipo de cambio para gastos en moneda extranjera: "pagué 20 dólares a 1500"
      if (mov.moneda !== 'ARS') {
        var tcN = precios[0] || montos.filter(function (N) { return N !== elegido && N.posiblePrecio; })[0];
        if (tcN) { mov.tc = tcN.valor; quitarRango(quitar, Math.max(c0, tcN.i0 - 1), tcN.i1); }
      }
    }
    if (cuotas) {
      quitarRango(quitar, cuotas.i0, cuotas.i1 + 1);
      if (toks[cuotas.i0 - 1] && toks[cuotas.i0 - 1].n === 'en') quitar[cuotas.i0 - 1] = 1;
    }
    var cn = numsC.filter(function (N) { return N.rol === 'cuota_n'; })[0];
    if (cn) {
      var ct = numsC.filter(function (N) { return N.rol === 'cuota_total' || (N.i0 === cn.i1 + 2 && toks[cn.i1 + 1] && toks[cn.i1 + 1].n === 'de'); })[0];
      mov.cuotaNum = cn.valor; if (ct) mov.cuotaTot = ct.valor;
      var desdeC = toks[cn.i0 - 1] && /^cuotas?$/.test(toks[cn.i0 - 1].n) ? cn.i0 - 1 : cn.i0;
      if (toks[desdeC - 1] && /^(la|el)$/.test(toks[desdeC - 1].n)) desdeC--;
      quitarRango(quitar, desdeC, ct ? ct.i1 : cn.i1);
      if (ct) { ct.rol = 'cuota_total'; if (elegido === ct) { elegido = null; } }
    }
    if (!mov.monto && previo && tipoInfo.heredado === undefined && montos.length === 0 && !activo) {
      // sin monto
    }

    // ---- moneda extranjera en gastos/ingresos: equivalente en pesos
    if (mov.moneda !== 'ARS' && mov.monto && !mov.activo) {
      mov.tc = mov.tc || ctx.tc[mov.moneda] || null;
      if (mov.tc) mov.montoARS = redondear(mov.monto * mov.tc);
    } else if (mov.monto) mov.montoARS = mov.monto;

    // ---- fecha
    var f = detectarFecha(toks, c0, c1, numsC, hoy, elegido);
    if (f) {
      mov.fecha = f.fecha;
      if (f.tokens) quitarRango(quitar, Math.max(c0, f.tokens[0]), Math.min(c1, f.tokens[1]));
      if (f.frase) quitarFrases(toks, c0, c1, quitar, new RegExp('\\b(el |este |el pasado )?' + escRe(f.frase) + '\\b'));
      if (f.aprox) mov.confianza = Math.min(mov.confianza, 0.7);
    } else mov.fecha = previo && previo.fechaExplicita ? previo.fecha : iso(diaLocal(hoy));
    mov.fechaExplicita = !!f || !!(previo && previo.fechaExplicita);

    // ---- cuentas
    if (tipo === 'transferencia') {
      var o = null, d = null;
      cuentas.forEach(function (c) {
        var antes = sEsp.slice(0, c.pos).trim().split(' ').pop();
        if (['de', 'desde', 'del'].indexOf(antes) >= 0 && !o) o = c.id;
        else if (['a', 'al', 'en', 'hacia', 'para'].indexOf(antes) >= 0 && !d) d = c.id;
        else if (!o) o = c.id; else if (!d) d = c.id;
      });
      if (tipoInfo.sub === 'pago_tarjeta') { o = o && o !== 'cta-tarjeta' ? o : 'cta-bbva'; d = 'cta-tarjeta'; }
      if (tipoInfo.sub === 'a_mp') { d = d || 'cta-mp'; if (o === d) o = null; o = o || 'cta-bbva'; }
      if (tipoInfo.sub === 'extraccion') { o = o && o !== 'cta-efectivo' ? o : 'cta-bbva'; d = 'cta-efectivo'; }
      if (tipoInfo.sub === 'deposito') { o = 'cta-efectivo'; d = d && d !== 'cta-efectivo' ? d : 'cta-bbva'; }
      mov.cuenta = o; mov.cuentaDestino = d;
      if (!o || !d) { mov.dudas.push({ campo: 'cuentas', texto: '¿De qué cuenta a qué cuenta?' }); mov.confianza = Math.min(mov.confianza, 0.55); }
    } else if (!mov.activo || mov.activo.clase !== 'usd' || cuentas.length) {
      if (cuentas.length) mov.cuenta = cuentas[0].id;
      else if (previo && previo.cuentaExplicita) mov.cuenta = previo.cuenta;
    }
    mov.cuentaExplicita = cuentas.length > 0 || !!(previo && previo.cuentaExplicita);
    var reCtas = [];
    ctx.cuentas.forEach(function (c) { c.alias.forEach(function (a) { reCtas.push(escRe(a.k)); }); });
    if (cuentas.length) {
      reCtas.sort(function (a, b) { return b.length - a.length; });
      quitarFrases(toks, c0, c1, quitar, new RegExp('\\b(con|en|por|desde|de|del|a|al|usando|via|pagando con|con el|con la|en el|en la|por el|por la|de la|del|a la|al)?\\s?(el |la |mi )?(' + reCtas.join('|') + ')(s|es)?\\b'));
    }
    if (!mov.cuenta) {
      if (tipo === 'ingreso' || tipo === 'cobro_prestamo' || tipo === 'prestamo_recibido' || tipo === 'rescate') mov.cuenta = ctx.cuentaIngreso;
      else if (tipo === 'inversion') mov.cuenta = ctx.cuentaInversion;
      else if (tipo === 'compra_activo' || tipo === 'venta_activo') mov.cuenta = mov.activo && mov.activo.clase === 'usd' ? ctx.cuentaInversion : ctx.cuentaBroker;
      else mov.cuenta = ctx.cuentaGasto;
    }

    // ---- plata que va o viene de una persona sin decir por qué
    var esPrestamo = /^(prestamo_dado|prestamo_recibido|cobro_prestamo|pago_deuda)$/.test(tipo);
    var haciaAlguien = /\b(le |les )(transferi|pase|di|mande|envie|deposite|gire)\b/.test(sEsp) ||
      (/\b(transferi|mande|envie|gire)\b/.test(sEsp) && tipo !== 'transferencia');
    var desdeAlguien = /\bme (transfirio|transfirieron|paso|pasaron|mando|mandaron|dio|dieron|giro|giraron|deposito)\b/.test(sEsp);
    if (!esPrestamo && tipo !== 'transferencia' && (haciaAlguien || desdeAlguien)) {
      var pq = detectarPersona(toks, c0, c1, ctx, 'prestamo_dado');
      if (pq) {
        mov.personaMencionada = pq.nombre;
        if (pq.tok !== undefined) { quitar[pq.tok] = 1; if (toks[pq.tok - 1] && ['a', 'al', 'de', 'con', 'para'].indexOf(toks[pq.tok - 1].n) >= 0) quitar[pq.tok - 1] = 1; }
        else if (pq.frase) quitarFrases(toks, c0, c1, quitar, new RegExp('\\b(a |de |con |para )?' + escRe(pq.frase) + '\\b'));
        if (haciaAlguien) {
          mov.tipo = tipo = 'gasto';
          mov.dudas.push({ campo: 'tipo', texto: '¿Qué fue lo que le pasaste a ' + pq.nombre + '?', opciones: [
            { etiqueta: 'Le presté', valor: 'prestamo_dado' }, { etiqueta: 'Le devolví', valor: 'pago_deuda' },
            { etiqueta: 'Un gasto o regalo', valor: 'gasto' }] });
        } else {
          mov.tipo = tipo = 'ingreso';
          mov.dudas.push({ campo: 'tipo', texto: '¿Por qué te pasó plata ' + pq.nombre + '?', opciones: [
            { etiqueta: 'Me devolvió', valor: 'cobro_prestamo' }, { etiqueta: 'Me prestó', valor: 'prestamo_recibido' },
            { etiqueta: 'Es un ingreso', valor: 'ingreso' }] });
        }
        mov.confianza = Math.min(mov.confianza, 0.55);
        tipoInfo.supuesto = false;
      }
    }

    // ---- persona (préstamos, gastos pagados por otro)
    if (esPrestamo || tipoInfo.sub === 'financiado' || /\b(me pago|le pague|me pagaron)\b/.test(sEsp)) {
      var p = detectarPersona(toks, c0, c1, ctx, tipoInfo.sub === 'financiado' ? 'financiado' : tipo);
      if (p) {
        if (tipoInfo.sub === 'financiado') mov.financiadoPor = p.nombre; else if (esPrestamo) mov.persona = p.nombre;
        else mov.personaMencionada = p.nombre;
        if (p.tok !== undefined) {
          quitar[p.tok] = 1;
          if (toks[p.tok + 1] && /^\p{Lu}/u.test(toks[p.tok + 1].o) && p.nombre.indexOf(' ') > 0) quitar[p.tok + 1] = 1;
          if (toks[p.tok - 1] && ['a', 'al', 'de', 'con', 'para'].indexOf(toks[p.tok - 1].n) >= 0) quitar[p.tok - 1] = 1;
        } else if (p.frase) quitarFrases(toks, c0, c1, quitar, new RegExp('\\b(a |de |con |para )?' + escRe(p.frase) + '\\b'));
      } else if (esPrestamo) {
        mov.dudas.push({ campo: 'persona', texto: tipo === 'prestamo_dado' ? '¿A quién se lo prestaste?' :
          tipo === 'cobro_prestamo' ? '¿Quién te devolvió?' : tipo === 'pago_deuda' ? '¿A quién le pagaste?' : '¿Quién te lo prestó?' });
        mov.confianza = Math.min(mov.confianza, 0.6);
      }
    }

    // ---- proyecto
    // plata que entra "en el kiosco" es del negocio (comprar algo en un kiosco es otra cosa)
    if (tipo === 'ingreso' && /\bkiosco\b/.test(sEsp)) {
      var pk = ctx.proyectos.filter(function (p) { return /kiosco/i.test(p.nombre); })[0];
      if (pk) proyecto = pk;
      if (ctx.catPorId['cat-negocio'] && !/\b(vendi|vendimos)\b.*\b(el|la|mi)\b/.test(sEsp)) mov.categoria = 'cat-negocio';
    }
    if (proyecto && tipo === 'ingreso' && /kiosco/i.test(proyecto.nombre) && /\bkiosco\b/.test(sEsp)) {
      mov.proyecto = proyecto.id;
    } else if (proyecto && (proyecto.palabras.some(function (w) { return w.multi ? w.re.test(' ' + s + ' ') : (' ' + s + ' ').indexOf(' ' + w.k + ' ') >= 0 || (' ' + s + ' ').indexOf(' ' + w.k + 's ') >= 0; }) ||
        (mov.moneda === 'BRL' && /brasil/i.test(proyecto.nombre)))) {
      mov.proyecto = proyecto.id;
      if (proyecto.esInversion && (tipo === 'gasto' || tipo === 'inversion')) {
        mov.tipo = tipo = 'inversion';
        mov.categoria = proyecto.categoriaInversion || mov.categoria;
      }
    } else if (mov.moneda === 'BRL') {
      var pb = ctx.proyectos.filter(function (p) { return /brasil/i.test(p.nombre); })[0];
      if (pb) mov.proyecto = pb.id;
    }

    // ---- categoría
    if (!mov.categoria) {
      if (tipo === 'gasto') {
        var rc = detectarCategoria(s, 'gasto', ctx);
        mov.categoria = rc.id || ((mov.moneda === 'BRL' || mov.moneda === 'EUR') && ctx.catPorId['cat-viajes'] ? 'cat-viajes' : 'cat-otros-gastos');
        mov.nd = rc.nd;
        mov._catPuntaje = rc.puntaje;
        if (!rc.id) mov.confianza = Math.min(mov.confianza, 0.7);
      } else if (tipo === 'ingreso') {
        var extra = tipoInfo.sub === 'venta' ? { 'cat-venta': 1.5 } : null;
        if (/\bme regalaron\b/.test(sEsp)) extra = { 'cat-regalo-recibido': 3 };
        if (/\b(me devolvieron|reintegro|reembolso)\b/.test(sEsp)) extra = { 'cat-reintegro': 2 };
        var ri = detectarCategoria(s, 'ingreso', ctx, extra);
        mov.categoria = ri.id || 'cat-otros-ingresos';
      } else if (tipo === 'inversion' || tipo === 'rescate') {
        mov.categoria = (instrumento && instrumento.cat) || mov.categoria || 'cat-plazo-fijo';
        if (instrumento) quitarFrases(toks, c0, c1, quitar, /\b(en |un |el |al |del |de )?(plazo fijo|plazos fijos|pf|money market|fci|fondo comun|fondo|caucion|cuenta remunerada)\b/);
        var mdias = /\ba (\d+) dias\b/.exec(sEsp);
        if (mdias) { mov.plazoDias = Number(mdias[1]); quitarFrases(toks, c0, c1, quitar, /\ba \d+ dias\b/); }
        var mtna = /\b(\d+(?:[.,]\d+)?) ?(%|por ciento)( de)? ?(tna|anual)?\b/.exec(sEsp);
        if (mtna) mov.tna = Number(mtna[1].replace(',', '.'));
      }
    }
    if (mov.categoria && ctx.catPorId[mov.categoria] && !mov.nd && tipo === 'gasto') mov.nd = ctx.catPorId[mov.categoria].nd || null;
    if (tipo === 'gasto') {
      if (/\b(capricho|gustito|me di un gusto|antojo|porque si|de gusto|un gusto)\b/.test(sEsp)) mov.nd = 'Deseo';
      else if (/\b(necesario|necesitaba|tuve que|hacia falta|obligado)\b/.test(sEsp)) mov.nd = 'Necesidad';
      quitarFrases(toks, c0, c1, quitar, /\b(fue un capricho|un capricho|capricho|gustito|me di un gusto|porque si|de gusto|era necesario|necesario)\b/);
    }

    // ---- descripción
    quitarFrases(toks, c0, c1, quitar, /\b(le |les |me )?(preste|prestamos|presto|prestaron|devolvi|devolvio|devolvieron|cancele|salde|debo|quede debiendo|pague lo que le debia)\b/);
    quitarFrases(toks, c0, c1, quitar, /\b(pesos|mangos|plata|guita)\b/);
    if (mov.activo) quitarFrases(toks, c0, c1, quitar, /\b(de |en )?(acciones|accion|cedears?|bonos?|ons?|dolares|dolar|usd|u\$s|verdes|bitcoin|btc|nominales)\b/);
    var desc = armarDescripcion(toks, c0, c1, quitar);
    if (mov.activo) {
      var a = mov.activo;
      desc = (tipo === 'venta_activo' ? 'Venta ' : 'Compra ') + (a.cantidad ? fmtNum(a.cantidad) + ' ' : '') +
        (a.clase === 'usd' ? 'USD' : a.ticker) + (a.precio ? ' a ' + formatoPesos(a.precio) : '');
    } else if (esPrestamo) {
      var pn = mov.persona || 'alguien';
      var base = { prestamo_dado: 'Préstamo a ' + pn, cobro_prestamo: pn + ' me devolvió', prestamo_recibido: 'Préstamo de ' + pn, pago_deuda: 'Le pagué a ' + pn }[tipo];
      desc = desc && !/^(plata|guita|lo que|la plata)$/i.test(desc) ? base + ' · ' + desc : base;
    } else if (tipo === 'transferencia') {
      var no = function (id) { var c = ctx.cuentas.filter(function (x) { return x.id === id; })[0]; return c ? c.nombre : '?'; };
      desc = tipoInfo.sub === 'pago_tarjeta' ? 'Pago de la tarjeta' : no(mov.cuenta) + ' → ' + no(mov.cuentaDestino);
    } else if ((tipo === 'inversion' || tipo === 'rescate') && instrumento) {
      desc = cap((tipo === 'rescate' ? 'Rescate ' + (instrumento.nombre === instrumento.nombre.toUpperCase() ? instrumento.nombre : instrumento.nombre.toLowerCase()) : instrumento.nombre) + (mov.plazoDias ? ' a ' + mov.plazoDias + ' días' : ''));
    } else if ((tipo === 'inversion' || tipo === 'rescate') && !desc) {
      desc = (tipo === 'rescate' ? 'Rescate ' : '') + (instrumento ? instrumento.nombre : (ctx.catPorId[mov.categoria] || {}).nombre || 'Inversión');
    }
    if (mov.cuotaNum) desc = 'Cuota ' + mov.cuotaNum + (mov.cuotaTot ? '/' + mov.cuotaTot : '') + (desc ? ' · ' + desc.replace(/^(del|de la|de)\s/i, '') : '');
    if (!desc && mov.personaMencionada) desc = (mov.tipo === 'ingreso' ? 'De ' : 'A ') + mov.personaMencionada;
    if (!desc && mov.categoria && ctx.catPorId[mov.categoria]) desc = ctx.catPorId[mov.categoria].nombre;
    if (mov.financiadoPor) desc = (desc || 'Gasto') + ' · lo pagó ' + mov.financiadoPor;
    mov.descripcion = desc || TIPOS[tipo].nombre;

    // ---- faltantes
    if (!mov.monto) {
      mov.dudas.unshift({ campo: 'monto', texto: '¿Cuánto fue?' });
      mov.confianza = Math.min(mov.confianza, 0.4);
    }
    if (tipoInfo.supuesto && !previo && !(mov._catPuntaje >= 1 && mov.categoria !== 'cat-otros-gastos') && !mov.activo) {
      if (!RE_GASTO.test(sEsp)) {
        mov.dudas.push({ campo: 'tipo', texto: '¿Qué fue?', opciones: [
          { etiqueta: 'Gasto', valor: 'gasto' }, { etiqueta: 'Ingreso', valor: 'ingreso' }, { etiqueta: 'Entre mis cuentas', valor: 'transferencia' }] });
      }
    }
    if (mov.categoria === 'cat-otros-gastos' || mov.categoria === 'cat-otros-ingresos') mov.confianza = Math.min(mov.confianza, 0.75);
    if (mov.activo && mov.activo.ticker === '?') {
      mov.dudas.push({ campo: 'activo', texto: '¿De qué empresa o activo?' });
      mov.descripcion = mov.descripcion.replace(' ?', ' ' + ({ accion: 'acciones', cedear: 'CEDEARs', bono: 'bonos', on: 'ON' }[mov.activo.clase] || ''));
      mov.confianza = Math.min(mov.confianza, 0.55);
    }
    delete mov._catPuntaje;
    mov.sub = tipoInfo.sub || null;
    return mov;
  }

  function fmtNum(n) { return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 8 }); }

  /* ---------- resolución con el estado (deudas, plazos fijos, posiciones) ---------- */

  function resolver(mov, ctx) {
    var est = ctx.estado || {};
    var personas = est.personas || {};
    // "Nacho me pagó 5 lucas" / "le pagué 10 lucas a Fer": ¿es un préstamo abierto?
    if (mov.personaMencionada && (mov.tipo === 'ingreso' || mov.tipo === 'gasto')) {
      var p = personas[mov.personaMencionada];
      var resuelto = false;
      if (p && mov.tipo === 'ingreso' && p.meDebe > 0) { mov.tipo = 'cobro_prestamo'; mov.persona = mov.personaMencionada; mov.categoria = null; mov.descripcion = mov.persona + ' me devolvió'; resuelto = true; }
      if (p && mov.tipo === 'gasto' && p.leDebo > 0) { mov.tipo = 'pago_deuda'; mov.persona = mov.personaMencionada; mov.categoria = null; mov.nd = null; mov.descripcion = 'Le pagué a ' + mov.persona; resuelto = true; }
      if (resuelto) {
        mov.dudas = mov.dudas.filter(function (d) { return d.campo !== 'tipo'; });
        mov.confianza = Math.max(mov.confianza, 0.8);
        mov.notas.push('lo asocié a la deuda abierta con ' + mov.persona);
      }
    }
    // préstamo sin persona: si hay una sola deuda abierta, es esa
    if (!mov.persona && (mov.tipo === 'cobro_prestamo' || mov.tipo === 'pago_deuda')) {
      var campo = mov.tipo === 'cobro_prestamo' ? 'meDebe' : 'leDebo';
      var abiertas = Object.keys(personas).filter(function (k) { return personas[k][campo] > 0; });
      if (abiertas.length === 1) {
        mov.persona = abiertas[0];
        mov.dudas = mov.dudas.filter(function (d) { return d.campo !== 'persona'; });
        mov.descripcion = mov.tipo === 'cobro_prestamo' ? mov.persona + ' me devolvió' : 'Le pagué a ' + mov.persona;
        mov.confianza = Math.max(mov.confianza, 0.75);
      } else if (abiertas.length > 1) {
        var d = mov.dudas.filter(function (x) { return x.campo === 'persona'; })[0];
        if (d) d.opciones = abiertas.slice(0, 6).map(function (k) { return { etiqueta: k, valor: k }; });
      }
    }
    // rescate de plazo fijo: separo capital e intereses
    if (mov.tipo === 'rescate' && mov.categoria === 'cat-plazo-fijo' && mov.monto) {
      var abiertos = (est.plazosFijos || []).filter(function (p) { return p.abierto; });
      if (abiertos.length) {
        var pf = abiertos[0];
        if (mov.monto > pf.monto) {
          mov.capital = pf.monto; mov.ganancia = redondear(mov.monto - pf.monto); mov.plazoFijoDe = pf.id;
          mov.notas.push('capital ' + formatoPesos(pf.monto) + ' + intereses ' + formatoPesos(mov.ganancia));
        }
      }
    }
    // venta de activo: resultado contra el costo promedio
    if (mov.tipo === 'venta_activo' && mov.activo && mov.activo.cantidad && mov.activo.precio) {
      var pos = (est.posiciones || {})[mov.activo.ticker];
      if (pos && pos.cantidad > 0) {
        var costo = pos.costo / pos.cantidad;
        mov.resultado = redondear((mov.activo.precio - costo) * mov.activo.cantidad);
        if (mov.activo.cantidad > pos.cantidad + 1e-9) mov.notas.push('vendés más de lo que tenés registrado (' + fmtNum(pos.cantidad) + ')');
      }
    }
    if (mov.tipo !== 'gasto') mov.nd = null;
    return mov;
  }

  /* ================================================================
   *  API PRINCIPAL
   * ================================================================ */

  function interpretar(textoUsuario, contexto, opciones) {
    var ctx = contexto && contexto.catPorId ? contexto : prepararContexto(contexto || {});
    var hoy = (opciones && opciones.hoy) || new Date();
    var limpio = String(textoUsuario || '')
      .replace(/\b(anot[aá](me)?|registr[aá](me)?|cargá|carga|poné|pone)\b[:,]?\s*/gi, '')
      .replace(/(\d)\s*[kK]\b/g, '$1k')
      .replace(/\$\s+(?=\d)/g, '$')
      .trim();
    if (!limpio) return { movimientos: [], texto: textoUsuario };
    if (/\p{L}/u.test(limpio) && limpio === limpio.toUpperCase()) limpio = limpio.toLowerCase();
    var toks = tokenizar(limpio);
    marcarFechasYHoras(toks);
    marcarProyectosConNumero(toks, ctx);
    var nums = leerTodosLosNumeros(toks);
    asignarRoles(toks, nums);
    var claus = partirEnClausulas(toks, nums);
    var movs = [], previo = null;
    claus.forEach(function (c) {
      var m = interpretarClausula(toks, c.i0, c.i1, nums, ctx, hoy, previo);
      m = resolver(m, ctx);
      m.texto = limpio.slice(toks[c.i0].a, toks[c.i1].b);
      movs.push(m);
      previo = m;
    });
    // cláusulas sin monto que en realidad eran detalle de la anterior ("... y después fuimos al cine")
    movs = movs.filter(function (m, i) { return m.monto || movs.length === 1 || i === 0; });
    movs.forEach(function (m) {
      delete m.fechaExplicita; delete m.cuentaExplicita;
      m.confianza = Math.round(m.confianza * 100) / 100;
    });
    return { movimientos: movs, texto: textoUsuario };
  }

  /** Estado agregado a partir de los movimientos guardados (préstamos, plazos fijos, posiciones). */
  function calcularEstado(movimientos) {
    var personas = {}, plazos = [], pos = {};
    var lista = (movimientos || []).filter(function (m) { return !m.deleted; })
      .sort(function (a, b) { return (a.fecha || '').localeCompare(b.fecha || '') || (a.createdAt || 0) - (b.createdAt || 0); });
    function p(n) { personas[n] = personas[n] || { meDebe: 0, leDebo: 0, movimientos: 0 }; personas[n].movimientos++; return personas[n]; }
    lista.forEach(function (m) {
      var monto = m.montoARS || m.monto || 0;
      if (m.tipo === 'prestamo_dado' && m.persona) p(m.persona).meDebe += monto;
      if (m.tipo === 'cobro_prestamo' && m.persona) p(m.persona).meDebe -= monto;
      if (m.tipo === 'prestamo_recibido' && m.persona) p(m.persona).leDebo += monto;
      if (m.tipo === 'pago_deuda' && m.persona) p(m.persona).leDebo -= monto;
      if (m.tipo === 'gasto' && m.financiadoPor) p(m.financiadoPor).leDebo += monto;
      if (m.tipo === 'inversion' && m.categoria === 'cat-plazo-fijo') plazos.push({ id: m.id, monto: monto, fecha: m.fecha, abierto: true });
      if (m.tipo === 'rescate' && m.categoria === 'cat-plazo-fijo') {
        var ab = plazos.filter(function (x) { return x.abierto; })[0];
        if (ab) ab.abierto = false;
      }
      if ((m.tipo === 'compra_activo' || m.tipo === 'venta_activo') && m.activo && m.activo.ticker) {
        var t = m.activo.ticker;
        pos[t] = pos[t] || { ticker: t, clase: m.activo.clase, cantidad: 0, costo: 0, realizado: 0 };
        var q = Number(m.activo.cantidad) || 0;
        if (m.tipo === 'compra_activo') { pos[t].cantidad += q; pos[t].costo += monto; }
        else if (q && pos[t].cantidad > 0) {
          var unit = pos[t].costo / pos[t].cantidad;
          var qq = Math.min(q, pos[t].cantidad);
          pos[t].realizado += monto - unit * qq;
          pos[t].cantidad -= qq; pos[t].costo -= unit * qq;
        }
      }
    });
    Object.keys(personas).forEach(function (k) {
      personas[k].meDebe = redondear(personas[k].meDebe);
      personas[k].leDebo = redondear(personas[k].leDebo);
    });
    return { personas: personas, plazosFijos: plazos, posiciones: pos };
  }

  /**
   * Convierte un movimiento interpretado en el/los registros que se guardan.
   * Lo usan la app y el respaldo, así los dos guardan exactamente lo mismo.
   * extra = { texto, origen, cotizaciones, hoy }
   */
  function aRegistros(m, extra) {
    extra = extra || {};
    var notas = Array.isArray(m.notas) ? m.notas.join('; ') : (m.notas || '');
    var base = {
      tipo: m.tipo, fecha: m.fecha || (extra.hoy || iso(diaLocal(new Date()))), monto: m.monto, moneda: m.moneda || 'ARS',
      montoARS: m.montoARS != null ? m.montoARS : m.monto, tc: m.tc || null, categoria: m.categoria || null,
      cuenta: m.cuenta || null, cuentaDestino: m.cuentaDestino || null, persona: m.persona || null,
      financiadoPor: m.financiadoPor || null, activo: m.activo || null, proyecto: m.proyecto || null,
      nd: m.tipo === 'gasto' ? (m.nd || null) : null, descripcion: m.descripcion || '', texto: extra.texto || m.texto || null,
      origen: extra.origen || 'texto', confianza: m.confianza != null ? m.confianza : null, cuotas: m.cuotas || null,
      plazoDias: m.plazoDias || null, tna: m.tna || null, resultado: m.resultado != null ? m.resultado : null,
      notas: notas || null, porIA: !!m.porIA
    };
    if (base.moneda !== 'ARS' && !(m.activo) && base.monto && (!base.montoARS || base.montoARS === base.monto)) {
      var tc = base.tc || (extra.cotizaciones || {})[base.moneda];
      if (tc) { base.tc = tc; base.montoARS = redondear(base.monto * tc); }
    }
    if (m.tipo === 'rescate' && m.ganancia > 0 && m.capital) {
      var cap1 = Object.assign({}, base, { monto: m.capital, montoARS: m.capital, descripcion: (base.descripcion || 'Rescate') + ' · capital' });
      var gan = Object.assign({}, base, { tipo: 'ingreso', monto: m.ganancia, montoARS: m.ganancia, categoria: 'cat-intereses',
        descripcion: 'Intereses del ' + (base.categoria === 'cat-plazo-fijo' ? 'plazo fijo' : 'rescate') });
      return [cap1, gan];
    }
    return [base];
  }

  return {
    VERSION: VERSION,
    TIPOS: TIPOS,
    catalogoBase: catalogoBase,
    prepararContexto: prepararContexto,
    interpretar: interpretar,
    aRegistros: aRegistros,
    aprender: aprender,
    calcularEstado: calcularEstado,
    formatoPesos: formatoPesos,
    // expuestos para pruebas y para la IA opcional
    _: { tokenizar: tokenizar, leerNumero: leerNumero, digitos: digitos, norm: norm, slug: slug,
         palabrasClave: palabrasClave, detectarTipo: detectarTipo, iso: iso }
  };
});
