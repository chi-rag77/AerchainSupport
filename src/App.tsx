import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // This is now the Dashboard
import TicketsPage from "./pages/TicketsPage"; // The old Index is now TicketsPage
import DashboardV2 from "./pages/DashboardV2"; // New DashboardV2 page
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { SupabaseProvider } from "./components/SupabaseProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./hooks/use-theme";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SupabaseProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} /> {/* New Dashboard as root */}
              <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} /> {/* Dedicated Tickets page */}
              <Route path="/dashboard-v2" element={<ProtectedRoute><DashboardV2 /></ProtectedRoute>} /> {/* New DashboardV2 route */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SupabaseProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;