// Este archivo va en: pages/api/suscribir.js
// Version completa con bloqueo por email, registro en Brevo y email de bienvenida impactante

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, nombre } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: "Email invalido" });

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = 3;
  if (!BREVO_API_KEY) return res.status(500).json({ error: "Configuracion incompleta" });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

  try {
    // Verificar si el email ya existe y ya uso el bot
    const checkEmail = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "api-key": BREVO_API_KEY },
    });

    if (checkEmail.status === 200) {
      const contactData = await checkEmail.json();
      if (contactData.attributes?.BOT_USADO === true) {
        return res.status(200).json({ ok: false, bloqueado: true });
      }
    }

    // Registrar en Brevo
    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
      body: JSON.stringify({
        email: email,
        attributes: { NOMBRE: nombre || "", BOT_USADO: true, IP_BOT: ip },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    if (brevoRes.status === 400) {
      const errData = await brevoRes.json().catch(() => ({}));
      if (errData.code === "duplicate_parameter") {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
          body: JSON.stringify({
            attributes: { BOT_USADO: true, IP_BOT: ip },
            listIds: [BREVO_LIST_ID],
          }),
        });
      }
    }

    // Email de bienvenida
    const nombreDisplay = nombre || "tu";
    const emailHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CAUSA &amp; EFECTO</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0d0d0d;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

  <tr><td style="background-color:#C9A84C;height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td style="background-color:#0d0d0d;padding:30px 40px 20px 40px;text-align:center;">
    <p style="margin:0;color:#C9A84C;font-size:11px;letter-spacing:3px;text-transform:uppercase;">RAUL M. CANOVAS - METODO CAUSA &amp; EFECTO</p>
    <p style="margin:8px 0 0 0;color:#f5f4f0;font-size:28px;font-weight:bold;letter-spacing:2px;">CAUSA <span style="color:#C9A84C;">&amp;</span> EFECTO</p>
  </td></tr>

  <tr><td style="padding:0 40px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #C9A84C;font-size:0;">&nbsp;</td></tr></table></td></tr>

  <tr><td style="background-color:#0d0d0d;padding:30px 40px 10px 40px;text-align:center;">
    <p style="margin:0;color:#888;font-size:13px;letter-spacing:1px;">Tu diagnostico ha sido procesado.</p>
    <p style="margin:12px 0 0 0;color:#f5f4f0;font-size:22px;font-weight:bold;line-height:1.3;">Lo que acabas de descubrir sobre ti<br>es solo la superficie.</p>
  </td></tr>

  <tr><td style="padding:25px 40px 10px 40px;">
    <a href="https://www.amazon.es/dp/B0H5FS71XT" target="_blank" style="display:block;">
      <img src="https://bot-anti-anhelo.vercel.app/img-suenos.jpeg" alt="Aqui descansan los suenos que la gente dejo para manana" width="520" style="width:100%;max-width:520px;display:block;border:0;border-radius:4px;" />
    </a>
  </td></tr>

  <tr><td style="background-color:#111;padding:30px 40px;text-align:center;">
    <p style="margin:0;color:#C9A84C;font-size:12px;letter-spacing:2px;text-transform:uppercase;">La pregunta que nadie se hace</p>
    <p style="margin:16px 0 0 0;color:#f5f4f0;font-size:20px;font-weight:bold;line-height:1.5;">Si dentro de un ano sigues igual,<br>que habra decidido por ti?</p>
    <p style="margin:16px 0 0 0;color:#aaa;font-size:14px;line-height:1.8;">El diagnostico que acabas de recibir no es un analisis. Es un espejo. Lo que viste ahi lleva tiempo funcionando en silencio, gobernando tus decisiones sin que tu lo eligieras.</p>
    <p style="margin:16px 0 0 0;color:#f5f4f0;font-size:15px;line-height:1.8;font-style:italic;">El problema nunca fue la falta de informacion. Fue la ausencia de un sistema que funcione incluso cuando no tienes ganas.</p>
  </td></tr>

  <tr><td style="padding:10px 40px;">
    <a href="https://www.amazon.es/dp/B0H5FS71XT" target="_blank" style="display:block;">
      <img src="https://bot-anti-anhelo.vercel.app/img-espejo.jpeg" alt="La persona que quieres ser te esta esperando" width="520" style="width:100%;max-width:520px;display:block;border:0;border-radius:4px;" />
    </a>
  </td></tr>

  <tr><td style="background-color:#111;padding:30px 40px;text-align:center;">
    <p style="margin:0;color:#C9A84C;font-size:12px;letter-spacing:2px;text-transform:uppercase;">27 pasos. Sin filtros. Sin excusas.</p>
    <p style="margin:16px 0 0 0;color:#f5f4f0;font-size:20px;font-weight:bold;line-height:1.5;">El metodo completo esta en el libro.</p>
    <p style="margin:16px 0 0 0;color:#aaa;font-size:14px;line-height:1.8;">No es autoayuda generica. No es motivacion que dura tres dias. Es un sistema de 27 pasos organizado en 8 bloques que trabajan exactamente los patrones que tu diagnostico ha identificado. Cada capitulo es una herramienta concreta.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr><td style="padding:8px 0;color:#f5f4f0;font-size:14px;text-align:left;"><span style="color:#C9A84C;font-weight:bold;">&#10003;</span>&nbsp;&nbsp;Recupera tu paz mental sin depender de la motivacion</td></tr>
      <tr><td style="padding:8px 0;color:#f5f4f0;font-size:14px;text-align:left;"><span style="color:#C9A84C;font-weight:bold;">&#10003;</span>&nbsp;&nbsp;Domina tu tiempo aunque trabajes para otra persona</td></tr>
      <tr><td style="padding:8px 0;color:#f5f4f0;font-size:14px;text-align:left;"><span style="color:#C9A84C;font-weight:bold;">&#10003;</span>&nbsp;&nbsp;Rompe el ciclo de intento y recaida de una vez por todas</td></tr>
      <tr><td style="padding:8px 0;color:#f5f4f0;font-size:14px;text-align:left;"><span style="color:#C9A84C;font-weight:bold;">&#10003;</span>&nbsp;&nbsp;Construye la version de ti que llevas anos aplazando</td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:10px 40px;">
    <a href="https://www.amazon.es/dp/B0H5FS71XT" target="_blank" style="display:block;">
      <img src="https://bot-anti-anhelo.vercel.app/img-libro.jpeg" alt="Deja de reaccionar. Empieza a crear la vida que mereces." width="520" style="width:100%;max-width:520px;display:block;border:0;border-radius:4px;" />
    </a>
  </td></tr>

  <tr><td style="background-color:#0d0d0d;padding:30px 40px 20px 40px;text-align:center;">
    <p style="margin:0 0 20px 0;color:#f5f4f0;font-size:16px;font-weight:bold;">El mapa ya lo tienes. El camino empieza aqui.</p>
    <a href="https://www.amazon.es/dp/B0H5FS71XT" target="_blank" style="display:inline-block;background-color:#C9A84C;color:#0d0d0d;font-size:16px;font-weight:bold;text-decoration:none;padding:18px 40px;border-radius:3px;letter-spacing:1px;text-transform:uppercase;">REGALATE EL CAMBIO</a>
    <p style="margin:12px 0 0 0;color:#666;font-size:12px;">CAUSA &amp; EFECTO - Disponible en Amazon (eBook y tapa blanda)</p>
  </td></tr>

  <tr><td style="padding:0 40px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #333;font-size:0;">&nbsp;</td></tr></table></td></tr>

  <tr><td style="background-color:#0d0d0d;padding:25px 40px;text-align:center;">
    <p style="margin:0;color:#C9A84C;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Contenido sin filtros cada semana</p>
    <p style="margin:10px 0;color:#aaa;font-size:13px;line-height:1.7;">Estrategias reales, sin autoayuda de pacotilla, para que empieces a tomar el control de tu mente, tu tiempo y tu vida.</p>
    <a href="https://www.instagram.com/raulm.canovas" target="_blank" style="display:inline-block;background-color:#1a1a1a;color:#C9A84C;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 35px;border-radius:3px;border:1px solid #C9A84C;letter-spacing:1px;">@raulm.canovas</a>
  </td></tr>

  <tr><td style="background-color:#C9A84C;height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td style="background-color:#0d0d0d;padding:20px 40px;text-align:center;">
    <p style="margin:0;color:#444;font-size:11px;">RAUL M. CANOVAS - CAUSA &amp; EFECTO - Todos los derechos reservados</p>
    <p style="margin:6px 0 0 0;color:#333;font-size:10px;">Recibiste este email porque completaste el diagnostico del Bot Anti-Anhelo.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: "Raul M. Canovas - CAUSA & EFECTO", email: "raulmonteagudocanovas@gmail.com" },
        to: [{ email: email, name: nombreDisplay }],
        subject: `${nombreDisplay}, lo que viste en tu diagnostico es solo la superficie.`,
        htmlContent: emailHtml,
      }),
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Error: " + error.message });
  }
}
