// Este archivo va en: pages/api/suscribir.js
// Se encarga de registrar cada email nuevo en la lista de Brevo "LECTORES BOT ANTIANHELO" (ID 3)
// La API Key se lee de una variable de entorno, nunca queda expuesta en el navegador.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, nombre } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: "Email inválido" });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = 3; // Lista "LECTORES BOT ANTIANHELO"

  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY no configurada en variables de entorno");
    return res.status(500).json({ error: "Configuración de Brevo incompleta" });
  }

  try {
    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          NOMBRE: nombre || "",
        },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true, // si el contacto ya existe, actualiza en lugar de fallar
      }),
    });

    // Brevo devuelve 204 (sin contenido) en éxito, o 201 si es nuevo contacto
    if (brevoRes.status === 204 || brevoRes.status === 201) {
      return res.status(200).json({ ok: true });
    }

    const brevoData = await brevoRes.json().catch(() => ({}));

    // Si el contacto ya existía y solo se actualizó, Brevo puede devolver 400 con "Contact already exist"
    // En ese caso lo tratamos como éxito, no como error real
    if (brevoRes.status === 400 && brevoData.code === "duplicate_parameter") {
      return res.status(200).json({ ok: true, nota: "contacto ya existente, actualizado" });
    }

    console.error("Error de Brevo:", brevoRes.status, brevoData);
    return res.status(500).json({ error: "No se pudo registrar el email" });

  } catch (error) {
    console.error("Error conectando con Brevo:", error.message);
    return res.status(500).json({ error: "Error de conexión con Brevo" });
  }
}
