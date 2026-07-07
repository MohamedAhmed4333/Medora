import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Eye, EyeOff, Stethoscope, User, Settings, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AIChatbot from "@/components/AIChatbot";
import { useLoading } from "../context/loadingcontext";
import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext"

type Role = "patient" | "doctor" | "admin";
type Mode = "login" | "register";

const roles: { id: Role; label: string; icon: typeof User; desc: string }[] = [
  { id: "patient", label: "Patient", icon: User, desc: "Access your health dashboard & AI diagnostics" },
  { id: "doctor", label: "Doctor", icon: Stethoscope, desc: "Manage appointments & patient records" }
];
const role: { id: Role; label: string; icon: typeof User; desc: string }[] = [
  { id: "patient", label: "Patient", icon: User, desc: "Access your health dashboard & AI diagnostics" }
];



export default function Auth() {
  const navigate = useNavigate();

  const { mode, setMode } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('patient');
  const [showPass, setShowPass] = useState(false);
  const { loading, setLoading } = useLoading();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullName] = useState("");



  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
          fullname: fullname,
          email: email,
          role: selectedRole,
          createdAt: serverTimestamp(),
          uid: user.uid
        })
        setLoading(false);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        if (res.user.uid === "EWlEe7Z57kbXbDRNxrZvDdxnYOT2") return;
        const userdoc = await getDoc(doc(db, "users", res.user.uid));
        if (userdoc.exists()) {
          const data = userdoc.data();
          if (data.role !== selectedRole) {
            await auth.signOut();
            setLoading(false);
            return;
          } else {
            setLoading(false);
          }
        }
        console.log("Logged In Successfully");
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* <AIChatbot /> */}

      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[45%] bg-gradient-hero p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-8 h-32 w-32 rounded-full bg-white/5" />

        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Medora</span>
              <span className="text-2xl font-bold text-medical-teal"> System</span>
            </div>
          </div>

          <h2 className="text-4xl font-heading font-bold text-white mb-4 leading-tight">
            AI-powered care, <br />just for you.
          </h2>
          <p className="text-white/70 mb-10 leading-relaxed">
            Join 128,000 patients and 340 doctors on the platform redefining modern healthcare.
          </p>

          <div className="space-y-4">
            {[
              "Upload X-rays for instant AI analysis",
              "Get matched to the right specialist",
              "Book appointments in 30 seconds",
              "Secure, HIPAA-compliant records",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-medical-green shrink-0" />
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "login" ? "Sign in to your Medora account" : "Start your AI health journey today"}
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Select your role</Label>


            {mode === "login" ? (
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${selectedRole === r.id
                        ? "border-medical-teal bg-medical-teal-light"
                        : "border-border bg-card hover:border-border/80 hover:bg-muted/50"
                      }`}
                  >
                    <r.icon className={`h-5 w-5 ${selectedRole === r.id ? "text-medical-teal" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-semibold ${selectedRole === r.id ? "text-medical-teal" : "text-muted-foreground"}`}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>) :

              role.map((r) => (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${selectedRole === r.id
                      ? "border-medical-teal bg-medical-teal-light"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/50"
                      }`}
                  >
                    <r.icon className={`h-5 w-5 ${selectedRole === r.id ? "text-medical-teal" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-semibold ${selectedRole === r.id ? "text-medical-teal" : "text-muted-foreground"}`}>{r.label}</span>
                  </button>
                </div>
              ))}

            <p className="text-xs text-muted-foreground mt-2 text-center">
              {roles.find((r) => r.id === selectedRole)?.desc}
            </p>
          </div>
          {/* ################################################################################# */}
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-medical-teal hover:underline">Forgot password?</button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-hero text-primary-foreground font-semibold h-11 hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                mode === "login" ? `Sign in as ${roles.find(r => r.id === selectedRole)?.label}` : "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-medical-teal font-semibold hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}
