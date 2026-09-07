import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  Flower2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Link,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/sessoes", label: "Sessões", icon: CalendarDays },
  { to: "/servicos", label: "Serviços", icon: Flower2 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
  }`;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const professional = useQuery(api.professionals.getMine);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (professional === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (professional === null || !professional.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  const currentLabel =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))?.label ??
    "Retorno";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Link className="flex items-center gap-3 px-6 pb-5 pt-6" to="/dashboard">
          <BrandMark className="size-9 rounded-lg" />
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold leading-tight">
              Retorno
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {professional.businessName}
            </p>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-4 py-4">
          <p className="truncate text-xs font-medium text-sidebar-foreground">
            {professional.professionalName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email ?? "Conta sem e-mail"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" aria-hidden />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <BrandMark className="size-8 rounded-lg" />
          <span className="font-display text-sm font-semibold">Retorno</span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{currentLabel}</span>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex items-center gap-3 border-b px-5 py-5">
                <BrandMark className="size-9 rounded-lg" />
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold leading-tight">
                    Retorno
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {professional.businessName}
                  </p>
                </div>
              </div>
              <nav className="space-y-1 p-3">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={navLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="border-t px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" aria-hidden />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
