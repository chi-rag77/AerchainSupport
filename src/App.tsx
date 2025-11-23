import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TicketsPage from "./pages/TicketsPage";
import DashboardV2 from "./pages/DashboardV2";
import Analytics from "./pages/Analytics";
import Customer360 from "./pages/Customer360"; // Import the new Customer360 page
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { SupabaseProvider } from "./components/SupabaseProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./hooks/use-theme";
import TopNavigation from "./components/TopNavigation"; // Import the new TopNavigation

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
              <TopNavigation /> {/* Render the TopNavigation component */}
              <main className="flex-grow">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
                  <Route path="/dashboard-v2" element={<ProtectedRoute><DashboardV2 /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/customer360" element={<ProtectedRoute><Customer360 /></ProtectedRoute>} /> {/* New route */}
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