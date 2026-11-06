/* Código compartido por la tienda y la página de administración */

const LINES = {
  "Infantil":{fill:"#18A4E0", text:"var(--blue-text)", tint:"var(--tint-blue)", desc:"Morrales, loncheras y bolsitos con personajes para el colegio y el paseo.", photo:"img/dino.jpg"},
  "Juvenil": {fill:"#C8203F", text:"var(--crimson-text)", tint:"var(--tint-crimson)", desc:"Loncheras, estuches y bolsos con estampados para el día a día.", photo:"img/tropical.jpg"},
  "Hogar":   {fill:"#72A40C", text:"var(--green-text)", tint:"var(--tint-green)", desc:"Cenefas, cojines y textiles de cocina que visten la casa.", photo:"img/cenefa.jpg"},
};
const TYPES = ["Morral","Lonchera","Bolso","Bandolera","Cartuchera","Estuche","Pañoleta","Cocina","Decoración"];

/* Catálogo de muestra: se muestra mientras no esté conectada la hoja de Google */
const SAMPLE = [
  {id:"s1", name:"Bolso Panda", line:"Infantil", type:"Bandolera", price:48000, photo:"img/panda.jpg", desc:"Estampado de panda, ribete y correa roja ajustable. Perfecto para los paseos.", isNew:true},
  {id:"s2", name:"Morral Dino", line:"Infantil", type:"Morral", price:85000, photo:"img/dino.jpg", desc:"Con ojos, dientes y crestas en relieve. Bolsillo frontal y espalda acolchada.", isNew:true},
  {id:"s3", name:"Lonchera Osito", line:"Infantil", type:"Lonchera", price:45000, desc:"Interior térmico lavable y asa superior para manos pequeñas."},
  {id:"s4", name:"Morral preescolar Unicornio", line:"Infantil", type:"Morral", price:72000, desc:"Tamaño justo para el jardín, con cremalleras fáciles de abrir."},
  {id:"s5", name:"Cartuchera Animalitos", line:"Infantil", type:"Cartuchera", price:18000, desc:"Estampado de animales y espacio para colores, lápices y borrador."},
  {id:"s6", name:"Babero Gotitas x2", line:"Infantil", type:"Pañoleta", price:16000, desc:"Dos baberos de algodón con broche suave al cuello."},
  {id:"s7", name:"Neceser Caritas", line:"Infantil", type:"Estuche", price:22000, desc:"Para el cepillo, la crema y la colonia de la pañalera."},
  {id:"s8", name:"Lonchera Tropical", line:"Juvenil", type:"Lonchera", price:52000, photo:"img/tropical.jpg", desc:"Estampado tropical, cierre frontal, correa cruzada y base reforzada. Personalizable con tus iniciales."},
  {id:"s9", name:"Estuche para gafas Tropical", line:"Juvenil", type:"Estuche", price:18000, photo:"img/gafas.jpg", desc:"Tela acolchada que protege tus gafas, con iniciales en metal.", isNew:true},
  {id:"s10", name:"Morral urbano Ruta", line:"Juvenil", type:"Morral", price:95000, desc:"Bolsillo para portátil, tela resistente al agua y espalda ventilada."},
  {id:"s11", name:"Bandolera Mini celular", line:"Juvenil", type:"Bandolera", price:32000, desc:"Del tamaño justo para celular, llaves y tarjetas."},
  {id:"s12", name:"Cosmetiquera Tropical", line:"Juvenil", type:"Cartuchera", price:26000, desc:"Para maquillaje y accesorios, con forro fácil de limpiar."},
  {id:"s13", name:"Tote Diario", line:"Juvenil", type:"Bolso", price:48000, desc:"Lona gruesa, bolsillo interno y asas largas para llevar al hombro."},
  {id:"s14", name:"Pañoleta estampada Sol", line:"Juvenil", type:"Pañoleta", price:18000, desc:"Algodón suave con estampado propio para el cabello, el cuello o el bolso."},
  {id:"s15", name:"Cenefa navideña Esferas", line:"Hogar", type:"Decoración", price:85000, photo:"img/cenefa.jpg", desc:"Tela crema con esferas, estrellas y moños de cuadros aplicados a mano. Hecha a la medida de tu ventana."},
  {id:"s16", name:"Delantal Sazón", line:"Hogar", type:"Cocina", price:42000, desc:"Bolsillo frontal, tiras largas y tela antimanchas."},
  {id:"s17", name:"Agarraderas Fogón x2", line:"Hogar", type:"Cocina", price:19000, desc:"Relleno térmico para ollas y bandejas calientes."},
  {id:"s18", name:"Individuales Mesa puesta x4", line:"Hogar", type:"Cocina", price:36000, desc:"Juego de cuatro individuales reversibles y lavables."},
  {id:"s19", name:"Cojín decorativo Cuadros", line:"Hogar", type:"Decoración", price:38000, desc:"Funda con cierre oculto, en cuadros o estampados de temporada."},
  {id:"s20", name:"Bolsa para pan Panadera", line:"Hogar", type:"Cocina", price:24000, desc:"Con cordón y forro de algodón para mantener el pan fresco."},
];

/* ---------- Utilidades ---------- */
const $ = s => document.querySelector(s);
const money = n => "$" + Math.round(Number(n) || 0).toLocaleString("es-CO");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lineOf = p => LINES[p.line] || LINES.Juvenil;
function toast(msg){ const t = $("#toast"); if (!t) return; t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600); }
const safeStore = {
  mem:{},
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return k in this.mem ? this.mem[k] : d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){ this.mem[k] = v; } },
};
const links = {
  wa: () => `https://wa.me/${CONFIG.whatsapp}`,
  ig: () => `https://instagram.com/${CONFIG.instagram}`,
  mail: () => `mailto:${CONFIG.correo}`,
};
function fillLinks(){
  document.querySelectorAll("[data-link]").forEach(a => { a.href = links[a.dataset.link](); });
  document.querySelectorAll("[data-ig-handle]").forEach(el => { el.textContent = "@" + CONFIG.instagram; });
}

/* ---------- Ilustraciones por tipo (cuando no hay foto) ---------- */
function art(type, f, kids){
  const st = `fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round"`;
  const sh = `fill="rgba(0,0,0,.15)"`, d = "#2D2A32";
  const eyes = kids ? `<circle cx="86" cy="66" r="6" fill="#fff"/><circle cx="114" cy="66" r="6" fill="#fff"/><circle cx="86" cy="66" r="3" fill="${d}"/><circle cx="114" cy="66" r="3" fill="${d}"/>` : "";
  const s = {
    Bolso:`<path d="M76 64 C76 26 124 26 124 64" fill="none" stroke="${f}" stroke-width="8" stroke-linecap="round"/><rect x="50" y="58" width="100" height="86" rx="12" fill="${f}"/><rect x="59" y="67" width="82" height="68" rx="7" ${st}/>`,
    Morral:`<path d="M88 42 C88 22 112 22 112 42" fill="none" stroke="${f}" stroke-width="7" stroke-linecap="round"/><rect x="58" y="38" width="84" height="108" rx="26" fill="${f}"/><rect x="70" y="92" width="60" height="42" rx="12" ${sh}/><rect x="76" y="98" width="48" height="30" rx="8" ${st}/>${eyes}`,
    Lonchera:`<path d="M84 46 C84 30 116 30 116 46" fill="none" stroke="${f}" stroke-width="7" stroke-linecap="round"/><rect x="48" y="44" width="104" height="96" rx="18" fill="${f}"/><path d="M62 140 V76 a22 22 0 0 1 22 -22 h32 a22 22 0 0 1 22 22 V140" ${st}/><rect x="48" y="122" width="104" height="18" rx="6" ${sh}/>`,
    Bandolera:`<path d="M34 18 L120 84" fill="none" stroke="${f}" stroke-width="7" stroke-linecap="round"/><rect x="74" y="70" width="92" height="70" rx="14" fill="${f}"/><path d="M74 84 a14 14 0 0 1 14 -14 h64 a14 14 0 0 1 14 14 v12 q-46 30 -92 0 z" ${sh}/><circle cx="120" cy="104" r="6" fill="${d}"/><rect x="82" y="78" width="76" height="54" rx="9" ${st}/>`,
    Cartuchera:`<rect x="34" y="58" width="132" height="66" rx="20" fill="${f}"/><path d="M48 76 H152" ${st}/><rect x="148" y="70" width="10" height="20" rx="4" fill="${d}"/><rect x="44" y="92" width="112" height="22" rx="8" ${sh}/>`,
    Estuche:`<rect x="70" y="24" width="60" height="118" rx="22" fill="${f}"/><rect x="78" y="32" width="44" height="102" rx="16" ${st}/><rect x="86" y="18" width="28" height="14" rx="6" fill="${d}"/>`,
    Pañoleta:`<path d="M26 46 H174 L100 142 Z" fill="${f}" stroke="${f}" stroke-width="10" stroke-linejoin="round"/><path d="M48 56 H152 L100 124 Z" ${st} stroke-linejoin="round"/><circle cx="80" cy="70" r="5" fill="#fff"/><circle cx="120" cy="70" r="5" fill="#fff"/><circle cx="100" cy="94" r="5" fill="#fff"/>`,
    Cocina:`<path d="M84 22 C84 6 116 6 116 22" fill="none" stroke="${f}" stroke-width="6"/><path d="M80 22 H120 V56 L152 62 V146 H48 V62 L80 56 Z" fill="${f}" stroke="${f}" stroke-width="6" stroke-linejoin="round"/><rect x="70" y="96" width="60" height="34" rx="8" ${sh}/><rect x="76" y="101" width="48" height="24" rx="6" ${st}/><path d="M48 64 L26 70 M152 64 L174 70" stroke="${f}" stroke-width="6" stroke-linecap="round"/>`,
    Decoración:`<rect x="44" y="32" width="112" height="104" rx="22" fill="${f}"/><rect x="56" y="44" width="88" height="80" rx="14" ${st}/><circle cx="44" cy="32" r="8" fill="${f}"/><circle cx="156" cy="32" r="8" fill="${f}"/><circle cx="44" cy="136" r="8" fill="${f}"/><circle cx="156" cy="136" r="8" fill="${f}"/><circle cx="100" cy="84" r="6" fill="#fff"/>`,
  };
  return `<svg viewBox="0 0 200 160" aria-hidden="true">${s[type] || s.Bolso}</svg>`;
}
const picture = p => p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : art(p.type, lineOf(p).fill, p.line === "Infantil");
const lineVars = p => `--ct:${lineOf(p).text};--tint:${p.photo ? "#FFFFFF" : lineOf(p).tint}`;

/* ---------- Conexión con la hoja de Google (Apps Script) ---------- */
const api = {
  ready: () => Boolean(CONFIG.apiUrl && CONFIG.apiUrl.startsWith("https://script.google.com/")),
  async list(){
    const r = await fetch(CONFIG.apiUrl + "?t=" + Date.now());
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || "Error al leer el catálogo");
    return d.productos;
  },
  async send(payload){
    // Se envía como texto plano para que el navegador no bloquee la petición
    const r = await fetch(CONFIG.apiUrl, {method:"POST", body:JSON.stringify(payload)});
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || "No se pudo completar la acción");
    return d;
  },
};
