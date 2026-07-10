import { useEffect, useState } from "react";
import { Calendar, Users, FileText, Clock, CheckCircle2, ChevronRight, Brain, AlertCircle, Activity, Star, X, Stethoscope, ScanLine, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";
import { collection, query, where, getDocs, onSnapshot, getDoc, doc, orderBy, limit } from "firebase/firestore";
import { db } from "../config/firebase";
import { useLoading } from "../context/loadingcontext";
import { useLocation } from "react-router-dom";
type TabType = "overview" | "appointments" | "patients";

// const todayAppointments = [
//   { time: "9:00 AM", patient: "John Doe", age: 34, reason: "Follow-up - Chest pain", status: "Completed", aiFlag: false },
//   { time: "10:30 AM", patient: "Emma Wilson", age: 28, reason: "X-ray review - Cough", status: "In Progress", aiFlag: true },
//   { time: "12:00 PM", patient: "Robert Kim", age: 56, reason: "Respiratory assessment", status: "Upcoming", aiFlag: true },
//   { time: "2:00 PM", patient: "Aisha Patel", age: 41, reason: "Post-op checkup", status: "Upcoming", aiFlag: false },
//   { time: "4:30 PM", patient: "Carlos Ruiz", age: 22, reason: "Breathing difficulties", status: "Upcoming", aiFlag: true },
// ];

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

export default function DoctorDashboard({ user }) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayappointment, settodatappointment] = useState<any[]>([]);
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [todayPatientsCount, setTodayPatientsCount] = useState<number>(0);
  const [patients, setPatients] = useState<any[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAppointmentPatient, setSelectedAppointmentPatient] = useState<any>(null);
  const location = useLocation();
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "overview" || hash === "appointments" || hash === "patients") {
      setActiveTab(hash as TabType);
    } else {
      setActiveTab("overview");
    }
  }, [location.hash]);

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const navItems: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "appointments", label: "Appointments" },
    { id: "patients", label: "Patient Records" },
  ];

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const appointmentsList: any[] = [];
        const today: any[] = [];
        const uniquePatientIds = new Set<string>();
        let todayCount = 0;
        const todayString = new Date().toISOString().split('T')[0];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          appointmentsList.push({ id: docSnap.id, ...data });

          if (data.patientId) {
            uniquePatientIds.add(data.patientId);
          }

          if (data.date === todayString && data.status !== "cancelled") {
            todayCount++;
            today.push({ id: docSnap.id, ...data });
          }
        });

        setAppointments(appointmentsList);
        setPatientsCount(uniquePatientIds.size);
        setTodayPatientsCount(todayCount);
        settodatappointment(today);

        // فانكشن مساعدة: تجيب أحدث document من أي subcollection معينة
        const getLatestDoc = async (patientId: string, subcollectionName: string) => {
          try {
            const ref = collection(db, "users", patientId, subcollectionName);
            const q = query(ref, orderBy("createdAt", "desc"), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
              return snap.docs[0].data();
            }
            return null;
          } catch (err) {
            console.warn(`No "${subcollectionName}" subcollection for patient ${patientId}`);
            return null;
          }
        };

        try {
          const patientPromises = Array.from(uniquePatientIds).map(async (patientId) => {
            const userDocSnap = await getDoc(doc(db, "users", patientId));
            if (!userDocSnap.exists()) return null;

            const userData = { id: userDocSnap.id, ...userDocSnap.data() };

            // نجيب كل الـ subcollections مع بعض في نفس الوقت
            const [latestSymptoms, latestMri, latestXray, latestAiDiagnosis, latestVitals] =
              await Promise.all([
                getLatestDoc(patientId, "Symptoms"),
                getLatestDoc(patientId, "MRI"),
                getLatestDoc(patientId, "X_Ray"),
                getLatestDoc(patientId, "aiAgentDiagnosis"),
                getLatestDoc(patientId, "vitals"),
              ]);

            return {
              ...userData,
              latestSymptoms,
              latestMri,
              latestXray,
              latestAiDiagnosis,
              latestVitals,
            };
          });

          const patientsData = (await Promise.all(patientPromises)).filter(
            (p) => p !== null
          );

          setPatients(patientsData);
        } catch (err) {
          console.error("Error fetching patients data:", err);
        }
      },
      (err) => {
        console.error("Error listening to doctor appointments:", err);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);


  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      {/* <AIChatbot /> */}

      <div className="container py-8">
        {/* Doctor banner */}
        <div className="rounded-2xl bg-gradient-hero p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm">Doctor Dashboard</p>
            <h1 className="text-2xl font-heading font-bold text-primary-foreground mt-1"> Dr. {user?.fullname}  </h1>
            <p className="text-primary-foreground/70 text-sm mt-1">{user?.specialty} · Medora General Hospital</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {[
              { label: "Today", val: todayPatientsCount },
              { label: "This Week", val: patientsCount },
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === item.id
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
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                {[
                  { label: "Appointments Today", val: todayPatientsCount, icon: Calendar, color: "bg-medical-blue-light text-medical-blue" },
                  // { label: "AI-Flagged Cases", val: "3", icon: Brain, color: "bg-medical-amber-light text-medical-amber" }
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
                  {todayappointment.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="text-center w-16 shrink-0">
                        <p className="text-xs font-bold text-primary">{apt.time}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{apt.patientName}</p>
                          {/* {apt.aiFlag && (
                            <span className="h-4 px-1.5 rounded text-[10px] font-bold bg-medical-amber-light text-medical-amber flex items-center gap-0.5">
                              <Brain className="h-2.5 w-2.5" /> AI
                            </span>
                          )} */}
                        </div>
                        {/* <p className="text-xs text-muted-foreground truncate">{apt.reason}</p> */}
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
            {/* <div className="space-y-4">
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
            </div> */}
          </div>
        )}

        {/* APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="rounded-2xl bg-card border border-border shadow-card">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Appointments</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{new Date().toLocaleDateString('en-US', options)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{patientsCount}</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {appointments.map((apt) => (

                <div key={apt.id} className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors">
                  <div className="text-center w-20 shrink-0">
                    <p className="text-sm font-bold text-primary">{apt.timeSlot}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{apt.date}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{apt.patientName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{apt.patientName}</p>
                      {/* <span className="text-xs text-muted-foreground">· Age {apt.age}</span> */}
                      {/* {apt.aiFlag && (
                        <span className="h-5 px-2 rounded-full text-[10px] font-bold bg-medical-amber-light text-medical-amber flex items-center gap-1">
                          <Brain className="h-3 w-3" /> AI Analysis
                        </span>
                      )} */}
                    </div>
                    {/* <p className="text-sm text-muted-foreground">{apt.reason}</p> */}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={apt.status === "Completed" ? "secondary" : apt.status === "In Progress" ? "default" : "outline"}
                    >
                      {apt.status === "In Progress" && <span className="h-1.5 w-1.5 rounded-full bg-medical-green mr-1.5" />}
                      {apt.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const patient = patients.find((p) => p.id === apt.patientId);
                        setSelectedAppointmentPatient({ ...apt, patientData: patient });
                        setViewModalOpen(true);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "patients" && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Patient Records with AI Insights</h3>
              </div>
              <div className="divide-y divide-border">
                {appointments.map((appt) => {
                  const patient = patients.find((p) => p.id === appt.patientId);
                  const confidenceValue = parseFloat(patient?.latestSymptoms?.predictions?.conf1 ?? "0");

                  return (
                    <div
                      key={appt.id}
                      onClick={() => setSelectedPatient(appt.patientName)}
                      className={`p-5 cursor-pointer hover:bg-muted/30 transition-colors ${selectedPatient === appt.patientName ? "bg-muted/40" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-foreground">
                              {appt.patientName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{appt.patientName}</p>
                            <p className="text-xs text-muted-foreground">
                              Age {patient?.age ?? "—"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${appt.sevColor}`}>{appt.severity}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">{patient?.latestSymptoms?.predictions?.first}</p>
                          <p className="text-sm font-semibold text-foreground">{confidenceValue}%</p>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${confidenceValue > 80
                              ? "bg-medical-red"
                              : confidenceValue > 65
                                ? "bg-medical-amber"
                                : "bg-medical-green"
                              }`}
                            style={{ width: `${confidenceValue}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">AI Diagnostic Confidence</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
      {viewModalOpen && selectedAppointmentPatient && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setViewModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl mx-4 rounded-2xl bg-card border border-border shadow-elevated overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-hero px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/70 text-xs">Preliminary Assessment</p>
                <h3 className="text-primary-foreground font-semibold text-lg">
                  {selectedAppointmentPatient.patientName}
                </h3>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Vitals Section */}
              {selectedAppointmentPatient.patientData?.latestVitals && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-medical-teal" />
                    Latest Vitals
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Blood Pressure</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedAppointmentPatient.patientData.latestVitals.bloodPressure?.systolic}/
                        {selectedAppointmentPatient.patientData.latestVitals.bloodPressure?.diastolic}
                      </p>
                      <p className="text-xs text-medical-amber mt-0.5">
                        {selectedAppointmentPatient.patientData.latestVitals.status?.bp}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Heart Rate</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedAppointmentPatient.patientData.latestVitals.heartRate} bpm
                      </p>
                      <p className="text-xs text-medical-green mt-0.5">
                        {selectedAppointmentPatient.patientData.latestVitals.status?.hr}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Blood Sugar</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedAppointmentPatient.patientData.latestVitals.bloodSugar} mg/dL
                      </p>
                      <p className="text-xs text-medical-green mt-0.5">
                        {selectedAppointmentPatient.patientData.latestVitals.status?.sugar}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">BMI</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedAppointmentPatient.patientData.latestVitals.bmi}
                      </p>
                      <p className="text-xs text-medical-green mt-0.5">
                        {selectedAppointmentPatient.patientData.latestVitals.status?.bmi}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Symptoms AI Section */}
              {selectedAppointmentPatient.patientData?.latestSymptoms && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-medical-teal" />
                    Symptom Analysis (AI)
                  </h4>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Most Likely Condition</p>
                    <p className="font-semibold text-foreground mb-2">
                      {selectedAppointmentPatient.patientData.latestSymptoms.predictions?.first ?? "—"}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-medical-teal"
                          style={{
                            width: `${parseFloat(
                              selectedAppointmentPatient.patientData.latestSymptoms.predictions?.conf1 ?? "0"
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {parseFloat(
                          selectedAppointmentPatient.patientData.latestSymptoms.predictions?.conf1 ?? "0"
                        )}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">2nd Possibility</p>
                        <p className="text-sm font-medium text-foreground">
                          {selectedAppointmentPatient.patientData.latestSymptoms.predictions?.second ?? "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">3rd Possibility</p>
                        <p className="text-sm font-medium text-foreground">
                          {selectedAppointmentPatient.patientData.latestSymptoms.predictions?.third ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* X-Ray Section */}
              {selectedAppointmentPatient.patientData?.latestXray && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-medical-teal" />
                    X-Ray Analysis (AI)
                  </h4>
                  <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Result</span>
                    <span
                      className={`text-sm font-semibold ${selectedAppointmentPatient.patientData.latestXray.predictions === "pneumonia"
                        ? "text-medical-red"
                        : "text-medical-green"
                        }`}
                    >
                      {selectedAppointmentPatient.patientData.latestXray.predictions}
                    </span>
                  </div>
                </div>
              )}

              {/* MRI Section */}
              {selectedAppointmentPatient.patientData?.latestMri && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-medical-teal" />
                    MRI Analysis (AI)
                  </h4>
                  <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Result</span>
                      <span
                        className={`text-sm font-semibold ${selectedAppointmentPatient.patientData.latestMri.predictions === "no_tumor"
                          ? "text-medical-green"
                          : "text-medical-red"
                          }`}
                      >
                        {selectedAppointmentPatient.patientData.latestMri.predictions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-medical-teal"
                          style={{
                            width: `${(selectedAppointmentPatient.patientData.latestMri.confidence ?? 0) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {((selectedAppointmentPatient.patientData.latestMri.confidence ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Agent Diagnosis Section (from the chat agent) */}
              {selectedAppointmentPatient.patientData?.latestAiDiagnosis && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-medical-teal" />
                    MedBot Conversational Assessment
                  </h4>
                  <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedAppointmentPatient.patientData.latestAiDiagnosis.summary}
                    </p>
                    {selectedAppointmentPatient.patientData.latestAiDiagnosis.possible_conditions?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedAppointmentPatient.patientData.latestAiDiagnosis.possible_conditions.map(
                          (cond: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-medical-teal/10 text-medical-teal border border-medical-teal/20"
                            >
                              {cond}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No data at all */}
              {!selectedAppointmentPatient.patientData?.latestVitals &&
                !selectedAppointmentPatient.patientData?.latestSymptoms &&
                !selectedAppointmentPatient.patientData?.latestXray &&
                !selectedAppointmentPatient.patientData?.latestMri &&
                !selectedAppointmentPatient.patientData?.latestAiDiagnosis && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No AI diagnostic data available for this patient yet.
                  </p>
                )}
            </div>

            {/* Footer disclaimer */}
            <div className="px-5 py-3 bg-muted/30 border-t border-border">
              <p className="text-xs text-muted-foreground">
                This is a preliminary AI-based assessment and does not replace professional medical evaluation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
