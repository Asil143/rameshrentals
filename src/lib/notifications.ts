import "server-only";

export async function sendBookingWhatsApp(phone: string, template: string, values: string[]) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return { configured: false as const };
  const endpoint = process.env.WHATSAPP_GRAPH_API_URL ?? `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: `91${phone}`,
        type: "template",
        template: { name: template, language: { code: "en" }, components: [{ type: "body", parameters: values.map((text) => ({ type: "text", text })) }] },
      }),
    });
    if (!response.ok) console.error("WhatsApp notification failed", { status: response.status });
    return { configured: true as const, ok: response.ok };
  } catch (error) {
    console.error("WhatsApp notification failed", { error: error instanceof Error ? error.message : "unknown" });
    return { configured: true as const, ok: false };
  }
}
