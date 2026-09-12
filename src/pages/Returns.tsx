import { SessionDialog } from "@/components/SessionDialog";
import { ReturnStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ReturnStatus } from "@/convex/returnPattern";
import {
  formatDaysAgo,
  initials,
  whatsappHref,
} from "@/lib/format";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  CalendarPlus,
  MessageCircle,
  PartyPopper,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

type Filter = "todos" | "atrasado" | "atencao";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "atrasado", label: "Atrasados" },
  { value: "atencao", label: "No período" },
];

/**
 * Dedicated "Retornos" page: everyone the pattern engine flagged as due or
 * overdue, in one place — without the Painel's top-8 cap.
 */
export default function Returns() {
  const professional = useQuery(api.professionals.getMine);
  // Skip until the workspace is confirmed — the server handler throws for
  // users who have not finished onboarding, which would crash the page.
  const summary = useQuery(
    api.dashboard.returns,
    professional ? {} : "skip",
  );
  const [filter, setFilter] = useState<Filter>("todos");
  const [sessionDialog, setSessionDialog] = useState<{
    open: boolean;
    clientId?: Id<"clients">;
  }>({ open: false });

  const overdueCount = summary?.opportunities.filter(
    (o) => o.status === "atrasado",
  ).length;

  const visible = useMemo(() => {
    const all = summary?.opportunities ?? [];
    if (filter === "todos") return all;
    return all.filter((o) => o.status === filter);
  }, [summary, filter]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Retornos
        </h1>
        <p className="text-sm text-muted-foreground">
          Clientes que chegaram ao período esperado de retorno ou já passaram
          dele — priorize o contato de quem está há mais tempo sem voltar.
        </p>
      </header>

      {/* Filter chips + headline count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "default" : "outline"}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        {summary && (
          <p className="text-sm text-muted-foreground">
            {overdueCount === 0
              ? "Nenhum retorno em atraso 🎉"
              : `${overdueCount} ${overdueCount === 1 ? "retorno" : "retornos"} em atraso`}
          </p>
        )}
      </div>

      {summary === undefined ? (
        <Card className="border-border/70">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Carregando…
          </CardContent>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            {filter !== "todos" ? (
              <>
                <PartyPopper className="size-6 text-primary" aria-hidden />
                <p className="text-sm font-medium">
                  Nenhum cliente neste filtro.
                </p>
                <Button variant="outline" size="sm" onClick={() => setFilter("todos")}>
                  Ver todos
                </Button>
              </>
            ) : summary.clientsCount === 0 ? (
              <>
                <Users className="size-6 text-primary" aria-hidden />
                <p className="text-sm font-medium">
                  Cadastre seus primeiros clientes para começar a acompanhar os
                  retornos.
                </p>
                <Button asChild className="gap-2">
                  <Link to="/app/clientes">
                    Ir para Clientes
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <PartyPopper className="size-6 text-primary" aria-hidden />
                <p className="text-sm font-medium">
                  Nenhum cliente atrasado no momento.
                </p>
                <p className="text-sm text-muted-foreground">
                  Quando alguém passar do período esperado de retorno, ela
                  aparece aqui automaticamente.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {visible.map((opportunity) => {
            const wa = whatsappHref(opportunity.phone);
            return (
              <Card
                key={opportunity.clientId}
                className={`border-border/70 py-4 ${
                  opportunity.status === "atrasado"
                    ? "border-rose-500/25 bg-rose-500/[0.04]"
                    : "border-amber-500/25 bg-amber-500/[0.04]"
                }`}
              >
                <CardContent className="flex flex-col gap-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials(opportunity.name)}
                      </span>
                      <div className="min-w-0">
                        <Link
                          to={`/app/clientes/${opportunity.clientId}`}
                          className="block truncate text-sm font-semibold hover:underline"
                        >
                          {opportunity.name}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {opportunity.completedCount}{" "}
                          {opportunity.completedCount === 1
                            ? "sessão"
                            : "sessões"}
                          {opportunity.avgIntervalDays !== null &&
                            ` · volta a cada ~${opportunity.avgIntervalDays} dias`}
                          {opportunity.daysSinceLast !== null &&
                            ` · última ${formatDaysAgo(opportunity.daysSinceLast)}`}
                        </p>
                      </div>
                    </div>
                    <ReturnStatusBadge
                      status={opportunity.status as ReturnStatus}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {opportunity.status === "atrasado" ? (
                      <>
                        Passaram-se{" "}
                        <span className="font-semibold text-rose-700 dark:text-rose-300">
                          {opportunity.daysOverdue} dias
                        </span>{" "}
                        do retorno esperado.
                      </>
                    ) : (
                      <>
                        Chegou ao período esperado{" "}
                        {opportunity.daysOverdue !== null &&
                          opportunity.daysOverdue > 0 &&
                          `(${opportunity.daysOverdue} ${
                            opportunity.daysOverdue === 1 ? "dia" : "dias"
                          })`}
                        .
                      </>
                    )}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        setSessionDialog({
                          open: true,
                          clientId: opportunity.clientId as Id<"clients">,
                        })
                      }
                    >
                      <CalendarPlus className="size-4" aria-hidden />
                      Registrar sessão
                    </Button>
                    {wa && (
                      <Button asChild size="sm" variant="outline" className="gap-1.5">
                        <a href={wa} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="size-4" aria-hidden />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="ml-auto gap-1 text-muted-foreground"
                    >
                      <Link to={`/app/clientes/${opportunity.clientId}`}>
                        Abrir
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </ul>
      )}

      <SessionDialog
        open={sessionDialog.open}
        onOpenChange={(open) =>
          setSessionDialog((prev) => ({ ...prev, open }))
        }
        defaultClientId={sessionDialog.clientId}
        lockClient
      />
    </div>
  );
}
