import { SessionDialog } from "@/components/SessionDialog";
import { ReturnStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ReturnStatus } from "@/convex/returnPattern";
import {
  formatBRL,
  formatDaysAgo,
  formatWeekdayDateTime,
  initials,
  whatsappHref,
} from "@/lib/format";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  CalendarPlus,
  CircleDollarSign,
  CircleUserRound,
  MessageCircle,
  PartyPopper,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function Dashboard() {
  const professional = useQuery(api.professionals.getMine);
  // Skip until the workspace is confirmed — the server handler throws for
  // users who have not finished onboarding, which would crash the page.
  const summary = useQuery(
    api.dashboard.summary,
    professional ? {} : "skip",
  );
  const [sessionDialog, setSessionDialog] = useState<{
    open: boolean;
    clientId?: Id<"clients">;
  }>({ open: false });

  const stats = summary?.stats;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {professional
            ? `Olá, ${professional.professionalName.split(" ")[0]}`
            : "Seu painel"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {professional
            ? [
                professional.businessName,
                professional.city,
              ]
                .filter(Boolean)
                .join(" · ")
            : ""}
        </p>
      </header>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Clientes"
          value={stats ? String(stats.clientsCount) : "…"}
          hint="cadastrados"
        />
        <StatCard
          icon={CalendarPlus}
          label="Sessões no mês"
          value={stats ? String(stats.monthSessions) : "…"}
          hint="realizadas"
        />
        <StatCard
          icon={CircleUserRound}
          label="Clientes em atraso"
          value={stats ? String(stats.overdueCount) : "…"}
          hint="além do período de retorno"
          tone={stats && stats.overdueCount > 0 ? "attention" : "default"}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Faturamento do mês"
          value={stats ? formatBRL(stats.monthRevenue) : "…"}
          hint={
            stats && stats.monthReceived > 0
              ? `${formatBRL(stats.monthReceived)} recebido`
              : "sessões realizadas"
          }
        />
      </section>

      {/* Oportunidades */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Clientes para entrar em contato
            </h2>
            <p className="text-sm text-muted-foreground">
              Pessoas que provavelmente já estão na hora de voltar.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Link to="/clientes">
              Ver todos
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {summary === undefined ? (
          <Card className="border-border/70">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Carregando…
            </CardContent>
          </Card>
        ) : summary.opportunities.length === 0 ? (
          <Card className="border-border/70">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              {stats && stats.clientsCount === 0 ? (
                <>
                  <p className="text-sm font-medium">
                    Cadastre seus primeiros clientes para começar a acompanhar
                    os retornos.
                  </p>
                  <Button asChild className="gap-2">
                    <Link to="/clientes">
                      <Users className="size-4" aria-hidden />
                      Ir para Clientes
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
          <ul className="grid gap-3 sm:grid-cols-2">
            {summary.opportunities.map((opportunity) => {
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
                            to={`/clientes/${opportunity.clientId}`}
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
                              opportunity.daysOverdue === 1
                                ? "dia"
                                : "dias"
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
                        <Link to={`/clientes/${opportunity.clientId}`}>
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
      </section>

      {/* Próximas sessões */}
      {summary && summary.upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Próximas sessões
            </h2>
            <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
              <Link to="/sessoes">
                Ver agenda
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <ul className="divide-y rounded-xl border border-border/70 bg-card">
            {summary.upcoming.map((session) => (
              <li
                key={session._id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    to={`/clientes/${session.clientId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {session.clientName}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {[session.serviceName, session.price !== undefined ? formatBRL(session.price) : null]
                      .filter(Boolean)
                      .join(" · ") || "Sessão"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatWeekdayDateTime(session.date)}
                </p>
              </li>
            ))}
          </ul>
        </section>
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

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "attention";
}) {
  return (
    <Card
      className={`border-border/70 shadow-none ${
        tone === "attention" ? "border-rose-500/25 bg-rose-500/[0.04]" : ""
      }`}
    >
      <CardContent className="px-4 py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" aria-hidden />
          <p className="text-xs font-medium">{label}</p>
        </div>
        <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
