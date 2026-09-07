import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { formatBRL } from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import {
  Clock,
  Flower2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type ServiceDoc = Doc<"services">;

export default function Services() {
  const services = useQuery(api.services.list);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceDoc | null>(null);
  const [deleting, setDeleting] = useState<ServiceDoc | null>(null);

  const filtered = (services ?? []).filter((service) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      service.name.toLowerCase().includes(term) ||
      (service.description ?? "").toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (service: ServiceDoc) => {
    setEditing(service);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Serviços
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu catálogo de tratamentos, valores e durações.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Novo serviço
        </Button>
      </header>

      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar serviço"
          className="pl-9"
        />
      </div>

      {services === undefined ? (
        <Card className="border-border/70">
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Carregando serviços…
          </CardContent>
        </Card>
      ) : services.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Flower2 className="size-6" aria-hidden />
            </div>
            <p className="text-sm font-medium">Seu catálogo está vazio</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Cadastre os tratamentos que você oferece para agilizar o registro
              das sessões.
            </p>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="size-4" aria-hidden />
              Novo serviço
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum serviço encontrado para “{search}”.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <Card key={service._id} className="border-border/70 py-0">
              <CardContent className="flex h-full flex-col gap-2 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {service.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {service.durationMin !== undefined && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" aria-hidden />
                          {service.durationMin} min
                        </span>
                      )}
                      <span className="font-medium text-foreground">
                        {formatBRL(service.price ?? undefined)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!service.active && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Inativo
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`Opções de ${service.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(service)}>
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleting(service)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {service.description && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {service.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </ul>
      )}

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {deleting?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sessões já registradas com este serviço mantêm o nome no
              histórico. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <DeleteServiceButton
              serviceId={deleting?._id}
              onDone={() => setDeleting(null)}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServiceDialog({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceDoc | null;
}) {
  const createService = useMutation(api.services.create);
  const updateService = useMutation(api.services.update);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [price, setPrice] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (open) {
      setName(service?.name ?? "");
      setDescription(service?.description ?? "");
      setDurationMin(service?.durationMin !== undefined ? String(service.durationMin) : "");
      setPrice(service?.price !== undefined ? String(service.price).replace(".", ",") : "");
      setActive(service?.active ?? true);
    }
  }, [open, service]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do serviço.");
      return;
    }
    const duration = durationMin ? Number(durationMin) : undefined;
    const priceValue = price.trim()
      ? Number(price.replace(",", "."))
      : undefined;
    if (duration !== undefined && (Number.isNaN(duration) || duration < 0)) {
      toast.error("Duração inválida.");
      return;
    }
    if (priceValue !== undefined && (Number.isNaN(priceValue) || priceValue < 0)) {
      toast.error("Valor inválido.");
      return;
    }

    setSaving(true);
    try {
      if (service) {
        await updateService({
          id: service._id,
          name: name.trim(),
          description: description || undefined,
          durationMin: duration,
          price: priceValue,
          active,
        });
        toast.success("Serviço atualizado.");
      } else {
        await createService({
          name: name.trim(),
          description: description || undefined,
          durationMin: duration,
          price: priceValue,
          active,
        });
        toast.success(`“${name.trim()}” adicionado ao catálogo.`);
      }
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
          <DialogTitle>{service ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          <DialogDescription>
            Serviços aparecem no catálogo e ao registrar sessões.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="service-name">Nome</Label>
            <Input
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Massagem relaxante"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service-description">Descrição</Label>
            <Textarea
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Para que serve, como funciona…"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="service-duration">Duração (min)</Label>
              <Input
                id="service-duration"
                type="number"
                min="0"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                placeholder="60"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-price">Valor (R$)</Label>
              <Input
                id="service-price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="120,00"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2.5">
            <div className="pr-3">
              <Label htmlFor="service-active" className="text-sm">
                Ativo no catálogo
              </Label>
              <p className="text-xs text-muted-foreground">
                Serviços inativos ficam ocultos ao registrar novas sessões.
              </p>
            </div>
            <Switch
              id="service-active"
              checked={active}
              onCheckedChange={setActive}
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

function DeleteServiceButton({
  serviceId,
  onDone,
}: {
  serviceId: Id<"services"> | undefined;
  onDone: () => void;
}) {
  const removeService = useMutation(api.services.remove);
  const [deleting, setDeleting] = useState(false);

  return (
    <Button
      variant="destructive"
      disabled={deleting || !serviceId}
      onClick={async () => {
        if (!serviceId) return;
        setDeleting(true);
        try {
          await removeService({ id: serviceId });
          toast.success("Serviço excluído.");
          onDone();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível excluir.",
          );
        } finally {
          setDeleting(false);
        }
      }}
    >
      {deleting && <Loader2 className="size-4 animate-spin" />}
      Excluir
    </Button>
  );
}
