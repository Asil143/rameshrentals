/** A UPI deep link (upi://pay) that any UPI app opens with the amount and note filled in. */
export function upiPaymentUri({ upiId, payee, amount, note }: { upiId: string; payee: string; amount: number; note: string }) {
  const params: [string, string][] = [
    ["pa", upiId],
    ["pn", payee],
    ["am", amount.toFixed(2)],
    ["cu", "INR"],
    ["tn", note],
  ];
  return `upi://pay?${params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")}`;
}
