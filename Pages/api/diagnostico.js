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
const INTENTOS = {
  no: "nunca ha intentado cambiar esto de forma seria",
  si_fallo: "ha intentado cambiar varias veces pero siempre recae en el mismo punto",
  si_poco: "ha mejorado algo pero no lo suficiente para sentir un cambio real",
};
const NUCLEO = {
  miedo: "miedo al fracaso y al juicio externo",
  creencias: "creencias limitantes sobre su propia capacidad y merecimiento",
  habitos: "inercia del entorno — sus hábitos y contexto lo arrastran de vuelta",
  claridad: "falta de claridad — no sabe exactamente qué cambiar ni por dónde",
  energia: "déficit de energía sostenida para mantener el cambio en el tiempo",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { nombre, situacion, impacto, tiempo, nucleo } = req.body;
  if (!nombre || !situacion || !tiempo || !nucleo) return res.status(400).json({ error: "Datos incompletos" });

  const prompt = `Eres el sistema de diagnóstico del método CAUSA & EFECTO, creado por Raúl M. Cánovas. Este método tiene 27 pasos organizados en 8 bloques de transformación personal, basados en psicología cognitiva, neurociencia del comportamiento, teoría del apego y regulación del sistema nervioso autónomo.

Tu función es generar un diagnóstico profundamente personalizado. No genérico. No de autoayuda estándar. Algo que haga que la persona sienta que llevas años conociéndola.

PERFIL DE LA PERSONA:
- Nombre: ${nombre}
- Problema central: ${SITUACION[situacion] || situacion}
- Área de mayor impacto: ${IMPACTO[impacto] || "múltiples áreas"}
- Tiempo con este patrón: ${TIEMPO_MAP[tiempo] || tiempo}
- Historial de cambio: ${INTENTOS[req.body.intentos] || "no especificado"}
- Causa raíz identificada por ella misma: ${NUCLEO[nucleo] || nucleo}

LOS 8 BLOQUES DEL MÉTODO CAUSA & EFECTO:
1. EL DESPERTAR (Caps 1-4): Romper el piloto automático. Identificar las leyes invisibles que gobiernan los resultados. Desmantelar el programa maestro de creencias. Rastrear el origen de las cadenas.
2. LA GRAN LIMPIEZA (Caps 5-7): Eliminar el lastre emocional acumulado. Romper las anclas del pasado. Asfixiar la ansiedad desde su raíz neurológica.
3. LA REPROGRAMACIÓN (Caps 8-10): Abrir las compuertas de la mente al cambio. Reconfigurar el termostato interno de resultados. Instalar el filtro de hierro para decisiones.
4. CALMA Y CLARIDAD BAJO PRESIÓN (Caps 11-12): Aniquilar el pánico operativo. Desarrollar resonancia operativa — actuar con claridad bajo presión real.
5. DIRECCIÓN, ACCIÓN Y RESULTADOS (Caps 13-14): Definir vectores de dirección reales. Convertirse en dueño absoluto del tiempo.
6. EL ARTE DE RELACIONARSE (Caps 15-19): Conexión implacable con otros. Lectura humana avanzada. Desmantelar la armadura. El espejo del amor. Calma bajo fuego social.
7. FORJA DE CARÁCTER (Caps 20-23): Forjarse en acero — resiliencia real. Mente esponja — aprendizaje acelerado. El destello interior. Energía imparable sostenida.
8. LIBERACIÓN Y PLENITUD (Caps 24-27): La llave de la jaula. Sintonía humana profunda. Semillas de confianza. La gran cosecha — la vida que mereces.

INSTRUCCIONES DE TONO:
- Cercano y empático, pero con autoridad. Como un amigo que también es el mejor especialista del mundo en esto.
- Habla directamente a ${nombre}, usando su nombre en momentos clave — no en cada frase.
- Nunca uses lenguaje de autoayuda genérica. Nada de "mereces lo mejor" o "eres increíble". 
- Sé específico, concreto, casi incómodo en la precisión.
- La base científica debe sentirse natural, no clínica. Integrada en el lenguaje, no colgada como etiqueta.
- El diagnóstico debe hacer que ${nombre} piense: "¿cómo sabe esto de mí?"

Responde ÚNICAMENTE con JSON válido. Sin texto antes ni después. Sin markdown. Sin bloques de código. Exactamente esta estructura:

{
  "titulo_diagnostico": "título de 6-10 palabras que describe el patrón central de ${nombre} — específico, no genérico",
  "perfil_bloqueo": "4-5 frases que describen exactamente lo que está viviendo ${nombre}. Menciona su nombre una vez. Conecta el síntoma visible con el mecanismo interno real. Que sienta que lo conoces desde hace años.",
  "causa_raiz": "2-3 frases que van más allá de lo que ${nombre} dijo. La causa detrás de la causa. Brutal pero compasiva.",
  "patron_repeticion": "2 frases que describen el ciclo exacto que se repite en su vida. El patrón que aparece en el trabajo, en las relaciones, en cómo se habla a sí mismo.",
  "bloques_prioritarios": [
    {
      "orden": 1,
      "bloque": "nombre exacto del bloque más urgente para este perfil",
      "caps": [número, número],
      "por_que": "2-3 frases explicando por qué este bloque es el primero para ${nombre} específicamente. Personalizado, no genérico.",
      "base_cientifica": "la base científica real que hay detrás — neurociencia, psicología cognitiva, teoría del apego, etc. Una frase, natural, no técnica."
    },
    {
      "orden": 2,
      "bloque": "nombre del segundo bloque",
      "caps": [número, número],
      "por_que": "2-3 frases personalizadas",
      "base_cientifica": "base científica en una frase natural"
    },
    {
      "orden": 3,
      "bloque": "nombre del tercer bloque",
      "caps": [número, número],
      "por_que": "2-3 frases personalizadas",
      "base_cientifica": "base científica en una frase natural"
    }
  ],
  "primer_paso": "La acción más concreta y pequeña que ${nombre} puede hacer esta semana. No un plan de vida. Un primer movimiento real, específico, que rompa el patrón. 3-4 frases.",
  "frase_cierre": "Una sola frase. Con el nombre de ${nombre}. Que combine verdad y esperanza. Que no suene a poster motivacional. Que suene a alguien que te conoce y te dice algo que necesitabas escuchar.",
  "indice_bloqueo": número entre 35 y 92 calculado según la profundidad y duración del patrón,
  "tiempo_estimado": "estimación honesta y específica — no vaga. Ej: entre 6 y 10 semanas para los primeros cambios visibles, 4-6 meses para una transformación sostenida."
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: "Eres el sistema de diagnóstico del método CAUSA & EFECTO. Generas diagnósticos personales profundos, precisos y empáticos. Respondes ÚNICAMENTE con JSON válido, sin ningún texto adicional, sin markdown, sin bloques de código.",
      messages: [{ role: "user", content: prompt }],
    });
    const texto = message.content.map(b => b.text || "").join("");
    const clean = texto.replace(/```json|```/g, "").trim();
    const diagnostico = JSON.parse(clean);
    return res.status(200).json({ diagnostico });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error generando diagnóstico" });
  }
}
