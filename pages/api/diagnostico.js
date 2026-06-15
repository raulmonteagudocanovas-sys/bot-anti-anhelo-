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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { nombre, situacion, impacto, tiempo, nucleo } = req.body;
  if (!nombre || !situacion || !tiempo || !nucleo) return res.status(400).json({ error: "Datos incompletos" });

  const prompt = `Eres el sistema de diagnóstico del método CAUSA Y EFECTO creado por Raul M. Canovas. Este método tiene 27 pasos organizados en 8 bloques de transformación personal.

Tu función es generar un diagnóstico profundamente personalizado para ${nombre}.

PERFIL:
- Nombre: ${nombre}
- Problema central: ${SITUACION[situacion] || situacion}
- Area de mayor impacto: ${IMPACTO[impacto] || "múltiples áreas"}
- Tiempo con este patrón: ${TIEMPO_MAP[tiempo] || tiempo}
- Causa raíz: ${NUCLEO[nucleo] || nucleo}

LOS 8 BLOQUES:
1. EL DESPERTAR (Caps 1-4): piloto automático, leyes invisibles, programa mental, cadenas del pasado
2. LA GRAN LIMPIEZA (Caps 5-7): lastre emocional, anclas del pasado, ansiedad
3. LA REPROGRAMACION (Caps 8-10): apertura mental, termostato interno, filtro de hierro
4. CALMA Y CLARIDAD (Caps 11-12): pánico operativo, resonancia
5. DIRECCION Y ACCION (Caps 13-14): vectores de dirección, dominio del tiempo
6. RELACIONES (Caps 15-19): conexión, lectura humana, armadura, amor, calma social
7. FORJA DE CARACTER (Caps 20-23): resiliencia, aprendizaje, destello interior, energía
8. LIBERACION (Caps 24-27): libertad, sintonía, confianza, cosecha vital

TONO: Cercano y empático pero con autoridad. Como un amigo que también es el mejor especialista del mundo en esto. Usa el nombre de ${nombre} en momentos clave. Nunca uses lenguaje de autoayuda genérica. Sé específico y concreto.

Responde SOLO con un objeto JSON válido. Sin texto antes ni después. Sin comillas triples. Sin markdown. Solo el JSON puro empezando con { y terminando con }.

El JSON debe tener exactamente estos campos:
{
"titulo_diagnostico": "título de 6-8 palabras específico para ${nombre}",
"perfil_bloqueo": "4-5 frases describiendo exactamente lo que vive ${nombre}. Menciona su nombre una vez. Conecta síntoma visible con mecanismo interno real.",
"causa_raiz": "2-3 frases que van más allá de lo que dijo. La causa detrás de la causa. Brutal pero compasiva.",
"patron_repeticion": "2 frases describiendo el ciclo exacto que se repite en su vida.",
"bloques_prioritarios": [
{"orden": 1, "bloque": "nombre del bloque más urgente", "caps": [4, 5], "por_que": "2-3 frases personalizadas para ${nombre}", "base_cientifica": "base científica en una frase natural"},
{"orden": 2, "bloque": "nombre del segundo bloque", "caps": [7, 8], "por_que": "2-3 frases personalizadas", "base_cientifica": "base científica en una frase"},
{"orden": 3, "bloque": "nombre del tercer bloque", "caps": [13, 14], "por_que": "2-3 frases personalizadas", "base_cientifica": "base científica en una frase"}
],
"primer_paso": "acción concreta que puede hacer esta semana. 3-4 frases muy específicas.",
"frase_cierre": "Una sola frase con el nombre de ${nombre} que combine verdad y esperanza.",
"indice_bloqueo": 72,
"tiempo_estimado": "estimación honesta y específica"
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
      console.error("No JSON found in response:", texto);
      return res.status(500).json({ error: "No se pudo extraer el diagnóstico" });
    }
    
    const diagnostico = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ diagnostico });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Error generando diagnóstico: " + error.message });
  }
}
