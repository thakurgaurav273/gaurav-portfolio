import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AllProjects from "./pages/AllProjects";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import ManageHero from "./pages/admin/ManageHero";
import ManageProjects from "./pages/admin/ManageProjects";
import ManageExperience from "./pages/admin/ManageExperience";
import ManageSkills from "./pages/admin/ManageSkills";
import { AdminLayout } from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/skills" element={<Index />} />
          <Route path="/experience" element={<Index />} />
          <Route path="/projects" element={<Index />} />
          <Route path="/contact" element={<Index />} />
          <Route path="/all-projects" element={<AllProjects />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="hero" element={<ManageHero />} />
            <Route path="projects" element={<ManageProjects />} />
            <Route path="experience" element={<ManageExperience />} />
            <Route path="skills" element={<ManageSkills />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
