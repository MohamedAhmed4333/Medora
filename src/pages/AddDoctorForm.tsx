import { useState } from "react";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { Loader2, Plus, X } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SPECIALTIES = ["Cardiologist", "Pulmonologist", "Ophthalmologist", "Internal Medicine", "Dermatologist", "Neurologist"];

interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

export default function AddDoctorForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [slotDuration, setSlotDuration] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(
    DAYS.reduce((acc, day) => {
      acc[day] = { active: false, start: "09:00", end: "17:00" };
      return acc;
    }, {} as Record<string, DaySchedule>)
  );

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }));
  };

  const updateDayTime = (day: string, field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ابني الـ workingHours بس من الأيام المفعّلة
      const workingHours: Record<string, { start: string; end: string }> = {};
      Object.entries(schedule).forEach(([day, data]) => {
        if (data.active) {
          workingHours[day] = { start: data.start, end: data.end };
        }
      });

      if (Object.keys(workingHours).length === 0) {
        alert("اختر يوم عمل واحد على الأقل");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/admin/create-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullname,
          specialty,
          slotDuration,
          workingHours,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to create doctor");

      // ابعت إيميل تعيين كلمة المرور
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);

      alert("تم إنشاء حساب الدكتور بنجاح، وتم إرسال رابط تعيين كلمة المرور له عبر الإيميل.");

      // Reset الفورم
      setEmail("");
      setFullname("");
      setSpecialty(SPECIALTIES[0]);
      setSlotDuration("30");
      setSchedule(
        DAYS.reduce((acc, day) => {
          acc[day] = { active: false, start: "09:00", end: "17:00" };
          return acc;
        }, {} as Record<string, DaySchedule>)
      );

      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating doctor:", error);
      alert(error.message || "حصل خطأ أثناء إنشاء الحساب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {/* Basic Info */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Full Name</label>
        <input
          type="text"
          required
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm bg-muted border border-transparent focus:outline-none focus:border-medical-teal focus:bg-card transition-colors"
          placeholder="Dr. John Doe"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm bg-muted border border-transparent focus:outline-none focus:border-medical-teal focus:bg-card transition-colors"
          placeholder="doctor@example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Specialty</label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm bg-muted border border-transparent focus:outline-none focus:border-medical-teal focus:bg-card transition-colors"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Slot Duration (min)</label>
          <select
            value={slotDuration}
            onChange={(e) => setSlotDuration(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm bg-muted border border-transparent focus:outline-none focus:border-medical-teal focus:bg-card transition-colors"
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="60">60</option>
          </select>
        </div>
      </div>

      {/* Working Hours */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Working Hours</label>
        <div className="space-y-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
                schedule[day].active ? "border-medical-teal/40 bg-medical-teal/5" : "border-border bg-muted/20"
              }`}
            >
              <label className="flex items-center gap-2 w-28 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule[day].active}
                  onChange={() => toggleDay(day)}
                  className="accent-medical-teal"
                />
                <span className="text-sm font-medium text-foreground">{day}</span>
              </label>

              {schedule[day].active && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={schedule[day].start}
                    onChange={(e) => updateDayTime(day, "start", e.target.value)}
                    className="rounded-lg px-2 py-1 text-sm bg-card border border-border"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={schedule[day].end}
                    onChange={(e) => updateDayTime(day, "end", e.target.value)}
                    className="rounded-lg px-2 py-1 text-sm bg-card border border-border"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-hero text-primary-foreground font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Doctor Account...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add Doctor
          </>
        )}
      </button>
    </form>
  );
}