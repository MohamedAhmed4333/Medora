import { useState } from "react";
import { Calendar, Users, FileText, Clock, CheckCircle2, ChevronRight, Brain, AlertCircle, Activity, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";

type TabType = "overview" | "appointments" | "patients";

const todayAppointments = [
  { time: "9:00 AM", patient: "John Doe", age: 34, reason: "Follow-up - Chest pain", status: "Completed", aiFlag: false },
  { time: "10:30 AM", patient: "Emma Wilson", age: 28, reason: "X-ray review - Cough", status: "In Progress", aiFlag: true },
  { time: "12:00 PM", patient: "Robert Kim", age: 56, reason: "Respiratory assessment", status: "Upcoming", aiFlag: true },
  { time: "2:00 PM", patient: "Aisha Patel", age: 41, reason: "Post-op checkup", status: "Upcoming", aiFlag: false },
  { time: "4:30 PM", patient: "Carlos Ruiz", age: 22, reason: "Breathing difficulties", status: "Upcoming", aiFlag: true },
];

const patientRecords = [
  {
    name: "Emma Wilson",
    age: 28,
    condition: "Bacterial Pneumonia",
    aiConfidence: 78,
    lastVisit: "Feb 19",
    severity: "Moderate",
    sevColor: "text-medical-amber",
  },
  {
    name: "Robert Kim",
    age: 56,
    condition: "COPD - Stage II",
    aiConfidence: 91,
    lastVisit: "Feb 12",
    severity: "High",
    sevColor: "text-medical-red",
  },
  {
    name: "Maria Torres",
    age: 44,
    condition: "Acute Bronchitis",
    aiConfidence: 65,
    lastVisit: "Feb 8",
    severity: "Mild",
    sevColor: "text-medical-green",
  },
];

export default function DoctorDashboard({user}) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const navItems: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "appointments", label: "Appointments" },
    { id: "patients", label: "Patient Records" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <AIChatbot />

      <div className="container py-8">
        {/* Doctor banner */}
        <div className="rounded-2xl bg-gradient-hero p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm">Doctor Dashboard</p>
            <h1 className="text-2xl font-heading font-bold text-primary-foreground mt-1"> Dr. {user?.fullname}  </h1>
            <p className="text-primary-foreground/70 text-sm mt-1">Pulmonologist · Medora General Hospital</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {[
              { label: "Today", val: "5" },
              { label: "This Week", val: "23" },
              { label: "AI Flags", val: "3" },
            ].map((s) => (
              <div key={s.label} className="text-center px-5 py-3 rounded-xl bg-white/10">
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-muted/50 p-1 rounded-xl w-fit">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-card text-primary shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Appointments Today", val: "5", icon: Calendar, color: "bg-medical-blue-light text-medical-blue" },
                  { label: "Active Patients", val: "142", icon: Users, color: "bg-medical-teal-light text-medical-teal" },
                  { label: "AI-Flagged Cases", val: "3", icon: Brain, color: "bg-medical-amber-light text-medical-amber" },
                  { label: "Avg. Rating", val: "4.9★", icon: Star, color: "bg-medical-green-light text-medical-green" },
                ].map((s) => (
                  <div key={s.label} className="stat-card bg-card">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{s.val}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Today's schedule */}
              <div className="rounded-2xl bg-card border border-border shadow-card">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h3 className="font-semibold text-foreground">Today's Schedule</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("appointments")}>
                    View all <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {todayAppointments.slice(0, 4).map((apt, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="text-center w-16 shrink-0">
                        <p className="text-xs font-bold text-primary">{apt.time}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{apt.patient}</p>
                          {apt.aiFlag && (
                            <span className="h-4 px-1.5 rounded text-[10px] font-bold bg-medical-amber-light text-medical-amber flex items-center gap-0.5">
                              <Brain className="h-2.5 w-2.5" /> AI
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{apt.reason}</p>
                      </div>
                      <Badge
                        variant={apt.status === "Completed" ? "secondary" : apt.status === "In Progress" ? "default" : "outline"}
                        className="text-xs shrink-0"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick info */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">AI Flagged Cases</h3>
                {patientRecords.filter((p) => p.aiConfidence > 70).map((p) => (
                  <div key={p.name} className="mb-3 last:mb-0 p-3 rounded-xl bg-medical-amber-light/50 border border-medical-amber/20">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <span className={`text-xs font-bold ${p.sevColor}`}>{p.severity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.condition}</p>
                    <p className="text-xs text-medical-amber mt-1">AI Confidence: {p.aiConfidence}%</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-medical-teal-light border border-medical-teal/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-medical-teal" />
                  <p className="text-sm font-semibold text-medical-teal">AI Performance</p>
                </div>
                <p className="text-3xl font-bold text-foreground">94.2%</p>
                <p className="text-xs text-muted-foreground">Diagnostic accuracy this month</p>
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="rounded-2xl bg-card border border-border shadow-card">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Today's Appointments</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Thursday, February 19, 2025</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">5 appointments</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {todayAppointments.map((apt, i) => (
                <div key={i} className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors">
                  <div className="text-center w-20 shrink-0">
                    <p className="text-sm font-bold text-primary">{apt.time}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{apt.patient[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{apt.patient}</p>
                      <span className="text-xs text-muted-foreground">· Age {apt.age}</span>
                      {apt.aiFlag && (
                        <span className="h-5 px-2 rounded-full text-[10px] font-bold bg-medical-amber-light text-medical-amber flex items-center gap-1">
                          <Brain className="h-3 w-3" /> AI Analysis
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{apt.reason}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={apt.status === "Completed" ? "secondary" : apt.status === "In Progress" ? "default" : "outline"}
                    >
                      {apt.status === "In Progress" && <span className="h-1.5 w-1.5 rounded-full bg-medical-green mr-1.5" />}
                      {apt.status}
                    </Badge>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PATIENTS */}
        {activeTab === "patients" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Patient Records with AI Insights</h3>
              </div>
              <div className="divide-y divide-border">
                {patientRecords.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => setSelectedPatient(p.name)}
                    className={`p-5 cursor-pointer hover:bg-muted/30 transition-colors ${selectedPatient === p.name ? "bg-muted/40" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">{p.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">Age {p.age} · Last visit {p.lastVisit}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${p.sevColor}`}>{p.severity}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-muted-foreground">{p.condition}</p>
                        <p className="text-sm font-semibold text-foreground">{p.aiConfidence}%</p>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.aiConfidence > 80 ? "bg-medical-red" : p.aiConfidence > 65 ? "bg-medical-amber" : "bg-medical-green"}`}
                          style={{ width: `${p.aiConfidence}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">AI Diagnostic Confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPatient ? (
              <div className="rounded-2xl bg-card border border-border shadow-card p-6 animate-slide-in-right">
                <h3 className="font-semibold text-foreground mb-4">AI Insights — {selectedPatient}</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-medical-amber-light border border-medical-amber/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-medical-amber" />
                      <p className="text-xs font-bold text-medical-amber">AI Recommendation</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Chest X-ray shows consolidation in lower lobe. Consider sputum culture and antibiotic therapy.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs font-bold text-muted-foreground mb-2">UPLOADED IMAGES</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Chest X-ray", "Lab Report"].map((img) => (
                        <div key={img} className="aspect-square rounded-lg bg-muted flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/80">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{img}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90 mt-2">
                    Add Clinical Notes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/30 border border-dashed border-border p-6 flex flex-col items-center justify-center text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Select a patient to view AI insights and uploaded images</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
