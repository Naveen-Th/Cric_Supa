
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CricketProvider } from "./context/cricket/useCricketContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

// User pages
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import MatchDetails from "./pages/MatchDetails";
import Statistics from "./pages/Statistics";
import Matches from "./pages/Matches";
import Auth from "./pages/Auth";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTeams from "./pages/admin/ManageTeams";
import EditTeam from "./pages/admin/EditTeam";
import ManageMatches from "./pages/admin/ManageMatches";
import AllPlayers from "./pages/admin/AllPlayers";
import AddPlayers from "./pages/admin/AddPlayers";
import CreateMatch from "./pages/admin/CreateMatch";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAdmin ? <>{children}</> : <Navigate to="/auth" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/auth" element={<Auth />} />
      
      {/* User Routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/teams/:teamId" element={<TeamDetails />} />
      <Route path="/matches" element={<Matches />} />
      <Route path="/matches/:matchId" element={<MatchDetails />} />
      <Route path="/statistics" element={<Statistics />} />
      
      {/* Admin Routes - Protected */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/teams" element={<AdminRoute><ManageTeams /></AdminRoute>} />
      <Route path="/admin/teams/:teamId" element={<AdminRoute><EditTeam /></AdminRoute>} />
      <Route path="/admin/teams/:teamId/add-players" element={<AdminRoute><AddPlayers /></AdminRoute>} />
      <Route path="/admin/matches" element={<AdminRoute><ManageMatches /></AdminRoute>} />
      <Route path="/admin/matches/create" element={<AdminRoute><CreateMatch /></AdminRoute>} />
      <Route path="/admin/players" element={<AdminRoute><AllPlayers /></AdminRoute>} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CricketProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </CricketProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
