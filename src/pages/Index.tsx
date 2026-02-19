import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Shield, Users, Microscope, CalendarDays, MessageSquare, ChevronRight, Star, CheckCircle2, Activity, HeartPulse, Stethoscope, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";
import heroImage from "@/assets/hero-medical.jpg";

const features = [
  { icon: Brain, title: "AI Disease Prediction", desc: "Upload X-rays or MRIs and let our AI detect conditions with 94% accuracy.", color: "bg-medical-blue-light text-medical-blue" },
  { icon: Stethoscope, title: "Smart Doctor Match", desc: "Get instantly matched to the right specialist based on your symptoms and AI analysis.", color: "bg-medical-teal-light text-medical-teal" },
  { icon: Shield, title: "Secure Health Records", desc: "Your medical data is encrypted and compliant with HIPAA standards.", color: "bg-medical-green-light text-medical-green" },
  { icon: CalendarDays, title: "Easy Scheduling", desc: "Book, reschedule, or cancel appointments from any device in seconds.", color: "bg-medical-amber-light text-medical-amber" },
  { icon: MessageSquare, title: "24/7 AI Chatbot", desc: "Describe symptoms any time — our medical AI guides you toward the right care.", color: "bg-primary/10 text-primary" },
  { icon: Microscope, title: "Advanced Diagnostics", desc: "AI-assisted analysis of lab results, imaging scans, and biometric data.", color: "bg-medical-red-light text-medical-red" },
];

const specialties = [
  { icon: HeartPulse, name: "Cardiology", patients: "2.4k" },
  { icon: Brain, name: "Neurology", patients: "1.8k" },
  { icon: Activity, name: "Pulmonology", patients: "3.1k" },
  { icon: Microscope, name: "Oncology", patients: "900" },
  { icon: Pill, name: "Endocrinology", patients: "1.2k" },
  { icon: Stethoscope, name: "General Medicine", patients: "5.6k" },
];

const stats = [
  { label: "Patients Served", value: "128K+" },
  { label: "AI Accuracy Rate", value: "94.2%" },
  { label: "Specialist Doctors", value: "340+" },
  { label: "Diagnoses Completed", value: "890K" },
];

const testimonials = [
  { name: "Maria Thompson", role: "Patient", rating: 5, text: "The AI detected a shadow on my lung scan that my local clinic missed. Medora's recommendation led to early-stage treatment that saved my life." },
  { name: "Dr. James Park", role: "Cardiologist", rating: 5, text: "The patient records and AI pre-analysis save me 40 minutes per appointment. I can focus fully on patient care instead of paperwork." },
  { name: "Linda Cruz", role: "Patient", rating: 5, text: "Booking an appointment took 30 seconds. The AI chatbot helped me understand my symptoms before I even saw the doctor." },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AIChatbot />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="Medical AI" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>

        <div className="container relative z-10 py-24">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-xs font-semibold border border-white/20 bg-white/10 text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-medical-green animate-pulse" />
              AI-Powered · 94.2% Diagnostic Accuracy
            </div>
            <h1 className="text-5xl sm:text-6xl font-heading font-bold text-white leading-tight mb-6">
              Intelligent Healthcare,{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #5eead4, #7dd3fc)" }}>
                Redefined.
              </span>
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Medora uses advanced AI to analyze symptoms, interpret medical images, and connect you with the right specialist — all in one seamless platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-primary font-semibold hover:bg-white/90 gap-2 shadow-elevated"
                onClick={() => navigate("/auth")}
              >
                Patient Login <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white font-semibold hover:bg-white/10 hover:border-white gap-2"
                onClick={() => navigate("/auth?role=doctor")}
              >
                Doctor Portal <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Mini stats */}
            <div className="mt-12 flex flex-wrap gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-medical-teal uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Everything healthcare needs in one place</h2>
            <p className="text-muted-foreground">From diagnosis to doctor booking — Medora's AI-powered ecosystem handles every step of your care journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl p-6 bg-card border border-border hover:border-medical-teal/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ boxShadow: "var(--shadow-card)", animationDelay: `${i * 80}ms` }}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-medical-teal uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Your path to better health in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up as a patient in under 2 minutes." },
              { step: "02", title: "Describe Symptoms", desc: "Chat with our AI or upload medical images." },
              { step: "03", title: "Get AI Analysis", desc: "Receive instant disease risk assessment." },
              { step: "04", title: "Book Specialist", desc: "Schedule with the recommended doctor." },
            ].map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {i < 3 && <div className="hidden md:block absolute top-7 left-[60%] w-full h-0.5 bg-gradient-to-r from-medical-teal/50 to-transparent" />}
                <div className="h-14 w-14 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4 shadow-glow">
                  <span className="text-xl font-bold text-primary-foreground">{s.step}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialties" className="py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-medical-teal uppercase tracking-widest mb-3">Medical Specialties</p>
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Expert care across all fields</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((sp) => (
              <div key={sp.name} className="rounded-2xl p-4 bg-card border border-border text-center hover:border-medical-teal/40 hover:shadow-card transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-xl bg-medical-blue-light flex items-center justify-center mx-auto mb-3 group-hover:bg-gradient-ai transition-colors">
                  <sp.icon className="h-6 w-6 text-medical-blue group-hover:text-primary-foreground transition-colors" />
                </div>
                <p className="font-semibold text-sm text-foreground">{sp.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{sp.patients} patients</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-medical-teal uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Trusted by patients and doctors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl p-6 bg-card border border-border shadow-card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-medical-amber text-medical-amber" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-hero flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-hero">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-heading font-bold text-primary-foreground mb-4">Start your AI health journey today</h2>
          <p className="text-primary-foreground/70 mb-8">Join 128,000+ patients who trust Medora for smarter, faster healthcare.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary font-semibold hover:bg-white/90" onClick={() => navigate("/auth")}>
              Create Free Account <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" onClick={() => navigate("/auth?role=doctor")}>
              Doctor Portal
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-primary-foreground/60">
            {["HIPAA Compliant", "256-bit Encryption", "24/7 Support"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-medical-green" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-medical-teal" />
            <span className="font-bold text-primary-foreground">Medora System</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 Medora System. AI-Powered Healthcare Platform.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
