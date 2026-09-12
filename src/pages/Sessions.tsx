import { SessionDialog } from "@/components/SessionDialog";
import {
  PaymentBadge,
  SessionStatusBadge,
} from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  formatBRL,
  formatWeekdayDateTime,
  telHref,
  whatsappHref,
} from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import {
  CalendarPlus,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface SessionsProps {
  /** Initial tab: /app/agenda opens "agendadas", /app/atendimentos opens "historico". */
  initialTab?: "agendadas" | "historico";
}

export default function Sessions({ initialTab = "agendadas" }: SessionsProps) {
  const sessions = useQuery(api.sessions.list);
  const [dialogOpen, setDialogOpen] = useState(false);
  // /app/agenda opens on "agendadas", /app/atendimentos on "historico".
  const [tab, setTab] = useState<"agendadas" | "historico">(initialTab);

  const now = Date.now();

  const scheduled = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.status === "agendada")
        .sort((a, b) => a.date - b.date),
    [sessions],
  );

  const history = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.status !== "agendada")
        .sort((a, b) => b.date - a.date),
    [sessions],
  );

  const visible = tab === "agendadas" ? scheduled : history;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Sessões
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua agenda e o histórico de atendimentos.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <CalendarPlus className="size-4" aria-hidden />
          Nova sessão
        </Button>
      </header>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as typeof tab)}
        className="w-fit"
      >
        <TabsList>
          <TabsTrigger value="agendadas" className="gap-1.5">
            Agendadas
            {scheduled.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {scheduled.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
      </Tabs>

      {sessions === undefined ? (
        <Card className="border-border/70">
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Carregando sessões…
          </CardContent>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-sm font-medium">
              {tab === "agendadas"
                ? "Nenhuma sessão agendada."
                : "Nenhuma sessão no histórico ainda."}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {tab === "agendadas"
                ? "Agende um horário para organizar o dia e lembrar de registrar a sessão depois."
                : "Registre sessões realizadas na página do cliente ou ao criar uma nova sessão."}
            </p>
            <Button className="mt-2 gap-2" onClick={() => setDialogOpen(true)}>
              <CalendarPlus className="size-4" aria-hidden />
              Nova sessão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border border-border/70 bg-card">
          {visible.map((session) => {
            const wa = whatsappHref(session.clientPhone);
            const isPast = session.date < now;
            return (
              <li
                key={session._id}
                className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 ${
                  tab === "agendadas" && isPast ? "bg-muted/40" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {formatWeekdayDateTime(session.date)}
                    {tab === "agendadas" && isPast && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (passou do horário)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.clientName}
                    {session.clientPhone ? (
                      <>
                        {" · "}
                        {telHref(session.clientPhone) ? (
                          <a
                            href={telHref(session.clientPhone)!}
                            className="hover:underline"
                          >
                            {session.clientPhone}
                          </a>
                        ) : (
                          session.clientPhone
                        )}
                      </>
                    ) : null}
                    {wa && (
                      <>
                        {" · "}
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 hover:underline"
                        >
                          <MessageCircle className="size-3" aria-hidden />
                          WhatsApp
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="hidden text-sm text-muted-foreground sm:block">
                    {[session.serviceName, session.price !== undefined ? formatBRL(session.price) : null]
                      .filter(Boolean)
                      .join(" · ") || "Sessão"}
                  </p>
                  {session.status === "realizada" && (
                    <PaymentBadge paid={session.paid} />
                  )}
                  <SessionStatusBadge status={session.status} />
                  <SessionRowActions
                    sessionId={session._id}
                    status={session.status}
                    paid={session.paid}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <SessionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

function SessionRowActions({
  sessionId,
  status,
  paid,
}: {
  sessionId: Id<"sessions">;
  status: "agendada" | "realizada" | "cancelada";
  paid: boolean | undefined;
}) {
  const complete = useMutation(api.sessions.complete);
  const cancel = useMutation(api.sessions.cancel);
  const setPaid = useMutation(api.sessions.setPaid);
  const remove = useMutation(api.sessions.remove);

  const run = (fn: () => Promise<unknown>, message: string) =>
    fn()
      .then(() => toast.success(message))
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error ? error.message : "Não foi possível concluir.",
        ),
      );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Ações da sessão">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status === "agendada" && (
          <>
            <DropdownMenuItem
              onClick={() =>
                run(() => complete({ id: sessionId }), "Sessão marcada como realizada.")
              }
            >
              <CheckCircle2 className="mr-2 size-4" />
              Marcar como realizada
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => run(() => cancel({ id: sessionId }), "Sessão cancelada.")}
            >
              <XCircle className="mr-2 size-4" />
              Cancelar sessão
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {status === "realizada" && (
          <>
            <DropdownMenuItem
              onClick={() =>
                run(
                  () => setPaid({ id: sessionId, paid: paid !== true }),
                  paid !== true
                    ? "Pagamento registrado."
                    : "Pagamento marcado como pendente.",
                )
              }
            >
              <CircleDollarSign className="mr-2 size-4" />
              {paid !== true ? "Marcar como pago" : "Marcar como pendente"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => run(() => remove({ id: sessionId }), "Sessão removida.")}
        >
          <Trash2 className="mr-2 size-4" />
          Excluir sessão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
