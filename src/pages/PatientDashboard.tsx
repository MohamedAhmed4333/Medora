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
import { Loader2, ImageOff, Check } from "lucide-react";
import { SymptomMultiSelect } from "../components/ui/SymptomMultiSelect";
import { useLocation } from "react-router-dom";

type TabType = "overview" | "ai-hub" | "results" | "doctors" | "booking" | "history";

const symptoms = ['anxiety_and_nervousness', 'depression', 'shortness_of_breath', 'depressive_or_psychotic_symptoms', 'sharp_chest_pain', 'dizziness', 'insomnia', 'abnormal_involuntary_movements', 'chest_tightness', 'palpitations', 'irregular_heartbeat', 'hoarse_voice', 'sore_throat', 'difficulty_speaking', 'cough', 'nasal_congestion', 'throat_swelling', 'diminished_hearing', 'lump_in_throat', 'throat_feels_tight', 'difficulty_in_swallowing', 'skin_swelling', 'retention_of_urine', 'groin_mass', 'leg_pain', 'hip_pain', 'suprapubic_pain', 'blood_in_stool', 'lack_of_growth', 'emotional_symptoms', 'elbow_weakness', 'back_weakness', 'symptoms_of_the_scrotum_and_testes', 'swelling_of_scrotum', 'pain_in_testicles', 'flatulence', 'pus_draining_from_ear', 'jaundice', 'mass_in_scrotum', 'white_discharge_from_eye', 'irritable_infant', 'abusing_alcohol', 'fainting', 'hostile_behavior', 'drug_abuse', 'sharp_abdominal_pain', 'feeling_ill', 'vomiting', 'headache', 'nausea', 'diarrhea', 'vaginal_itching', 'vaginal_dryness', 'painful_urination', 'involuntary_urination', 'pain_during_intercourse', 'frequent_urination', 'lower_abdominal_pain', 'vaginal_discharge', 'blood_in_urine', 'hot_flashes', 'intermenstrual_bleeding', 'hand_or_finger_pain', 'wrist_pain', 'hand_or_finger_swelling', 'arm_pain', 'wrist_swelling', 'arm_stiffness_or_tightness', 'arm_swelling', 'hand_or_finger_stiffness_or_tightness', 'wrist_stiffness_or_tightness', 'lip_swelling', 'toothache', 'abnormal_appearing_skin', 'skin_lesion', 'acne_or_pimples', 'dry_lips', 'facial_pain', 'mouth_ulcer', 'skin_growth', 'eye_deviation', 'diminished_vision', 'double_vision', 'cross_eyed', 'symptoms_of_eye', 'pain_in_eye', 'eye_moves_abnormally', 'abnormal_movement_of_eyelid', 'foreign_body_sensation_in_eye', 'irregular_appearing_scalp', 'swollen_lymph_nodes', 'back_pain', 'neck_pain', 'low_back_pain', 'pain_of_the_anus', 'pain_during_pregnancy', 'pelvic_pain', 'impotence', 'infant_spitting_up', 'vomiting_blood', 'regurgitation', 'burning_abdominal_pain', 'restlessness', 'symptoms_of_infants', 'wheezing', 'peripheral_edema', 'neck_mass', 'ear_pain', 'jaw_swelling', 'mouth_dryness', 'neck_swelling', 'knee_pain', 'foot_or_toe_pain', 'bowlegged_or_knock_kneed', 'ankle_pain', 'bones_are_painful', 'knee_weakness', 'elbow_pain', 'knee_swelling', 'skin_moles', 'knee_lump_or_mass', 'weight_gain', 'problems_with_movement', 'knee_stiffness_or_tightness', 'leg_swelling', 'foot_or_toe_swelling', 'heartburn', 'smoking_problems', 'muscle_pain', 'infant_feeding_problem', 'recent_weight_loss', 'problems_with_shape_or_size_of_breast', 'difficulty_eating', 'vaginal_pain', 'vaginal_redness', 'vulvar_irritation', 'weakness', 'decreased_heart_rate', 'increased_heart_rate', 'bleeding_or_discharge_from_nipple', 'ringing_in_ear', 'plugged_feeling_in_ear', 'itchy_ear_s_', 'frontal_headache', 'fluid_in_ear', 'neck_stiffness_or_tightness', 'spots_or_clouds_in_vision', 'eye_redness', 'lacrimation', 'itchiness_of_eye', 'blindness', 'eye_burns_or_stings', 'itchy_eyelid', 'feeling_cold', 'decreased_appetite', 'excessive_appetite', 'excessive_anger', 'loss_of_sensation', 'focal_weakness', 'slurring_words', 'symptoms_of_the_face', 'disturbance_of_memory', 'paresthesia', 'side_pain', 'fever', 'shoulder_pain', 'shoulder_stiffness_or_tightness', 'shoulder_weakness', 'shoulder_swelling', 'tongue_lesions', 'leg_cramps_or_spasms', 'ache_all_over', 'lower_body_pain', 'problems_during_pregnancy', 'spotting_or_bleeding_during_pregnancy', 'cramps_and_spasms', 'upper_abdominal_pain', 'stomach_bloating', 'changes_in_stool_appearance', 'unusual_color_or_odor_to_urine', 'kidney_mass', 'swollen_abdomen', 'symptoms_of_prostate', 'leg_stiffness_or_tightness', 'difficulty_breathing', 'rib_pain', 'joint_pain', 'muscle_stiffness_or_tightness', 'hand_or_finger_lump_or_mass', 'chills', 'groin_pain', 'fatigue', 'abdominal_distention', 'regurgitation_1', 'symptoms_of_the_kidneys', 'melena', 'flushing', 'coughing_up_sputum', 'seizures', 'delusions_or_hallucinations', 'pain_or_soreness_of_breast', 'excessive_urination_at_night', 'bleeding_from_eye', 'rectal_bleeding', 'constipation', 'temper_problems', 'coryza', 'wrist_weakness', 'hemoptysis', 'lymphedema', 'skin_on_leg_or_foot_looks_infected', 'allergic_reaction', 'congestion_in_chest', 'muscle_swelling', 'sleepiness', 'apnea', 'abnormal_breathing_sounds', 'blood_clots_during_menstrual_periods', 'absence_of_menstruation', 'pulling_at_ears', 'gum_pain', 'redness_in_ear', 'fluid_retention', 'flu_like_syndrome', 'sinus_congestion', 'painful_sinuses', 'fears_and_phobias', 'recent_pregnancy', 'uterine_contractions', 'burning_chest_pain', 'back_cramps_or_spasms', 'stiffness_all_over', 'muscle_cramps_contractures_or_spasms', 'low_back_cramps_or_spasms', 'back_mass_or_lump', 'nosebleed', 'long_menstrual_periods', 'heavy_menstrual_flow', 'unpredictable_menstruation', 'painful_menstruation', 'infertility', 'frequent_menstruation', 'sweating', 'mass_on_eyelid', 'swollen_eye', 'eyelid_swelling', 'eyelid_lesion_or_rash', 'symptoms_of_bladder', 'irregular_appearing_nails', 'itching_of_skin', 'hurts_to_breath', 'skin_dryness_peeling_scaliness_or_roughness', 'skin_on_arm_or_hand_looks_infected', 'skin_irritation', 'itchy_scalp', 'warts', 'bumps_on_penis', 'too_little_hair', 'foot_or_toe_lump_or_mass', 'skin_rash', 'ankle_swelling', 'drainage_in_throat', 'premenstrual_tension_or_irritability', 'feeling_hot', 'foot_or_toe_stiffness_or_tightness', 'elbow_swelling', 'early_or_late_onset_of_menopause', 'bleeding_from_ear', 'hand_or_finger_weakness', 'low_self_esteem', 'itching_of_the_anus', 'swollen_or_red_tonsils', 'irregular_belly_button', 'lip_sore', 'vulvar_sore', 'hip_stiffness_or_tightness', 'mouth_pain', 'arm_weakness', 'leg_lump_or_mass', 'penis_pain', 'loss_of_sex_drive', 'obsessions_and_compulsions', 'antisocial_behavior', 'neck_cramps_or_spasms', 'poor_circulation', 'thirst', 'sneezing', 'bladder_mass', 'premature_ejaculation', 'leg_weakness', 'penis_redness', 'penile_discharge', 'cloudy_eye', 'arm_lump_or_mass', 'nightmares', 'bleeding_gums', 'pain_in_gums', 'bedwetting', 'diaper_rash', 'lump_or_mass_of_breast', 'vaginal_bleeding_after_menopause', 'postpartum_problems_of_the_breast', 'hesitancy', 'muscle_weakness', 'throat_redness', 'redness_in_or_around_nose', 'wrinkles_on_skin', 'foot_or_toe_weakness', 'hand_or_finger_cramps_or_spasms', 'skin_pain', 'low_urine_output', 'ankle_weakness', 'symptom_count']



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


interface X_rayApiResponse {
  status: string;
  results: string[];
}
interface MriApiResponse {
  status: string;
  results: string[];
  confidence: number;
}

interface RadiologyResultCardProps {
  title: string;
  disease: string;
  isNormal: boolean;
  confidence?: number;
}

function RadiologyResultCard({
  title,
  disease,
  isNormal,
  confidence,
}: RadiologyResultCardProps) {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isNormal
            ? "text-green-600 bg-green-50 dark:bg-green-950/30"
            : "text-destructive bg-destructive/10"
            }`}
        >
          {isNormal ? "Normal" : "Abnormal"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${isNormal ? "bg-green-500" : "bg-destructive"
              }`}
          />
          <span className="text-sm font-medium text-foreground capitalize">
            {disease.replace(/_/g, " ")}
          </span>
        </div>

        {confidence !== undefined && (
          <span className="text-xs font-semibold text-muted-foreground">
            {confidence}%
          </span>
        )}
      </div>
    </div>
  );
}
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
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [xrayFile, setXrayFile] = useState<File | null>(null);
  const [mriFile, setMriFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<X_rayApiResponse | null>(null);
  const [mriResult, setMriResult] = useState<MriApiResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "overview" || hash === "ai-hub" || hash === "history") {
      setActiveTab(hash as TabType);
    } else {
      setActiveTab("overview");
    }
  }, [location.hash]);

  const handleSaveResults = async () => {
    setIsSaving(true);
    try {
      await saveResults();
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowResults(false);

    try {

      if (selectedSymptoms.length > 0) {
        const symptomsVector = symptoms.map(symptom =>
          selectedSymptoms.includes(symptom) ? 1 : 0
        );

        const response = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symptoms: symptomsVector }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          setAiResults(data.predictions);
        }
      }


      if (xrayFile !== null) {
        const formData = new FormData();
        formData.append("file", xrayFile);

        const xrayResponse = await fetch("http://127.0.0.1:8000/predict-xray", {
          method: "POST",
          body: formData,
        });

        const xrayData = await xrayResponse.json();
        console.log("API RESPONSE:", xrayData);
        if (xrayData.status === "success") {
          setPredictionResult(xrayData);
        }
      }

      if (mriFile !== null) {
        const formData = new FormData();
        formData.append("file", mriFile);

        const mriResponse = await fetch("http://127.0.0.1:8000/predict-mri", {
          method: "POST",
          body: formData,
        });

        const mriData = await mriResponse.json();
        if (mriData.status === "success") {
          setMriResult(mriData);
        }
      }

    } catch (error) {
      console.error("Failed to connect to AI server:", error);
    } finally {
      setIsAnalyzing(false);
      setShowResults(true);
      setActiveTab("results");
    }
  };

  const saveResults = async () => {
    if (aiResults != null && user?.uid) {
      try {
        await addDoc(collection(db, "users", user.uid, "Symptoms"), {
          createdAt: serverTimestamp(),
          predictions: {
            first: aiResults?.[0]?.disease,
            conf1: aiResults?.[0]?.confidence,
            second: aiResults?.[1]?.disease,
            conf2: aiResults?.[1]?.confidence,
            third: aiResults?.[2]?.disease,
            conf3: aiResults?.[2]?.confidence
          }
        });
        console.log("تم حفظ الأعراض بنجاح في الفايرستور!");
      } catch (error) {
        console.error("حدث خطأ أثناء حفظ الأعراض:", error);
      }
    }
    if (predictionResult != null && user?.uid) {
      try {
        await addDoc(collection(db, "users", user.uid, "X_Ray"), {
          createdAt: serverTimestamp(),
          predictions: predictionResult?.results?.[0]
        });
        console.log("تم حفظ الأعراض بنجاح في الفايرستور!");
      } catch (error) {
        console.error("حدث خطأ أثناء حفظ الأعراض:", error);
      }
    }
    if (mriResult != null && user?.uid) {
      try {
        await addDoc(collection(db, "users", user.uid, "MRI"), {
          createdAt: serverTimestamp(),
          predictions: mriResult?.results?.[0],
          confidence: mriResult?.confidence
        });
        console.log("تم حفظ الأعراض بنجاح في الفايرستور!");
      } catch (error) {
        console.error("حدث خطأ أثناء حفظ الأعراض:", error);
      }
    }

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
  }, [user?.uid, bookingSuccess])

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
        {user && <AIChatbot user={user} />}
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
      {user && <AIChatbot user={user} />}

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

            {/* Image upload section */}
            <div className="rounded-2xl bg-card border border-border shadow-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">Upload Medical Images</h3>
              <p className="text-sm text-muted-foreground mb-6">Upload X-ray and MRI scans for specialized AI analysis.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground block px-1">X-Ray Image</span>
                  <label className={`flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all ${xrayFile ? "border-medical-green bg-medical-green-light/20" : "border-border hover:border-medical-teal bg-muted/30"}`}>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setXrayFile(e.target.files?.[0] || null)}
                    />
                    {xrayFile ? (
                      <div className="text-center p-4">
                        <CheckCircle2 className="h-8 w-8 text-medical-green mx-auto mb-2" />
                        <p className="text-xs font-semibold text-medical-green truncate max-w-[150px]">{xrayFile.name}</p>
                        <button
                          onClick={(e) => { e.preventDefault(); setXrayFile(null); }}
                          className="text-[10px] text-red-500 underline mt-2 block mx-auto hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs font-semibold text-foreground">Upload X-Ray</p>
                        <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG up to 50MB</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground block px-1">MRI Scan</span>
                  <label className={`flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all ${mriFile ? "border-medical-green bg-medical-green-light/20" : "border-border hover:border-medical-teal bg-muted/30"}`}>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setMriFile(e.target.files?.[0] || null)}
                    />
                    {mriFile ? (
                      <div className="text-center p-4">
                        <CheckCircle2 className="h-8 w-8 text-medical-green mx-auto mb-2" />
                        <p className="text-xs font-semibold text-medical-green truncate max-w-[150px]">{mriFile.name}</p>
                        <button
                          onClick={(e) => { e.preventDefault(); setMriFile(null); }}
                          className="text-[10px] text-red-500 underline mt-2 block mx-auto hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs font-semibold text-foreground">Upload MRI</p>
                        <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG up to 50MB</p>
                      </div>
                    )}
                  </label>
                </div>

              </div>
            </div>

            {/* Symptom checker */}
            <div className="rounded-2xl bg-card border border-border shadow-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">Symptom Checker</h3>
              <p className="text-sm text-muted-foreground mb-4">Select all symptoms you are experiencing.</p>

              <SymptomMultiSelect
                symptoms={symptoms}
                selectedSymptoms={selectedSymptoms}
                onChange={setSelectedSymptoms}
              />

              <textarea
                placeholder="Describe additional symptoms or medical history..."
                className="w-full h-24 rounded-xl bg-muted/50 border border-border p-3 text-sm resize-none focus:outline-none focus:border-medical-teal transition-colors mt-4"
              />
            </div>

            <div className="lg:col-span-2">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!xrayFile && !mriFile && selectedSymptoms.length === 0)}
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

                  <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                    <h3 className="font-semibold text-lg text-foreground mb-4">Radiology Results</h3>

                    {(() => {
                      const xrayDisease = predictionResult?.results?.[0] ?? null;
                      const mriDisease = mriResult?.results?.[0] ?? null;
                      const mriConf = mriResult?.confidence ?? null;

                      if (!xrayDisease && !mriDisease) {
                        return (
                          <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                              <ImageOff className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">No scans analyzed yet</p>
                            <p className="text-xs text-muted-foreground max-w-[220px]">
                              Upload an X-Ray or MRI scan to see AI-powered radiology results here.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {/* X-Ray Result */}
                          {xrayDisease && (
                            <RadiologyResultCard
                              title="X-Ray"
                              disease={xrayDisease}
                              isNormal={xrayDisease === "normal"}
                            />
                          )}

                          {/* MRI Result */}
                          {mriDisease && (

                            <RadiologyResultCard
                              title="MRI"
                              disease={mriDisease}
                              isNormal={mriDisease === "no_tumor"}
                              confidence={Number(mriConf.toFixed(5)) * 100}
                            />
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Detected Conditions - مكان AI Guidance القديم */}
                  <div className="rounded-2xl bg-card border border-border shadow-card p-6">
                    <h3 className="font-semibold text-lg text-foreground mb-4">Detected Conditions</h3>
                    {aiResults.map((item, index) => {
                      const numericConfidence = parseFloat(item.confidence.replace('%', ''));
                      let severity = "Low Risk";
                      let severityColor = "text-green-600 bg-green-50 dark:bg-green-950/30";

                      if (numericConfidence > 70) {
                        severity = "High Risk";
                        severityColor = "text-destructive bg-destructive/10";
                      } else if (numericConfidence > 30) {
                        severity = "Moderate Risk";
                        severityColor = "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
                      }
                      return (
                        <div key={index} className="mb-4 last:mb-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-foreground capitalize">
                              {item.disease.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              {item.confidence}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-medical-teal transition-all duration-500 ease-out"
                              style={{ width: `${numericConfidence}%` }}
                            />
                          </div>
                          <div className="mt-1.5">
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${severityColor}`}>
                              Severity: {severity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="bg-gradient-hero text-primary-foreground hover:opacity-90"
                    onClick={handleSaveResults}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Ai Results for Doctors <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
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
                  {/* <Button variant="ghost" size="sm" className="ml-4">
                    View <ChevronRight className="h-4 w-4 ml-1" />
                  </Button> */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
