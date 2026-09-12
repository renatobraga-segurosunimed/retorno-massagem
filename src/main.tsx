import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const LandingPage = lazy(() => import("./landing/LandingPage.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const Clients = lazy(() => import("./pages/Clients.tsx"));
const ClientDetail = lazy(() => import("./pages/ClientDetail.tsx"));
const Sessions = lazy(() => import("./pages/Sessions.tsx"));
const Returns = lazy(() => import("./pages/Returns.tsx"));
const Services = lazy(() => import("./pages/Services.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const Subscription = lazy(() => import("./pages/Subscription.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Carregando…</div>
    </div>
  );
}

/** Shared shell for authenticated pages: auth gate + app layout (sidebar,
 *  mobile header) + the redirect to /onboarding when no workspace exists yet. */
function ProtectedLayout() {
  return (
    <RequireAuth>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </RequireAuth>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Keeps old deep links alive: /clientes/:id → /app/clientes/:id. */
function LegacyClientRedirect() {
  const { id } = useParams();
  return <Navigate to={`/app/clientes/${id}`} replace />;
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              {/* ── Public marketing site ── */}
              <Route path="/" element={<LandingPage />} />

              {/* ── Public auth flows ── */}
              <Route
                path="/login"
                element={<AuthPage redirectAfterAuth="/app/dashboard" />}
              />
              <Route
                path="/cadastro"
                element={
                  <AuthPage redirectAfterAuth="/app/dashboard" initialStep="signUp" />
                }
              />
              {/* Legacy alias: existing links/messages use /auth?returnTo=… */}
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/app/dashboard" />}
              />

              {/* Onboarding stays outside the shell: AppLayout redirects here
                  when there is no workspace, and nesting it would loop. */}
              <Route
                path="/app/onboarding"
                element={
                  <RequireAuth>
                    <Onboarding />
                  </RequireAuth>
                }
              />

              {/* ── Protected CRM (all under /app) ── */}
              <Route element={<ProtectedLayout />}>
                <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="/app/dashboard" element={<Dashboard />} />
                <Route path="/app/clientes" element={<Clients />} />
                <Route path="/app/clientes/:id" element={<ClientDetail />} />
                <Route path="/app/retornos" element={<Returns />} />
                <Route
                  path="/app/agenda"
                  element={<Sessions initialTab="agendadas" />}
                />
                <Route
                  path="/app/atendimentos"
                  element={<Sessions initialTab="historico" />}
                />
                <Route path="/app/servicos" element={<Services />} />
                <Route path="/app/configuracoes" element={<Settings />} />
                <Route path="/app/admin" element={<Admin />} />
              </Route>

              {/* Billing is outside the shell on purpose: after the trial ends
                  it must stay reachable while the rest is blocked. */}
              <Route
                path="/app/assinatura"
                element={
                  <RequireAuth>
                    <Subscription />
                  </RequireAuth>
                }
              />

              {/* ── Legacy CRM paths → /app/* (bookmarks, old links) ── */}
              <Route
                path="/dashboard"
                element={<Navigate to="/app/dashboard" replace />}
              />
              <Route
                path="/clientes"
                element={<Navigate to="/app/clientes" replace />}
              />
              <Route path="/clientes/:id" element={<LegacyClientRedirect />} />
              <Route path="/sessoes" element={<Navigate to="/app/agenda" replace />} />
              <Route
                path="/servicos"
                element={<Navigate to="/app/servicos" replace />}
              />
              <Route
                path="/configuracoes"
                element={<Navigate to="/app/configuracoes" replace />}
              />
              <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
              <Route
                path="/assinatura"
                element={<Navigate to="/app/assinatura" replace />}
              />
              <Route
                path="/onboarding"
                element={<Navigate to="/app/onboarding" replace />}
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
