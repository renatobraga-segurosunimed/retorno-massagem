import { Badge } from "@/components/ui/badge";
import type { ReturnStatus } from "@/convex/returnPattern";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type SessionStatus = Doc<"sessions">["status"];

const RETURN_CONFIG: Record<ReturnStatus, { label: string; className: string }> =
  {
    novo: {
      label: "Novo",
      className: "bg-muted text-muted-foreground",
    },
    em_dia: {
      label: "Em dia",
      className:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-transparent",
    },
    atencao: {
      label: "Atenção",
      className:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-transparent",
    },
    atrasado: {
      label: "Em atraso",
      className:
        "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-transparent",
    },
  };

const SESSION_CONFIG: Record<SessionStatus, { label: string; className: string }> =
  {
    agendada: {
      label: "Agendada",
      className: "bg-primary/10 text-primary border-transparent",
    },
    realizada: {
      label: "Realizada",
      className:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-transparent",
    },
    cancelada: {
      label: "Cancelada",
      className: "bg-muted text-muted-foreground line-through",
    },
  };

export function ReturnStatusBadge({
  status,
  className,
}: {
  status: ReturnStatus;
  className?: string;
}) {
  const config = RETURN_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function SessionStatusBadge({
  status,
  className,
}: {
  status: SessionStatus;
  className?: string;
}) {
  const config = SESSION_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function PaymentBadge({
  paid,
  className,
}: {
  paid: boolean | null | undefined;
  className?: string;
}) {
  const isPaid = paid === true;
  return (
    <Badge
      variant="secondary"
      className={cn(
        isPaid
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-transparent"
          : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-transparent",
        className,
      )}
    >
      {isPaid ? "Pago" : "Pendente"}
    </Badge>
  );
}
