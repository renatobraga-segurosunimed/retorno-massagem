import { ReturnStatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { parseClientsCsv, type CsvClientRow } from "@/lib/csv";
import { formatDaysAgo, initials } from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import {
  Loader2,
  Plus,
  Search,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Clients() {
  const clients = useQuery(api.clients.list);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = (clients ?? []).filter((client) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      client.name.toLowerCase().includes(term) ||
      (client.phone ?? "").toLowerCase().includes(term) ||
      (client.email ?? "").toLowerCase().includes(term)
    );
  });

  const overdueFirst = (a: { pattern: { daysOverdue: number | null } }, b: { pattern: { daysOverdue: number | null } }) =>
    (b.pattern.daysOverdue ?? -1) - (a.pattern.daysOverdue ?? -1);

  const sorted = [...filtered].sort(
    (a, b) =>
      overdueFirst(a, b) || a.name.localeCompare(b.name, "pt-BR"),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe o padrão de retorno de cada pessoa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" aria-hidden />
            Importar CSV
          </Button>
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Adicionar cliente
          </Button>
        </div>
      </header>

      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone ou e-mail"
          className="pl-9"
        />
      </div>

      {clients === undefined ? (
        <Card className="border-border/70">
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Carregando clientes…
          </CardContent>
        </Card>
      ) : clients.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-6" aria-hidden />
            </div>
            <p className="text-sm font-medium">Nenhum cliente por aqui ainda</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Adicione manualmente ou importe sua base em CSV para começar a
              acompanhar os padrões de retorno.
            </p>
            <div className="flex gap-2">
              <Button className="gap-2" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" aria-hidden />
                Adicionar cliente
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
                <Upload className="size-4" aria-hidden />
                Importar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum cliente encontrado para “{search}”.
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border border-border/70 bg-card">
          {sorted.map((client) => (
            <li key={client._id}>
              <button
                type="button"
                onClick={() => navigate(`/clientes/${client._id}`)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(client.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{client.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[client.phone, client.email].filter(Boolean).join(" · ") ||
                      "Sem contato cadastrado"}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-muted-foreground">
                    {client.pattern.completedCount}{" "}
                    {client.pattern.completedCount === 1 ? "sessão" : "sessões"}
                    {client.pattern.avgIntervalDays !== null &&
                      ` · ~${client.pattern.avgIntervalDays} dias`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Última {formatDaysAgo(client.pattern.daysSinceLast)}
                  </p>
                </div>
                <ReturnStatusBadge status={client.pattern.status} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} />
      <ImportClientsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}

function AddClientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createClient = useMutation(api.clients.create);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    setSaving(true);
    try {
      await createClient({
        name: name.trim(),
        phone: phone || undefined,
        email: email || undefined,
        notes: notes || undefined,
      });
      toast.success(`Cliente “${name.trim()}” cadastrado.`);
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
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
          <DialogTitle>Adicionar cliente</DialogTitle>
          <DialogDescription>
            Cadastre uma pessoa da sua carteira para acompanhar o histórico de
            sessões.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="add-name">Nome</Label>
            <Input
              id="add-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Mariana Lima"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="add-phone">Telefone</Label>
              <Input
                id="add-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">E-mail</Label>
              <Input
                id="add-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mariana@email.com"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="add-notes">Observações</Label>
            <Textarea
              id="add-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências, restrições de saúde, etc."
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
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ImportClientsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const importRows = useMutation(api.clients.importRows);
  const [pendingRows, setPendingRows] = useState<CsvClientRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { rows, skipped } = parseClientsCsv(text);
    if (rows.length === 0) {
      toast.error(
        "Não encontramos clientes no arquivo. Use colunas como: nome, telefone, email.",
      );
      return;
    }
    setPendingRows(rows);
    if (skipped > 0) {
      toast.info(`${skipped} linha(s) sem nome foram ignoradas.`);
    }
  };

  const handleImport = async () => {
    if (!pendingRows?.length) return;
    setImporting(true);
    try {
      const imported = await importRows({ rows: pendingRows });
      toast.success(`${imported} cliente(s) importado(s).`);
      setPendingRows(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha na importação.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar clientes de um CSV</DialogTitle>
          <DialogDescription>
            Uma linha por cliente, com colunas separadas por vírgula ou ponto
            e vírgula. Aceita cabeçalho com nome, telefone e email — se não
            houver cabeçalho, consideramos essa ordem.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          {pendingRows && (
            <div className="rounded-lg border border-border/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  <Sparkles className="size-3" aria-hidden />
                  {pendingRows.length} cliente(s) encontrados
                </Badge>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  aria-label="Descartar arquivo"
                  onClick={() => setPendingRows(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                {pendingRows.slice(0, 8).map((row, index) => (
                  <li key={`${row.name}-${index}`} className="truncate">
                    {row.name}
                    {row.phone ? ` · ${row.phone}` : ""}
                    {row.email ? ` · ${row.email}` : ""}
                  </li>
                ))}
                {pendingRows.length > 8 && (
                  <li>… e mais {pendingRows.length - 8}</li>
                )}
              </ul>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Selecionar um novo arquivo substitui a pré-visualização. A
            importação adiciona os clientes à sua carteira atual.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={importing}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={importing || !pendingRows?.length}
          >
            {importing && <Loader2 className="size-4 animate-spin" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
