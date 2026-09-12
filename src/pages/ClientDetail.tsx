import { SessionDialog } from "@/components/SessionDialog";
import {
  PaymentBadge,
  ReturnStatusBadge,
  SessionStatusBadge,
} from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ReturnStatus } from "@/convex/returnPattern";
import {
  formatBRL,
  formatDate,
  formatDateTime,
  formatDaysAgo,
  initials,
  telHref,
  whatsappHref,
} from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  CircleDollarSign,
  History,
  Loader2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = params.id as Id<"clients"> | undefined;

  const detail = useQuery(
    api.clients.get,
    clientId ? { id: clientId } : "skip",
  );

  const [sessionDialog, setSessionDialog] = useState<{
    open: boolean;
    realized: boolean;
  }>({ open: false, realized: false });
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (detail === undefined) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Carregando cliente…
      </div>
    );
  }

  if (detail === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-sm font-medium">Cliente não encontrado.</p>
        <Button asChild variant="outline">
          <Link to="/app/clientes">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar para Clientes
          </Link>
        </Button>
      </div>
    );
  }

  const { client, sessions, notes, pattern } = detail;
  const wa = whatsappHref(client.phone);

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-2 text-muted-foreground">
        <Link to="/app/clientes">
          <ArrowLeft className="size-4" aria-hidden />
          Clientes
        </Link>
      </Button>

      {/* Cabeçalho */}
      <Card className="border-border/70">
        <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-lg font-semibold text-primary">
              {initials(client.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                  {client.name}
                </h1>
                <ReturnStatusBadge status={pattern.status as ReturnStatus} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {client.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" aria-hidden />
                    {telHref(client.phone) ? (
                      <a href={telHref(client.phone)!} className="hover:underline">
                        {client.phone}
                      </a>
                    ) : (
                      client.phone
                    )}
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" aria-hidden />
                    <a href={`mailto:${client.email}`} className="hover:underline">
                      {client.email}
                    </a>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <History className="size-3.5" aria-hidden />
                  Cliente desde {formatDate(client.createdAt)}
                </span>
              </div>
              {client.notes && (
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  {client.notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {wa && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setSessionDialog({ open: true, realized: false })}
            >
              <CalendarPlus className="size-4" aria-hidden />
              Agendar
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setSessionDialog({ open: true, realized: true })}
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Registrar sessão
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Mais opções">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 size-4" />
                  Editar cliente
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Excluir cliente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Padrão de retorno */}
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Padrão de retorno</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Sessões" value={String(pattern.completedCount)} />
            <MiniStat
              label="Intervalo médio"
              value={
                pattern.avgIntervalDays !== null
                  ? `~${pattern.avgIntervalDays} dias`
                  : "—"
              }
            />
            <MiniStat
              label="Última sessão"
              value={formatDaysAgo(pattern.daysSinceLast)}
            />
            <MiniStat
              label="Previsão de retorno"
              value={
                pattern.expectedReturnAt !== null
                  ? formatDate(pattern.expectedReturnAt)
                  : "—"
              }
            />
          </div>
          <p className="rounded-lg bg-muted/60 px-3 py-2.5 text-sm text-muted-foreground">
            {pattern.status === "novo" && pattern.completedCount === 0
              ? "Nenhuma sessão registrada ainda. Ao registrar a primeira, começamos a linha do tempo."
              : pattern.status === "novo"
                ? "Com 2 sessões realizadas, o Retorno calcula o intervalo médio e passa a avisar sobre o momento ideal de retorno."
                : pattern.status === "em_dia"
                  ? pattern.daysOverdue !== null && pattern.daysOverdue < 0
                    ? `Retorno esperado em ${Math.abs(pattern.daysOverdue)} dias.`
                    : "Retorno esperado para hoje."
                  : pattern.expectedReturnAt !== null
                    ? `Passaram-se ${pattern.daysOverdue} dias do retorno esperado (${formatDate(pattern.expectedReturnAt)}). Vale o contato!`
                    : ""}
          </p>
        </CardContent>
      </Card>

      {/* Histórico de sessões */}
      <Card className="border-border/70">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-lg">
            Histórico de sessões
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setSessionDialog({ open: true, realized: false })}
          >
            <Plus className="size-4" aria-hidden />
            Nova sessão
          </Button>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma sessão registrada para este cliente.
            </p>
          ) : (
            <ul className="divide-y">
              {sessions.map((session) => (
                <li
                  key={session._id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {formatDateTime(session.date)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[session.serviceName, session.price !== undefined ? formatBRL(session.price) : null]
                        .filter(Boolean)
                        .join(" · ") || "Sessão"}
                      {session.notes ? ` · ${session.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === "realizada" && (
                      <PaymentBadge paid={session.paid} />
                    )}
                    <SessionStatusBadge status={session.status} />
                    <SessionActions sessionId={session._id} status={session.status} paid={session.paid} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Anotações */}
      <NotesCard clientId={client._id} notes={notes} />

      <SessionDialog
        open={sessionDialog.open}
        onOpenChange={(open) => setSessionDialog((prev) => ({ ...prev, open }))}
        defaultClientId={client._id}
        lockClient
        defaultRealized={sessionDialog.realized}
      />

      <EditClientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={{
          _id: client._id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          notes: client.notes,
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {client.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              O histórico de sessões e as anotações deste cliente também serão
              removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <DeleteClientButton clientId={client._id} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function SessionActions({
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
              onClick={() => run(() => complete({ id: sessionId }), "Sessão marcada como realizada.")}
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
          onClick={() =>
            run(() => remove({ id: sessionId }), "Sessão removida.")
          }
        >
          <Trash2 className="mr-2 size-4" />
          Excluir sessão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotesCard({
  clientId,
  notes,
}: {
  clientId: Id<"clients">;
  notes: Array<{ _id: Id<"clientNotes">; text: string; createdAt: number }>;
}) {
  const addNote = useMutation(api.notes.add);
  const removeNote = useMutation(api.notes.remove);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      toast.error("Escreva uma anotação antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await addNote({ clientId, text });
      setText("");
      toast.success("Anotação salva.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <StickyNote className="size-4 text-primary" aria-hidden />
          Anotações e comentários
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleAdd} className="grid gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex.: prefere pressão leve; comentou que voltará após a viagem…"
            rows={2}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" aria-hidden />
              )}
              Adicionar anotação
            </Button>
          </div>
        </form>
        {notes.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            Nenhuma anotação ainda. Guarde aqui preferências e combinados.
          </p>
        ) : (
          <ul className="grid gap-2">
            {notes.map((note) => (
              <li
                key={note._id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm leading-6">{note.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(note.createdAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remover anotação"
                  onClick={() =>
                    removeNote({ id: note._id })
                      .then(() => toast.success("Anotação removida."))
                      .catch((error: unknown) =>
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Não foi possível remover.",
                        ),
                      )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EditClientDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    _id: Id<"clients">;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
  };
}) {
  const updateClient = useMutation(api.clients.update);
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone ?? "");
  const [email, setEmail] = useState(client.email ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(client.name);
      setPhone(client.phone ?? "");
      setEmail(client.email ?? "");
      setNotes(client.notes ?? "");
    }
  }, [open, client]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    setSaving(true);
    try {
      await updateClient({
        id: client._id,
        name: name.trim(),
        phone: phone || undefined,
        email: email || undefined,
        notes: notes || undefined,
      });
      toast.success("Cliente atualizado.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Atualize os dados de contato e observações.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-notes">Observações</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteClientButton({ clientId }: { clientId: Id<"clients"> }) {
  const navigate = useNavigate();
  const removeClient = useMutation(api.clients.remove);
  const [deleting, setDeleting] = useState(false);

  return (
    <Button
      variant="destructive"
      disabled={deleting}
      onClick={async () => {
        setDeleting(true);
        try {
          await removeClient({ id: clientId });
          toast.success("Cliente excluído.");
          navigate("/app/clientes");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível excluir.",
          );
          setDeleting(false);
        }
      }}
    >
      {deleting && <Loader2 className="size-4 animate-spin" />}
      Excluir
    </Button>
  );
}
