import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AllProjects from "./pages/AllProjects";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import ScrollManager from "./components/ScrollManager";
import CommandMenu from "./components/CommandMenu";
const Login = lazy(() => import("./pages/admin/Login"));
const ForgotPassword = lazy(() => import("./pages/admin/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/admin/ResetPassword"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageHero = lazy(() => import("./pages/admin/ManageHero"));
const ManageProjects = lazy(() => import("./pages/admin/ManageProjects"));
const ProjectEditor = lazy(() => import("./pages/admin/ProjectEditor"));
const ManageExperience = lazy(() => import("./pages/admin/ManageExperience"));
const ManageSkills = lazy(() => import("./pages/admin/ManageSkills"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollManager />
        <CommandMenu />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<Index />} />
            <Route path="/experience" element={<Index />} />
            <Route path="/projects" element={<Index />} />
            <Route path="/contact" element={<Index />} />
            <Route path="/all-projects" element={<AllProjects />} />
            <Route path="/work/:slug" element={<ProjectDetail />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="hero" element={<ManageHero />} />
              <Route path="projects" element={<ManageProjects />} />
              <Route path="projects/new" element={<ProjectEditor />} />
              <Route path="projects/:id" element={<ProjectEditor />} />
              <Route path="experience" element={<ManageExperience />} />
              <Route path="skills" element={<ManageSkills />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
