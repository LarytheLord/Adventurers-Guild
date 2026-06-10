"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { SunIcon as Sunburst, Loader2, Building2, Sword } from "lucide-react";

const inputClass =
  "text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-orange-500 border-gray-300";
const labelClass = "block text-sm mb-2";

/* ─── Google icon SVG ────────────────────────────────────── */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.08 1.84 2.82 1.31 3.51 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.48-1.33-5.48-5.9 0-1.3.46-2.36 1.22-3.19-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.22a11.6 11.6 0 0 1 6 0c2.3-1.54 3.29-1.22 3.29-1.22.66 1.65.25 2.87.13 3.17.76.83 1.22 1.89 1.22 3.19 0 4.58-2.82 5.6-5.5 5.9.43.38.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

/* ─── OAuth sign-in buttons ─────────────────────────────── */
function OAuthSignInButton({
  provider,
  label,
  icon,
}: {
  provider: "google" | "github";
  label: string;
  icon: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleOAuthSignIn() {
    setIsLoading(true);
    try {
      const result = await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: true
      });
      if (result?.error) {
        toast.error(`OAuth error: ${result.error}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('OAuth sign-in error:', error);
      toast.error('Failed to sign in with ' + provider);
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleOAuthSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}

/* ─── Divider ────────────────────────────────────────────── */
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

/* ─── Login form ─────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user) router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "oauth-adventurer-only") {
      toast.error("Google and GitHub sign-in are available for adventurer accounts only.");
    }
    if (error === "oauth-email-required") {
      toast.error("Your OAuth provider did not share an email address. Please use email login instead.");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        if (result?.url) { window.location.assign(result.url); return; }
        router.replace("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <OAuthSignInButton
        provider="google"
        label="Continue with Google"
        icon={<GoogleIcon className="h-4 w-4" />}
      />
      <OAuthSignInButton
        provider="github"
        label="Continue with GitHub"
        icon={<GitHubIcon className="h-4 w-4" />}
      />
      <OrDivider />
    <form className="flex flex-col gap-4" onSubmit={handleLogin} noValidate>
      <div>
        <label htmlFor="email" className={labelClass}>Your email</label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          autoComplete="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="text-sm">Password</label>
          <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          id="password"
          autoComplete="current-password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </button>
      <div className="text-center text-gray-600 text-sm">
        No account?{" "}
        <Link href="/register" className="text-orange-500 font-medium underline">
          Join the Guild
        </Link>
      </div>
    </form>
    </div>
  );
}

function LoginFormWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

/* ─── Register form ──────────────────────────────────────── */
function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "company" ? "company" : "adventurer";
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<"adventurer" | "company">(defaultTab as "adventurer" | "company");

  const [aName, setAName] = useState("");
  const [aUsername, setAUsername] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aPassword, setAPassword] = useState("");

  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user) router.push("/dashboard");
  }, [status, session, router]);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    const role = tab;
    const email = role === "company" ? cEmail : aEmail;
    const password = role === "company" ? cPassword : aPassword;
    const name = role === "company" ? cName : aName;
    if (!email || !password || !name) return;
    if (role === "adventurer" && !aUsername) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, password, name, role,
          companyName: role === "company" ? cName : "",
          username: role === "adventurer" ? aUsername : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.details?.fieldErrors) {
          const firstMsg = Object.values(data.details.fieldErrors as Record<string, string[]>)[0]?.[0];
          if (firstMsg) throw new Error(firstMsg);
        }
        throw new Error(data.error || data.message || "Registration failed");
      }
      toast.success("Account created! Logging you in...");
      await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {tab === "adventurer" ? (
        <>
          <OAuthSignInButton
            provider="google"
            label="Continue with Google"
            icon={<GoogleIcon className="h-4 w-4" />}
          />
          <OAuthSignInButton
            provider="github"
            label="Continue with GitHub"
            icon={<GitHubIcon className="h-4 w-4" />}
          />
          <OrDivider />
        </>
      ) : null}
    <form className="flex flex-col gap-4" onSubmit={register} noValidate>
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-1">
        <button
          type="button"
          onClick={() => setTab("adventurer")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
            tab === "adventurer" ? "bg-orange-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Sword className="h-3.5 w-3.5" /> Adventurer
        </button>
        <button
          type="button"
          onClick={() => setTab("company")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
            tab === "company" ? "bg-orange-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" /> Company
        </button>
      </div>

      {tab === "adventurer" ? (
        <>
          <div>
            <label htmlFor="a-name" className={labelClass}>Full name</label>
            <input id="a-name" type="text" placeholder="John Doe" className={inputClass} value={aName} onChange={(e) => setAName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="a-username" className={labelClass}>Username</label>
            <input id="a-username" type="text" placeholder="yourhandle" className={inputClass} value={aUsername} onChange={(e) => setAUsername(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="a-email" className={labelClass}>Email</label>
            <input id="a-email" type="email" placeholder="you@example.com" autoComplete="email" className={inputClass} value={aEmail} onChange={(e) => setAEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="a-password" className={labelClass}>Password</label>
            <input id="a-password" type="password" placeholder="Min. 8 characters" minLength={8} autoComplete="new-password" className={inputClass} value={aPassword} onChange={(e) => setAPassword(e.target.value)} required />
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="c-name" className={labelClass}>Company name</label>
            <input id="c-name" type="text" placeholder="Acme Inc." className={inputClass} value={cName} onChange={(e) => setCName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="c-email" className={labelClass}>Work email</label>
            <input id="c-email" type="email" placeholder="you@company.com" autoComplete="email" className={inputClass} value={cEmail} onChange={(e) => setCEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="c-password" className={labelClass}>Password</label>
            <input id="c-password" type="password" placeholder="Min. 8 characters" minLength={8} autoComplete="new-password" className={inputClass} value={cPassword} onChange={(e) => setCPassword(e.target.value)} required />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </button>
      <div className="text-center text-gray-600 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-500 font-medium underline">
          Sign in
        </Link>
      </div>
    </form>
    </div>
  );
}

function RegisterForm() {
  return (
    <Suspense fallback={null}>
      <RegisterFormInner />
    </Suspense>
  );
}


/* ─── Main export ────────────────────────────────────────── */
export interface FullScreenSignupProps {
  mode?: "login" | "register";
}

export const FullScreenSignup = ({ mode = "register" }: FullScreenSignupProps) => {
  const isLogin = mode === "login";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden relative bg-background"
    >
      {/* Subtle ink-spread from the card's bottom-left corner */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 50% 40% at 30% 65%, #f9731618 0%, transparent 50%)",
            "radial-gradient(ellipse 70% 55% at 30% 65%, #ea580c10 0%, transparent 55%)",
            "radial-gradient(ellipse 85% 70% at 30% 65%, #1a1a1a08 0%, transparent 65%)",
            "radial-gradient(ellipse 110% 90% at 30% 65%, #29252406 0%, transparent 80%)",
          ].join(", "),
        }}
      />

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4 pb-12">
        <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-2xl">

        {/* Left panel */}
        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-bl-2xl overflow-hidden">
          {/* Gradient overlays — same as original */}
          <div className="w-full h-full z-[2] absolute inset-0 bg-gradient-to-t from-transparent to-black pointer-events-none"></div>
          <div className="flex absolute inset-0 z-[2] overflow-hidden backdrop-blur-2xl pointer-events-none">
            <div className="h-full z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30"></div>
            <div className="h-full z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30"></div>
            <div className="h-full z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30"></div>
            <div className="h-full z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30"></div>
            <div className="h-full z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30"></div>
            <div className="h-full z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30"></div>
          </div>
          <div className="w-[15rem] h-[15rem] bg-orange-500 absolute z-[1] rounded-full -bottom-16 -left-16 pointer-events-none"></div>
          <div className="w-[8rem] h-[5rem] bg-white absolute z-[1] rounded-full -bottom-8 left-8 pointer-events-none"></div>
          <h1 className="text-2xl md:text-3xl font-medium leading-tight z-10 tracking-tight relative">
            {isLogin
              ? "Every quest brings you closer to S-Rank."
              : "Real digital work. Real pay. No resume needed."}
          </h1>
        </div>

        {/* Right panel */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-secondary z-99 text-secondary-foreground">
          <div className="flex flex-col items-left mb-8">
            <div className="text-orange-500 mb-4">
              <Sunburst className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">
              {isLogin ? "Welcome back" : "Join the Guild"}
            </h2>
            <p className="text-left opacity-80">
              {isLogin
                ? "Sign in to your quest board"
                : "Start at F-Rank — free to join"}
            </p>
          </div>

          {isLogin ? <LoginFormWrapper /> : <RegisterForm />}
        </div>
      </div>
      </div>
    </div>
  );
};
