import { BrandMark } from "@/components/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarCheck2,
  CircleDollarSign,
  ClipboardList,
  Flower2,
  History,
  MessageCircleHeart,
  Phone,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { Link } from "react-router";

const FEATURES = [
  {
    icon: History,
    title: "Padrão de retorno",
    description:
      "O sistema aprende o intervalo entre as sessões de cada cliente e estima a próxima visita.",
  },
  {
    icon: MessageCircleHeart,
    title: "Clientes para contato",
    description:
      "O painel destaca quem provavelmente já está atrasado — com telefone e WhatsApp a um clique.",
  },
  {
    icon: CalendarCheck2,
    title: "Agenda de sessões",
    description:
      "Agende horários futuros e registre sessões realizadas em segundos.",
  },
  {
    icon: CircleDollarSign,
    title: "Pagamentos em dia",
    description:
      "Marque o que foi pago, acompanhe pendências e veja o faturamento do mês.",
  },
  {
    icon: Flower2,
    title: "Catálogo de serviços",
    description:
      "Massagens, drenagem, reflexologia: cadastre valores e durações com busca instantânea.",
  },
  {
    icon: ClipboardList,
    title: "Anotações do cliente",
    description:
      "Guarde preferências, restrições e o que conversou em cada visita.",
  },
];

const STEPS = [
  {
    title: "Registre o histórico",
    description:
      "Cada sessão realizada alimenta a linha do tempo do cliente — manualmente ou importando sua base.",
  },
  {
    title: "O sistema identifica o padrão",
    description:
      "Calculamos o intervalo médio de retorno de cada pessoa, automaticamente.",
  },
  {
    title: "Receba as oportunidades",
    description:
      "Quando alguém passa do período esperado, ela aparece no seu painel do dia.",
  },
  {
    title: "Chame e receba de volta",
    description:
      "Um contato na hora certa transforma o intervalo perdido em nova sessão.",
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="size-9 rounded-lg" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Retorno Massagem
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#como-funciona" className="transition-colors hover:text-foreground">
              Como funciona
            </a>
            <a href="#recursos" className="transition-colors hover:text-foreground">
              Recursos
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/auth">
                Criar conta
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_50%,var(--accent),transparent)]"
          />
          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
            <div>
              <Badge
                variant="secondary"
                className="mb-5 gap-1.5 bg-accent text-accent-foreground"
              >
                <Sparkles className="size-3.5" aria-hidden />
                Gestão para massoterapeutas
              </Badge>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Saiba quem está pronto para voltar à sua mesa.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                O Retorno acompanha o histórico de sessões de cada cliente,
                identifica o ritmo de retorno de cada um e avisa na hora certa
                — antes que o intervalo vire meses sem contato.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auth">
                    Começar gratuitamente
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Sem cartão de crédito. Configure seu espaço em 3 passos.
              </p>
            </div>

            {/* Illustrative card */}
            <div className="relative">
              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Clientes para entrar em contato
                  </p>
                  <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-transparent" variant="secondary">
                    2 atrasadas
                  </Badge>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Mariana</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          6 sessões · volta a cada ~28 dias
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-transparent">
                        Atrasada
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Última sessão há 54 dias —{" "}
                      <span className="font-medium text-rose-700 dark:text-rose-300">
                        26 dias além do esperado
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Cláudia</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          4 sessões · volta a cada ~21 dias
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-transparent">
                        Atenção
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Chegou ao período esperado de retorno
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Paulo</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          9 sessões · volta a cada ~30 dias
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-transparent">
                        Em dia
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Previsão de retorno em 6 dias
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Um contato hoje pode render{" "}
                    <span className="font-semibold text-foreground">
                      uma sessão ainda esta semana
                    </span>
                  </p>
                  <Phone className="size-4 text-primary" aria-hidden />
                </div>
              </div>
              <div
                aria-hidden
                className="absolute -bottom-6 -right-4 -z-10 h-full w-full rounded-2xl bg-accent/50"
              />
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="border-t border-border/60 bg-secondary/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary">Como funciona</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Do histórico de sessões ao retorno do cliente
              </h2>
              <p className="mt-4 text-muted-foreground">
                Um fluxo simples que cabe na rotina de quem atende: registrar,
                observar e agir no momento certo.
              </p>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-border/70 bg-card p-5"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary">Recursos</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Tudo que a sua rotina de atendimento pede — e nada além disso
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/30"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-primary/30 bg-accent/40 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Upload className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">Já tem uma base de clientes?</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Importe sua lista em CSV durante a configuração e comece a
                    acompanhar os retornos imediatamente.
                  </p>
                </div>
              </div>
              <Search className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-border/60 bg-primary">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
                Seus clientes sentem falta de você. Alguns só não sabem como
                voltar.
              </h2>
              <p className="mt-3 text-primary-foreground/85">
                Crie seu espaço, cadastre seus serviços e deixe o Retorno
                cuidar do resto.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="shrink-0 gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/auth">
                Criar meu espaço
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <BrandMark className="size-7 rounded-md" />
            <span>Retorno Massagem</span>
          </div>
          <p>Gestão e relacionamento para massoterapeutas.</p>
        </div>
      </footer>
    </div>
  );
}
