"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMockAuth } from "../layout-shell";
import { api } from "@/lib/api-client";
import { createAuthClient } from "better-auth/react";

//Icons
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const InstagramIcon = ({ size = 18, colored = false }: { size?: number; colored?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "url(#ig-grad-auth)" : "currentColor"}>
    {colored && (
      <defs>
        <linearGradient id="ig-grad-auth" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
    )}
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

//Main
export default function AuthPage() {
  const router = useRouter();
  const { switchRole, updateUser } = useMockAuth();
  const authClient = createAuthClient()
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"influencer" | "brand" | "admin">("influencer");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const r = p.get("role") as "brand" | "influencer" | null;
      if (r === "brand" || r === "influencer") setRole(r);
    }
  }, []);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPwd, setShowSignupPwd] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "instagram" | null>(null);

  const clear = () => { setErrorMsg(null); setSuccessMsg(null); };

  const redirect = (r: string) => {
    if (r === "brand") router.push("/brand/dashboard");
    else if (r === "admin") router.push("/admin/dashboard");
    else router.push("/influencer/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); clear(); setLoginLoading(true);
    try {
      const res = await authClient.signIn.email({
        email: loginEmail,
        password: loginPassword,
      });
      if (res.error) {
        setErrorMsg("Invalid email or password");
      }
      else {
        setSuccessMsg("Logged in! Redirecting...");
        switchRole(role);
        updateUser({ name: res.data.user.name, email: res.data.user.email, id: res.data.user.id });
        setTimeout(() => redirect(role), 900);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
    } finally { setLoginLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); clear(); setSignupLoading(true);
    try {
      const res = await authClient.signUp.email({
        email: signupEmail,
        password: signupPassword,
        name: signupName
      });
      if (res.error) {
        setErrorMsg("Failed to create account");
      }
      else {
        setSuccessMsg("Account created! Please sign in.");
        setActiveTab("login");
        setLoginEmail(signupEmail);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account");
    } finally { setSignupLoading(false); }
  };

  const handleGoogle = async () => {
    const data = await authClient.signIn.social({
      provider: "google",
    });
    if (data.error) {
      setErrorMsg("Error loggin in with google");
    }
    else {
      setSuccessMsg("Logged in! Redirecting...");
    }
  };

  const handleInstagram = async () => {
    const data = await authClient.signIn.social({
      provider: "instagram",
    });
    if (data.error) {
      setErrorMsg("Error loggin in with instagram");
    }
    else {
      setSuccessMsg("Logged in! Redirecting...");
    }
  };

  const isInfluencer = role === "influencer";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-8 transition-colors duration-300">

      {/* Subtle background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-950/60 rounded-full blur-[120px] opacity-70 dark:opacity-50" />
        <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-violet-100 dark:bg-violet-950/50 rounded-full blur-[120px] opacity-70 dark:opacity-40" />
      </div>

      {/* Logo */}
      <a href="/" className="flex items-center gap-2.5 mb-8 no-underline group">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xl shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
          R
        </span>
        <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          Reelio
        </span>
      </a>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/80 dark:shadow-black/40 border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-7 pb-0">

          {/* Role Switcher */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl mb-6">
            {(["influencer", "brand"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 capitalize ${role === r
                  ? r === "influencer"
                    ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md shadow-violet-500/20"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
              >
                {r === "influencer" ? "Influencer" : "Brand"}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700/60">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setActiveTab(t); clear(); }}
                className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-all -mb-px border-b-2 ${activeTab === t
                  ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                  : "text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-5">

          {/* Status messages */}
          {successMsg && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-semibold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {errorMsg}
            </div>
          )}

          {/* ── LOGIN ── */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Email Address" htmlFor="auth-email">
                <AuthInput id="auth-email" type="email" required placeholder="you@reelio.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              </Field>

              <Field label="Password" htmlFor="auth-pwd">
                <PwdInput id="auth-pwd" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} show={showLoginPwd} onToggle={() => setShowLoginPwd(v => !v)} placeholder="••••••••" />
              </Field>
              <SubmitBtn loading={loginLoading} label="Sign In" loadingLabel="Authenticating..." accent="indigo" />
            </form>
          )}

          {/* ── SIGNUP ── */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <Field label="Full Name" htmlFor="auth-name">
                <AuthInput id="auth-name" type="text" required placeholder="John Doe" value={signupName} onChange={e => setSignupName(e.target.value)} />
              </Field>
              <Field label="Email Address" htmlFor="auth-semail">
                <AuthInput id="auth-semail" type="email" required placeholder="email@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
              </Field>
              <Field label="Password" htmlFor="auth-spwd">
                <PwdInput id="auth-spwd" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} show={showSignupPwd} onToggle={() => setShowSignupPwd(v => !v)} placeholder="Min. 8 characters" />
              </Field>
              <SubmitBtn loading={signupLoading} label="Create Account" loadingLabel="Creating account..." accent={isInfluencer ? "violet" : "indigo"} />
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
          </div>

          {/* OAuth */}
          <div className="space-y-2.5">
            <SocialBtn
              icon={<GoogleIcon />}
              label="Continue with Google"
              loading={oauthLoading === "google"}
              onClick={handleGoogle}
              hoverClass="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/30 dark:hover:border-blue-700/50"
            />

            <SocialBtn
              icon={<InstagramIcon size={18} colored />}
              label={isInfluencer ? "Import via Instagram" : "Connect Instagram"}
              loading={oauthLoading === "instagram"}
              onClick={handleInstagram}
              hoverClass="hover:bg-pink-50 hover:border-pink-200 dark:hover:bg-pink-950/30 dark:hover:border-pink-700/50"
              badge={isInfluencer ? "Recommended" : undefined}
            />
          </div>

          {/* Influencer hint */}
          {isInfluencer && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50">
              <InstagramIcon size={14} colored />
              <p className="text-[11px] text-violet-700 dark:text-violet-300 leading-relaxed">
                <strong>Influencer import</strong> syncs your Instagram profile, follower count, engagement metrics, and niche categories automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-slate-400 dark:text-slate-600 text-center">
        By continuing you agree to Reelio&apos;s{" "}
        <a href="#" className="text-slate-500 dark:text-slate-500 underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</a>
        {" & "}
        <a href="#" className="text-slate-500 dark:text-slate-500 underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a>.
      </p>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function AuthInput({ id, type, required, placeholder, value, onChange }: {
  id: string; type: string; required?: boolean; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      id={id} type={type} required={required} placeholder={placeholder} value={value} onChange={onChange}
      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
    />
  );
}

function PwdInput({ id, value, onChange, show, onToggle, placeholder }: {
  id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean; onToggle: () => void; placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        id={id} type={show ? "text" : "password"} required placeholder={placeholder} value={value} onChange={onChange}
        className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
      />
      <button
        type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel, accent }: {
  loading: boolean; label: string; loadingLabel: string; accent: "indigo" | "violet";
}) {
  const base = accent === "violet"
    ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-violet-500/25 hover:shadow-violet-500/40"
    : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/25 hover:shadow-indigo-500/40";
  return (
    <button
      type="submit" disabled={loading}
      className={`w-full py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${base}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : label}
    </button>
  );
}

function SocialBtn({ icon, label, loading, onClick, hoverClass, badge }: {
  icon: React.ReactNode; label: string; loading: boolean; onClick: () => void;
  hoverClass: string; badge?: string;
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={loading}
      className={`relative w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${hoverClass}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
      ) : icon}
      <span>{label}</span>
      {badge && !loading && (
        <span className="absolute right-3 top-1 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
    </button>
  );
}
