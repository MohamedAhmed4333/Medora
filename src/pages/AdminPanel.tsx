import { useState } from "react";
import { Users, Stethoscope, Activity, TrendingUp, Plus, Search, Edit, Trash2, CheckCircle2, X, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";

type TabType = "overview" | "doctors" | "users" | "analytics";

const doctors = [
  { name: "Dr. Sarah Chen", specialty: "Pulmonology", patients: 142, status: "Active", rating: 4.9, joined: "Jan 2023" },
  { name: "Dr. Marcus Reid", specialty: "Cardiology", patients: 198, status: "Active", rating: 4.8, joined: "Mar 2022" },
  { name: "Dr. Priya Nair", specialty: "Internal Medicine", patients: 87, status: "Active", rating: 4.7, joined: "Jun 2023" },
  { name: "Dr. Alex Brandt", specialty: "Neurology", patients: 64, status: "Inactive", rating: 4.6, joined: "Feb 2024" },
  { name: "Dr. Sofia Martinez", specialty: "Oncology", patients: 33, status: "Active", rating: 4.9, joined: "Aug 2023" },
];

const users = [
  { name: "John Doe", email: "john@example.com", role: "Patient", joined: "Feb 1", status: "Active", diagnoses: 3 },
  { name: "Emma Wilson", email: "emma@example.com", role: "Patient", joined: "Jan 28", status: "Active", diagnoses: 1 },
  { name: "Carlos Ruiz", email: "carlos@example.com", role: "Patient", joined: "Jan 15", status: "Active", diagnoses: 5 },
  { name: "Aisha Patel", email: "aisha@example.com", role: "Patient", joined: "Feb 10", status: "Suspended", diagnoses: 0 },
  { name: "Robert Kim", email: "robert@example.com", role: "Patient", joined: "Dec 20", status: "Active", diagnoses: 7 },
];

const monthlyStats = [65, 80, 72, 90, 85, 95, 88, 102, 98, 110, 125, 128];
const months = ["M", "A", "M", "J", "J", "A", "S", "O", "N", "D", "J", "F"];

export default function AdminPanel({user}) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [search, setSearch] = useState("");
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  const navItems: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "doctors", label: "Manage Doctors" },
    { id: "users", label: "User Accounts" },
    { id: "analytics", label: "Analytics" },
  ];

  const maxStat = Math.max(...monthlyStats);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user = {user} />
      <AIChatbot />

      <div className="container py-8">
        {/* Admin banner */}
        <div className="rounded-2xl bg-gradient-hero p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm">Admin Panel</p>
            <h1 className="text-2xl font-heading font-bold text-primary-foreground mt-1">System Overview</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">Medora System Administration</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {[
              { label: "Total Users", val: "128K" },
              { label: "Active Doctors", val: "340" },
              { label: "System Health", val: "99.9%" },
            ].map((s) => (
              <div key={s.label} className="text-center px-5 py-3 rounded-xl bg-white/10">
                <p className="text-xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-muted/50 p-1 rounded-xl w-fit overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === item.id ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Patients", val: "128,432", change: "+12%", icon: Users, color: "bg-medical-blue-light text-medical-blue" },
                { label: "Active Doctors", val: "340", change: "+5%", icon: Stethoscope, color: "bg-medical-teal-light text-medical-teal" },
                { label: "AI Diagnoses Today", val: "1,248", change: "+23%", icon: Brain, color: "bg-medical-amber-light text-medical-amber" },
                { label: "System Uptime", val: "99.9%", change: "Stable", icon: Activity, color: "bg-medical-green-light text-medical-green" },
              ].map((s) => (
                <div key={s.label} className="stat-card bg-card">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.val}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <span className="text-xs font-semibold text-medical-green">{s.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* System status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">System Services</h3>
                {[
                  { name: "AI Diagnostic Engine", status: "Operational", uptime: "99.9%" },
                  { name: "Image Processing API", status: "Operational", uptime: "99.7%" },
                  { name: "Database Cluster", status: "Operational", uptime: "100%" },
                  { name: "Appointment System", status: "Operational", uptime: "99.8%" },
                  { name: "Notification Service", status: "Degraded", uptime: "94.2%" },
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${svc.status === "Operational" ? "bg-medical-green" : "bg-medical-amber"} animate-pulse`} />
                      <span className="text-sm text-foreground">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{svc.uptime}</span>
                      <Badge variant={svc.status === "Operational" ? "secondary" : "outline"} className="text-xs">
                        {svc.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { icon: Users, text: "New patient registered: Carlos Ruiz", time: "2m ago", color: "bg-medical-blue-light text-medical-blue" },
                    { icon: Brain, text: "AI flagged high-risk case: Robert Kim", time: "15m ago", color: "bg-medical-amber-light text-medical-amber" },
                    { icon: CheckCircle2, text: "Appointment confirmed: Dr. Chen / John Doe", time: "1h ago", color: "bg-medical-green-light text-medical-green" },
                    { icon: Stethoscope, text: "New doctor approved: Dr. Sofia Martinez", time: "3h ago", color: "bg-medical-teal-light text-medical-teal" },
                    { icon: TrendingUp, text: "Daily diagnosis target achieved: 1,248", time: "5h ago", color: "bg-primary/10 text-primary" },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
                        <a.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{a.text}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCTORS */}
        {activeTab === "doctors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                className="bg-gradient-hero text-primary-foreground hover:opacity-90"
                onClick={() => setShowAddDoctor(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Doctor
              </Button>
            </div>

            {showAddDoctor && (
              <div className="rounded-2xl bg-card border border-medical-teal/30 shadow-card p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Add New Doctor</h3>
                  <button onClick={() => setShowAddDoctor(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input placeholder="Full Name" />
                  <Input placeholder="Specialty" />
                  <Input placeholder="Email address" type="email" />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={() => setShowAddDoctor(false)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Add Doctor
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDoctor(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Doctor", "Specialty", "Patients", "Rating", "Joined", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doctors.filter((d) => d.name.toLowerCase().includes(search.toLowerCase())).map((doc, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary-foreground">{doc.name.split(" ")[1][0]}</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{doc.specialty}</td>
                      <td className="px-4 py-4 text-sm text-foreground font-medium">{doc.patients}</td>
                      <td className="px-4 py-4 text-sm text-medical-amber font-semibold">★ {doc.rating}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{doc.joined}</td>
                      <td className="px-4 py-4">
                        <Badge variant={doc.status === "Active" ? "default" : "secondary"}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-medical-red hover:bg-medical-red-light transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["User", "Email", "Role", "Joined", "Diagnoses", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase())).map((user, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{user.name[0]}</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{user.joined}</td>
                      <td className="px-4 py-4 text-sm text-foreground font-medium">{user.diagnoses}</td>
                      <td className="px-4 py-4">
                        <Badge variant={user.status === "Active" ? "default" : "destructive"} className="text-xs">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-medical-red hover:bg-medical-red-light transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Usage chart */}
              <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground">Monthly Diagnoses</h3>
                    <p className="text-sm text-muted-foreground">Patients diagnosed via AI system</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-green font-semibold">
                    <TrendingUp className="h-4 w-4" /> +23% this month
                  </div>
                </div>
                <div className="flex items-end gap-2 h-40">
                  {monthlyStats.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-gradient-ai transition-all hover:opacity-80"
                        style={{ height: `${(val / maxStat) * 100}%`, minHeight: "8px" }}
                      />
                      <span className="text-[10px] text-muted-foreground">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI metrics */}
              <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">AI Performance</h3>
                {[
                  { label: "Diagnostic Accuracy", val: 94, color: "bg-medical-green" },
                  { label: "Image Classification", val: 89, color: "bg-medical-teal" },
                  { label: "Symptom Analysis", val: 91, color: "bg-primary" },
                  { label: "Doctor Match Rate", val: 97, color: "bg-medical-blue" },
                ].map((m) => (
                  <div key={m.label} className="mb-4 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className="text-xs font-bold text-foreground">{m.val}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialty breakdown */}
            <div className="rounded-2xl bg-card border border-border shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Diagnoses by Specialty</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: "Pulmonology", count: "3,142", pct: 25 },
                  { name: "Cardiology", count: "2,618", pct: 21 },
                  { name: "General Med", count: "5,610", pct: 44 },
                  { name: "Neurology", count: "1,844", pct: 15 },
                  { name: "Oncology", count: "900", pct: 7 },
                  { name: "Endocrinology", count: "1,218", pct: 10 },
                ].map((sp) => (
                  <div key={sp.name} className="text-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-2 rounded-full bg-gradient-ai mb-3" style={{ opacity: sp.pct / 44 + 0.3 }} />
                    <p className="text-lg font-bold text-foreground">{sp.count}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sp.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
