import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

const PREGUNTAS = [
  {
    id: 'nombre',
    bot: '¿Cómo te llamas?\n\nNo te pido el nombre para el registro. Te lo pido porque lo que viene ahora va sobre ti, y quiero hablarte de frente.',
    tipo: 'texto',
    placeholder: 'Tu nombre...',
    clave: 'nombre',
  },
  {
    id: 'situacion',
    bot: (d) => `${d.nombre}, bien.\n\nSin rodeos. ¿Cuál de estas frases describe mejor lo que estás viviendo ahora mismo?`,
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
    bot: (d) => `Entendido, ${d.nombre}.\n\n¿En qué parte de tu vida lo notas más?`,
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
    id: 'tiempo',
    bot: '¿Cuánto tiempo llevas así?',
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
  const W = 210, H = 297, mg = 20, ancho = W - mg * 2;

  function wrap(txt, x, y, maxW, fs) {
    doc.setFontSize(fs || 10);
    const lines = doc.splitTextToSize(String(txt), maxW);
    doc.text(lines, x, y);
    return y + lines.length * (fs || 10) * 0.45 + 3;
  }

  // PORTADA
  doc.setFillColor(13, 13, 13); doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(201, 168, 76); doc.rect(0, 0, W, 4, 'F'); doc.rect(0, H-4, W, 4, 'F');
  doc.setTextColor(201, 168, 76); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('INFORME DE DIAGNÓSTICO PERSONAL · CAUSA & EFECTO', W/2, 22, {align:'center'});
  doc.setTextColor(245,244,240); doc.setFontSize(38); doc.setFont('helvetica','bold');
  doc.text('CAUSA', W/2, 82, {align:'center'});
  doc.setTextColor(201,168,76); doc.text('&', W/2, 98, {align:'center'});
  doc.setTextColor(245,244,240); doc.text('EFECTO', W/2, 114, {align:'center'});
  doc.setDrawColor(201,168,76); doc.setLineWidth(0.4);
  doc.line(mg+25, 124, W-mg-25, 124);
  doc.setFontSize(11); doc.setFont('helvetica','normal'); doc.setTextColor(200,200,200);
  const titLines = doc.splitTextToSize(diag.titulo_diagnostico.toUpperCase(), ancho-20);
  doc.text(titLines, W/2, 134, {align:'center'});
  doc.setFontSize(9); doc.setTextColor(150,150,150);
  doc.text(`Preparado para: ${datos.nombre}`, W/2, 158, {align:'center'});
  doc.text('RAÚL M. CÁNOVAS · Método CAUSA & EFECTO', W/2, 165, {align:'center'});
  doc.setFontSize(7);
  doc.text('www.raulcanovas.com  ·  @raulm.canovas', W/2, 172, {align:'center'});
  const ib = diag.indice_bloqueo;
  doc.setFontSize(8); doc.setTextColor(150,150,150);
  doc.text(`ÍNDICE DE BLOQUEO: ${ib}/100`, W/2, 186, {align:'center'});
  doc.setFillColor(40,40,40); doc.rect(mg+20, 190, ancho-40, 7, 'F');
  const r = ib>70?180:ib>40?201:80, g = ib>70?50:ib>40?168:160, b = ib>70?50:ib>40?76:80;
  doc.setFillColor(r,g,b); doc.rect(mg+20, 190, ((ancho-40)*ib)/100, 7, 'F');
  doc.setFontSize(7); doc.setTextColor(120,120,120);
  doc.text('Calculado en base a tu perfil de respuestas', W/2, 203, {align:'center'});

  // PÁGINA 2: DIAGNÓSTICO
  doc.addPage();
  doc.setFillColor(13,13,13); doc.rect(0,0,W,H,'F');
  doc.setFillColor(201,168,76); doc.rect(0,0,4,H,'F');
  let cy = mg+8;
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(201,168,76);
  doc.text('DIAGNÓSTICO · LO QUE ESTÁ PASANDO DE VERDAD', mg+10, cy); cy+=9;
  doc.setDrawColor(201,168,76); doc.setLineWidth(0.3); doc.line(mg+10,cy,W-mg,cy); cy+=7;
  doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(245,244,240);
  const dt = doc.splitTextToSize(diag.titulo_diagnostico, ancho-10);
  doc.text(dt, mg+10, cy); cy+=dt.length*6.5+5;
  doc.setFont('helvetica','normal'); doc.setTextColor(185,185,185);
  cy = wrap(diag.perfil_bloqueo, mg+10, cy, ancho-10, 10); cy+=5;
  doc.setFillColor(40,40,40); doc.rect(mg+10,cy,ancho-10,0.5,'F'); cy+=7;
  doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(201,168,76);
  doc.text('LA CAUSA RAÍZ', mg+10, cy); cy+=6;
  doc.setFont('helvetica','normal'); doc.setTextColor(200,200,200);
  cy = wrap(diag.causa_raiz, mg+10, cy, ancho-10, 10); cy+=8;
  doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(201,168,76);
  doc.text('EL PATRÓN QUE SE REPITE', mg+10, cy); cy+=6;
  doc.setFont('helvetica','normal'); doc.setTextColor(200,200,200);
  cy = wrap(diag.patron_repeticion, mg+10, cy, ancho-10, 10);

  // PÁGINA 3: PLAN
  doc.addPage();
  doc.setFillColor(13,13,13); doc.rect(0,0,W,H,'F');
  doc.setFillColor(201,168,76); doc.rect(0,0,4,H,'F');
  cy = mg+8;
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(201,168,76);
  doc.text('TU HOJA DE RUTA PERSONALIZADA', mg+10, cy); cy+=9;
  doc.setDrawColor(201,168,76); doc.setLineWidth(0.3); doc.line(mg+10,cy,W-mg,cy); cy+=7;
  diag.bloques_prioritarios.forEach((bloque) => {
    if (cy > H-55) { doc.addPage(); doc.setFillColor(13,13,13); doc.rect(0,0,W,H,'F'); doc.setFillColor(201,168,76); doc.rect(0,0,4,H,'F'); cy=mg+10; }
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(201,168,76);
    doc.text(`PASO ${bloque.orden} DE TU PROCESO`, mg+10, cy); cy+=5;
    doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(245,244,240);
    doc.text(bloque.bloque, mg+10, cy);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(140,140,140);
    doc.text(`Caps. ${Array.isArray(bloque.caps)?bloque.caps.join(', '):bloque.caps}`, W-mg, cy, {align:'right'});
    cy+=6;
    doc.setFont('helvetica','normal'); doc.setTextColor(185,185,185);
    cy = wrap(bloque.por_que, mg+10, cy, ancho-10, 9);
    doc.setTextColor(150,150,150); doc.setFontSize(8);
    cy = wrap(`Base científica: ${bloque.base_cientifica}`, mg+10, cy, ancho-10, 8); cy+=6;
  });
  cy+=3;
  doc.setDrawColor(60,60,60); doc.setLineWidth(0.3); doc.line(mg+10,cy,W-mg,cy); cy+=8;
  doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(201,168,76);
  doc.text('TU PRIMER PASO CONCRETO — ESTA SEMANA', mg+10, cy); cy+=6;
  doc.setFont('helvetica','normal'); doc.setTextColor(205,205,205);
  cy = wrap(diag.primer_paso, mg+10, cy, ancho-10, 10); cy+=5;
  doc.setFontSize(8); doc.setTextColor(140,140,140);
  doc.text(`Tiempo estimado para resultados visibles: ${diag.tiempo_estimado}`, mg+10, cy); cy+=12;
  const flines = doc.splitTextToSize(`"${diag.frase_cierre}"`, ancho-28);
  const bH = flines.length*5.5+14;
  if (cy+bH > H-30) { doc.addPage(); doc.setFillColor(13,13,13); doc.rect(0,0,W,H,'F'); doc.setFillColor(201,168,76); doc.rect(0,0,4,H,'F'); cy=mg+10; }
  doc.setDrawColor(201,168,76); doc.setLineWidth(0.5); doc.rect(mg+10,cy,ancho-10,bH,'S');
  doc.setFontSize(10); doc.setFont('helvetica','bolditalic'); doc.setTextColor(201,168,76);
  doc.text(flines, mg+15, cy+9); cy+=bH+14;

  // ÚLTIMA: CTA
  doc.addPage();
  doc.setFillColor(13,13,13); doc.rect(0,0,W,H,'F');
  doc.setFillColor(201,168,76); doc.rect(0,0,W,4,'F'); doc.rect(0,H-4,W,4,'F');
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(130,130,130);
  doc.text('EL DIAGNÓSTICO ES EL MAPA. EL LIBRO ES EL CAMINO.', W/2, 58, {align:'center'});
  doc.setFontSize(20); doc.setFont('helvetica','bold'); doc.setTextColor(245,244,240);
  doc.text('Ahora sabes qué está pasando.', W/2, 76, {align:'center'});
  doc.setTextColor(201,168,76);
  doc.text('La pregunta es qué vas a hacer.', W/2, 88, {align:'center'});
  doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(185,185,185);
  const ctaTxt = doc.splitTextToSize('Los 27 pasos del método CAUSA & EFECTO están diseñados para que el cambio no dependa de la motivación — que sube y baja — sino de un sistema que funciona incluso los días en que no tienes ganas. Este diagnóstico identifica dónde estás. El libro te lleva a donde quieres ir.', ancho-20);
  doc.text(ctaTxt, W/2, 104, {align:'center'});
  doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(201,168,76);
  doc.text('CAUSA & EFECTO', W/2, 148, {align:'center'});
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(140,140,140);
  doc.text('RAÚL M. CÁNOVAS', W/2, 156, {align:'center'});
  doc.setDrawColor(201,168,76); doc.setLineWidth(0.4);
  doc.rect(mg+30, 163, ancho-60, 16, 'S');
  doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(201,168,76);
  doc.text('CONSIGUE EL LIBRO →  www.raulcanovas.com', W/2, 173, {align:'center'});
  doc.setFontSize(7); doc.setTextColor(110,110,110);
  doc.text('@raulm.canovas  ·  Amazon KDP  ·  IngramSpark', W/2, 196, {align:'center'});

  doc.save(`Diagnostico_CausaEfecto_${datos.nombre.replace(/\s+/g,'_')}.pdf`);
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
  const progreso = Math.min((paso/totalPasos)*100, 100);

  const scrollBottom = () => { setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100); };
  const addMsg = useCallback((rol, contenido) => { setMensajes(prev => [...prev, {id: Date.now()+Math.random(), rol, contenido}]); scrollBottom(); }, []);
  const botDice = useCallback((texto, delay=700) => new Promise(resolve => {
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
    const nuevosDatos = {...datos, [pregActual.clave]: valor};
    setDatos(nuevosDatos);
    addMsg('user', label || valor);
    const siguiente = paso+1;
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
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(nuevosDatos),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const {diagnostico: diag} = await res.json();
        setDiagnostico(diag);
        setGenerando(false);
        await botDice(`He terminado el análisis.\n\n**${diag.titulo_diagnostico}**\n\n${diag.perfil_bloqueo}`, 700);
        await new Promise(r => setTimeout(r, 600));
        addMsg('bot', '__EMAIL__');
      } catch(e) {
        setGenerando(false);
        setErrorMsg('Algo ha fallado. Por favor recarga la página e inténtalo de nuevo.');
        addMsg('bot', 'Ha habido un problema al procesar tu perfil. Por favor, recarga la página.');
      }
      setBloqueado(false);
    }
  };

  const handleTexto = () => { const val=inputVal.trim(); if(!val||bloqueado) return; setInputVal(''); handleRespuesta(val,val); };
  const handleEmail = () => { const e=emailVal.trim(); if(!e||!e.includes('@')) return; setEmailEnviado(true); addMsg('user',e); setTimeout(()=>addMsg('bot','__PDF__'),700); };
  const handleDescargar = async () => { if(!diagnostico||descargando) return; setDescargando(true); try { await generarPDF(datos,diagnostico); } catch(e) { setErrorMsg('Error al generar el PDF. Inténtalo de nuevo.'); } setDescargando(false); };

  const pregActual = paso < PREGUNTAS.length ? PREGUNTAS[paso] : null;
  const esperandoTexto = pregActual?.tipo==='texto' && !typing && !bloqueado;
  const esperandoOpciones = pregActual?.tipo==='opciones' && !typing && !bloqueado;
  const particulas = Array.from({length:16},(_,i)=>({key:i,left:`${5+i*6}%`,delay:`${(i*0.8)%12}s`,duration:`${11+(i*1.3)%10}s`}));

  return (
    <>
      <Head>
        <title>Bot Anti-Anhelo · CAUSA & EFECTO · Raúl M. Cánovas</title>
        <meta name="description" content="Tu diagnóstico personal basado en el método de 27 pasos. Sin filtros. Sin genéricos." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-particles">
        {particulas.map(p=><div key={p.key} className="particle" style={{left:p.left,animationDelay:p.delay,animationDuration:p.duration}}/>)}
      </div>
      <div className="app">
        <div className="header">
          <div className="header-eyebrow">RAÚL M. CÁNOVAS · MÉTODO CAUSA & EFECTO</div>
          <h1 className="header-title">BOT <span>ANTI-ANHELO</span></h1>
          <p className="header-subtitle">Tu diagnóstico personal. Basado en evidencia. Sin filtros. Sin respuestas genéricas.</p>
        </div>
        {paso>0 && (
          <div className="progress">
            <div className="progress-label">
              <span>{paso<totalPasos?`Pregunta ${paso+1} de ${totalPasos}`:'Análisis completado'}</span>
              <span>{Math.round(progreso)}%</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{width:`${progreso}%`}}/></div>
          </div>
        )}
        <div className="chat-container">
          <div className="messages-scroll" ref={scrollRef}>
            {mensajes.map(m=>{
              if(m.contenido==='__EMAIL__') return (
                <div key={m.id}>
                  <div className="msg"><div className="avatar bot">C&E</div>
                    <div className="bubble bot">
                      <p>Tu informe completo está listo.</p>
                      <p>Antes de descargarlo, dime dónde te lo envío. Solo necesito tu email — sin spam, sin listas, solo tu informe.</p>
                    </div>
                  </div>
                  {!emailEnviado&&<div className="email-box">
                    <p>Tu diagnóstico es único. Generado solo para ti, en este momento.</p>
                    <div className="email-row">
                      <input className="email-input" type="email" placeholder="tu@email.com" value={emailVal} onChange={e=>setEmailVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmail()}/>
                      <button className="email-btn" onClick={handleEmail}>CONTINUAR →</button>
                    </div>
                  </div>}
                </div>
              );
              if(m.contenido==='__PDF__') return (
                <div key={m.id}>
                  <div className="msg"><div className="avatar bot">C&E</div>
                    <div className="bubble bot">
                      <p>Perfecto, <strong>{datos.nombre}</strong>.</p>
                      <p>Tu informe incluye tu diagnóstico completo, la causa raíz identificada, los pasos del método que más te aplican ahora mismo, y tu primer movimiento concreto para esta semana.</p>
                      <p>No es un informe genérico. Es tuyo.</p>
                    </div>
                  </div>
                  <div className="pdf-cta">
                    <h3>Tu Diagnóstico Personal</h3>
                    <p>{diagnostico?.titulo_diagnostico} · Para {datos.nombre}</p>
                    <button className="pdf-btn" onClick={handleDescargar} disabled={descargando}>{descargando?'Generando...':'⬇ DESCARGAR MI INFORME'}</button>
                    <div className="book-link">El método completo en el libro → <a href="https://www.raulcanovas.com" target="_blank" rel="noopener noreferrer">www.raulcanovas.com</a></div>
                  </div>
                </div>
              );
              return (
                <div key={m.id} className={`msg ${m.rol}`}>
                  <div className={`avatar ${m.rol}`}>{m.rol==='bot'?'C&E':datos.nombre?datos.nombre[0].toUpperCase():'Tú'}</div>
                  <div className={`bubble ${m.rol}`}>
                    {m.contenido.split('\n').map((linea,i)=>{
                      const partes=linea.split(/(\*\*[^*]+\*\*)/g);
                      return <p key={i}>{partes.map((p,j)=>p.startsWith('**')&&p.endsWith('**')?<strong key={j}>{p.slice(2,-2)}</strong>:p)}</p>;
                    })}
                  </div>
                </div>
              );
            })}
            {(typing||generando)&&(
              <div className="typing-wrap">
                <div className="avatar bot">C&E</div>
                <div className="typing"><div className="dot"/><div className="dot"/><div className="dot"/></div>
                {generando&&<span style={{fontSize:'11px',color:'#888',marginLeft:'8px'}}>Analizando tu perfil…</span>}
              </div>
            )}
          </div>
          {errorMsg&&<div className="error-msg">{errorMsg}</div>}
          {esperandoOpciones&&<div className="options">{pregActual.opciones.map(op=><button key={op.v} className="opt-btn" onClick={()=>handleRespuesta(op.v,op.t)} disabled={bloqueado}>{op.t}</button>)}</div>}
          {esperandoTexto&&<div className="input-area">
            <input className="input-field" placeholder={pregActual.placeholder||'Escribe tu respuesta...'} value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleTexto()} autoFocus/>
            <button className="send-btn" onClick={handleTexto} disabled={!inputVal.trim()}>→</button>
          </div>}
        </div>
      </div>
    </>
  );
}
