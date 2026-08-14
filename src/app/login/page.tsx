"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "flex-1 rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    setIsLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("otp");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: "sms",
    });
    setIsLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/bookings");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface-raised p-7 shadow-soft">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] font-display text-lg font-bold text-white shadow-soft">
          R
        </span>
        <h1 className="font-display text-2xl font-bold">Log in</h1>
        <p className="mb-6 mt-1 text-sm text-ink-soft">
          We&apos;ll text you a one-time code — no password needed.
        </p>

        {step === "phone" ? (
          <form onSubmit={sendOtp} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Phone number
              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-ink-soft">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="\d{10}"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  required
                  className={inputClass}
                />
              </div>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-4 py-3 font-display font-semibold text-white shadow-soft transition-all hover:shadow-brand disabled:opacity-60 active:scale-[0.98]"
            >
              {isLoading ? "Sending code…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Enter the 6-digit code sent to +91{phone}
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                required
                className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm tracking-widest outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-4 py-3 font-display font-semibold text-white shadow-soft transition-all hover:shadow-brand disabled:opacity-60 active:scale-[0.98]"
            >
              {isLoading ? "Verifying…" : "Verify & log in"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="text-sm text-ink-soft hover:underline"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
