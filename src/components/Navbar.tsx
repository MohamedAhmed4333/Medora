import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Menu, X, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

// interface NavbarProps {
//   role?: "patient" | "doctor" | "admin" | null;
// }

export default function Navbar( {user}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      console.log("Logging out user:", auth.currentUser?.email);
      await signOut(auth);
      // اختيارياً: لو عندك صلاحية الوصول لـ setUser هنا (بس الأفضل تعتمد على App.tsx)
      console.log("User signed out successfully");

      // التوجيه لصفحة الـ login
      navigate("/auth", { replace: true });
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };
  console.log("Navbar current user:", user);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur-md shadow-card">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero group-hover:scale-105 transition-transform">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold text-primary">Medora</span>
            <span className="text-xl font-bold text-medical-teal"> System</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {!user && (
            <>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it works</a>
              <a href="#specialties" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Specialties</a>
            </>
          )}
          {user?.role === "patient" && (
            <>
              <Link to="/patient" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/patient#ai-hub" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">AI Diagnostics</Link>
              <Link to="/patient#booking" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Appointments</Link>
            </>
          )}
          {user?.role === "doctor" && (
            <>
              <Link to="/doctor" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/doctor#patients" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Patients</Link>
              <Link to="/doctor#schedule" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Schedule</Link>
            </>
          )}
          {user?.uid === "EWlEe7Z57kbXbDRNxrZvDdxnYOT2" && (
            <>
              <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Overview</Link>
              <Link to="/admin#doctors" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Doctors</Link>
              <Link to="/admin#users" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Users</Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button className="relative p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-medical-teal" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gradient-hero flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-foreground">
                        {user?.role === "patient" ? user?.fullname : user?.role === "doctor" ? `Dr. ${user?.fullname}` : "Admin"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-medical-red"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2"/> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
              <Button size="sm" className="bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-card px-4 py-4 space-y-2">
          <Link to="/" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">Home</Link>
          <a href="#features" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">Features</a>
          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
              <Button size="sm" className="bg-gradient-hero text-primary-foreground" onClick={() => navigate("/auth")}>Get Started</Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
