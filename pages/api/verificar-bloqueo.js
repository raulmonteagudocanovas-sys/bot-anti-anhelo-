// Este archivo va en: pages/api/verificar-bloqueo.js
// Solo COMPRUEBA si el email o la IP ya usaron el bot. No registra nada.
// Se llama justo al introducir el email, ANTES de gastar creditos en el diagnostico.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: "Email invalido" });

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) return res.status(500).json({ error: "Configuracion incompleta" });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const ipKey = `ip-${ip.replace(/[^a-zA-Z0-9.]/g, '-')}@control.interno`;

  try {
    // Verificar bloqueo por EMAIL
    const checkEmail = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "api-key": BREVO_API_KEY },
    });

    if (checkEmail.status === 200) {
      const contactData = await checkEmail.json();
      console.log("Check email - attributes:", JSON.stringify(contactData.attributes));
      if (contactData.attributes?.BOT_USADO === true || contactData.attributes?.BOT_USADO === "true" || contactData.attributes?.BOT_USADO === 1) {
        return res.status(200).json({ bloqueado: true, motivo: 'email' });
      }
    }

    // Verificar bloqueo por IP
    if (ip !== 'unknown') {
      const checkIp = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(ipKey)}`, {
        method: "GET",
        headers: { "api-key": BREVO_API_KEY },
      });
      if (checkIp.status === 200) {
        const ipData = await checkIp.json();
        console.log("Check IP - attributes:", JSON.stringify(ipData.attributes));
        if (ipData.attributes?.BOT_USADO === true || ipData.attributes?.BOT_USADO === "true" || ipData.attributes?.BOT_USADO === 1) {
          return res.status(200).json({ bloqueado: true, motivo: 'ip' });
        }
      }
    }

    return res.status(200).json({ bloqueado: false });

  } catch (error) {
    console.error("Error verificando bloqueo:", error.message);
    // En caso de error de conexion con Brevo, NO bloqueamos (mejor dejar pasar que romper la experiencia)
    return res.status(200).json({ bloqueado: false });
  }
}
