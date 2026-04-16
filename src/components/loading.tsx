import { Loader2 } from "lucide-react";

const Loading = () => {
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
};

export default Loading;