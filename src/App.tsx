import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CompleteProfileModal from "./pages/CompleteProfileModal"
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { auth, db } from "../src/config/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react";
import { useLoading } from "../src/context/loadingcontext"
import Loading from "./components/loading";
import {useAuth} from "./context/AuthContext";
const queryClient = new QueryClient();

const App = () => {
  const {mode,setMode} = useAuth();
  const [user, setUser] = useState(null);
  const { loading, setLoading } = useLoading();
  const isAdmin =
    user?.email === "admin@gmail.com" &&
    user?.uid === "EWlEe7Z57kbXbDRNxrZvDdxnYOT2";
  console.log("Current Loading State:", loading);
  console.log("Current User:", user);
  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        if (unsubscribeDoc) unsubscribeDoc();
        setUser(null);
        setLoading(false);
      }

      else if (currentUser?.email === "admin@gmail.com" && currentUser?.uid === "EWlEe7Z57kbXbDRNxrZvDdxnYOT2") {
        if (unsubscribeDoc) unsubscribeDoc();
        setUser(currentUser);
        setLoading(false);
      }
      // console.log("Done");
      else {
        if (unsubscribeDoc) unsubscribeDoc();

        unsubscribeDoc = onSnapshot(
          doc(db, "users", currentUser.uid),
          (docsnap) => {
            if (docsnap.exists()) {
              setUser({ ...currentUser, ...docsnap.data() });
              setTimeout(()=> {
                setLoading(false);
              },2000);
            } else {
              console.warn("No user document found in Firestore");
              setUser(currentUser);
              setLoading(false);
            }
          },
          (error) => {
            console.error("Firestore error:", error);
            setLoading(false);
          }

        );
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);



  if (loading) {
    return <Loading />;
  } else {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={!user ? <Auth /> : (
                <Navigate to={
                  isAdmin ? '/admin' :
                    user?.role === 'doctor' ? '/doctor' : '/patient'
                } replace />
              )} />
              <Route path="/patient" element={(user?.role === 'patient' && !user?.age) ? <CompleteProfileModal user = {user} /> : (user?.age) ? <PatientDashboard user = {user} /> : <Auth />} />
              <Route path="/doctor" element={user?.role === 'doctor' ? <DoctorDashboard user = {user}/> : <Auth />} />
              <Route path="/admin" element={
                isAdmin
                  ? <AdminPanel user = {user} />
                  : <Navigate to="/auth" replace />
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    )
  }
};

export default App;
