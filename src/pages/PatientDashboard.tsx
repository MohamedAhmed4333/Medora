import { useEffect, useState, useMemo } from "react";
import { Upload, AlertCircle, CheckCircle2, Clock, ChevronRight, Calendar, FileText, Activity, Stethoscope, Brain, HeartPulse, Microscope, Pill, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";
import AIProcessingAnimation from "@/components/AIProcessingAnimation";
import { collection, getDoc, getDocs, orderBy, query, where, addDoc, serverTimestamp, doc, runTransaction, increment } from "firebase/firestore";
import { db } from "../config/firebase";
import { useLoading } from "../context/loadingcontext"
import { Loader2 } from "lucide-react";

type TabType = "overview" | "ai-hub" | "results" | "doctors" | "booking" | "history";

const symptoms = ["Fever", "Cough", "Shortness of breath", "Chest pain", "Fatigue", "Headache", "Nausea", "Dizziness"];

const recommendedDoctors = [
  { name: "Dr. Sarah Chen", specialty: "Pulmonologist", rating: 4.9, available: "Today 3:00 PM", exp: "12 yrs", icon: Activity },
  { name: "Dr. Marcus Reid", specialty: "Cardiologist", rating: 4.8, available: "Tomorrow 10:00 AM", exp: "15 yrs", icon: HeartPulse },
  { name: "Dr. Priya Nair", specialty: "Internal Medicine", rating: 4.7, available: "Today 5:30 PM", exp: "9 yrs", icon: Stethoscope },
];

const appointments = [
  { date: "Feb 22", time: "10:30 AM", doctor: "Dr. Sarah Chen", specialty: "Pulmonology", status: "Upcoming" },
  { date: "Jan 18", time: "2:00 PM", doctor: "Dr. Marcus Reid", specialty: "Cardiology", status: "Completed" },
  { date: "Dec 10", time: "11:00 AM", doctor: "Dr. Priya Nair", specialty: "Internal Medicine", status: "Completed" },
];

// const calendarDays = [20, 21, 22, 23, 24, 25, 26];


const generateCalendarDays = (numDays: number = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
};



export default function ({ user }) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const calendarDays = useMemo(() => generateCalendarDays(7), []);
  const [bookedSlots, setbookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
    // setIsLoadingSlots(true);
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const today = new Date();
    let currentTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;
    while (currentTotalMinutes < endTotalMinutes) {
      const hours = Math.floor(currentTotalMinutes / 60);
      const minutes = currentTotalMinutes % 60;

      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      if (hours > currentHour || (hours === currentHour && minutes > currentMinute) || selectedDay?.toLocaleDateString('en-US', { weekday: "long" }) != today.toLocaleDateString('en-US', { weekday: "long" })) {
        if (!bookedSlots.includes(formattedTime) && selectedDay?.toLocaleDateString('en-US', { weekday: "long" }) != today.toLocaleDateString('en-US', { weekday: "long" })) {
          slots.push(formattedTime);
        }
      }
      currentTotalMinutes += intervalMinutes;
    }
    return slots;
  }

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      setActiveTab("results");
    }, 4000);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDay || !selectedSlot) return;
    const formattedDate = selectedDay.toISOString().split('T')[0];
    const appointmentId = `${selectedDoctor.uid}_${formattedDate}_${selectedSlot.replace(':', '-')}`;
    const appointmentRef = doc(db, "appointments", appointmentId);
    const patientRef = doc(db, "users", user.uid);
    try {
      await runTransaction(db, async (transaction) => {
        const appointmentDoc = await transaction.get(appointmentRef);
        if (appointmentDoc.exists()) {
          throw new Error("Oooops, This Time is reserved");
        }
        transaction.set(appointmentRef, {
          patientId: user.uid,
          patientName: user.fullname,
          doctorId: selectedDoctor.uid,
          doctorName: selectedDoctor.fullname,
          specialty: selectedDoctor.specialty,
          date: formattedDate,
          timeSlot: selectedSlot,
          status: "upcoming",
          createdAt: serverTimestamp()
        });
        transaction.update(patientRef, {
          "stats.upcoming": increment(1)
        });
      });
      setBookingSuccess(true);

      setTimeout(() => { setBookingSuccess(false); setActiveTab("history"); }, 1000);
      setSelectedDay(null);
    } catch (error) {
      console.error("Transaction failed: ", error);
      alert(error.message || "حدث خطأ أثناء الحجز، يرجى المحاولة مرة أخرى.");
    }
  };

  const navItems: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "ai-hub", label: "AI Diagnostics" },
    { id: "results", label: "AI Results" },
    { id: "doctors", label: "Doctors" },
    { id: "booking", label: "Book Appointment" },
    { id: "history", label: "Medical History" },
  ];
  const [vitals, setVitals] = useState(null);
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    const fetchDoctorHours = async () => {
      const booked: string[] = [];
      const formattedDate = selectedDay.toISOString().split('T')[0];
      try {
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", selectedDoctor.uid),
          where("date", "==", formattedDate)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          booked.push(doc.data().timeSlot);
        });
        setbookedSlots(booked);
      } catch (error) {
        console.error("Error fetching booked slots: ", error);
      }
      finally {
        setIsLoadingSlots(false);
      }
    }
    fetchDoctorHours();
  }, [selectedDay, selectedDoctor])

  useEffect(() => {
    const fetchAll = async () => {
      setDashboardLoading(true);
      console.log("fsssssssssssssssssssssss", user?.uid);
      if (!user?.uid) return;
      try {
        const fetchSubcollection = async () => {
          if (!user) return;
          try {
            const ref = collection(db, "users", user.uid, "vitals");
            const q = query(ref, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              setVitals(snapshot.docs[0].data());
            }
          } catch (err) { console.error(err) }
        }
        const fetchDoctors = async () => {
          try {
            const doctorsQuery = query(
              collection(db, "users"),
              where("role", "==", "doctor")
            );
            const querySnapshot = await getDocs(doctorsQuery);
            const doctorsList = querySnapshot.docs.map((doc) => ({
              uid: doc.id,
              ...doc.data(),
            }));
            setDoctors(doctorsList);
          }
          catch (error) {
            console.error("Error fetching doctors:", error);
          }
        }

       await Promise.all([
        fetchSubcollection(),
        fetchDoctors()
      ]);


      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setDashboardLoading(false);
      }
    }
    fetchAll();
  }, [user?.uid])

  useEffect(() => {
     const fetchappiontments = async () => {
          try {
            const q = query(
              collection(db, "appointments"),
              where("patientId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const appointmentsList: any[] = [];
            querySnapshot.forEach((doc) => {
              appointmentsList.push({
                id: doc.id,
                ...doc.data()
              });
            });
            appointmentsList.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            setAppointments(appointmentsList);
          } catch (error) {
            console.error("Error fetching appointments: ", error);
          }
        }
        fetchappiontments();
  },[user?.uid,bookingSuccess])

  const calculateHealthScore = (vitals) => {
    if (!vitals) return 0;
    let score = 0;

    const sys = vitals?.bloodPressure?.systolic;
    const dia = vitals?.bloodPressure?.diastolic;

    if (sys && dia) {
      if (sys >= 110 && sys <= 130 && dia >= 70 && dia <= 85) {
        score += 30;
      } else if (sys < 140 && dia < 90) {
        score += 20;
      } else {
        score += 10;
      }
    }
    if (vitals?.heartRate) {
      if (vitals.heartRate >= 60 && vitals.heartRate <= 100) {
        score += 20;
      } else {
        score += 10;
      }
    }
    if (vitals?.bloodSugar) {
      if (vitals.bloodSugar >= 70 && vitals.sugar <= 100) {
        score += 30;
      } else if (vitals.bloodSugar < 125) {
        score += 15;
      } else {
        score += 5;
      }
    }
    if (vitals?.bmi) {
      if (vitals.bmi >= 18.5 && vitals.bmi <= 24.9) {
        score += 20;
      } else {
        score += 10;
      }
    }
    return score;
  };

  if (dashboardLoading) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* نبض خارجي كأنه ضربات قلب */}
        <div className="absolute h-24 w-24 animate-ping rounded-full bg-primary/20"></div>
        
        {/* الدائرة الدوارة */}
        <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={2.5} />
      </div>
      
      {/* نص توضيحي */}
      <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
        Medora
      </h2>
      <p className="mt-2 animate-pulse text-sm text-muted-foreground">
        جاري التحقق من البيانات...
      </p>
    </div>
  );
}



  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <AIChatbot />

      <div className="container py-8">
        {/* Welcome banner */}
        <div className="rounded-2xl bg-gradient-hero p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm mb-1">Good morning,</p>
            <h1 className="text-2xl font-heading font-bold text-primary-foreground"> {user?.fullname} </h1>
            <p className="text-primary-foreground/70 text-sm mt-1">Your health score: <span className="text-medical-green font-semibold">{calculateHealthScore(vitals)}/100</span></p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-center px-6 py-3 rounded-xl bg-white/10">
              <p className="text-2xl font-bold text-white">{user?.stats.upcoming}</p>
              <p className="text-xs text-white/70">Upcoming</p>
            </div>
            <div className="text-center px-6 py-3 rounded-xl bg-white/10">
              <p className="text-2xl font-bold text-white">{user?.stats.completed}</p>
              <p className="text-xs text-white/70">Past Visits</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap mb-8 bg-muted/50 p-1 rounded-xl w-fit max-w-full overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === item.id
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
              {/* Quick actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Start AI Diagnosis", icon: Brain, color: "bg-medical-blue-light text-medical-blue", action: () => setActiveTab("ai-hub") },
                  { label: "Book Appointment", icon: Calendar, color: "bg-medical-teal-light text-medical-teal", action: () => setActiveTab("booking") },
                  { label: "View Doctors", icon: Stethoscope, color: "bg-medical-green-light text-medical-green", action: () => setActiveTab("doctors") },
                ].map((a) => (
                  <button key={a.label} onClick={a.action} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-medical-teal/30 hover:shadow-card transition-all text-left group">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${a.color}`}>
                      <a.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Recent appointments */}
              <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Appointments</h3>
                <div className="space-y-3">
                  {appointments.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{app.doctorName}</p>
                          <p className="text-xs text-muted-foreground">{app.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">{app.date} · {app.timeSlot}</p>
                        <Badge variant={app.status === "Upcoming" ? "default" : "secondary"} className="text-xs mt-1">
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Health summary */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Health Vitals</h3>
                {[
                  { label: "Blood Pressure", value: `${vitals?.bloodPressure.systolic || `-`} / ${vitals?.bloodPressure.diastolic || `-`}`, status: `${vitals?.status.bp || `-`}`, color: "text-medical-green" },
                  { label: "Heart Rate", value: `${vitals?.heartRate || '-'} bpm`, status: vitals?.status.hr, color: "text-medical-green" },
                  { label: "Blood Sugar", value: `${vitals?.bloodSugar || '-'} mg/dL`, status: vitals?.status.sugar, color: "text-medical-green" },
                  { label: "BMI", value: vitals?.bmi, status: vitals?.status.bmi, color: "text-medical-green" },
                ].map((v) => (
                  <div key={v.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{v.label}</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{v.value}</p>
                      <p className={`text-xs ${v.color}`}>{v.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-medical-teal-light border border-medical-teal/20 p-5">
                <p className="text-sm font-semibold text-medical-teal mb-1">AI Tip of the Day</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Stay hydrated! Drinking 8 glasses of water daily can reduce fatigue and improve cognitive function by up to 30%.</p>
              </div>
            </div>
          </div>
        )}

        {/* AI HUB */}
        {activeTab === "ai-hub" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image upload */}
            <div className="rounded-2xl bg-card border border-border shadow-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">Upload Medical Image</h3>
              <p className="text-sm text-muted-foreground mb-6">Upload X-ray, MRI, or CT scan for AI analysis.</p>
              <label className={`flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploadedFile ? "border-medical-green bg-medical-green-light" : "border-border hover:border-medical-teal bg-muted/30"}`}>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setUploadedFile(e.target.files?.[0]?.name || null)} />
                {uploadedFile ? (
                  <>
                    <CheckCircle2 className="h-10 w-10 text-medical-green mb-2" />
                    <p className="text-sm font-semibold text-medical-green">File uploaded!</p>
                    <p className="text-xs text-muted-foreground mt-1">{uploadedFile}</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">DICOM, PNG, JPG · Max 50MB</p>
                  </>
                )}
              </label>
            </div>

            {/* Symptom checker */}
            <div className="rounded-2xl bg-card border border-border shadow-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">Symptom Checker</h3>
              <p className="text-sm text-muted-foreground mb-4">Select all symptoms you are experiencing.</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {symptoms.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedSymptoms.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Describe additional symptoms or medical history..."
                className="w-full h-24 rounded-xl bg-muted/50 border border-border p-3 text-sm resize-none focus:outline-none focus:border-medical-teal transition-colors"
              />
            </div>

            <div className="lg:col-span-2">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!uploadedFile && selectedSymptoms.length === 0)}
                className="w-full h-12 bg-gradient-ai text-primary-foreground font-semibold hover:opacity-90 gap-2"
              >
                <Brain className="h-5 w-5" />
                {isAnalyzing ? "Analyzing..." : "Run AI Diagnosis"}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card">
                <AIProcessingAnimation label="AI Analysis in Progress" subLabel="Analyzing your symptoms and medical images..." />
              </div>
            )}
          </div>
        )}

        {/* RESULTS */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {!showResults ? (
              <div className="rounded-2xl bg-card border border-border shadow-card p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No analysis yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Go to AI Diagnostics to upload an image or enter symptoms.</p>
                <Button onClick={() => setActiveTab("ai-hub")} variant="outline">Start Diagnosis</Button>
              </div>
            ) : (
              <>
                {/* Alert */}
                <div className="rounded-2xl bg-medical-amber-light border border-medical-amber/30 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-medical-amber shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Preliminary AI Results — Not a medical diagnosis</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Please consult with a licensed physician for a confirmed diagnosis and treatment plan.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Conditions */}
                  <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                    <h3 className="font-semibold text-lg text-foreground mb-4">Detected Conditions</h3>
                    {[
                      { name: "Pneumonia (Bacterial)", probability: 72, severity: "Moderate", color: "bg-medical-amber" },
                      { name: "Acute Bronchitis", probability: 45, severity: "Mild", color: "bg-medical-teal" },
                      { name: "Common Cold", probability: 28, severity: "Mild", color: "bg-medical-green" },
                    ].map((c) => (
                      <div key={c.name} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-foreground">{c.name}</span>
                          <span className="text-sm font-bold text-foreground">{c.probability}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${c.color}`} style={{ width: `${c.probability}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Severity: {c.severity}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Guidance */}
                  <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                    <h3 className="font-semibold text-lg text-foreground mb-4">AI Guidance</h3>
                    <div className="space-y-3">
                      {[
                        { icon: CheckCircle2, text: "Based on your symptoms, seek medical attention within 24-48 hours.", color: "text-medical-green" },
                        { icon: Activity, text: "Avoid strenuous exercise and get adequate rest.", color: "text-medical-teal" },
                        { icon: Pill, text: "Stay hydrated and monitor your temperature every 4 hours.", color: "text-primary" },
                        { icon: AlertCircle, text: "Seek emergency care if breathing becomes severely difficult.", color: "text-medical-red" },
                      ].map((g, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                          <g.icon className={`h-4 w-4 ${g.color} shrink-0 mt-0.5`} />
                          <p className="text-sm text-muted-foreground">{g.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={() => setActiveTab("doctors")}>
                    View Recommended Doctors <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("booking")}>
                    Book Appointment
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* DOCTORS */}
        {activeTab === "doctors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div key={doc.uid} className="rounded-2xl bg-card border border-border shadow-card p-6 hover:border-medical-teal/30 hover:shadow-elevated transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  {/* <div className="h-14 w-14 rounded-2xl bg-gradient-hero flex items-center justify-center">
                    <doc.icon className="h-7 w-7 text-primary-foreground" />
                  </div> */}
                  <div>
                    <h3 className="font-semibold text-foreground">{doc.fullname}</h3>
                    <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="text-medical-amber font-semibold">★ 4.5</span>
                  <span className="text-muted-foreground">5 experience</span>
                </div>
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-medical-green-light">
                  <Clock className="h-3.5 w-3.5 text-medical-green" />
                  <p className="text-xs font-medium text-medical-green">Available: {doc.workingHours ? Object.keys(doc.workingHours).length : 0} days</p>
                </div>
                <Button
                  className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
                  onClick={() => {
                    setActiveTab("booking");
                    setSelectedDoctor(doc);
                  }}
                >
                  Book Appointment
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* BOOKING */}
        {activeTab === "booking" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-card border border-border shadow-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-6">Select Date</h3>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {calendarDays.map((date) => {
                  const isSelected = selectedDay?.toDateString() === date.toDateString();
                  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        if (date.toDateString() != selectedDay?.toDateString()) {
                          setSelectedDay(date)
                          setIsLoadingSlots(true);
                        }
                      }}
                      className={`aspect-square rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-1 transition-all ${isSelected
                        ? "bg-gradient-hero text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      <span className="text-[10px] uppercase opacity-70">{dayName}</span>
                      <span className="text-base font-semibold">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              <h3 className="font-semibold text-foreground mb-3">Available Time Slots</h3>
              <div className="grid grid-cols-3 gap-2 min-h-[160px]">
                {(isLoadingSlots && selectedDoctor) ? (
                  <div className="col-span-3 flex flex-col items-center justify-center gap-3 py-10">
                    <div className="w-8 h-8 border-[3px] border-medical-teal/20 border-t-medical-teal rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading available times...</p>
                  </div>
                ) : (
                  (() => {
                    const dayName = selectedDay?.toLocaleDateString('en-US', { weekday: "long" });
                    const dayConfig = selectedDoctor?.workingHours?.[String(dayName)];
                    console.log("dayConfig : ", selectedDoctor);
                    if (!dayConfig) {
                      return <p className="col-span-3 text-sm text-muted-foreground text-center">There is not any Time available Today</p>;
                    }
                    const availableSlots = generateTimeSlots(dayConfig.start, dayConfig.end, Number(selectedDoctor.slotDuration));
                    // setIsLoadingSlots(false);
                    return availableSlots.map((slot: string) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-lg text-sm font-medium border transition-all ${selectedSlot === slot
                          ? "bg-medical-teal text-primary-foreground border-medical-teal"
                          : "border-border text-muted-foreground hover:border-medical-teal/40"
                          }`}
                      >
                        {slot}
                      </button>
                    ));
                  })()
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border shadow-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-6">Booking Summary</h3>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Doctor", value: selectedDoctor?.fullname },
                  { label: "Specialty", value: selectedDoctor?.specialty },
                  { label: "Date", value: selectedDay ? selectedDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : "—" },
                  { label: "Time", value: selectedSlot || "—" },
                  { label: "Type", value: "In-person" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

              {bookingSuccess ? (
                <div className="flex flex-col items-center py-4 gap-2">
                  <CheckCircle2 className="h-10 w-10 text-medical-green" />
                  <p className="font-semibold text-medical-green">Appointment booked!</p>
                </div>
              ) : (
                <Button
                  className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
                  disabled={!selectedDay || !selectedSlot}
                  onClick={handleBook}
                >
                  <Calendar className="h-4 w-4 mr-2" /> Confirm Booking
                </Button>
              )}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="rounded-2xl bg-card border border-border shadow-card">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-lg text-foreground">Medical History</h3>
            </div>
            <div className="divide-y divide-border">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{apt.date} · {apt.timeSlot}</p>
                    <Badge variant={apt.status === "Upcoming" ? "default" : "secondary"} className="text-xs mt-1">
                      {apt.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4">
                    View <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
