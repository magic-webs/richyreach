"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockAuth } from "../layout-shell";
import { api } from "@/lib/api-client";

export default function AuthPage() {
  const router = useRouter();
  const { switchRole, updateUser } = useMockAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"influencer" | "brand" | "admin">("influencer");

  // Sign In States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up States
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Status Displays
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoginLoading(true);

    try {
      const res = await api.api.auth.login.$post({
        json: {
          email: loginEmail,
          password: loginPassword,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Authentication failed");
      }

      // Success: Save details and navigate
      setSuccessMsg("Logged in successfully! Redirecting...");
      const returnedUser = json.data.user;
      
      switchRole(returnedUser.role || "influencer");
      updateUser({
        name: returnedUser.name,
        email: returnedUser.email,
        id: returnedUser.id,
      });

      setTimeout(() => {
        router.push(returnedUser.role === "brand" ? "/brand/dashboard" : "/influencer/dashboard");
      }, 1000);
    } catch (err: any) {
      // Fallback for mock/dev testing if user account is not created in DB yet
      console.warn("Dev mode fallback trigger. Logging in mock user...");
      switchRole(role);
      updateUser({ name: "Demo User", email: loginEmail });
      setSuccessMsg(`[Demo Mode] Logged in successfully as ${role}! Redirecting...`);
      setTimeout(() => {
        router.push(role === "brand" ? "/brand/dashboard" : "/influencer/dashboard");
      }, 1000);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSignupLoading(true);

    try {
      const res = await api.api.auth.signup.$post({
        json: {
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: role,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Registration failed");
      }

      setSuccessMsg("Account registered successfully! Please log in.");
      setActiveTab("login");
      setLoginEmail(signupEmail);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            Welcome to Reelio
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Authenticate to sync profiles and start collaborating.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-850 h-12 mb-6">
              <TabsTrigger value="login" className="rounded-lg font-bold text-xs uppercase cursor-pointer">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg font-bold text-xs uppercase cursor-pointer">
                Register
              </TabsTrigger>
            </TabsList>

            {/* Status indicators */}
            {successMsg && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold text-center">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-300 text-xs font-bold">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    placeholder="user@reelio.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-300 text-xs font-bold">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-bold">Sandbox Role Type (If demo logging)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["influencer", "brand", "admin"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`text-xs py-2 rounded-lg font-bold border capitalize cursor-pointer transition-all ${
                          role === r 
                            ? "bg-indigo-650 border-indigo-500 text-white shadow-md shadow-indigo-600/10" 
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-xl font-bold cursor-pointer"
                >
                  {loginLoading ? "Authenticating..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-300 text-xs font-bold">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="bg-slate-950 border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-300 text-xs font-bold">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-300 text-xs font-bold">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-bold">Select Role Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("influencer")}
                      className={`text-xs py-2.5 rounded-xl font-bold border capitalize cursor-pointer transition-colors ${
                        role === "influencer" 
                          ? "bg-indigo-650 border-indigo-500 text-white shadow-md shadow-indigo-600/10" 
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Influencer (Creator)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("brand")}
                      className={`text-xs py-2.5 rounded-xl font-bold border capitalize cursor-pointer transition-colors ${
                        role === "brand" 
                          ? "bg-indigo-650 border-indigo-500 text-white shadow-md shadow-indigo-600/10" 
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Brand (Advertiser)
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-xl font-bold cursor-pointer"
                >
                  {signupLoading ? "Creating account..." : "Register Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="bg-slate-950 border-t border-slate-850 p-6 flex flex-col gap-3">
          <div className="relative w-full flex items-center justify-center">
            <hr className="w-full border-slate-800/80" />
            <span className="absolute bg-slate-950 px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Or Social Login
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => {
                switchRole("influencer");
                setSuccessMsg("[Mock OAuth] Connected via Google. Redirecting...");
                setTimeout(() => router.push("/influencer/dashboard"), 1000);
              }}
              className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
            >
              <span>Google</span>
            </button>
            <button
              onClick={() => {
                switchRole("influencer");
                setSuccessMsg("[Mock OAuth] Connected via Instagram. Redirecting...");
                setTimeout(() => router.push("/influencer/dashboard"), 1000);
              }}
              className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
            >
              <span>Instagram</span>
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
