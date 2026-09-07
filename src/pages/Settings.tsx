import { BrandMark } from "@/components/BrandMark";
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
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Settings() {
  const professional = useQuery(api.professionals.getMine);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.professionals.updateProfile);

  const [businessName, setBusinessName] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (professional) {
      setBusinessName(professional.businessName);
      setProfessionalName(professional.professionalName);
      setCity(professional.city ?? "");
      setPhone(professional.phone ?? "");
    }
  }, [professional]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessName.trim() || !professionalName.trim()) {
      toast.error("Preencha o nome do negócio e do profissional.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        businessName,
        professionalName,
        city: city || undefined,
        phone: phone || undefined,
      });
      toast.success("Configurações salvas.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (professional === undefined) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Carregando…
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dados do seu espaço e da sua conta.
        </p>
      </header>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-display text-lg">Seu espaço</CardTitle>
          <CardDescription>
            Essas informações identificam seu negócio dentro do Retorno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="settings-business">Nome do negócio</Label>
              <Input
                id="settings-business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settings-professional">Nome do profissional</Label>
              <Input
                id="settings-professional"
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="settings-city">Cidade</Label>
                <Input
                  id="settings-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="settings-phone">Telefone</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-display text-lg">Sua conta</CardTitle>
          <CardDescription>
            Você entra no Retorno com um código enviado por e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark className="size-10 rounded-full" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user?.name || professional.professionalName}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email ?? "Conta sem e-mail"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" aria-hidden />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
