
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CricketProvider } from "./context/CricketContext";

// User pages
import Dashboard from "./pages/Dashboard";
import TeamDetails from "./pages/TeamDetails";
import MatchDetails from "./pages/MatchDetails";
import Statistics from "./pages/Statistics";
import Matches from "./pages/Matches";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTeams from "./pages/admin/ManageTeams";
import ManageMatches from "./pages/admin/ManageMatches";
import AllPlayers from "./pages/admin/AllPlayers";
import AddPlayers from "./pages/admin/AddPlayers";
import CreateMatch from "./pages/admin/CreateMatch";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CricketProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/teams/:teamId" element={<TeamDetails />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:matchId" element={<MatchDetails />} />
            <Route path="/statistics" element={<Statistics />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/teams" element={<ManageTeams />} />
            <Route path="/admin/teams/:teamId/add-players" element={<AddPlayers />} />
            <Route path="/admin/matches" element={<ManageMatches />} />
            <Route path="/admin/matches/create" element={<CreateMatch />} />
            <Route path="/admin/players" element={<AllPlayers />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CricketProvider>
  </QueryClientProvider>
);

export default App;
