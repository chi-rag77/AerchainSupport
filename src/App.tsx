import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TicketsPage from "./pages/TicketsPage";
import DashboardV2 from "./pages/DashboardV2";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Customer360 from "./pages/Customer360";
import WeeklySummaryPage from "./pages/WeeklySummaryPage";
import SettingsPage from "./pages/SettingsPage"; // New import
import { SupabaseProvider } from "./components/SupabaseProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./hooks/use-theme";
import TopNavigation from "./components/TopNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SupabaseProvider>
            <div className="flex flex-col min-h-screen">
              <TopNavigation />
              <main className="flex-grow">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
                  <Route path="/dashboard-v2" element={<ProtectedRoute><DashboardV2 /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/customer360" element={<ProtectedRoute><Customer360 /></ProtectedRoute>} />
                  <Route path="/weekly-summary" element={<ProtectedRoute><WeeklySummaryPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} /> {/* New route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SupabaseProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;