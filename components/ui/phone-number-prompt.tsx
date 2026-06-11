"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export function PhoneNumberPrompt() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNo, setPhoneNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user && session.user.role === "adventurer") {
      fetch("/api/user/onboarding")
        .then((res) => res.json())
        .then((data) => {
          // If onboarding is completed but they don't have a phone number
          if (data.onboardingCompleted === true && data.hasPhoneNumber === false) {
            setIsOpen(true);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!countryCode.startsWith("+") || countryCode.length < 2) {
      toast.error("Please enter a valid country code (e.g. +91)");
      return;
    }
    if (!phoneNo || phoneNo.length < 8) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const phoneNumber = `${countryCode}${phoneNo}`;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/phone-number", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save phone number");

      toast.success("Phone number saved!");
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Add WhatsApp Number</h3>
            <p className="text-sm text-slate-500">Required for Quest updates and standups.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="flex gap-2">
            <div className="w-24 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Code</label>
              <input
                type="text"
                required
                placeholder="+91"
                value={countryCode}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val && !val.startsWith('+')) {
                    val = '+' + val;
                  }
                  setCountryCode(val);
                }}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 text-sm placeholder-slate-400 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 transition-all shadow-sm"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, ""))}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 text-sm placeholder-slate-400 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 transition-all shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || phoneNo.length < 8}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 border border-orange-500/50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Save Number"}
          </button>
        </form>
      </div>
    </div>
  );
}
