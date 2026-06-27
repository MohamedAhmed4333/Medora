import { useEffect, useState } from "react";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import {serverTimestamp} from "firebase/firestore";
import { useLoading } from "../context/loadingcontext";
import { useAuth } from "../context/AuthContext";
type Step = 1 | 2 | 3 | 4;

interface PatientData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  exercise: string;
  sleepHours: string;
  smoking: string;
  systolic?: string;
  diastolic?: string;
  heartRate?: string;
  bloodSugar?: string;
}

const initialData: PatientData = {
  age: "", gender: "", height: "", weight: "",
  exercise: "", sleepHours: "", smoking: "",
  systolic: "", diastolic: "", heartRate: "", bloodSugar: "",
};


function buildFirebasePayload(data: PatientData, bmi: string | null) {
  const sys = Number(data.systolic);
  const dia = Number(data.diastolic);
  const hr = Number(data.heartRate);
  const sugar = Number(data.bloodSugar);
  const bmiNum = bmi ? Number(bmi) : 0;

  const bmiStatus =
    bmiNum < 18.5 ? "Underweight" : bmiNum < 25 ? "Normal" : bmiNum < 30 ? "Overweight" : "Obese";
  const bpStatus =
    sys === 0 && dia === 0? "-":
    sys < 120 && dia < 80 ? "Normal"
      : sys < 130 && dia < 80 ? "Elevated"
        : sys < 140 || dia < 90 ? "High Stage 1"
          : "High Stage 2";
  const hrStatus = hr === 0? "-" :hr < 60 ? "Bradycardia" : hr <= 100 ? "Normal" : "Tachycardia";
  const sugarStatus =
    sugar === 0? "-" : sugar < 70 ? "Low" : sugar <= 99 ? "Normal" : sugar <= 125 ? "Prediabetes" : "High";

  return {
    bloodPressure: { systolic: sys, diastolic: dia },
    bloodSugar: sugar,
    bmi: bmiNum,
    createdAt: new Date(),
    heartRate: hr,
    status: { bmi: bmiStatus, bp: bpStatus, hr: hrStatus, sugar: sugarStatus },
    age: Number(data.age),
    gender: data.gender,
    height: Number(data.height),
    weight: Number(data.weight),
    exercise: data.exercise,
    sleepHours: Number(data.sleepHours),
    smoking: data.smoking,
  };
}

const exerciseOptions = [
  { value: "none", label: "None", icon: "🛋️" },
  { value: "light", label: "Light (1–2×/week)", icon: "🚶" },
  { value: "moderate", label: "Moderate (3–4×/week)", icon: "🏃" },
  { value: "intense", label: "Intense (5+×/week)", icon: "💪" },
];

const smokingOptions = [
  { value: "never", label: "Never Smoked", icon: "✅" },
  { value: "former", label: "Former Smoker", icon: "🕐" },
  { value: "occasional", label: "Occasional", icon: "⚠️" },
  { value: "daily", label: "Daily Smoker", icon: "🚬" },
];

function bpLabel(sys: number, dia: number) {
  if (!sys || !dia || isNaN(sys) || isNaN(dia)) {
    return null;
  }
  if (sys < 120 && dia < 80) return { label: "Normal", color: "#34d399" };
  if (sys < 130 && dia < 80) return { label: "Elevated", color: "#fbbf24" };
  if (sys < 140 || dia < 90) return { label: "High Stage 1", color: "#fb923c" };
  return { label: "High Stage 2", color: "#f87171" };
}
function hrLabel(hr: number) {
  if (!hr) return null;
  if (hr < 60) return { label: "Bradycardia", color: "#60a5fa" };
  if (hr <= 100) return { label: "Normal", color: "#34d399" };
  return { label: "Tachycardia", color: "#f87171" };
}
function sugarLabel(sugar: number) {
  if (!sugar) return null;
  if (sugar < 70) return { label: "Low", color: "#60a5fa" };
  if (sugar <= 99) return { label: "Normal", color: "#34d399" };
  if (sugar <= 125) return { label: "Prediabetes", color: "#fbbf24" };
  return { label: "High", color: "#f87171" };
}


export default function PatientHealthForm({ user }) {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<PatientData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [firebasePayload, setFirebasePayload] = useState<ReturnType<typeof buildFirebasePayload> | null>(null);
  const {loading, setLoading} = useLoading();
  const {mode, setMode} = useAuth();
  const update = (field: keyof PatientData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const TOTAL = 4;

  const goNext = () => { setAnimating(true); setTimeout(() => { setStep((s) => (s < TOTAL ? (s + 1) as Step : s)); setAnimating(false); }, 200); };
  const goBack = () => { setAnimating(true); setTimeout(() => { setStep((s) => (s > 1 ? (s - 1) as Step : s)); setAnimating(false); }, 200); };

  // const handleSubmit = () => {
    
  //   const payload = buildFirebasePayload(data, bmi);
  //   setFirebasePayload(payload);
  //   setSubmitted(true);
  //   console.log("Firebase Payload:", JSON.stringify(payload, null, 2));
  // };

  const bmi = data.height && data.weight
    ? (Number(data.weight) / (Number(data.height) / 100) ** 2).toFixed(1)
    : null;
  const bmiCategory = bmi
    ? Number(bmi) < 18.5 ? { label: "Underweight", color: "#60a5fa" }
      : Number(bmi) < 25 ? { label: "Normal", color: "#34d399" }
        : Number(bmi) < 30 ? { label: "Overweight", color: "#fbbf24" }
          : { label: "Obese", color: "#f87171" }
    : null;
  
  const bpStatus = bpLabel(Number(data.systolic), Number(data.diastolic));
  const hrStatus = hrLabel(Number(data.heartRate));
  const sugarStatus = sugarLabel(Number(data.bloodSugar));

  const stepLabels = ["Personal Info", "Measurements", "Lifestyle", "Vitals"];
  const stepValid: Record<Step, boolean> = {
    1: !!data.age && !!data.gender,
    2: !!data.height && !!data.weight,
    3: !!data.exercise && !!data.sleepHours && !!data.smoking,
    4: true,
  };


  const addTodatabase = async () => {
    setLoading(true);
    const payload = buildFirebasePayload(data, bmi);
    await updateDoc(doc(db, "users", user.uid), {
      age : payload.age,
      height : payload.height,
      weight: payload.weight,
      gender : payload.gender,
      lifestyle : {
        exercise: payload.exercise,
        sleephours: payload.sleepHours,
        smoking: payload.smoking, 
      },
      stats: {
        cancelled : 0,
        completed: 0,
        upcoming: 0
      }
    });
    await addDoc(collection(db, "users", user.uid, "vitals"), {
      bloodPressure: {
        diastolic: payload.bloodPressure.diastolic || null,
        systolic: payload.bloodPressure.systolic || null
      },
      bloodSugar: payload.bloodSugar || null,
      bmi: payload.bmi,
      heartRate : payload.heartRate || null,
      status: {
        bmi: payload.status.bmi,
        bp: payload.status.bp,
        hr: payload.status.hr,
        sugar: payload.status.sugar
      },
      createdAt : serverTimestamp()
    })
    setMode("login");
  }


  return (
    <div style={S.root}>
      {/* LEFT */}
      <div style={S.left}>
        <div style={S.leftOverlay} />
        <div style={S.leftContent}>
          <div style={S.logo}>
            <span style={S.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </span>
            <span style={S.logoText}>Medora <span style={S.logoAccent}>System</span></span>
          </div>
          <div style={S.leftHero}>
            <h2 style={S.leftHeading}>Your health profile,<br />powered by AI.</h2>
            <p style={S.leftSub}>Help us personalise your diagnostics & care recommendations by filling in your health details.</p>
          </div>
          <ul style={S.featureList}>
            {["Instant AI health risk analysis", "Personalised specialist matching", "HIPAA-compliant & encrypted", "Smart appointment scheduling"].map((f) => (
              <li key={f} style={S.featureItem}>
                <span style={S.featureCheck}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div style={S.leftSteps}>
            {stepLabels.map((label, i) => (
              <div key={label} style={S.leftStep}>
                <div style={{ ...S.leftStepDot, background: step > i + 1 ? "#0d9488" : step === i + 1 ? "white" : "rgba(255,255,255,0.2)", border: step === i + 1 ? "2px solid white" : "2px solid transparent" }} />
                <span style={{ ...S.leftStepLabel, opacity: step === i + 1 ? 1 : 0.5, fontWeight: step === i + 1 ? 600 : 400 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={S.right}>
        {!submitted ? (
          <div style={{ ...S.formCard, opacity: animating ? 0 : 1, transform: animating ? "translateY(10px)" : "translateY(0)", transition: "opacity 0.2s, transform 0.2s" }}>
            <div style={S.progressBar}>
              <div style={{ ...S.progressFill, width: `${(step / TOTAL) * 100}%` }} />
            </div>
            <div style={S.formHeader}>
              <p style={S.stepLabel}>Step {step} of {TOTAL}</p>
              <h2 style={S.formTitle}>{stepLabels[step - 1]}</h2>
              <p style={S.formSub}>
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "Enter your body measurements"}
                {step === 3 && "Share your daily lifestyle habits"}
                {step === 4 && "Enter your latest vital signs"}
              </p>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div style={S.fields}>
                <div style={S.field}>
                  <label style={S.label}>Age</label>
                  <div style={S.inputWrapper}>
                    <input type="number" min={1} max={120} placeholder="e.g. 32" value={data.age} onChange={(e) => update("age", e.target.value)} style={S.input} />
                    <span style={S.inputUnit}>yrs</span>
                  </div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Gender</label>
                  <div style={S.genderGrid}>
                    {[{ value: "male", label: "Male", icon: "♂" }, { value: "female", label: "Female", icon: "♀" }].map((g) => (
                      <button key={g.value} onClick={() => update("gender", g.value)} style={{ ...S.optionBtn, ...(data.gender === g.value ? S.optionBtnActive : {}) }}>
                        <span style={S.optionIcon}>{g.icon}</span>
                        <span style={S.optionLabel}>{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={S.fields}>
                <div style={S.twoCol}>
                  <div style={S.field}>
                    <label style={S.label}>Height</label>
                    <div style={S.inputWrapper}>
                      <input type="number" min={50} max={250} placeholder="170" value={data.height} onChange={(e) => update("height", e.target.value)} style={S.input} />
                      <span style={S.inputUnit}>cm</span>
                    </div>
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Weight</label>
                    <div style={S.inputWrapper}>
                      <input type="number" min={20} max={300} placeholder="70" value={data.weight} onChange={(e) => update("weight", e.target.value)} style={S.input} />
                      <span style={S.inputUnit}>kg</span>
                    </div>
                  </div>
                </div>
                {bmi && bmiCategory && (
                  <div style={{ ...S.vitalCard, borderColor: bmiCategory.color }}>
                    <div style={S.vitalCardRow}>
                      <div>
                        <p style={S.vitalCardTitle}>Your BMI</p>
                        <p style={{ ...S.vitalCardValue, color: bmiCategory.color }}>{bmi}</p>
                      </div>
                      <div style={{ ...S.statusBadge, background: bmiCategory.color + "22", color: bmiCategory.color }}>{bmiCategory.label}</div>
                    </div>
                    <div style={S.bmiScale}>
                      {[{ range: "<18.5", color: "#60a5fa" }, { range: "18.5–25", color: "#34d399" }, { range: "25–30", color: "#fbbf24" }, { range: ">30", color: "#f87171" }].map((s) => (
                        <div key={s.range} style={{ textAlign: "center" as const, flex: 1 }}>
                          <div style={{ width: "100%", height: 4, background: s.color, borderRadius: 2 }} />
                          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.range}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div style={S.fields}>
                <div style={S.field}>
                  <label style={S.label}>Exercise Frequency</label>
                  <div style={S.optionGrid}>
                    {exerciseOptions.map((opt) => (
                      <button key={opt.value} onClick={() => update("exercise", opt.value)} style={{ ...S.optionBtn, ...(data.exercise === opt.value ? S.optionBtnActive : {}) }}>
                        <span style={S.optionIcon}>{opt.icon}</span>
                        <span style={S.optionLabel}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Sleep Hours / Night <span style={{ color: "#0d9488", fontWeight: 700 }}>{data.sleepHours || "—"}h</span></label>
                  <input type="range" min={2} max={14} step={0.5} value={data.sleepHours || 7} onChange={(e) => update("sleepHours", e.target.value)} style={S.slider} />
                  <div style={S.sliderLabels}><span>2h</span><span style={{ color: "#34d399" }}>7–9h ideal</span><span>14h</span></div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Smoking Status</label>
                  <div style={S.optionGrid}>
                    {smokingOptions.map((opt) => (
                      <button key={opt.value} onClick={() => update("smoking", opt.value)} style={{ ...S.optionBtn, ...(data.smoking === opt.value ? S.optionBtnActive : {}) }}>
                        <span style={S.optionIcon}>{opt.icon}</span>
                        <span style={S.optionLabel}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — VITALS */}
            {step === 4 && (
              <div style={S.fields}>
                {/* Blood Pressure */}
                <div style={S.field}>
                  <label style={S.label}>
                    Blood Pressure
                    {bpStatus && <span style={{ ...S.inlineBadge, background: bpStatus.color + "22", color: bpStatus.color }}>{bpStatus.label}</span>}
                  </label>
                  <div style={S.twoCol}>
                    <div style={S.inputWrapper}>
                      <input type="number" min={60} max={250} placeholder="120 - Optional" value={data.systolic} onChange={(e) => update("systolic", e.target.value)} style={S.input} />
                      <span style={S.inputUnit}>sys</span>
                    </div>
                    <div style={S.inputWrapper}>
                      <input type="number" min={40} max={150} placeholder="80 - Optional" value={data.diastolic} onChange={(e) => update("diastolic", e.target.value)} style={S.input} />
                      <span style={S.inputUnit}>dia</span>
                    </div>
                  </div>
                  <p style={S.fieldHint}>mmHg — systolic / diastolic</p>
                  {bpStatus && (
                    <div style={{ ...S.vitalCard, borderColor: bpStatus.color, padding: "10px 14px" }}>
                      <div style={S.vitalCardRow}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>{data.systolic}/{data.diastolic} mmHg</span>
                        <div style={{ ...S.statusBadge, background: bpStatus.color + "22", color: bpStatus.color }}>{bpStatus.label}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Heart Rate */}
                <div style={S.field}>
                  <label style={S.label}>
                    Heart Rate
                    {hrStatus && <span style={{ ...S.inlineBadge, background: hrStatus.color + "22", color: hrStatus.color }}>{hrStatus.label}</span>}
                  </label>
                  <div style={S.inputWrapper}>
                    <input type="number" min={30} max={220} placeholder="72 - Optional" value={data.heartRate} onChange={(e) => update("heartRate", e.target.value)} style={S.input} />
                    <span style={S.inputUnit}>bpm</span>
                  </div>
                  <p style={S.fieldHint}>Normal resting: 60–100 bpm</p>
                </div>

                {/* Blood Sugar */}
                <div style={S.field}>
                  <label style={S.label}>
                    Blood Sugar (Fasting)
                    {sugarStatus && <span style={{ ...S.inlineBadge, background: sugarStatus.color + "22", color: sugarStatus.color }}>{sugarStatus.label}</span>}
                  </label>
                  <div style={S.inputWrapper}>
                    <input type="number" min={40} max={500} placeholder="90 - Optional" value={data.bloodSugar} onChange={(e) => update("bloodSugar", e.target.value)} style={S.input} />
                    <span style={S.inputUnit}>mg/dL</span>
                  </div>
                  <p style={S.fieldHint}>Normal fasting: 70–99 mg/dL</p>
                </div>

                <div style={S.autoNote}>
                  <span>⚡</span>
                  <span>BMI · BP · HR · Sugar statuses will be computed automatically on submit</span>
                </div>
              </div>
            )}

            {/* NAV */}
            <div style={S.navRow}>
              {step > 1 && <button onClick={goBack} style={S.backBtn}>← Back</button>}
              <div style={{ flex: 1 }} />
              {step < TOTAL ? (
                <button onClick={goNext} disabled={!stepValid[step]} style={{ ...S.nextBtn, opacity: stepValid[step] ? 1 : 0.45, cursor: stepValid[step] ? "pointer" : "not-allowed" }}>Continue →</button>
              ) : (
                <button onClick={addTodatabase} disabled={!stepValid[4]} style={{ ...S.nextBtn, opacity: stepValid[4] ? 1 : 0.45, cursor: stepValid[4] ? "pointer" : "not-allowed" }}>Save ✓</button>
              )}
            </div>
            <p style={S.footerNote}>🔒 Your data is encrypted and HIPAA-compliant</p>
          </div>
        ) : (
          /* SUCCESS */
          <div style={S.successCard}>
            <div style={S.successIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={S.successTitle}>Profile Saved!</h2>
            <p style={S.successSub}>All status fields computed automatically — ready to write to Firestore.</p>
            {firebasePayload && (
              <div style={S.payloadPreview}>
                <p style={S.payloadTitle}>📦 Firebase Payload</p>
                <div style={S.payloadGrid}>
                  {[
                    { label: "bloodPressure", value: `${firebasePayload.bloodPressure.systolic}/${firebasePayload.bloodPressure.diastolic} mmHg` },
                    { label: "bloodSugar", value: `${firebasePayload.bloodSugar} mg/dL` },
                    { label: "bmi", value: String(firebasePayload.bmi) },
                    { label: "heartRate", value: `${firebasePayload.heartRate} bpm` },
                    { label: "status.bmi", value: firebasePayload.status.bmi },
                    { label: "status.bp", value: firebasePayload.status.bp },
                    { label: "status.hr", value: firebasePayload.status.hr },
                    { label: "status.sugar", value: firebasePayload.status.sugar },
                    { label: "age", value: `${firebasePayload.age} yrs` },
                    { label: "gender", value: firebasePayload.gender },
                    { label: "exercise", value: firebasePayload.exercise },
                    { label: "sleepHours", value: `${firebasePayload.sleepHours}h` },
                  ].map((item) => (
                    <div key={item.label} style={S.payloadItem}>
                      <p style={S.summaryLabel}>{item.label}</p>
                      <p style={S.summaryValue}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => { setSubmitted(false); setStep(1); setData(initialData); setFirebasePayload(null); }} style={S.nextBtn}>Start Over</button>
          </div>
        )}
      </div>

      {/* FAB */}
      <button style={S.fab}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Ask Medora AI
      </button>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f8fafc" },
  left: { width: "42%", background: "linear-gradient(145deg,#0f3460 0%,#0d6e7e 50%,#0d9488 100%)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" },
  leftOverlay: { position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 20%,rgba(255,255,255,.07) 0%,transparent 60%),radial-gradient(circle at 20% 80%,rgba(13,148,136,.3) 0%,transparent 50%)", pointerEvents: "none" },
  leftContent: { position: "relative", zIndex: 1, padding: "48px 44px", display: "flex", flexDirection: "column", height: "100%" },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 56 },
  logoIcon: { width: 40, height: 40, background: "rgba(255,255,255,.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" },
  logoText: { color: "white", fontWeight: 700, fontSize: 20, letterSpacing: "-.3px" },
  logoAccent: { color: "#5eead4" },
  leftHero: { marginBottom: 36 },
  leftHeading: { color: "white", fontSize: 30, fontWeight: 800, lineHeight: 1.25, margin: "0 0 12px", letterSpacing: "-.5px" },
  leftSub: { color: "rgba(255,255,255,.65)", fontSize: 14, lineHeight: 1.65, margin: 0 },
  featureList: { listStyle: "none", padding: 0, margin: "0 0 auto", display: "flex", flexDirection: "column", gap: 14 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,.85)", fontSize: 14 },
  featureCheck: { width: 22, height: 22, background: "rgba(255,255,255,.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  leftSteps: { marginTop: 40, display: "flex", flexDirection: "column", gap: 12 },
  leftStep: { display: "flex", alignItems: "center", gap: 12 },
  leftStepDot: { width: 10, height: 10, borderRadius: "50%", transition: "all .3s", flexShrink: 0 },
  leftStepLabel: { color: "white", fontSize: 13, transition: "all .3s" },
  right: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#f8fafc" },
  formCard: { width: "100%", maxWidth: 480, background: "white", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,0,0,.08)", padding: "0 0 32px", overflow: "hidden" },
  progressBar: { height: 4, background: "#e2e8f0", borderRadius: "4px 4px 0 0", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#0d6e7e,#0d9488)", borderRadius: 4, transition: "width .4s cubic-bezier(.4,0,.2,1)" },
  formHeader: { padding: "28px 36px 8px" },
  stepLabel: { color: "#0d9488", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" },
  formTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-.5px" },
  formSub: { color: "#64748b", fontSize: 14, margin: 0 },
  fields: { padding: "20px 36px", display: "flex", flexDirection: "column", gap: 22 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 8 },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  input: { width: "100%", padding: "11px 52px 11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 15, color: "#0f172a", outline: "none", transition: "border-color .2s", boxSizing: "border-box" as const, background: "#f8fafc" },
  inputUnit: { position: "absolute", right: 14, color: "#94a3b8", fontSize: 11, fontWeight: 700, pointerEvents: "none", textTransform: "uppercase" as const, letterSpacing: .5 },
  fieldHint: { fontSize: 11, color: "#94a3b8", margin: 0 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  genderGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  optionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  optionBtn: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "12px 8px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", cursor: "pointer", transition: "all .2s", color: "#475569", fontSize: 13, fontWeight: 500 },
  optionBtnActive: { border: "1.5px solid #0d9488", background: "#f0fdfa", color: "#0d6e7e" },
  optionIcon: { fontSize: 20 },
  optionLabel: { textAlign: "center" as const, lineHeight: 1.3 },
  vitalCard: { border: "1.5px solid", borderRadius: 12, padding: "14px 16px", background: "#f8fafc" },
  vitalCardRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  vitalCardTitle: { color: "#64748b", fontSize: 12, fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase" as const, letterSpacing: .5 },
  vitalCardValue: { fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-1px" },
  statusBadge: { padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 },
  inlineBadge: { padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  bmiScale: { display: "flex", gap: 4, marginTop: 8 },
  slider: { width: "100%", accentColor: "#0d9488", cursor: "pointer" },
  sliderLabels: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginTop: 2 },
  autoNote: { display: "flex", alignItems: "flex-start", gap: 8, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#0d6e7e", lineHeight: 1.5 },
  navRow: { display: "flex", alignItems: "center", padding: "8px 36px 0" },
  backBtn: { padding: "11px 20px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  nextBtn: { padding: "13px 28px", background: "linear-gradient(135deg,#0d6e7e,#0d9488)", border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "-.2px", boxShadow: "0 4px 16px rgba(13,148,136,.3)", transition: "opacity .2s" },
  footerNote: { textAlign: "center" as const, color: "#94a3b8", fontSize: 12, marginTop: 16 },
  successCard: { width: "100%", maxWidth: 520, background: "white", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,0,0,.08)", padding: "40px 36px", textAlign: "center" as const },
  successIcon: { width: 72, height: 72, background: "linear-gradient(135deg,#0d6e7e,#0d9488)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(13,148,136,.35)" },
  successTitle: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-.5px" },
  successSub: { color: "#64748b", fontSize: 14, lineHeight: 1.65, margin: "0 0 20px" },
  payloadPreview: { background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "left" as const },
  payloadTitle: { fontSize: 12, fontWeight: 700, color: "#0d9488", textTransform: "uppercase" as const, letterSpacing: 1, margin: "0 0 12px" },
  payloadGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  payloadItem: { background: "white", borderRadius: 8, padding: "8px 12px" },
  summaryLabel: { color: "#94a3b8", fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: .5, margin: "0 0 2px" },
  summaryValue: { color: "#0f172a", fontSize: 13, fontWeight: 700, margin: 0 },
  fab: { position: "fixed" as const, bottom: 24, right: 24, display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "linear-gradient(135deg,#0d6e7e,#0d9488)", color: "white", border: "none", borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 20px rgba(13,148,136,.4)", zIndex: 100 },
};