import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fromDateInputValue, toDateInputValue } from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClientId?: Id<"clients">;
  lockClient?: boolean;
  defaultRealized?: boolean;
}

export function SessionDialog({
  open,
  onOpenChange,
  defaultClientId,
  lockClient = false,
  defaultRealized = false,
}: SessionDialogProps) {
  const clients = useQuery(api.clients.list, open ? {} : "skip");
  const services = useQuery(api.services.list, open ? {} : "skip");
  const createSession = useMutation(api.sessions.create);

  const [clientId, setClientId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>(toDateInputValue(Date.now()));
  const [time, setTime] = useState<string>("09:00");
  const [realized, setRealized] = useState(defaultRealized);
  const [paid, setPaid] = useState(true);
  const [price, setPrice] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setClientId(defaultClientId ?? "");
      setServiceId("");
      setDate(toDateInputValue(Date.now()));
      setTime("09:00");
      setRealized(defaultRealized);
      setPaid(true);
      setPrice("");
    }
  }, [open, defaultClientId, defaultRealized]);

  const handleServiceChange = (value: string) => {
    setServiceId(value);
    const service = services?.find((s) => s._id === value);
    if (service?.price !== undefined && service.price !== null) {
      setPrice(String(service.price));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clientId) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (!date) {
      toast.error("Informe a data da sessão.");
      return;
    }
    const priceValue = price.trim()
      ? Number(price.replace(",", "."))
      : undefined;
    if (priceValue !== undefined && Number.isNaN(priceValue)) {
      toast.error("Informe um valor válido.");
      return;
    }

    setSubmitting(true);
    try {
      await createSession({
        clientId: clientId as Id<"clients">,
        serviceId: serviceId ? (serviceId as Id<"services">) : undefined,
        date: fromDateInputValue(date, time),
        status: realized ? "realizada" : "agendada",
        price: priceValue,
        paid: realized ? paid : false,
      });
      toast.success(
        realized ? "Sessão registrada com sucesso." : "Sessão agendada.",
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {realized ? "Registrar sessão" : "Agendar sessão"}
          </DialogTitle>
          <DialogDescription>
            {realized
              ? "Registre uma sessão que já aconteceu para manter o histórico em dia."
              : "Reserve um horário com um cliente da sua carteira."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="session-client">Cliente</Label>
            {lockClient && defaultClientId ? (
              <Input
                id="session-client"
                value={
                  clients?.find((c) => c._id === defaultClientId)?.name ?? "…"
                }
                disabled
              />
            ) : (
              <Select
                value={clientId}
                onValueChange={setClientId}
                disabled={clients === undefined}
              >
                <SelectTrigger id="session-client" className="w-full">
                  <SelectValue placeholder="Escolha um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {(clients ?? []).map((client) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="session-service">Serviço</Label>
            <Select
              value={serviceId}
              onValueChange={handleServiceChange}
              disabled={services === undefined}
            >
              <SelectTrigger id="session-service" className="w-full">
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {(services ?? []).map((service) => (
                  <SelectItem key={service._id} value={service._id}>
                    {service.name}
                    {!service.active ? " (inativo)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="session-date">Data</Label>
              <Input
                id="session-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="session-time">Horário</Label>
              <Input
                id="session-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="session-price">Valor (R$)</Label>
            <Input
              id="session-price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2.5">
            <div className="pr-3">
              <Label htmlFor="session-realized" className="text-sm">
                Sessão já realizada
              </Label>
              <p className="text-xs text-muted-foreground">
                Desative para apenas agendar o horário.
              </p>
            </div>
            <Switch
              id="session-realized"
              checked={realized}
              onCheckedChange={setRealized}
            />
          </div>

          {realized && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="session-paid"
                checked={paid}
                onCheckedChange={(checked) => setPaid(checked === true)}
              />
              <Label htmlFor="session-paid" className="text-sm font-normal">
                Pagamento recebido
              </Label>
            </div>
          )}

          <DialogFooter className="mt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {realized ? "Registrar" : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
