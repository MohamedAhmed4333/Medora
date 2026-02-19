import { Brain, Loader2 } from "lucide-react";

interface AIProcessingAnimationProps {
  label?: string;
  subLabel?: string;
}

export default function AIProcessingAnimation({
  label = "AI Analysis in Progress",
  subLabel = "Processing medical data...",
}: AIProcessingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      {/* Outer ring */}
      <div className="relative flex items-center justify-center">
        <div className="h-28 w-28 rounded-full border-4 border-muted" />
        <div
          className="absolute h-28 w-28 rounded-full border-4 border-transparent border-t-medical-teal border-r-medical-teal processing-ring"
          style={{ borderTopColor: "hsl(var(--medical-teal))", borderRightColor: "transparent" }}
        />
        <div
          className="absolute h-20 w-20 rounded-full border-4 border-transparent border-b-primary processing-ring"
          style={{ borderBottomColor: "hsl(var(--primary))", animationDuration: "2s", animationDirection: "reverse" }}
        />
        <div className="relative z-10 h-12 w-12 rounded-full bg-gradient-ai flex items-center justify-center ai-pulse shadow-glow">
          <Brain className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>

      {/* Scan lines */}
      <div className="flex gap-1.5 items-end h-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 bg-medical-teal rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 24 + 8}px`,
              animationDelay: `${i * 80}ms`,
              opacity: 0.6 + (i % 3) * 0.13,
            }}
          />
        ))}
      </div>

      {/* Status */}
      <div className="text-center space-y-1">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{subLabel}</p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {[
          { label: "Image preprocessing", done: true },
          { label: "Pattern recognition", done: true },
          { label: "Disease classification", done: false },
          { label: "Generating report", done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-medical-green" : "bg-muted border border-border"}`}>
              {step.done ? (
                <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Loader2 className="h-2.5 w-2.5 text-muted-foreground animate-spin" />
              )}
            </div>
            <p className={`text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
