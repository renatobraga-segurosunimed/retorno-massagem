import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PLAN } from "@/lib/billing";
import { formatBRL, formatDate } from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import {
  CalendarCheck2,
  CircleAlert,
  CircleCheck,
  Clock3,
  Loader2,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const METHOD_LABEL: Record<string, string> = {
  credit_card: "Cartão",
  pix: "Pix",
  manual: "Manual",
  outros: "Outro",
};

function StatusBadge({
  status,
}: {
  status: "trial" | "active" | "expired";
}) {
  return (
    <Badge
      variant="secondary"
      className={
        status === "active"
          ? "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : status === "trial"
            ? "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300"
            : "border-transparent bg-rose-500/15 text-rose-700 dark:text-rose-300"
      }
    >
      {status === "active"
        ? "Assinatura ativa"
        : status === "trial"
          ? "Em teste"
          : "Vencida"}
    </Badge>
  );
}

export default function Admin() {
  const me = useQuery(api.admin.isMe);
  const accounts = useQuery(api.admin.accounts, me?.isAdmin ? {} : "skip");
  const grantAccess = useMutation(api.admin.grantAccess);

  const [search, setSearch] = useState("");
  const [grantingId, setGrantingId] = useState<string | null>(null);

  if (me === undefined) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Carregando…
      </div>
    );
  }

  if (!me.isAdmin) {
    return (
      <Card className="mx-auto max-w-xl border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <ShieldCheck className="size-5 text-primary" aria-hidden />
            Acesso restrito
          </CardTitle>
          <CardDescription>
            Esta área é exclusiva da administração da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Para liberar seu acesso, defina a variável{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              ADMIN_EMAILS
            </code>{" "}
            no ambiente do Convex com o e-mail da administração (separe vários
            e-mails por vírgula) e entre com uma conta autorizada.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = accounts?.stats;
  const rows = (accounts?.rows ?? []).filter((row) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      row.businessName.toLowerCase().includes(term) ||
      row.professionalName.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term)
    );
  });

  const handleGrant = async (professionalId: string) => {
    setGrantingId(professionalId);
    try {
      await grantAccess({
        professionalId: professionalId as Id<"professionals">,
      });
      toast.success("Acesso ativo por mais 30 dias.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível ativar.",
      );
    } finally {
      setGrantingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Administração
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contas, período de teste e pagamentos da plataforma.
        </p>
      </header>

      {/* Indicadores */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Profissionais" value={stats ? String(stats.total) : "…"} />
        <StatCard icon={Clock3} label="Em teste" value={stats ? String(stats.trial) : "…"} />
        <StatCard
          icon={CircleCheck}
          label="Assinaturas ativas"
          value={stats ? String(stats.active) : "…"}
        />
        <StatCard
          icon={CircleAlert}
          label="Acessos vencidos"
          value={stats ? String(stats.expired) : "…"}
        />
        <StatCard
          icon={CircleCheck}
          label="Recebido"
          value={stats ? formatBRL(stats.revenueCents / 100) : "…"}
        />
      </section>

      {/* Uso da plataforma */}
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Clientes cadastrados"
          value={stats ? String(stats.clientsCount) : "…"}
        />
        <StatCard
          icon={CalendarCheck2}
          label="Sessões realizadas"
          value={stats ? String(stats.realizedSessionsCount) : "…"}
        />
        <StatCard
          icon={Clock3}
          label="Sessões agendadas"
          value={stats ? String(stats.scheduledSessionsCount) : "…"}
        />
      </section>

      {/* Contas */}
      <Card className="border-border/70">
        <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="font-display text-lg">Contas</CardTitle>
            <CardDescription>
              Cada conta tem 30 dias de teste gratuito. Vencidas precisam de
              assinatura paga ou ativação manual.
            </CardDescription>
          </div>
          <div className="relative w-full max-w-xs">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conta, profissional ou e-mail"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            />
          </div>
        </CardHeader>
        <CardContent>
          {accounts === undefined ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Carregando contas…
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma conta encontrada{search ? ` para “${search}”` : " ainda"}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Negócio</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Última atividade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teste até</TableHead>
                    <TableHead>Acesso pago até</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>
                        <p className="text-sm font-medium">{row.businessName}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.email}
                          {row.city ? ` · ${row.city}` : ""}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.professionalName}
                        <p className="text-xs text-muted-foreground">
                          desde {formatDate(row.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <p className="font-medium">{row.usage.clientsCount} clientes</p>
                        <p className="text-xs text-muted-foreground">
                          {row.usage.realizedCount} realizadas ·{" "}
                          {row.usage.scheduledCount} agendadas
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.usage.lastActivityAt
                          ? formatDate(row.usage.lastActivityAt)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(row.trialEndsAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.paidUntil ? formatDate(row.paidUntil) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          disabled={grantingId === row._id}
                          onClick={() => handleGrant(row._id)}
                        >
                          {grantingId === row._id && (
                            <Loader2 className="size-3.5 animate-spin" />
                          )}
                          Ativar {PLAN.periodDays} dias
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagamentos */}
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">
            Pagamentos recentes
          </CardTitle>
          <CardDescription>
            Pagamentos processados pelo gateway e ativações manuais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts === undefined || accounts.payments.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Nenhum pagamento registrado ainda.
            </p>
          ) : (
            <ul className="divide-y">
              {accounts.payments.map((payment) => (
                <li
                  key={payment._id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {formatBRL(payment.amount / 100)}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {payment.method
                          ? METHOD_LABEL[payment.method] ?? payment.method
                          : "Método a confirmar"}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {payment.professionalName} · {payment.businessName} ·{" "}
                      {payment.status === "paid" && payment.paidAt
                        ? `pago em ${formatDate(payment.paidAt)}`
                        : `criado em ${formatDate(payment.createdAt)}`}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      payment.status === "paid"
                        ? "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }
                  >
                    {payment.status === "paid" ? "Pago" : "Aguardando"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="px-4 py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" aria-hidden />
          <p className="text-xs font-medium">{label}</p>
        </div>
        <p className="mt-2 font-display text-xl font-semibold tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
