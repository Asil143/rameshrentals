"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <div className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        We&apos;ll text you a one-time code — no password needed.
      </p>

      {step === "phone" ? (
        <form onSubmit={sendOtp} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Phone number
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10">
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
                className="flex-1 rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black"
              />
            </div>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isLoading ? "Sending code…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Enter the 6-digit code sent to +91{phone}
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              required
              className="rounded-lg border border-black/10 px-3 py-2 tracking-widest dark:border-white/10 dark:bg-black"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isLoading ? "Verifying…" : "Verify & log in"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="text-sm text-black/60 hover:underline dark:text-white/60"
          >
            Change phone number
          </button>
        </form>
      )}
    </div>
  );
}
