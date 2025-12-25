import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import Queue from "./pages/Queue";
import SentHistory from "./pages/SentHistory";
import FailedEmails from "./pages/FailedEmails";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Students from "./pages/Students";
import Birthday from "./pages/Birthday";

const queryClient = new QueryClient();

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null; // Let AppInner handle the splash
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  return element;
};

const AppInner = () => {
  const { isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Save current path to localStorage on route change
  useEffect(() => {
    if (location.pathname !== "/auth") {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location.pathname]);

  // On mount, restore last path if on root
  useEffect(() => {
    if (location.pathname === "/") {
      const lastPath = localStorage.getItem("lastPath");
      if (lastPath && lastPath !== "/" && lastPath !== "/auth") {
        navigate(lastPath, { replace: true });
      } else if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }
  }, [location.pathname, navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary animate-pulse" />
          <div className="flex flex-col items-center gap-2">
            <span className="h-4 w-32 bg-gray-200 rounded" />
            <span className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} />}
        />
        <Route path="/upload" element={<PrivateRoute element={<Upload />} />} />
        <Route path="/files" element={<PrivateRoute element={<Files />} />} />
        <Route path="/queue" element={<PrivateRoute element={<Queue />} />} />
        <Route
          path="/students"
          element={<PrivateRoute element={<Students />} />}
        />
        <Route
          path="/birthdays"
          element={<PrivateRoute element={<Birthday />} />}
        />
        <Route
          path="/history/sent"
          element={<PrivateRoute element={<SentHistory />} />}
        />
        <Route
          path="/history/failed"
          element={<PrivateRoute element={<FailedEmails />} />}
        />
        <Route
          path="/settings"
          element={<PrivateRoute element={<Settings />} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
