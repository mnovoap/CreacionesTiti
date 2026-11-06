/**
 * CREACIONES TITI · Catálogo y pedidos en Google Sheets
 *
 * Este código va en una hoja de Google: Extensiones → Apps Script.
 * Cambia las dos líneas de abajo antes de usarlo.
 */
const CLAVE = 'cambia-esta-clave';            // clave para entrar a admin.html
const CORREO = 'tucorreo@ejemplo.com';        // donde llegan las cotizaciones

const HOJA_PRODUCTOS = 'Productos';
const HOJA_PEDIDOS = 'Pedidos';
const CARPETA_FOTOS = 'Creaciones Titi - Fotos del catálogo';
const COLUMNAS = ['id', 'nombre', 'linea', 'tipo', 'precio', 'descripcion', 'foto', 'nuevo', 'creado'];

/* ---------- Ejecuta esta función UNA vez desde el editor ---------- */
function configurar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA_PRODUCTOS);
  if (!hoja) hoja = libro.insertSheet(HOJA_PRODUCTOS);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold');
    hoja.setFrozenRows(1);
    const ahora = new Date();
    MUESTRA.forEach(p => hoja.appendRow([p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], ahora]));
  }
  let pedidos = libro.getSheetByName(HOJA_PEDIDOS);
  if (!pedidos) {
    pedidos = libro.insertSheet(HOJA_PEDIDOS);
    pedidos.appendRow(['fecha', 'nombre', 'telefono', 'correo', 'ciudad', 'pedido', 'total', 'comentarios']);
    pedidos.getRange(1, 1, 1, 8).setFontWeight('bold');
    pedidos.setFrozenRows(1);
  }
  carpeta_();
  Logger.log('Listo. Ahora publica: Implementar → Nueva implementación → Aplicación web.');
}

/* ---------- La tienda pide el catálogo ---------- */
function doGet() {
  return json_({ ok: true, productos: leerProductos_() });
}

/* ---------- Pedidos y cambios desde la web ---------- */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Datos inválidos' }); }

  if (d.accion === 'pedido') return json_(guardarPedido_(d));

  if (d.clave !== CLAVE) return json_({ ok: false, error: 'Clave incorrecta' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (d.accion) {
      case 'verificar': return json_({ ok: true, hoja: SpreadsheetApp.getActiveSpreadsheet().getUrl() });
      case 'agregar':   return json_(agregar_(d));
      case 'eliminar':  return json_(eliminar_(d.id));
      case 'actualizar':return json_(actualizar_(d.id, d.campos || {}));
      default:          return json_({ ok: false, error: 'Acción desconocida' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Funciones internas ---------- */
function hoja_() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_PRODUCTOS); }

function leerProductos_() {
  const datos = hoja_().getDataRange().getValues();
  const cab = datos.shift();
  const i = n => cab.indexOf(n);
  return datos
    .filter(f => f[i('id')] && f[i('nombre')])
    .map(f => ({
      id: String(f[i('id')]),
      name: String(f[i('nombre')]),
      line: String(f[i('linea')] || 'Juvenil'),
      type: String(f[i('tipo')] || 'Bolso'),
      price: Number(f[i('precio')]) || 0,
      desc: String(f[i('descripcion')] || ''),
      photo: String(f[i('foto')] || ''),
      isNew: f[i('nuevo')] === true || String(f[i('nuevo')]).toLowerCase() === 'si' || String(f[i('nuevo')]).toLowerCase() === 'sí',
      creado: f[i('creado')] ? new Date(f[i('creado')]).getTime() : 0,
    }))
    .sort((a, b) => b.creado - a.creado);
}

function agregar_(d) {
  const p = d.producto || {};
  if (!p.nombre || !(Number(p.precio) > 0)) return { ok: false, error: 'Faltan el nombre o el precio' };
  const id = 'p' + Date.now();
  let foto = '';
  if (d.foto) {
    const blob = Utilities.newBlob(Utilities.base64Decode(d.foto), 'image/jpeg', id + '.jpg');
    const archivo = carpeta_().createFile(blob);
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    foto = 'https://drive.google.com/thumbnail?id=' + archivo.getId() + '&sz=w1200';
  }
  const fila = [id, p.nombre, p.linea, p.tipo, Number(p.precio), p.descripcion || '', foto, !!p.nuevo, new Date()];
  hoja_().appendRow(fila);
  return { ok: true, producto: { id, name: p.nombre, line: p.linea, type: p.tipo, price: Number(p.precio), desc: p.descripcion || '', photo: foto, isNew: !!p.nuevo } };
}

function filaDe_(id) {
  const ids = hoja_().getRange(1, 1, hoja_().getLastRow(), 1).getValues().map(r => String(r[0]));
  const n = ids.indexOf(String(id));
  return n > 0 ? n + 1 : -1;
}

function eliminar_(id) {
  const fila = filaDe_(id);
  if (fila < 0) return { ok: false, error: 'No se encontró el producto' };
  hoja_().deleteRow(fila);
  return { ok: true };
}

function actualizar_(id, campos) {
  const fila = filaDe_(id);
  if (fila < 0) return { ok: false, error: 'No se encontró el producto' };
  Object.keys(campos).forEach(k => {
    const col = COLUMNAS.indexOf(k);
    if (col > 0) hoja_().getRange(fila, col + 1).setValue(campos[k]);
  });
  return { ok: true };
}

function guardarPedido_(d) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  libro.getSheetByName(HOJA_PEDIDOS).appendRow([new Date(), d.nombre, d.telefono, d.correo, d.ciudad, d.pedido, d.total, d.comentarios]);
  const cuerpo =
    'Nueva cotización desde la página web\n\n' +
    d.pedido + '\n\nTotal de referencia: ' + d.total + '\n\n' +
    'Nombre: ' + d.nombre + '\nTeléfono: ' + d.telefono +
    '\nCorreo: ' + (d.correo || 'No indicado') + '\nCiudad: ' + (d.ciudad || 'No indicada') +
    '\nComentarios: ' + (d.comentarios || 'Ninguno');
  const opciones = { to: CORREO, subject: 'Nueva cotización de ' + d.nombre, body: cuerpo };
  if (d.correo) opciones.replyTo = d.correo;
  MailApp.sendEmail(opciones);
  return { ok: true };
}

function carpeta_() {
  const it = DriveApp.getFoldersByName(CARPETA_FOTOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_FOTOS);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Catálogo de muestra (se carga con configurar) ---------- */
const MUESTRA = [
  ['s1', 'Bolso Panda', 'Infantil', 'Bandolera', 48000, 'Estampado de panda, ribete y correa roja ajustable. Perfecto para los paseos.', 'img/panda.jpg', true],
  ['s2', 'Morral Dino', 'Infantil', 'Morral', 85000, 'Con ojos, dientes y crestas en relieve. Bolsillo frontal y espalda acolchada.', 'img/dino.jpg', true],
  ['s3', 'Lonchera Osito', 'Infantil', 'Lonchera', 45000, 'Interior térmico lavable y asa superior para manos pequeñas.', '', false],
  ['s4', 'Morral preescolar Unicornio', 'Infantil', 'Morral', 72000, 'Tamaño justo para el jardín, con cremalleras fáciles de abrir.', '', false],
  ['s5', 'Cartuchera Animalitos', 'Infantil', 'Cartuchera', 18000, 'Estampado de animales y espacio para colores, lápices y borrador.', '', false],
  ['s6', 'Babero Gotitas x2', 'Infantil', 'Pañoleta', 16000, 'Dos baberos de algodón con broche suave al cuello.', '', false],
  ['s7', 'Neceser Caritas', 'Infantil', 'Estuche', 22000, 'Para el cepillo, la crema y la colonia de la pañalera.', '', false],
  ['s8', 'Lonchera Tropical', 'Juvenil', 'Lonchera', 52000, 'Estampado tropical, cierre frontal, correa cruzada y base reforzada. Personalizable con tus iniciales.', 'img/tropical.jpg', false],
  ['s9', 'Estuche para gafas Tropical', 'Juvenil', 'Estuche', 18000, 'Tela acolchada que protege tus gafas, con iniciales en metal.', 'img/gafas.jpg', true],
  ['s10', 'Morral urbano Ruta', 'Juvenil', 'Morral', 95000, 'Bolsillo para portátil, tela resistente al agua y espalda ventilada.', '', false],
  ['s11', 'Bandolera Mini celular', 'Juvenil', 'Bandolera', 32000, 'Del tamaño justo para celular, llaves y tarjetas.', '', false],
  ['s12', 'Cosmetiquera Tropical', 'Juvenil', 'Cartuchera', 26000, 'Para maquillaje y accesorios, con forro fácil de limpiar.', '', false],
  ['s13', 'Tote Diario', 'Juvenil', 'Bolso', 48000, 'Lona gruesa, bolsillo interno y asas largas para llevar al hombro.', '', false],
  ['s14', 'Pañoleta estampada Sol', 'Juvenil', 'Pañoleta', 18000, 'Algodón suave con estampado propio para el cabello, el cuello o el bolso.', '', false],
  ['s15', 'Cenefa navideña Esferas', 'Hogar', 'Decoración', 85000, 'Tela crema con esferas, estrellas y moños de cuadros aplicados a mano. Hecha a la medida de tu ventana.', 'img/cenefa.jpg', false],
  ['s16', 'Delantal Sazón', 'Hogar', 'Cocina', 42000, 'Bolsillo frontal, tiras largas y tela antimanchas.', '', false],
  ['s17', 'Agarraderas Fogón x2', 'Hogar', 'Cocina', 19000, 'Relleno térmico para ollas y bandejas calientes.', '', false],
  ['s18', 'Individuales Mesa puesta x4', 'Hogar', 'Cocina', 36000, 'Juego de cuatro individuales reversibles y lavables.', '', false],
  ['s19', 'Cojín decorativo Cuadros', 'Hogar', 'Decoración', 38000, 'Funda con cierre oculto, en cuadros o estampados de temporada.', '', false],
  ['s20', 'Bolsa para pan Panadera', 'Hogar', 'Cocina', 24000, 'Con cordón y forro de algodón para mantener el pan fresco.', '', false],
];
