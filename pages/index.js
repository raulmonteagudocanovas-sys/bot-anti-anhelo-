import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

const PREGUNTAS = [
  {
    id: 'nombre',
    bot: 'Antes de empezar, necesito saber a quién tengo delante.\n\n¿Cómo te llamas?',
    tipo: 'texto',
    placeholder: 'Tu nombre...',
    clave: 'nombre',
  },
  {
    id: 'edad',
    bot: (d) => `${d.nombre}, bien.\n\nUna cosa antes de entrar en materia. ¿En qué etapa vital estás ahora mismo?`,
    tipo: 'opciones',
    opciones: [
      { v: '20s', t: 'Tengo entre 20 y 29 años. Estoy construyendo mi camino.' },
      { v: '30s', t: 'Tengo entre 30 y 39 años. Siento que el tiempo apremia.' },
      { v: '40s', t: 'Tengo entre 40 y 49 años. Necesito un cambio real, ya.' },
      { v: '50mas', t: 'Tengo 50 o más. He visto mucho y sé que puedo más.' },
    ],
    clave: 'edad',
  },
  {
    id: 'laboral',
    bot: '¿Cuál es tu situación laboral ahora mismo?',
    tipo: 'opciones',
    opciones: [
      { v: 'empleado', t: 'Empleado. Trabajo para otra persona o empresa.' },
      { v: 'autonomo', t: 'Autónomo o empresario. Trabajo para mí mismo.' },
      { v: 'busqueda', t: 'En búsqueda de trabajo o en transición profesional.' },
      { v: 'otro', t: 'Otra situación — estudiante, cuidador, retirado.' },
    ],
    clave: 'laboral',
  },
  {
    id: 'contexto_personal',
    bot: (d) => `Entendido, ${d.nombre}.\n\n¿Tienes pareja, hijos u otras personas que dependan de ti en este momento?`,
    tipo: 'opciones',
    opciones: [
      { v: 'solo', t: 'No. Estoy solo y tengo libertad total.' },
      { v: 'pareja', t: 'Tengo pareja pero sin hijos.' },
      { v: 'familia', t: 'Tengo familia — pareja, hijos o personas a mi cargo.' },
      { v: 'responsabilidades', t: 'Tengo personas dependientes aunque no sea pareja o hijos.' },
    ],
    clave: 'contexto_personal',
  },
  {
    id: 'energia',
    bot: 'Sé honesto aquí. ¿Cómo describirías tu energía y tu sueño en general?',
    tipo: 'opciones',
    opciones: [
      { v: 'bien', t: 'Duermo bien y tengo energía suficiente para el día.' },
      { v: 'irregular', t: 'Irregular. Hay días buenos y días en que estoy por los suelos.' },
      { v: 'agotado', t: 'Cronicamente agotado. Me levanto cansado y así sigo todo el día.' },
      { v: 'insomnio', t: 'Problemas de sueño. La cabeza no para ni por la noche.' },
    ],
    clave: 'energia',
  },
  {
    id: 'lectura_previa',
    bot: (d) => `${d.nombre}, ¿has leído antes libros de desarrollo personal o has hecho cursos de este tipo?`,
    tipo: 'opciones',
    opciones: [
      { v: 'no', t: 'No. Este es mi primer contacto real con esto.' },
      { v: 'algo', t: 'He leído alguna cosa pero sin aplicarlo de verdad.' },
      { v: 'bastante', t: 'Sí, bastante. Sé mucho en teoría pero no lo traslado a mi vida.' },
      { v: 'experto', t: 'Mucho. He consumido de todo y sigo igual o casi igual.' },
    ],
    clave: 'lectura_previa',
  },
  {
    id: 'situacion',
    bot: 'Sin rodeos. ¿Cuál de estas frases describe mejor lo que estás viviendo ahora mismo?',
    tipo: 'opciones',
    opciones: [
      { v: 'paralisis', t: 'Sé exactamente lo que tengo que hacer. Y no lo hago.' },
      { v: 'agotamiento', t: 'Estoy quemado. Mucho movimiento, poco avance real.' },
      { v: 'perdido', t: 'No sé hacia dónde voy. Me falta dirección de verdad.' },
      { v: 'relaciones', t: 'Mis relaciones me drenan más de lo que me dan.' },
      { v: 'ansiedad', t: 'La ansiedad y el ruido mental toman decisiones por mí.' },
      { v: 'tiempo', t: 'El tiempo se me escapa. Nunca tengo suficiente.' },
    ],
    clave: 'situacion',
  },
  {
    id: 'impacto',
    bot: (d) => `¿En qué parte de tu vida lo notas más, ${d.nombre}?`,
    tipo: 'opciones',
    opciones: [
      { v: 'trabajo', t: 'En el trabajo o mis proyectos personales.' },
      { v: 'familia', t: 'En mi familia o pareja.' },
      { v: 'yo_mismo', t: 'En cómo me siento conmigo mismo.' },
      { v: 'todo', t: 'En todo. No hay una sola área que esté bien.' },
    ],
    clave: 'impacto',
  },
  {
    id: 'intentos_pasados',
    bot: '¿Qué has intentado cambiar antes y cuánto duró?',
    tipo: 'opciones',
    opciones: [
      { v: 'nada', t: 'Nada en serio. He pensado en cambiar pero no he actuado.' },
      { v: 'dias', t: 'He intentado cosas pero duran días, una semana máximo.' },
      { v: 'meses', t: 'He mantenido cambios meses, pero siempre vuelvo al punto de partida.' },
      { v: 'ciclos', t: 'Llevo años en ciclos de mejora y recaída. Ya casi no lo intento.' },
    ],
    clave: 'intentos_pasados',
  },
  {
    id: 'tiempo',
    bot: '¿Cuánto tiempo llevas con este patrón?',
    tipo: 'opciones',
    opciones: [
      { v: 'reciente', t: 'Pocos meses. Es algo relativamente nuevo.' },
      { v: 'anyo', t: 'Más de un año. Ya casi no recuerdo cómo era antes.' },
      { v: 'siempre', t: 'Toda mi vida. No conozco otra forma de estar.' },
    ],
    clave: 'tiempo',
  },
  {
    id: 'nucleo',
    bot: (d) => `${d.nombre}, última pregunta. Y te pido que seas completamente honesto contigo.\n\nSi tuvieras que señalar con el dedo la razón real por la que esto no ha cambiado, ¿cuál sería?`,
    tipo: 'opciones',
    opciones: [
      { v: 'miedo', t: 'El miedo. A fallar, a lo que dirán, a lo desconocido.' },
      { v: 'creencias', t: 'En el fondo creo que no soy capaz, o que no lo merezco.' },
      { v: 'habitos', t: 'Mis hábitos y mi entorno me arrastran de vuelta siempre.' },
      { v: 'claridad', t: 'No sé exactamente qué cambiar ni por dónde empezar.' },
      { v: 'energia', t: 'Me falta energía real para sostenerlo en el tiempo.' },
    ],
    clave: 'nucleo',
  },
];

async function cargarJsPDF() {
  return new Promise((resolve) => {
    if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(s);
  });
}

async function generarPDF(datos, diag) {
  const jsPDF = await cargarJsPDF();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, mg = 18, ancho = W - mg * 2;

  function addPage() {
    doc.addPage();
    doc.setFillColor(13, 13, 13); doc.rect(0, 0, W, H, 'F');
    doc.setFillColor(201, 168, 76); doc.rect(0, 0, 4, H, 'F');
  }

  function wrapText(txt, x, y, maxW, fs, color) {
    doc.setFontSize(fs || 10);
    if (color) doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(txt), maxW);
    doc.text(lines, x, y);
    return y + lines.length * (fs || 10) * 0.42 + 2;
  }

  function checkPage(cy, needed) {
    if (cy + needed > H - 20) { addPage(); return mg + 10; }
    return cy;
  }

  // ── PORTADA ──
  doc.setFillColor(13, 13, 13); doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(201, 168, 76); doc.rect(0, 0, W, 5, 'F'); doc.rect(0, H - 5, W, 5, 'F');
  doc.setFillColor(201, 168, 76); doc.rect(0, 0, 4, H, 'F');
  doc.setTextColor(201, 168, 76); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('INFORME DE DIAGNÓSTICO PERSONAL · MÉTODO CAUSA & EFECTO', W / 2, 24, { align: 'center' });
  doc.setTextColor(245, 244, 240); doc.setFontSize(40); doc.setFont('helvetica', 'bold');
  doc.text('CAUSA', W / 2, 82, { align: 'center' });
  doc.setTextColor(201, 168, 76); doc.text('&', W / 2, 99, { align: 'center' });
  doc.setTextColor(245, 244, 240); doc.text('EFECTO', W / 2, 116, { align: 'center' });
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.4);
  doc.line(mg + 30, 126, W - mg - 30, 126);
  doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(210, 210, 210);
  const titLines = doc.splitTextToSize(diag.titulo_diagnostico.toUpperCase(), ancho - 20);
  doc.text(titLines, W / 2, 136, { align: 'center' });
  doc.setFontSize(8); doc.setTextColor(150, 150, 150);
  doc.text(`Preparado exclusivamente para: ${datos.nombre}`, W / 2, 158, { align: 'center' });
  doc.text('RAÚL M. CÁNOVAS · Método CAUSA & EFECTO', W / 2, 165, { align: 'center' });
  doc.setFontSize(7);
  doc.text('www.raulcanovas.com  ·  @raulm.canovas', W / 2, 172, { align: 'center' });
  const ib = diag.indice_bloqueo;
  doc.setFontSize(7); doc.setTextColor(150, 150, 150);
  doc.text(`ÍNDICE DE BLOQUEO ACTUAL: ${ib}/100`, W / 2, 186, { align: 'center' });
  doc.setFillColor(35, 35, 35); doc.rect(mg + 15, 190, ancho - 30, 6, 'F');
  const r = ib > 70 ? 180 : ib > 40 ? 201 : 80;
  const g = ib > 70 ? 50 : ib > 40 ? 168 : 160;
  const b = ib > 70 ? 50 : ib > 40 ? 76 : 80;
  doc.setFillColor(r, g, b);
  doc.rect(mg + 15, 190, ((ancho - 30) * ib) / 100, 6, 'F');
  doc.setFontSize(6); doc.setTextColor(110, 110, 110);
  doc.text('Calculado en base a tu perfil de respuestas', W / 2, 201, { align: 'center' });

  // ── PÁGINA 2: DIAGNÓSTICO ──
  addPage();
  let cy = mg + 8;
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(201, 168, 76);
  doc.text('DIAGNÓSTICO · LO QUE ESTÁ PASANDO DE VERDAD', mg + 10, cy); cy += 7;
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.3); doc.line(mg + 10, cy, W - mg, cy); cy += 7;
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(245, 244, 240);
  const dt = doc.splitTextToSize(diag.titulo_diagnostico, ancho - 8);
  doc.text(dt, mg + 10, cy); cy += dt.length * 6 + 4;
  cy = wrapText(diag.perfil_bloqueo, mg + 10, cy, ancho - 8, 9.5, [190, 190, 190]); cy += 5;
  doc.setFillColor(40, 40, 40); doc.rect(mg + 10, cy, ancho - 8, 0.4, 'F'); cy += 6;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 168, 76);
  doc.text('LA CAUSA RAÍZ', mg + 10, cy); cy += 5;
  cy = wrapText(diag.causa_raiz, mg + 10, cy, ancho - 8, 9.5, [200, 200, 200]); cy += 5;
  doc.setFillColor(40, 40, 40); doc.rect(mg + 10, cy, ancho - 8, 0.4, 'F'); cy += 6;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 168, 76);
  doc.text('EL PATRÓN QUE SE REPITE', mg + 10, cy); cy += 5;
  cy = wrapText(diag.patron_repeticion, mg + 10, cy, ancho - 8, 9.5, [200, 200, 200]);

  // ── PÁGINA 3+: PLAN ──
  addPage();
  cy = mg + 8;
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(201, 168, 76);
  doc.text('TU HOJA DE RUTA PERSONALIZADA', mg + 10, cy); cy += 7;
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.3); doc.line(mg + 10, cy, W - mg, cy); cy += 7;

  diag.bloques_prioritarios.forEach((bloque) => {
    cy = checkPage(cy, 55);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 168, 76);
    doc.text(`PASO ${bloque.orden} DE TU PROCESO`, mg + 10, cy); cy += 5;
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(245, 244, 240);
    const caps = Array.isArray(bloque.caps) ? bloque.caps.join(', ') : bloque.caps;
    const bloqueNombre = doc.splitTextToSize(bloque.bloque, ancho - 40);
    doc.text(bloqueNombre, mg + 10, cy);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(140, 140, 140);
    doc.text(`Caps. ${caps}`, W - mg, cy, { align: 'right' });
    cy += bloqueNombre.length * 5.5 + 3;
    cy = wrapText(bloque.por_que, mg + 10, cy, ancho - 8, 9, [185, 185, 185]); cy += 2;
    doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(120, 120, 120);
    const bc = doc.splitTextToSize(`Base científica: ${bloque.base_cientifica}`, ancho - 8);
    doc.text(bc, mg + 10, cy); cy += bc.length * 4 + 8;
  });

  cy = checkPage(cy, 45);
  doc.setDrawColor(60, 60, 60); doc.setLineWidth(0.3); doc.line(mg + 10, cy, W - mg, cy); cy += 7;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 168, 76);
  doc.text('TU PRIMER PASO CONCRETO — ESTA SEMANA', mg + 10, cy); cy += 5;
  cy = wrapText(diag.primer_paso, mg + 10, cy, ancho - 8, 9.5, [205, 205, 205]); cy += 4;
  doc.setFontSize(7.5); doc.setTextColor(140, 140, 140);
  const tiempoLines = doc.splitTextToSize(`Tiempo estimado para resultados visibles: ${diag.tiempo_estimado}`, ancho - 8);
  doc.text(tiempoLines, mg + 10, cy); cy += tiempoLines.length * 4 + 10;

  cy = checkPage(cy, 32);
  const fraseCompleta = `"${diag.frase_cierre}"`;
  doc.setFontSize(10); doc.setFont('helvetica', 'bolditalic');
  const flines = doc.splitTextToSize(fraseCompleta, ancho - 20);
  const bH = flines.length * 5.5 + 16;
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5);
  doc.rect(mg + 10, cy, ancho - 8, bH, 'S');
  doc.setTextColor(201, 168, 76);
  doc.text(flines, mg + 15, cy + 9); cy += bH + 12;

  // ── PÁGINA FINAL: CTA ──
  addPage();
  cy = 45;
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(130, 130, 130);
  doc.text('EL DIAGNÓSTICO ES EL MAPA. EL LIBRO ES EL CAMINO.', W / 2, cy, { align: 'center' }); cy += 14;
  doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(245, 244, 240);
  doc.text('Ahora sabes lo que está pasando.', W / 2, cy, { align: 'center' }); cy += 10;
  doc.setTextColor(201, 168, 76);
  doc.text('La pregunta es qué vas a hacer con ello.', W / 2, cy, { align: 'center' }); cy += 14;
  doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(185, 185, 185);
  const ctaTxt1 = doc.splitTextToSize('Este diagnóstico te ha mostrado el patrón. Pero un mapa sin ruta no lleva a ningún sitio.', ancho - 20);
  doc.text(ctaTxt1, W / 2, cy, { align: 'center' }); cy += ctaTxt1.length * 5 + 5;
  const ctaTxt2 = doc.splitTextToSize('Los 27 pasos del método CAUSA & EFECTO son el sistema completo para que el cambio no dependa de la motivación — que sube y baja — sino de una estructura que funciona incluso los días en que no tienes ganas. Cada capítulo es una herramienta concreta. No teoría. No autoayuda genérica. Un método probado para que dejes de vivir la vida que te tocó y empieces a gobernar la que elegiste.', ancho - 20);
  doc.text(ctaTxt2, W / 2, cy, { align: 'center' }); cy += ctaTxt2.length * 5 + 12;

  // ── BOTÓN CTA — ENLACE REAL DE COMPRA EN AMAZON ──
  const AMAZON_URL = 'https://www.amazon.es/dp/B0H5FS71XT';
  const btnAmazonY = cy, btnAmazonH = 22;
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5);
  doc.setFillColor(201, 168, 76);
  doc.rect(mg + 20, btnAmazonY, ancho - 40, btnAmazonH, 'FD');
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(13, 13, 13);
  doc.text('REGALATE EL CAMBIO', W / 2, btnAmazonY + 10, { align: 'center' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40);
  doc.text('CAUSA & EFECTO - Disponible en Amazon (eBook y tapa blanda)', W / 2, btnAmazonY + 17, { align: 'center' });
  doc.link(mg + 20, btnAmazonY, ancho - 40, btnAmazonH, { url: AMAZON_URL });
  cy = btnAmazonY + btnAmazonH + 8;

  doc.setDrawColor(50, 50, 50); doc.setLineWidth(0.3); doc.line(mg + 20, cy, W - mg - 20, cy); cy += 10;
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 168, 76);
  doc.text('Quieres contenido que cambie como piensas cada semana?', W / 2, cy, { align: 'center' }); cy += 7;
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(170, 170, 170);
  const igTxt = doc.splitTextToSize('Sigueme en Instagram donde comparto estrategias reales, sin filtros y sin autoayuda de pacotilla, para que empieces a tomar el control de tu mente, tu tiempo y tu vida.', ancho - 20);
  doc.text(igTxt, W / 2, cy, { align: 'center' }); cy += igTxt.length * 5 + 8;

  // ── BLOQUE INSTAGRAM CLICKABLE — icono simple a la izquierda del texto, sin desplazamientos manuales ──
  const IG_URL = 'https://www.instagram.com/raulm.canovas';
  const igBoxY = cy, igBoxH = 18, igBoxX = mg + 30, igBoxW = ancho - 60;
  doc.setFillColor(25, 25, 25);
  doc.rect(igBoxX, igBoxY, igBoxW, igBoxH, 'F');
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.4);
  doc.rect(igBoxX, igBoxY, igBoxW, igBoxH, 'S');

  // Icono Instagram simple: cuadrado redondeado con circulo dentro, a la izquierda del texto
  const icSize = 6, icMargin = 8;
  const icX = igBoxX + icMargin, icY = igBoxY + (igBoxH - icSize) / 2;
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5);
  doc.roundedRect(icX, icY, icSize, icSize, 1.5, 1.5, 'S');
  doc.circle(icX + icSize / 2, icY + icSize / 2, icSize * 0.28, 'S');
  doc.setFillColor(201, 168, 76);
  doc.circle(icX + icSize * 0.78, icY + icSize * 0.22, 0.45, 'F');

  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 168, 76);
  doc.text('@raulm.canovas', igBoxX + igBoxW / 2 + 3, igBoxY + igBoxH / 2 + 1.5, { align: 'center' });
  doc.link(igBoxX, igBoxY, igBoxW, igBoxH, { url: IG_URL });
  cy = igBoxY + igBoxH + 8;

  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 90, 90);
  doc.text('RAUL M. CANOVAS - CAUSA & EFECTO - Todos los derechos reservados', W / 2, cy, { align: 'center' });

  doc.save(`Diagnostico_CausaEfecto_${datos.nombre.replace(/\s+/g, '_')}.pdf`);
}

export default function BotAntiAnhelo() {
  const [mensajes, setMensajes] = useState([]);
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState({});
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);
  const [emailVal, setEmailVal] = useState('');
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [diagnostico, setDiagnostico] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bloqueado, setBloqueado] = useState(false);
  const scrollRef = useRef(null);
  const totalPasos = PREGUNTAS.length;
  const progreso = Math.min((paso / totalPasos) * 100, 100);

  const scrollBottom = () => { setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100); };
  const addMsg = useCallback((rol, contenido) => { setMensajes(prev => [...prev, { id: Date.now() + Math.random(), rol, contenido }]); scrollBottom(); }, []);
  const botDice = useCallback((texto, delay = 700) => new Promise(resolve => {
    setTyping(true); scrollBottom();
    setTimeout(() => { setTyping(false); addMsg('bot', texto); resolve(); }, delay);
  }), [addMsg]);

  useEffect(() => {
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => { setTyping(false); addMsg('bot', PREGUNTAS[0].bot); }, 1200);
    }, 600);
  }, []);

  const handleRespuesta = async (valor, label) => {
    if (bloqueado) return;
    setBloqueado(true);
    const pregActual = PREGUNTAS[paso];
    const nuevosDatos = { ...datos, [pregActual.clave]: valor };
    setDatos(nuevosDatos);
    addMsg('user', label || valor);
    const siguiente = paso + 1;
    if (siguiente < PREGUNTAS.length) {
      setPaso(siguiente);
      const sig = PREGUNTAS[siguiente];
      const txt = typeof sig.bot === 'function' ? sig.bot(nuevosDatos) : sig.bot;
      await botDice(txt, 950);
      setBloqueado(false);
    } else {
      setPaso(siguiente);
      await botDice(`${nuevosDatos.nombre}, gracias por tu honestidad.\n\nEso que acabas de compartir no es fácil de decir. Y tampoco es fácil de ver con claridad cuando estás dentro.\n\nEstoy procesando tu perfil completo. Dame un momento.`, 1000);
      setGenerando(true);
      try {
        const res = await fetch('/api/diagnostico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevosDatos),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { diagnostico: diag } = await res.json();
        setDiagnostico(diag);
        setGenerando(false);
        await botDice(`He terminado el análisis.\n\n**${diag.titulo_diagnostico}**\n\n${diag.perfil_bloqueo}`, 700);
        await new Promise(r => setTimeout(r, 600));
        addMsg('bot', '__EMAIL__');
      } catch (e) {
        setGenerando(false);
        setErrorMsg('Algo ha fallado. Por favor recarga la página e inténtalo de nuevo.');
        addMsg('bot', 'Ha habido un problema al procesar tu perfil. Por favor, recarga la página.');
      }
      setBloqueado(false);
    }
  };

  const handleTexto = () => { const val = inputVal.trim(); if (!val || bloqueado) return; setInputVal(''); handleRespuesta(val, val); };
  const handleEmail = async () => {
    const e = emailVal.trim();
    if (!e || !e.includes('@')) return;
    setEmailEnviado(true);
    addMsg('user', e);
    try {
      const res = await fetch('/api/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, nombre: datos.nombre || '' }),
      });
      const data = await res.json();
      if (data.bloqueado) {
        // Mensaje de bloqueo — ya tiene un análisis con este email
        setTimeout(() => addMsg('bot', 'Tu análisis ya existe. Fue creado específicamente para ti y no cambia con una segunda vuelta — los patrones que el método detectó no desaparecen por repetir el diagnóstico. Lo que sigue es una sola cosa: el libro. 27 pasos para que dejes de analizar tu situación y empieces a cambiarla.\n\n→ amazon.es/dp/B0H5FS71XT'), 700);
      } else {
        setTimeout(() => addMsg('bot', '__PDF__'), 700);
      }
    } catch (err) {
      console.error('Error en suscribir:', err);
      setTimeout(() => addMsg('bot', '__PDF__'), 700);
    }
  };
  const handleDescargar = async () => { if (!diagnostico || descargando) return; setDescargando(true); try { await generarPDF(datos, diagnostico); } catch (e) { setErrorMsg('Error al generar el PDF. Inténtalo de nuevo.'); } setDescargando(false); };

  const pregActual = paso < PREGUNTAS.length ? PREGUNTAS[paso] : null;
  const esperandoTexto = pregActual?.tipo === 'texto' && !typing && !bloqueado;
  const esperandoOpciones = pregActual?.tipo === 'opciones' && !typing && !bloqueado;
  const particulas = Array.from({ length: 16 }, (_, i) => ({ key: i, left: `${5 + i * 6}%`, delay: `${(i * 0.8) % 12}s`, duration: `${11 + (i * 1.3) % 10}s` }));

  return (
    <>
      <Head>
        <title>Bot Anti-Anhelo · CAUSA & EFECTO · Raúl M. Cánovas</title>
        <meta name="description" content="Tu diagnóstico personal basado en el método de 27 pasos. Sin filtros. Sin genéricos." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-particles">
        {particulas.map(p => <div key={p.key} className="particle" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }} />)}
      </div>
      <div className="app">
        <div className="header">
          <div className="header-eyebrow">RAÚL M. CÁNOVAS · MÉTODO CAUSA & EFECTO</div>
          <h1 className="header-title">BOT <span>ANTI-ANHELO</span></h1>
          <p className="header-subtitle">Tu diagnóstico personal. Basado en evidencia. Sin filtros. Sin respuestas genéricas.</p>
        </div>
        {paso > 0 && (
          <div className="progress">
            <div className="progress-label">
              <span>{paso < totalPasos ? `Pregunta ${paso + 1} de ${totalPasos}` : 'Análisis completado'}</span>
              <span>{Math.round(progreso)}%</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progreso}%` }} /></div>
          </div>
        )}
        <div className="chat-container">
          <div className="messages-scroll" ref={scrollRef}>
            {mensajes.map(m => {
              if (m.contenido === '__EMAIL__') return (
                <div key={m.id}>
                  <div className="msg"><div className="avatar bot">C&E</div>
                    <div className="bubble bot">
                      <p>Tu informe completo está listo.</p>
                      <p>Antes de descargarlo, dime dónde te lo envío. Solo necesito tu email.</p>
                    </div>
                  </div>
                  {!emailEnviado && <div className="email-box">
                    <p>Tu diagnóstico es único. Generado solo para ti, en este momento.</p>
                    <div className="email-row">
                      <input className="email-input" type="email" placeholder="tu@email.com" value={emailVal} onChange={e => setEmailVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmail()} />
                      <button className="email-btn" onClick={handleEmail}>CONTINUAR →</button>
                    </div>
                  </div>}
                </div>
              );
              if (m.contenido === '__PDF__') return (
                <div key={m.id}>
                  <div className="msg"><div className="avatar bot">C&E</div>
                    <div className="bubble bot">
                      <p>Perfecto, <strong>{datos.nombre}</strong>.</p>
                      <p>Tu informe incluye tu diagnóstico exacto, la causa raíz, los bloques del libro que más te aplican y tu primer paso concreto para esta semana.</p>
                      <p>No es un informe genérico. Es tuyo.</p>
                    </div>
                  </div>
                  <div className="pdf-cta">
                    <h3>Tu Diagnóstico Personal</h3>
                    <p>{diagnostico?.titulo_diagnostico} · Para {datos.nombre}</p>
                    <button className="pdf-btn" onClick={handleDescargar} disabled={descargando}>{descargando ? 'Generando...' : '⬇ DESCARGAR MI INFORME'}</button>
                    {/* ── ENLACE REAL DE COMPRA EN AMAZON ── */}
                    <div className="book-link">¿Lista tu próxima versión? → <a href="https://www.amazon.es/dp/B0H5FS71XT" target="_blank" rel="noopener noreferrer">REGÁLATE EL CAMBIO</a></div>
                  </div>
                </div>
              );
              return (
                <div key={m.id} className={`msg ${m.rol}`}>
                  <div className={`avatar ${m.rol}`}>{m.rol === 'bot' ? 'C&E' : datos.nombre ? datos.nombre[0].toUpperCase() : 'Tú'}</div>
                  <div className={`bubble ${m.rol}`}>
                    {m.contenido.split('\n').map((linea, i) => {
                      const partes = linea.split(/(\*\*[^*]+\*\*)/g);
                      return <p key={i}>{partes.map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p)}</p>;
                    })}
                  </div>
                </div>
              );
            })}
            {(typing || generando) && (
              <div className="typing-wrap">
                <div className="avatar bot">C&E</div>
                <div className="typing"><div className="dot" /><div className="dot" /><div className="dot" /></div>
                {generando && <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>Analizando tu perfil…</span>}
              </div>
            )}
          </div>
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          {esperandoOpciones && <div className="options">{pregActual.opciones.map(op => <button key={op.v} className="opt-btn" onClick={() => handleRespuesta(op.v, op.t)} disabled={bloqueado}>{op.t}</button>)}</div>}
          {esperandoTexto && <div className="input-area">
            <input className="input-field" placeholder={pregActual.placeholder || 'Escribe tu respuesta...'} value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTexto()} autoFocus />
            <button className="send-btn" onClick={handleTexto} disabled={!inputVal.trim()}>→</button>
          </div>}
        </div>
      </div>
    </>
  );
}
