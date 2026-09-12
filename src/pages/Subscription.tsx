import { BrandMark } from "@/components/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { PLAN, daysLeft } from "@/lib/billing";
import { formatBRL, formatDate } from "@/lib/format";
import { useAction, useQuery } from "convex/react";
import {
  CalendarCheck2,
  CircleCheck,
  Clock3,
  CreditCard,
  Loader2,
  Lock,
  LogOut,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";

const METHOD_LABEL: Record<string, string> = {
  credit_card: "Cartão de crédito",
  pix: "Pix",
  manual: "Ativação manual",
  outros: "Outro",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  failed: "Falhou",
};

export default function Subscription() {
  const access = useQuery(api.billing.myAccess);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const createCheckout = useAction(api.billingStripe.createCheckout);
  const syncPayment = useAction(api.billingStripe.syncPayment);

  const [startingCheckout, setStartingCheckout] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const autoSyncedRef = useRef<string | null>(null);

  const pending = access?.payments.find(
    (payment) => payment.status === "pending",
  );

  // When returning from checkout, automatically confirm the latest pending
  // payment once (Stripe applies PIX/card confirmation with a short delay).
  useEffect(() => {
    if (!pending || autoSyncedRef.current === pending._id) return;
    autoSyncedRef.current = pending._id;
    syncPayment({ paymentId: pending._id })
      .then((result) => {
        if (result.paid) {
          toast.success("Pagamento confirmado! Sua assinatura está ativa.");
        }
      })
      .catch(() => {});
  }, [pending, syncPayment]);

  const handleSubscribe = async () => {
    setStartingCheckout(true);
    try {
      const result = await createCheckout({});
      window.location.href = result.url;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento.",
      );
      setStartingCheckout(false);
    }
  };

  const handleCheck = async () => {
    if (!pending) return;
    setCheckingId(pending._id);
    try {
      const result = await syncPayment({
        paymentId: pending._id as Id<"payments">,
      });
      if (result.paid) {
        toast.success("Pagamento confirmado! Sua assinatura está ativa.");
      } else {
        toast.info(
          "Ainda não identificamos o pagamento. Se você acabou de pagar, aguarde alguns instantes e tente novamente.",
        );
      }
    } catch {
      toast.error("Não foi possível verificar o pagamento agora.");
    } finally {
      setCheckingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (access === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // No workspace yet — the initial setup flow creates one.
  if (access === null) {
    return <Navigate to="/app/onboarding" replace />;
  }

  const isActive = access.status === "active";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="size-9 rounded-lg" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Retorno Massagem
            </span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" aria-hidden />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-10 sm:px-6">
        {/* Status atual */}
        {access.status === "trial" && (
          <Card className="border-primary/25 bg-primary/[0.04]">
            <CardContent className="flex items-center gap-3 px-5 py-4">
              <Clock3 className="size-5 shrink-0 text-primary" aria-hidden />
              <p className="text-sm">
                <span className="font-semibold">Teste gratuito em andamento.</span>{" "}
                <span className="text-muted-foreground">
                  Faltam {daysLeft(access.trialEndsAt, Date.now())} dia(s) —
                  o teste termina em {formatDate(access.trialEndsAt)}.
                </span>
              </p>
            </CardContent>
          </Card>
        )}
        {access.status === "expired" && (
          <Card className="border-rose-500/30 bg-rose-500/[0.05]">
            <CardContent className="flex items-center gap-3 px-5 py-4">
              <Lock className="size-5 shrink-0 text-rose-600 dark:text-rose-300" aria-hidden />
              <p className="text-sm">
                <span className="font-semibold">Seu período de teste encerrou.</span>{" "}
                <span className="text-muted-foreground">
                  Assine o plano abaixo para retomar o acesso ao painel, clientes
                  e sessões.
                </span>
              </p>
            </CardContent>
          </Card>
        )}
        {isActive && (
          <Card className="border-emerald-500/30 bg-emerald-500/[0.05]">
            <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CircleCheck
                  className="size-5 shrink-0 text-emerald-600 dark:text-emerald-300"
                  aria-hidden
                />
                <p className="text-sm">
                  <span className="font-semibold">Assinatura ativa.</span>{" "}
                  <span className="text-muted-foreground">
                    Acesso garantido até {formatDate(access.paidUntil ?? Date.now())}.
                  </span>
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link to="/app/dashboard">Ir para o painel</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plano */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="font-display text-xl">
                  {PLAN.name}
                </CardTitle>
                <CardDescription>
                  Para massoterapeutas que vivem de retorno: todo o sistema,
                  sem limite de clientes.
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-semibold tracking-tight">
                  {formatBRL(PLAN.priceCents / 100)}
                </p>
                <p className="text-xs text-muted-foreground">
                  por {PLAN.periodDays} dias
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CircleCheck className="size-4 text-primary" aria-hidden />
                Clientes e histórico ilimitados
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="size-4 text-primary" aria-hidden />
                Alertas de padrão de retorno
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="size-4 text-primary" aria-hidden />
                Agenda, pagamentos e anotações
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="size-4 text-primary" aria-hidden />
                Importação de CSV e Excel
              </li>
            </ul>

            {!isActive && (
              <div className="grid gap-3">
                <Button
                  onClick={handleSubscribe}
                  disabled={startingCheckout}
                  className="gap-2"
                  size="lg"
                >
                  {startingCheckout ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Abrindo checkout…
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" aria-hidden />
                      Assinar agora — {formatBRL(PLAN.priceCents / 100)}
                    </>
                  )}
                </Button>
                <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <QrCode className="size-3.5" aria-hidden />
                  Pix ou cartão de crédito · checkout seguro
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagamento pendente */}
        {pending && !isActive && (
          <Card className="border-amber-500/30 bg-amber-500/[0.05]">
            <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw
                  className="size-5 shrink-0 text-amber-600 dark:text-amber-300"
                  aria-hidden
                />
                <p className="text-sm">
                  <span className="font-semibold">Pagamento em análise.</span>{" "}
                  <span className="text-muted-foreground">
                    Assim que confirmado, seu acesso é liberado automaticamente.
                  </span>
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={handleCheck}
                disabled={checkingId === pending._id}
              >
                {checkingId === pending._id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CalendarCheck2 className="size-4" aria-hidden />
                )}
                Verificar pagamento
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Histórico */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">
              Histórico de pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {access.payments.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">
                Nenhum pagamento ainda. Durante o teste você não paga nada.
              </p>
            ) : (
              <ul className="divide-y">
                {access.payments.map((payment) => (
                  <li
                    key={payment._id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatBRL(payment.amount / 100)}
                        {payment.method && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {METHOD_LABEL[payment.method] ?? payment.method}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.status === "paid" && payment.paidAt
                          ? `Pago em ${formatDate(payment.paidAt)}`
                          : `Criado em ${formatDate(payment.createdAt)}`}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        payment.status === "paid"
                          ? "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : payment.status === "failed"
                            ? "border-transparent bg-rose-500/15 text-rose-700 dark:text-rose-300"
                            : "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }
                    >
                      {STATUS_LABEL[payment.status] ?? payment.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
