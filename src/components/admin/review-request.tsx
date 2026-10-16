"use client";

import { useState } from "react";

/** Sends the customer their private review link on WhatsApp (or copies it). */
export function ReviewRequest({ bookingId, phone, name, vehicle }: { bookingId: string; phone: string; name: string; vehicle: string }) {
  const [copied, setCopied] = useState(false);
  const link = () => `${window.location.origin}/review/${bookingId}`;
  const firstName = name.trim().split(" ")[0];

  function whatsapp() {
    const text = `Hi ${firstName}, thanks for renting the ${vehicle} from Ramesh Rentals! Could you rate your trip? It takes 30 seconds: ${link()}`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  async function copy() {
    await navigator.clipboard.writeText(link());
    setCopied(true);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={whatsapp} className="rounded-full bg-[#25D366] px-3.5 py-1.5 text-xs font-semibold text-white">
        Ask for review
      </button>
      <button type="button" onClick={copy} className="rounded-full border border-hairline px-3.5 py-1.5 text-xs font-semibold">
        {copied ? "Link copied" : "Copy review link"}
      </button>
    </div>
  );
}
