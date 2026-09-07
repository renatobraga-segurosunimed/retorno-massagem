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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { parseClientsCsv, type CsvClientRow } from "@/lib/csv";
import { formatBRL } from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";

const EXAMPLE_SERVICES = [
  { name: "Massagem relaxante", durationMin: 60 },
  { name: "Massagem terapêutica", durationMin: 60 },
  { name: "Drenagem linfática", durationMin: 60 },
  { name: "Reflexologia", durationMin: 45 },
  { name: "Massagem desportiva", durationMin: 60 },
];

const STEP_TITLES = ["Seu espaço", "Seus serviços", "Seus clientes"];

export default function Onboarding() {
  const professional = useQuery(api.professionals.getMine);
  const [step, setStep] = useState(1);

  if (professional === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (professional?.onboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 py-10 sm:py-16">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <BrandMark className="size-12 rounded-xl" />
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
            Vamos configurar seu espaço
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Três passos rápidos e você já pode acompanhar os retornos.
          </p>
          <div className="mt-6 flex items-center gap-2" aria-hidden>
            {STEP_TITLES.map((title, index) => {
              const number = index + 1;
              const active = number === step;
              const done = number < step;
              return (
                <div key={title} className="flex items-center gap-2">
                  <span
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                          ? "border-2 border-primary text-primary"
                          : "border border-border text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-3.5" /> : number}
                  </span>
                  <span
                    className={`hidden text-sm sm:inline ${
                      active ? "font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {title}
                  </span>
                  {number < STEP_TITLES.length && (
                    <span className="h-px w-6 bg-border sm:w-10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          {step === 1 && professional !== null && (
            <StepSpace
              professional={professional}
              onDone={() => setStep(2)}
            />
          )}
          {step === 2 && <StepServices onDone={() => setStep(3)} />}
          {step === 3 && <StepClients />}
        </div>
      </div>
    </main>
  );
}

type Professional = Doc<"professionals">;

function StepSpace({
  professional,
  onDone,
}: {
  professional: Professional;
  onDone: () => void;
}) {
  const save = useMutation(api.professionals.saveOnboarding);
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState(professional.businessName);
  const [professionalName, setProfessionalName] = useState(
    professional.professionalName,
  );
  const [city, setCity] = useState(professional.city ?? "");
  const [phone, setPhone] = useState(professional.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessName.trim() || !professionalName.trim()) {
      toast.error("Preencha o nome do negócio e do profissional.");
      return;
    }
    setSaving(true);
    try {
      await save({
        businessName,
        professionalName,
        city: city || undefined,
        phone: phone || undefined,
      });
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-xl">
          Primeiro, seu espaço
        </CardTitle>
        <CardDescription>
          Essas informações aparecem no seu painel e nas suas configurações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="business-name">Nome do negócio</Label>
            <Input
              id="business-name"
              placeholder="Ex.: Espaço Bem Viver"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="professional-name">Nome do profissional</Label>
            <Input
              id="professional-name"
              placeholder="Ex.: Ana Souza"
              value={professionalName}
              onChange={(e) => setProfessionalName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="Ex.: Curitiba, PR"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(41) 99999-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Voltar ao início
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Continuar
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StepServices({ onDone }: { onDone: () => void }) {
  const services = useQuery(api.services.list, {});
  const createService = useMutation(api.services.create);
  const removeService = useMutation(api.services.remove);
  const [name, setName] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [price, setPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const addService = async (
    serviceName: string,
    serviceDuration?: number,
    servicePrice?: number,
  ) => {
    setAdding(true);
    try {
      await createService({
        name: serviceName,
        durationMin: serviceDuration,
        price: servicePrice,
        active: true,
      });
      toast.success(`“${serviceName}” adicionado aos seus serviços.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setAdding(false);
    }
  };

  const handleAddCustom = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do serviço.");
      return;
    }
    const duration = durationMin ? Number(durationMin) : undefined;
    const parsedPrice = price ? Number(price.replace(",", ".")) : undefined;
    if (
      duration !== undefined && Number.isNaN(duration)
    ) {
      toast.error("Duração inválida.");
      return;
    }
    if (parsedPrice !== undefined && Number.isNaN(parsedPrice)) {
      toast.error("Valor inválido.");
      return;
    }
    await addService(name.trim(), duration, parsedPrice);
    setName("");
    setDurationMin("");
    setPrice("");
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await removeService({ id: id as never });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível remover.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  const existingNames = new Set((services ?? []).map((s) => s.name));
  const suggestions = EXAMPLE_SERVICES.filter(
    (example) => !existingNames.has(example.name),
  );

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-xl">Seus serviços</CardTitle>
        <CardDescription>
          Comece pelos exemplos abaixo ou adicione os seus. Você pode editar
          valores depois, em Serviços.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2">
          <Label>Exemplos para começar</Label>
          <div className="flex flex-wrap gap-2">
            {suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todos os exemplos já foram adicionados.
              </p>
            ) : (
              suggestions.map((example) => (
                <Button
                  key={example.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-full"
                  disabled={adding}
                  onClick={() =>
                    addService(example.name, example.durationMin)
                  }
                >
                  <Plus className="size-3.5" aria-hidden />
                  {example.name}
                </Button>
              ))
            )}
          </div>
        </div>

        {(services ?? []).length > 0 && (
          <div className="grid gap-2">
            <Label>Seus serviços</Label>
            <ul className="divide-y rounded-lg border border-border/70">
              {(services ?? []).map((service) => (
                <li
                  key={service._id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[service.durationMin ? `${service.durationMin} min` : null, service.price !== undefined ? formatBRL(service.price) : null]
                        .filter(Boolean)
                        .join(" · ") || "Toque em editar depois para detalhes"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Remover ${service.name}`}
                    disabled={removingId === service._id}
                    onClick={() => handleRemove(service._id)}
                  >
                    {removingId === service._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={handleAddCustom}
          className="grid gap-3 rounded-lg border border-dashed border-border p-3 sm:grid-cols-[1fr_90px_110px_auto] sm:items-end"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="service-name">Outro serviço</Label>
            <Input
              id="service-name"
              placeholder="Ex.: Pedra quente"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="service-duration">Duração (min)</Label>
            <Input
              id="service-duration"
              type="number"
              min="0"
              placeholder="60"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="service-price">Valor (R$)</Label>
            <Input
              id="service-price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={adding} className="gap-1.5">
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
            Adicionar
          </Button>
        </form>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Pular esta etapa
          </Button>
          <Button type="button" onClick={onDone} className="gap-2">
            Continuar
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepClients() {
  const navigate = useNavigate();
  const clients = useQuery(api.clients.list, {});
  const finish = useMutation(api.professionals.finishOnboarding);
  const createClient = useMutation(api.clients.create);
  const importRows = useMutation(api.clients.importRows);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingRows, setPendingRows] = useState<CsvClientRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    setAdding(true);
    try {
      await createClient({
        name: name.trim(),
        phone: phone || undefined,
        email: email || undefined,
      });
      toast.success(`Cliente “${name.trim()}” cadastrado.`);
      setName("");
      setPhone("");
      setEmail("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setAdding(false);
    }
  };

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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha na importação.",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await finish({});
      toast.success("Tudo pronto. Bem-vindo(a) ao Retorno!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível concluir.",
      );
      setFinishing(false);
    }
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-xl">Seus clientes</CardTitle>
        <CardDescription>
          Cadastre alguns clientes agora ou importe sua base em CSV. Dá para
          adicionar mais tarde também.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <form
          onSubmit={handleAddClient}
          className="grid gap-3 sm:grid-cols-[1fr_140px_180px_auto] sm:items-end"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="client-name">Nome</Label>
            <Input
              id="client-name"
              placeholder="Ex.: Mariana Lima"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="client-phone">Telefone</Label>
            <Input
              id="client-phone"
              type="tel"
              placeholder="(11) 99999-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="client-email">E-mail</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="mariana@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={adding} className="gap-1.5">
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
            Cadastrar
          </Button>
        </form>

        <div className="grid gap-3 rounded-lg border border-dashed border-border p-4">
          <div className="flex items-start gap-3">
            <Upload className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium">Importar clientes de um CSV</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                Aceita colunas separadas por vírgula ou ponto e vírgula:
                nome, telefone, email. Uma linha por cliente.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="max-w-xs cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {pendingRows && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  <Sparkles className="size-3" aria-hidden />
                  {pendingRows.length} cliente(s) prontos
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleImport}
                  disabled={importing}
                  className="gap-1.5"
                >
                  {importing && <Loader2 className="size-3.5 animate-spin" />}
                  Importar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label="Descartar importação"
                  onClick={() => setPendingRows(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {clients !== undefined && clients.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {clients.length} cliente(s) cadastrado(s) até agora.
          </p>
        )}

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={handleFinish} disabled={finishing}>
            Pular e concluir
          </Button>
          <Button type="button" onClick={handleFinish} disabled={finishing} className="gap-2">
            {finishing && <Loader2 className="size-4 animate-spin" />}
            Concluir configuração
            <Check className="size-4" aria-hidden />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
