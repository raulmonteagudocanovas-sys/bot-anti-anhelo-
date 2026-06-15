import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SITUACION = {
  paralisis: "parálisis de acción — sabe lo que tiene que hacer pero no lo hace",
  agotamiento: "agotamiento crónico — mucho movimiento, muy poco avance real",
  perdido: "pérdida de dirección — ausencia de propósito claro",
  relaciones: "vínculos que drenan — relaciones que cuestan más de lo que dan",
  ansiedad: "ansiedad como piloto — el ruido mental toma las decisiones",
  tiempo: "tiranía del tiempo — sensación permanente de que no alcanza",
};
const IMPACTO = {
  trabajo: "su vida profesional y proyectos personales",
  familia: "su familia y relaciones de pareja",
  yo_mismo: "su relación consigo mismo y su autoconcepto",
  todo: "todas las áreas de su vida simultáneamente",
};
const TIEMPO_MAP = {
  reciente: "pocos meses — es relativamente reciente",
  anyo: "más de un año — ya forma parte de su identidad cotidiana",
  siempre: "toda su vida — no conoce otra forma de estar",
};
const NUCLEO = {
  miedo: "miedo al fracaso y al juicio externo",
  creencias: "creencias limitantes sobre su propia capacidad y merecimiento",
  habitos: "inercia del entorno — sus hábitos y contexto lo arrastran de vuelta",
  claridad: "falta de claridad — no sabe exactamente qué cambiar ni por dónde",
  energia: "déficit de energía sostenida para mantener el cambio en el tiempo",
};
const EDAD = {
  '20s': "entre 20 y 29 años — etapa de construcción de identidad y camino",
  '30s': "entre 30 y 39 años — etapa de presión social y reloj interno acelerado",
  '40s': "entre 40 y 49 años — etapa de revisión vital y urgencia de cambio real",
  '50mas': "50 años o más — etapa de sabiduría acumulada y deseo de legado",
};
const LABORAL = {
  empleado: "empleado — trabaja para otra persona o empresa",
  autonomo: "autónomo o empresario — trabaja para sí mismo",
  busqueda: "en búsqueda de trabajo o transición profesional",
  otro: "otra situación — estudiante, cuidador o retirado",
};
const CONTEXTO = {
  solo: "sin pareja ni dependientes — libertad total pero también soledad en el proceso",
  pareja: "con pareja sin hijos — responsabilidad compartida sin cargas de crianza",
  familia: "con familia completa — pareja e hijos o personas a su cargo",
  responsabilidades: "con personas dependientes sin ser pareja o hijos",
};
const ENERGIA_MAP = {
  bien: "duerme bien y tiene energía suficiente — el problema no es físico",
  irregular: "energía irregular — días buenos y días por los suelos",
  agotado: "agotamiento crónico — se levanta cansado y así continúa todo el día",
  insomnio: "problemas de sueño — la mente no para ni por la noche",
};
const LECTURA = {
  no: "sin experiencia previa en desarrollo personal — es su primer contacto real",
  algo: "algo de lectura previa pero sin aplicación real",
  bastante: "mucha teoría acumulada pero sin traslado a la vida real — la brecha teoría-práctica es su principal freno",
  experto: "consumidor intensivo de desarrollo personal que sigue igual — el problema no es información sino implementación",
};
const INTENTOS = {
  nada: "nunca ha intentado cambiar en serio — hay resistencia de base al movimiento",
  dias: "intentos que duran días — el patrón de abandono precoz está muy instalado",
  meses: "cambios que duran meses pero siempre regresa al punto de partida — el problema es la recaída, no el inicio",
  ciclos: "años de ciclos mejora-recaída — hay fatiga de intento acumulada que dificulta el siguiente movimiento",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { nombre, situacion, impacto, tiempo, nucleo, edad, laboral, contexto_personal, energia, lectura_previa, intentos_pasados } = req.body;
  
  if (!nombre || !situacion || !tiempo || !nucleo) return res.status(400).json({ error: "Datos incompletos" });

  const prompt = `Eres el sistema de diagnóstico del método CAUSA Y EFECTO creado por Raul M. Canovas. Este método tiene 27 pasos organizados en 8 bloques de transformación personal, basados en psicología cognitiva, neurociencia del comportamiento, teoría del apego y regulación del sistema nervioso autónomo.

Tu función es generar el diagnóstico más preciso y personalizado que esta persona haya leído jamás sobre sí misma. Que cuando lo lea piense: esto lo ha escrito alguien que me conoce de hace años.

PERFIL COMPLETO DE ${nombre.toUpperCase()}:
- Nombre: ${nombre}
- Etapa vital: ${EDAD[edad] || edad || "no especificada"}
- Situación laboral: ${LABORAL[laboral] || laboral || "no especificada"}
- Contexto personal: ${CONTEXTO[contexto_personal] || contexto_personal || "no especificado"}
- Energía y sueño: ${ENERGIA_MAP[energia] || energia || "no especificado"}
- Experiencia previa en desarrollo personal: ${LECTURA[lectura_previa] || lectura_previa || "no especificada"}
- Historial de intentos de cambio: ${INTENTOS[intentos_pasados] || intentos_pasados || "no especificado"}
- Problema central: ${SITUACION[situacion] || situacion}
- Área de mayor impacto: ${IMPACTO[impacto] || "múltiples áreas"}
- Tiempo con este patrón: ${TIEMPO_MAP[tiempo] || tiempo}
- Causa raíz identificada por él/ella: ${NUCLEO[nucleo] || nucleo}

LOS 8 BLOQUES DEL MÉTODO:
1. EL DESPERTAR (Caps 1-4): romper el piloto automático, leyes invisibles que gobiernan resultados, programa maestro de creencias, origen de las cadenas
2. LA GRAN LIMPIEZA (Caps 5-7): eliminar lastre emocional acumulado, romper anclas del pasado, asfixiar la ansiedad desde su raíz
3. LA REPROGRAMACION (Caps 8-10): abrir compuertas mentales al cambio, reconfigurar termostato interno de resultados, instalar filtro de hierro para decisiones
4. CALMA Y CLARIDAD BAJO PRESION (Caps 11-12): aniquilar pánico operativo, desarrollar resonancia operativa — actuar con claridad bajo presión real
5. DIRECCION ACCION Y RESULTADOS (Caps 13-14): definir vectores de dirección reales, convertirse en dueño absoluto del tiempo
6. EL ARTE DE RELACIONARSE (Caps 15-19): conexión implacable, lectura humana avanzada, desmantelar la armadura, espejo del amor, calma bajo fuego social
7. FORJA DE CARACTER (Caps 20-23): resiliencia real forjada en acero, aprendizaje acelerado, destello interior, energía imparable sostenida
8. LIBERACION Y PLENITUD (Caps 24-27): llave de la jaula, sintonía humana profunda, semillas de confianza, la gran cosecha

INSTRUCCIONES CRÍTICAS DE TONO Y PRECISIÓN:
- Usa toda la información del perfil para hacer el diagnóstico específico a esta persona — no genérico
- Conecta la etapa vital, la situación laboral y el contexto personal con el problema central
- Si tiene mucha teoría acumulada, nómbralo. Si tiene fatiga de intento, nómbrala. Si tiene familia a cargo, nómbrala como factor
- Habla directamente a ${nombre}, usa su nombre en momentos clave — no en cada frase
- Nunca uses lenguaje de autoayuda genérica. Nada de "mereces lo mejor" ni "eres increíble"
- Sé brutalmente preciso pero compasivo — como el mejor médico del mundo dando un diagnóstico honesto
- La base científica debe sonar natural, integrada, no colgada como etiqueta técnica

Responde SOLO con un objeto JSON válido. Sin texto antes ni después. Sin comillas triples. Sin markdown. Solo el JSON puro empezando con { y terminando con }.

{
"titulo_diagnostico": "título de 6-9 palabras específico y único para ${nombre} basado en su perfil completo",
"perfil_bloqueo": "5-6 frases que describen exactamente lo que vive ${nombre}. Menciona su nombre una vez. Conecta síntoma visible con mecanismo interno real. Integra su etapa vital, situación laboral y contexto personal. Que sienta que llevas años conociéndole.",
"causa_raiz": "3 frases que van más allá de lo que dijo. La causa detrás de la causa. Integra su historial de intentos y experiencia previa. Brutal pero compasiva.",
"patron_repeticion": "2-3 frases describiendo el ciclo exacto que se repite en su vida, específico a su perfil de edad, contexto y energía.",
"bloques_prioritarios": [
{"orden": 1, "bloque": "nombre exacto del bloque más urgente para este perfil concreto", "caps": [1, 2], "por_que": "3 frases personalizadas explicando por qué este bloque es el primero para ${nombre} específicamente, conectando con su perfil completo", "base_cientifica": "base científica real en una frase natural y no técnica"},
{"orden": 2, "bloque": "nombre del segundo bloque", "caps": [5, 6], "por_que": "3 frases personalizadas para este perfil", "base_cientifica": "base científica en una frase natural"},
{"orden": 3, "bloque": "nombre del tercer bloque", "caps": [13, 14], "por_que": "3 frases personalizadas para este perfil", "base_cientifica": "base científica en una frase natural"}
],
"primer_paso": "La acción más concreta y pequeña que ${nombre} puede hacer esta semana, específica a su contexto laboral y personal. No un plan de vida. Un primer movimiento real que rompa el patrón. 4-5 frases muy específicas.",
"frase_cierre": "Una sola frase. Con el nombre de ${nombre}. Que combine verdad y esperanza. Que no suene a poster motivacional. Que suene a alguien que le conoce de verdad y le dice algo que necesitaba escuchar.",
"indice_bloqueo": numero entre 35 y 92 calculado según profundidad duración del patrón historial de intentos y energía disponible,
"tiempo_estimado": "estimación honesta y específica según su perfil — no vaga. Diferencia entre primeros cambios visibles y transformación sostenida."
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const texto = message.content.map((b) => b.text || "").join("");
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found:", texto.substring(0, 200));
      return res.status(500).json({ error: "No se pudo extraer el diagnóstico" });
    }
    const diagnostico = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ diagnostico });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Error: " + error.message });
  }
}
