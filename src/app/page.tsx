"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Home() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authResponse, setAuthResponse] = useState<any>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // TanStack Query for users list
  const { data: users = [], isLoading: loadingUsers, refetch: fetchUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.api.users.$get();
      if (!res.ok) {
        const json = await res.json() as any;
        throw new Error(json.error?.message || "Failed to load users");
      }
      const json = await res.json();
      return json.data;
    },
  });

  // TanStack Mutation for adding user
  const addUserMutation = useMutation({
    mutationFn: async (newUser: { name: string; email: string }) => {
      const res = await api.api.users.$post({
        json: newUser,
      });
      const json = await res.json() as any;
      if (!res.ok) {
        throw new Error(json.error?.message || json.issues?.[0]?.message || "Failed to create user");
      }
      return json.data;
    },
    onSuccess: (newUser) => {
      setSuccessMessage(`User "${newUser.name}" added successfully!`);
      setName("");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      setError(err.message || "Request failed");
    },
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    addUserMutation.mutate({ name, email });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthResponse(null);
    setAuthLoading(true);
    
    try {
      const res = await api.api.auth.login.$post({
        json: { email: authEmail, password: authPassword },
      });
      const json = await res.json();
      setAuthResponse({ status: res.status, data: json });
    } catch (err: any) {
      setAuthResponse({ error: err.message });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 pb-8 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                Backend Ready
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400">
              Reelio API Console
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Ultra-fast Hono API integration running inside Next.js on Cloudflare Edge.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl backdrop-blur-sm self-start">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">API Status: Online</span>
          </div>
        </header>

        {/* Info Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Framework</h3>
            <p className="text-lg font-bold text-slate-200 mt-1 flex items-center gap-1.5">
              <span>🔥 Hono v4</span>
              <span className="text-xs font-normal text-slate-500">via hono/vercel</span>
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Deployment Platform</h3>
            <p className="text-lg font-bold text-slate-200 mt-1">☁️ Cloudflare Pages</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Type Safety</h3>
            <p className="text-lg font-bold text-slate-200 mt-1">🛠️ End-to-End RPC</p>
          </div>
        </section>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Users Section (GET / POST) */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col">
            <div className="p-6 border-b border-slate-800/60">
              <h2 className="text-xl font-bold text-slate-100">User Management</h2>
              <p className="text-xs text-slate-400 mt-1">Interacts with GET and POST /api/users</p>
            </div>
            
            <div className="p-6 space-y-6 flex-grow">
              {/* Form to add user */}
              <form onSubmit={handleAddUser} className="space-y-4 bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-indigo-400">Add New User</h3>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addUserMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  {addUserMutation.isPending ? "Adding..." : "Add User"}
                </button>
              </form>

              {/* Status messages */}
              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-lg text-xs">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-lg text-xs">
                  {error}
                </div>
              )}

              {/* Users list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300">Active Users List</h3>
                  <button 
                    onClick={() => { fetchUsers(); }} 
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {loadingUsers ? (
                  <div className="text-center py-6 text-slate-500 text-sm">Loading users from API...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                    No users found
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/40 max-h-[220px] overflow-y-auto pr-1">
                    {users.map((u) => (
                      <div key={u.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-200">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          ID: {u.id}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Auth Tester Section */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col">
            <div className="p-6 border-b border-slate-800/60">
              <h2 className="text-xl font-bold text-slate-100">Auth Route Tester</h2>
              <p className="text-xs text-slate-400 mt-1">Interacts with POST /api/auth/login (Zod-validated)</p>
            </div>
            
            <div className="p-6 space-y-6 flex-grow flex flex-col">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="admin@reelio.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-lg shadow-purple-600/10 cursor-pointer"
                >
                  {authLoading ? "Logging in..." : "Run POST /api/auth/login"}
                </button>
              </form>

              {/* API Response Display */}
              <div className="flex-grow flex flex-col min-h-[160px]">
                <h3 className="text-xs font-semibold text-slate-400 mb-2">API JSON Response</h3>
                <div className="flex-grow bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs overflow-auto max-h-[220px]">
                  {authResponse ? (
                    <pre className="text-emerald-400">
                      {JSON.stringify(authResponse, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-slate-600 italic">Submit credentials above to view API response. Try invalid formats to test validation errors.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Code Snippet RPC documentation */}
        <section className="bg-slate-900/20 border border-slate-800/40 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-2">How it works: Type-Safe RPC</h3>
          <p className="text-sm text-slate-400 mb-4">
            Hono shares TypeScript types directly with the client SDK. This eliminates the need for manual API clients, fetch paths, or Swagger specs.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed">
{`// 1. In your backend router (src/server/routes/users.ts)
const usersApp = new Hono<HonoEnv>()
  .get("/", (c) => c.json({ success: true, data: mockUsers }))
  .post("/", zValidator("json", schema), (c) => { ... });

export type AppType = typeof usersApp;

// 2. In your frontend client (src/lib/api-client.ts)
import { hc } from "hono/client";
import { AppType } from "@/server";
export const api = hc<AppType>("/");

// 3. Fully typed call with autocomplete
const res = await api.users.$get();
const json = await res.json(); // Typed structure!`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
