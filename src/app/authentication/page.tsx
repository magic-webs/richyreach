"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMockAuth } from "../layout-shell";

// ──────────────────────────────────────────────────────────────
// Icons
// ──────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

// ──────────────────────────────────────────────────────────────
// Role-aware colour tokens
// ──────────────────────────────────────────────────────────────
// influencer → RichyReach crimson (primary #7E1523)
// brand      → violet/indigo (matches brand profile)
// admin      → slate dark
const ROLE_COLORS = {
  influencer: {
    // Active role pill
    pill: "bg-gradient-to-r from-[#3F030B] to-[#7E1523] text-white shadow-md",
    // Tab active underline
    tab: "text-[#7E1523] dark:text-rose-400 border-[#7E1523] dark:border-rose-400",
    // Submit button — matches btn-glass-purple (red glassmorphic)
    btn: "bg-gradient-to-r from-[#3F030B] to-[#7E1523] hover:from-[#7E1523] hover:to-rose-600 shadow-[#7E1523]/30",
    // Input focus ring
    focusRing: "focus:border-[#7E1523] focus:ring-[#7E1523]/10",
    // OTP cell focus
    otpFocus: "focus:border-[#7E1523] dark:focus:border-rose-400 focus:ring-[#7E1523]/10",
    // Resend / back link text
    link: "text-[#7E1523] dark:text-rose-400",
    // Footer link hover
    footerLink: "hover:text-[#7E1523]",
    // Background ambient blob gradient
    blob1: "bg-[#3F030B]/10 dark:bg-[#3F030B]/20",
    blob2: "bg-[#7E1523]/10 dark:bg-[#7E1523]/15",
  },
  brand: {
    pill: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md",
    tab: "text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400",
    btn: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/30",
    focusRing: "focus:border-violet-500 focus:ring-violet-500/10",
    otpFocus: "focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500/10",
    link: "text-violet-600 dark:text-violet-400",
    footerLink: "hover:text-violet-600",
    blob1: "bg-violet-500/10 dark:bg-violet-500/15",
    blob2: "bg-indigo-500/10 dark:bg-indigo-500/10",
  },
  admin: {
    pill: "bg-slate-800 dark:bg-slate-700 text-white shadow-md",
    tab: "text-slate-700 dark:text-slate-300 border-slate-700 dark:border-slate-300",
    btn: "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 shadow-slate-700/30",
    focusRing: "focus:border-slate-500 focus:ring-slate-500/10",
    otpFocus: "focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500/10",
    link: "text-slate-600 dark:text-slate-400",
    footerLink: "hover:text-slate-600",
    blob1: "bg-slate-500/10 dark:bg-slate-500/15",
    blob2: "bg-slate-600/10 dark:bg-slate-600/10",
  },
} as const;

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter();
  const { switchRole, updateUser } = useMockAuth();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [authMethod, setAuthMethod] = useState<"email" | "whatsapp">("email");
  const [role, setRole] = useState<"influencer" | "brand" | "admin">("influencer");

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");

  const [step, setStep] = useState<"request" | "verify">("request");
  const [otpCodes, setOtpCodes] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync role from ?role= query param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("role") as "brand" | "influencer" | "admin" | null;
      if (queryRole === "brand" || queryRole === "influencer" || queryRole === "admin") {
        setRole(queryRole);
      }
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const clearAlerts = () => { setErrorMsg(null); setSuccessMsg(null); };

  // Derive current colour set
  const colors = ROLE_COLORS[role];

  // ── OTP Request ────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);
    if (!identifier.trim()) {
      setErrorMsg("Please enter your email or phone number.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), method: authMethod }),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.message || "Failed to send verification code.");
      setSuccessMsg(`Verification code sent to your ${authMethod === "email" ? "email address" : "WhatsApp number"}.`);
      setStep("verify");
      setTimer(59);
      setTimeout(() => { if (otpRefs.current[0]) otpRefs.current[0].focus(); }, 200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to deliver verification code. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Verify ─────────────────────────────────────────────
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearAlerts();
    setLoading(true);
    const code = otpCodes.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      setLoading(false);
      return;
    }
    try {
      const payload: Record<string, any> = { identifier: identifier.trim(), code };
      if (activeTab === "signup") { payload.role = role; payload.name = name.trim() || undefined; }
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.message || "Invalid or expired verification code.");
      setSuccessMsg("Verification successful! Authenticating session...");
      localStorage.setItem("reelio_session_token", data.data.token);
      switchRole(data.data.user.role);
      updateUser({
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
        avatar: data.data.user.image,
      });
      setTimeout(() => {
        if (data.data.user.role === "brand") router.push("/brand/dashboard");
        else if (data.data.user.role === "admin") router.push("/admin/dashboard");
        else router.push("/influencer/dashboard");
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Cell Handlers ──────────────────────────────────────
  const handleOtpChange = (val: string, index: number) => {
    const numericVal = val.replace(/[^0-9]/g, "");
    const updated = [...otpCodes];
    if (!numericVal) { updated[index] = ""; setOtpCodes(updated); return; }
    updated[index] = numericVal[0];
    setOtpCodes(updated);
    if (index < 5 && otpRefs.current[index + 1]) otpRefs.current[index + 1]?.focus();
    if (index === 5 && updated.every(c => c !== "")) setTimeout(() => handleVerifyOtp(), 100);
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const updated = [...otpCodes];
      if (!otpCodes[index] && index > 0 && otpRefs.current[index - 1]) {
        updated[index - 1] = ""; setOtpCodes(updated); otpRefs.current[index - 1]?.focus();
      } else { updated[index] = ""; setOtpCodes(updated); }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "");
    if (pastedData.length === 6) {
      setOtpCodes(pastedData.split(""));
      if (otpRefs.current[5]) otpRefs.current[5]?.focus();
    }
  };

  // ── Shared input class (role-aware focus ring) ─────────────
  const inputClass = `w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 transition-all font-semibold ${colors.focusRing}`;

  // ── Primary action button (role + auth-method aware) ───────
  // WhatsApp always gets green regardless of role
  const btnClass = `w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${authMethod === "whatsapp" ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/20" : colors.btn}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-8 transition-colors duration-300">

      {/* Ambient blobs — role-coloured */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[130px] opacity-70 dark:opacity-40 transition-all duration-700 ${colors.blob1}`} />
        <div className={`absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full blur-[130px] opacity-70 dark:opacity-30 transition-all duration-700 ${colors.blob2}`} />
      </div>

      {/* Logo */}
      <a href="/" className="flex items-center gap-2.5 mb-8 no-underline group">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3F030B] to-[#7E1523] text-white font-bold text-2xl shadow-xl shadow-[#3F030B]/25 group-hover:shadow-[#3F030B]/40 transition-all font-serif-brand">
          RR
        </span>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3F030B] to-[#7E1523] dark:from-white dark:to-slate-300 font-serif-brand tracking-tight">
          Richy Reach
        </span>
      </a>

      {/* Auth Card */}
      <div className="w-full max-w-[440px] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800/80 overflow-hidden">

        <div className="px-8 pt-8">
          {step === "request" ? (
            <>
              {/* ── Role Selector ── */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-6">
                {(["influencer", "brand", "admin"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    id={`role-tab-${r}`}
                    onClick={() => { setRole(r); clearAlerts(); }}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${role === r ? ROLE_COLORS[r].pill : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
                  >
                    {r === "brand" ? "Brand" : r}
                  </button>
                ))}
              </div>

              {/* ── Login / Signup Tabs ── */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                {(["login", "signup"] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    id={`auth-tab-${t}`}
                    onClick={() => { setActiveTab(t); clearAlerts(); }}
                    className={`flex-1 pb-3 text-sm font-extrabold transition-all border-b-2 cursor-pointer ${activeTab === t ? colors.tab : "text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-350"}`}
                  >
                    {t === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              {/* ── Auth Method Selector ── */}
              <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl mb-2">
                <button
                  type="button"
                  id="auth-method-email"
                  onClick={() => { setAuthMethod("email"); clearAlerts(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${authMethod === "email" ? `bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50 ${colors.link}` : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"}`}
                >
                  <MailIcon />
                  Email OTP
                </button>
                <button
                  type="button"
                  id="auth-method-whatsapp"
                  onClick={() => { setAuthMethod("whatsapp"); clearAlerts(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${authMethod === "whatsapp" ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50 text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"}`}
                >
                  <WhatsAppIcon />
                  WhatsApp OTP
                </button>
              </div>
            </>
          ) : (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setStep("request")}
                className={`flex items-center gap-1.5 text-xs font-bold hover:underline cursor-pointer mb-4 ${colors.link}`}
              >
                ← Back to edit credentials
              </button>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Security Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter the 6-digit one-time code sent to{" "}
                <strong className="text-slate-800 dark:text-slate-200 font-bold">{identifier}</strong>
              </p>
            </div>
          )}
        </div>

        {/* ── Form Body ── */}
        <div className="px-8 pb-8 pt-4 space-y-5">

          {/* Alert banners */}
          {successMsg && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold animate-fadeIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fadeIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {errorMsg}
            </div>
          )}

          {/* ── Step 1: Request OTP ── */}
          {step === "request" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">

              {activeTab === "signup" && (
                <div className="space-y-1.5">
                  <label htmlFor="auth-name" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon /></span>
                    <input id="auth-name" type="text" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="auth-identifier" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {authMethod === "email" ? "Email Address" : "WhatsApp Number"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {authMethod === "email" ? <MailIcon /> : <WhatsAppIcon />}
                  </span>
                  <input
                    id="auth-identifier"
                    type={authMethod === "email" ? "email" : "tel"}
                    required
                    placeholder={authMethod === "email" ? "you@richyreach.com" : "+1 (555) 000-0000"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <button id="auth-submit-otp" type="submit" disabled={loading} className={btnClass}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP code...
                  </span>
                ) : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* ── Step 2: Verify OTP ── */}
          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">

              <div className="flex justify-between gap-2.5" onPaste={handleOtpPaste}>
                {otpCodes.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-cell-${idx}`}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className={`w-12 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 transition-all text-slate-900 dark:text-white ${colors.otpFocus}`}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <button id="auth-submit-verify" type="submit" disabled={loading} className={btnClass}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : activeTab === "login" ? "Sign In" : "Complete Registration"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    id="auth-resend-otp"
                    disabled={timer > 0 || loading}
                    onClick={handleRequestOtp}
                    className={`text-xs font-extrabold hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-colors ${colors.link}`}
                  >
                    {timer > 0 ? `Resend code in ${timer}s` : "Resend Verification Code"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-400 dark:text-slate-600 text-center">
        By authenticating you verify and agree to Richy Reach&apos;s{" "}
        <a href="#" className={`text-slate-500 underline transition-colors ${colors.footerLink}`}>Terms of Service</a>
        {" & "}
        <a href="#" className={`text-slate-500 underline transition-colors ${colors.footerLink}`}>Privacy Policy</a>.
      </p>
    </div>
  );
}
