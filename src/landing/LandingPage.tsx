import { motion } from "framer-motion";
import { Link } from "react-router";

import { Logo } from "@/landing/Logo";

// ─────────────────────────────────────────────────────────────────────────
// 🔗 CTA — o botão principal leva ao cadastro interno (fluxo de teste
//    grátis). Quando houver checkout externo (Hotmart, Kiwify, Stripe…),
//    troque os <Link to="/cadastro"> pelo link de pagamento.
// ─────────────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Icon({
  name,
  className = "",
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

const NAV = [
  { href: "#o-problema", label: "O Problema" },
  { href: "#solucao", label: "Solução" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#demonstracao", label: "Demonstração" },
  { href: "#duvidas", label: "Dúvidas" },
];

const PROBLEMS = [
  {
    icon: "person_off",
    title: "Clientes que não voltam",
    text: "A sensação constante e cansativa de ter que sempre buscar novos clientes do zero em vez de fidelizar quem já conheceu seu toque e aprovou seu acolhimento.",
  },
  {
    icon: "contact_support",
    title: "Falta de acompanhamento",
    text: "Não saber com exatidão como o cliente se sentiu nos dias seguintes à massagem ou esquecer o momento propício de sugerir a próxima sessão de manutenção.",
  },
  {
    icon: "description",
    title: "Informações espalhadas",
    text: "Anotações em cadernos, fichas de papel soltas e detalhes de queixas corporais que se perdem com facilidade na correria dos atendimentos diários.",
  },
  {
    icon: "psychology_alt",
    title: "Dependência da memória e WhatsApp",
    text: "Tentar lembrar de cabeça datas, preferências de pressão, dores relatadas e conversar pelo aplicativo de mensagens sem qualquer histórico estruturado.",
  },
];

const SOLUTIONS = [
  {
    icon: "contacts",
    title: "Organize seus clientes",
    text: "Ficha rápida com preferências de manobras, histórico de tensão muscular, aromas favoritos e contato sempre acessível sem burocracia.",
  },
  {
    icon: "vital_signs",
    title: "Acompanhe os atendimentos",
    text: "Registre as técnicas utilizadas, óleos vegetais ou essenciais preferidos e a evolução do bem-estar a cada sessão realizada.",
  },
  {
    icon: "event_repeat",
    title: "Não esqueça dos retornos",
    text: "Lembretes automáticos e intuitivos para convidar o cliente para a sessão de manutenção no momento ideal, de forma ética e carinhosa.",
  },
  {
    icon: "favorite",
    title: "Aumente a recorrência",
    text: "Transforme atendimentos avulsos em clientes fiéis que cuidam da saúde e do corpo de forma contínua com você.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Cadastre seus clientes",
    text: "Em poucos segundos, anote dados básicos e preferências diretamente pelo celular ou computador sem fichas complexas.",
  },
  {
    n: "2",
    title: "Registre seus atendimentos",
    text: "Ao término de cada massagem, faça um registro rápido de como foi a sessão, pontos de tensão aliviados e recomendações.",
  },
  {
    n: "3",
    title: "Mantenha o relacionamento",
    text: "Receba avisos inteligentes para retomar contato com carinho e profissionalismo na periodicidade ideal de cada cliente.",
  },
];

const FAQS = [
  {
    q: "Como funciona a compra do sistema?",
    a: "O acesso é liberado imediatamente após a confirmação do pagamento. Você recebe seu login e já pode cadastrar seus clientes no mesmo dia.",
  },
  {
    q: "O sistema é fácil de usar para quem não entende de tecnologia?",
    a: "Sim, o Retorno Massagem foi pensado exclusivamente para a rotina prática do massoterapeuta, com botões grandes, linguagem clara e sem complicações.",
  },
  {
    q: "Consigo usar diretamente pelo celular?",
    a: "Com certeza. O sistema é 100% responsivo e funciona perfeitamente no navegador do seu smartphone (iPhone ou Android).",
  },
  {
    q: "Consigo testar antes de comprar?",
    a: "Sim! Você pode testar gratuitamente por 30 dias, sem cartão de crédito, e só compra se gostar do resultado na sua rotina.",
  },
  {
    q: "Preciso instalar algum programa pesado no computador?",
    a: "Não. O sistema funciona na nuvem, direto pelo navegador da internet. Suas informações ficam seguras e acessíveis de qualquer aparelho.",
  },
];

const TESTIMONIALS = [
  {
    role: "Massoterapeuta Clínica",
    city: "São Paulo/SP",
    text: "Espaço reservado para relato de massoterapeuta parceiro durante o período de avaliação.",
  },
  {
    role: "Terapeuta Holística e Spa",
    city: "Curitiba/PR",
    text: "Espaço reservado para relato de massoterapeuta parceiro durante o período de avaliação.",
  },
  {
    role: "Massoterapia e Quiropraxia",
    city: "Rio de Janeiro/RJ",
    text: "Espaço reservado para relato de massoterapeuta parceiro durante o período de avaliação.",
  },
];

const WEEK = [
  { d: "SEG", n: 4, today: false },
  { d: "TER", n: 5, today: false },
  { d: "QUA", n: 6, today: true },
  { d: "QUI", n: 3, today: false },
  { d: "SEX", n: 4, today: false },
];

export default function Landing() {
  return (
    <div className="landing min-h-screen bg-background text-foreground">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(27,77,62,0.05)]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:gap-6 sm:px-5 lg:px-12">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Logo className="h-9 w-9 shrink-0" />
            <span className="min-w-0 text-[0.95rem] font-bold leading-tight tracking-tight text-primary sm:text-xl sm:leading-normal">
              Retorno Massagem
            </span>
          </Link>
          <nav className="hidden items-center gap-6 whitespace-nowrap lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-2.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-secondary-container sm:px-4 sm:py-3"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-[0_4px_20px_-2px_rgba(27,77,62,0.16)] transition-all hover:bg-primary-container hover:text-on-primary-container sm:px-6 sm:py-3"
            >
              Teste grátis
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 sm:pt-20">
        {/* ── 1. HERO ─────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden py-12 lg:py-16">
          <div className="pointer-events-none absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-secondary-container/40 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 left-10 -z-10 h-80 w-80 rounded-full bg-primary-fixed/30 blur-3xl" />

          <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-5 text-center lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary-container/60 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm"
            >
              <Icon name="spa" filled className="text-base text-primary" />
              Feito exclusivamente para massoterapeutas ✨
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="max-w-4xl text-4xl font-bold leading-[1.15] tracking-[-0.025em] text-primary lg:text-6xl lg:leading-[1.14] lg:tracking-[-0.03em]"
            >
              Faça seus clientes de massoterapia voltarem mais vezes.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-4 mb-8 max-w-2xl text-lg leading-7 text-muted-foreground"
            >
              Organize seus clientes, acompanhe seus atendimentos e mantenha o
              relacionamento ativo de forma simples e profissional.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mb-6 flex w-full max-w-md flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                to="/cadastro"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary-container sm:w-auto"
              >
                Teste grátis
                <Icon name="arrow_forward" className="text-lg" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-muted px-8 py-4 text-sm font-semibold text-primary transition-all hover:bg-secondary-container sm:w-auto"
              >
                <Icon name="play_circle" className="text-xl" />
                Ver como funciona
              </a>
            </motion.div>

            <div className="mb-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-semibold text-secondary">
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" className="text-base text-primary" />
                Teste grátis de 30 dias
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" className="text-base text-primary" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" className="text-base text-primary" />
                Fácil de usar no celular e computador
              </span>
            </div>

            {/* Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 bg-muted px-6 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-outline/50" />
                  <div className="h-3 w-3 rounded-full bg-outline/50" />
                  <div className="h-3 w-3 rounded-full bg-outline/50" />
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">
                    retornomassagem.app/painel
                  </span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  <span className="flex items-center gap-1 rounded-lg bg-card px-3 py-1.5 text-sm font-semibold text-primary shadow-sm">
                    <Icon name="group" className="text-base" /> Clientes
                  </span>
                  <span className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground">
                    <Icon name="healing" className="text-base" /> Atendimentos
                  </span>
                  <span className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground">
                    <Icon name="schedule" className="text-base" /> Retornos
                    pendentes
                  </span>
                  <span className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground">
                    <Icon name="calendar_today" className="text-base" /> Agenda
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-5 p-6 text-left lg:p-8">
                <div className="flex flex-col justify-between gap-4 rounded-xl bg-secondary-container/50 p-5 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                      R
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-primary">
                        Bom dia, Roberta!
                      </h2>
                      <p className="text-muted-foreground">
                        Você tem 4 retornos sugeridos para hoje.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-semibold text-primary shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-primary-container" />
                    Quinta-feira • 3 atendimentos agendados
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { icon: "people", label: "Clientes ativos", value: "84" },
                    {
                      icon: "self_improvement",
                      label: "Atendimentos no mês",
                      value: "32",
                    },
                    {
                      icon: "trending_up",
                      label: "Taxa de retorno",
                      value: "78%",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-xl bg-muted p-4"
                    >
                      <div>
                        <p className="text-xs font-semibold text-secondary">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {stat.value}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary shadow-sm">
                        <Icon name={stat.icon} className="text-xl" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Próximos atendimentos e acompanhamentos
                  </h3>
                  <div className="space-y-2">
                    <div className="flex flex-col justify-between gap-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/50 transition-colors hover:bg-muted sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed font-bold text-on-primary-fixed">
                          CL
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">
                            Camila Lima
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Hoje, às 14:30
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                          Massagem Relaxante - Lombar
                        </span>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                          Óleo de Lavanda
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/50 transition-colors hover:bg-muted sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container font-bold text-primary">
                          MA
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">
                            Marcos Andrade
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Hoje, às 16:00
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                          Drenagem Linfática
                        </span>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                          Pós-treino
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-xl bg-tertiary-fixed/30 p-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-fixed font-bold text-on-tertiary-fixed">
                          FS
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground">
                              Fernanda Souza
                            </h4>
                            <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[11px] font-semibold text-tertiary">
                              Retorno após 15 dias
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Última sessão de liberação miofascial cervical há 16
                            dias
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/cadastro"
                        className="inline-flex items-center gap-2 self-start rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-container sm:self-auto"
                      >
                        <Icon name="chat" className="text-base" />
                        Enviar mensagem pelo WhatsApp
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── 2. O PROBLEMA ───────────────────────────────────────── */}
        <section
          id="o-problema"
          className="w-full scroll-mt-24 bg-muted py-16 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-12">
            <Reveal className="mb-12 max-w-3xl">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-secondary">
                Desafio Diário
              </span>
              <h2 className="text-3xl font-semibold leading-9 tracking-[-0.015em] text-primary lg:text-4xl lg:leading-[1.2] lg:tracking-[-0.02em]">
                Você conquista o cliente. Mas o que acontece depois da primeira
                sessão?
              </h2>
              <p className="mt-4 text-lg leading-7 text-muted-foreground">
                A massoterapia é uma profissão de entrega profunda, técnica
                apurada e presença total na maca. No entanto, quando o dia
                termina, o cuidado pós-atendimento acaba se tornando um gargalo
                exaustivo, fazendo com que profissionais dedicados percam o
                contato com quem acabou de aprovar seu trabalho.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {PROBLEMS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="flex h-full flex-col justify-between rounded-2xl bg-card p-8 shadow-sm">
                    <div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary">
                        <Icon name={p.icon} className="text-[26px]" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-primary">
                        {p.title}
                      </h3>
                      <p className="leading-6 text-muted-foreground">
                        {p.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. A SOLUÇÃO ────────────────────────────────────────── */}
        <section id="solucao" className="w-full scroll-mt-24 py-16 lg:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-12">
            <Reveal className="mx-auto mb-12 max-w-3xl text-center">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-secondary">
                Tranquilidade e Praticidade
              </span>
              <h2 className="text-3xl font-semibold tracking-[-0.015em] text-primary lg:text-4xl lg:tracking-[-0.02em]">
                Um jeito simples de cuidar do relacionamento com seus clientes.
              </h2>
              <p className="mt-4 text-lg leading-7 text-muted-foreground">
                A clareza e a paz de espírito de ter todo o histórico de alívio
                e bem-estar dos seus atendidos reunidos no mesmo lugar,
                acessível em segundos.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {SOLUTIONS.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="flex items-start gap-6 rounded-2xl bg-muted p-8">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-primary">
                      <Icon name={s.icon} className="text-[28px]" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-primary">
                        {s.title}
                      </h3>
                      <p className="leading-6 text-muted-foreground">
                        {s.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. COMO FUNCIONA ────────────────────────────────────── */}
        <section
          id="como-funciona"
          className="w-full scroll-mt-24 bg-muted py-16 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-12">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-secondary">
                Passo a Passo
              </span>
              <h2 className="text-3xl font-semibold tracking-[-0.015em] text-primary lg:text-4xl lg:tracking-[-0.02em]">
                Como funciona no seu dia a dia
              </h2>
              <p className="mt-4 text-lg leading-7 text-muted-foreground">
                Uma rotina fluida criada para caber nos 3 minutos de intervalo
                entre uma sessão e outra.
              </p>
            </Reveal>
            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.1}>
                  <div className="relative h-full rounded-2xl bg-card p-8 shadow-sm">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                      {step.n}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-primary">
                      {step.title}
                    </h3>
                    <p className="leading-6 text-muted-foreground">
                      {step.text}
                    </p>
                    {i < 2 && (
                      <span className="absolute top-10 -right-4 hidden text-outline md:block">
                        <Icon name="chevron_right" className="text-3xl" />
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. DEMONSTRAÇÃO ─────────────────────────────────────── */}
        <section
          id="demonstracao"
          className="w-full scroll-mt-24 py-16 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-12">
            <Reveal className="mx-auto mb-12 max-w-3xl text-center">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-secondary">
                Interface Limpa e Humanizada
              </span>
              <h2 className="text-3xl font-semibold tracking-[-0.015em] text-primary lg:text-4xl lg:tracking-[-0.02em]">
                Veja o sistema por dentro
              </h2>
              <p className="mt-4 text-lg leading-7 text-muted-foreground">
                Interface leve, pensada para transmitir a mesma calma que você
                oferece em sua sala de atendimento.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Mockup A: Ficha do Cliente */}
              <Reveal>
                <div className="flex h-full flex-col gap-4 rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      Ficha da Cliente
                    </span>
                    <span className="rounded-full bg-secondary-container px-3 py-0.5 text-xs font-semibold text-primary">
                      Perfil Ativo
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-xl font-bold text-on-primary-container">
                      BC
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-foreground">
                        Beatriz Castanho
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Cliente desde Outubro • 6 sessões realizadas
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-xl bg-muted p-4">
                    <p className="text-xs font-semibold text-secondary">
                      Queixas principais & Foco corporal:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Cervicobraquialgia leve",
                        "Tensão trapézio direito",
                        "Pressão preferida: Moderada/Firme",
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-card px-3 py-1 text-sm text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-secondary">
                      Próximo retorno recomendado: em 12 dias
                    </span>
                  </div>
                </div>
              </Reveal>

              {/* Mockup B: Histórico */}
              <Reveal delay={0.08}>
                <div className="flex h-full flex-col gap-4 rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      Histórico de Atendimentos
                    </span>
                    <span className="text-xs font-semibold text-secondary">
                      Linha do tempo
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-muted p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          Sessão #06 • 18 de Novembro
                        </span>
                        <span className="text-xs font-semibold text-secondary">
                          50 min
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Massagem Terapêutica com foco dorsal. Relatou alívio
                        imediato no ombro. Boa resposta com óleo carreador de
                        semente de uva e lavanda.
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          Sessão #05 • 03 de Novembro
                        </span>
                        <span className="text-xs font-semibold text-secondary">
                          50 min
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Liberação miofascial cervical. Queixa de dor ao final da
                        jornada de trabalho reduziu consideravelmente.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Mockup C: Retornos & Lembretes */}
              <Reveal delay={0.05}>
                <div className="flex h-full flex-col gap-4 rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      Painel de Retornos & Lembretes
                    </span>
                    <span className="rounded-full bg-tertiary-fixed px-3 py-0.5 text-xs font-semibold text-on-tertiary-fixed">
                      3 sugeridos
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          Juliana Mendes
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Completou 21 dias da última drenagem
                        </p>
                      </div>
                      <span className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                        Lembrar
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          Rodrigo Nogueira
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Completou 30 dias de massagem desportiva
                        </p>
                      </div>
                      <span className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                        Lembrar
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Mockup D: Semana */}
              <Reveal delay={0.13}>
                <div className="flex h-full flex-col gap-4 rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      Visão Geral da Semana
                    </span>
                    <span className="text-xs font-semibold text-secondary">
                      Ritmo Serena
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {WEEK.map((d) => (
                      <div
                        key={d.d}
                        className={`rounded-lg p-2 ${
                          d.today ? "bg-secondary-container" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`block text-[11px] font-semibold ${
                            d.today
                              ? "font-bold text-primary"
                              : "text-secondary"
                          }`}
                        >
                          {d.d}
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {d.n}
                        </span>
                        <span
                          className={`block text-[10px] ${
                            d.today ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {d.today ? "hoje" : "sessões"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-secondary">
                    <span className="text-sm">
                      Tempo médio entre atendimentos: 15 min de descanso
                    </span>
                    <Icon name="self_improvement" className="text-lg" />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── 6. ANTES E DEPOIS ───────────────────────────────────── */}
        <section className="w-full bg-muted py-16 lg:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-12">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-secondary">
                Comparativo Real
              </span>
              <h2 className="text-3xl font-semibold tracking-[-0.015em] text-primary lg:text-4xl lg:tracking-[-0.02em]">
                A transformação na sua rotina terapêutica
              </h2>
            </Reveal>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
              <Reveal>
                <div className="flex h-full flex-col gap-6 rounded-2xl bg-card p-8 opacity-90 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-outline/30 text-muted-foreground">
                      <Icon name="close" className="text-lg" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Antes do Retorno Massagem
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {[
                      {
                        t: "Clientes esquecidos",
                        d: "Clientes fazem uma sessão ótima, mas nunca mais são contatados e acabam esfriando com o passar das semanas.",
                      },
                      {
                        t: "Anotações espalhadas",
                        d: "Fichas de papel amassadas, notas soltas no bloco de notas do celular e conversas perdidas na timeline do WhatsApp.",
                      },
                      {
                        t: "Falta de acompanhamento",
                        d: "Insegurança sobre quando chamar o cliente e a sensação desagradável de estar insistindo sem um critério profissional.",
                      },
                    ].map((item) => (
                      <div key={item.t}>
                        <h4 className="font-bold text-primary">{item.t}</h4>
                        <p className="mt-1 leading-6 text-muted-foreground">
                          {item.d}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="flex h-full flex-col gap-6 rounded-2xl bg-secondary-container/40 p-8 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon name="check" className="text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-primary">
                      Depois do Retorno Massagem
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {[
                      {
                        t: "Clientes organizados",
                        d: "Perfil completo na ponta dos dedos, acessível onde quer que você atenda: na clínica, no spa ou em atendimento domiciliar.",
                      },
                      {
                        t: "Histórico centralizado",
                        d: "Toda a jornada de alívio e evolução corporal documentada com facilidade em poucos cliques após a sessão.",
                      },
                      {
                        t: "Relacionamento mais profissional",
                        d: "Mensagens cuidadosas no momento certo, gerando agenda cheia com naturalidade e respeito ao ritmo do cliente.",
                      },
                    ].map((item) => (
                      <div key={item.t}>
                        <h4 className="font-bold text-primary">{item.t}</h4>
                        <p className="mt-1 leading-6 text-secondary">
                          {item.d}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── 7. DEPOIMENTOS ──────────────────────────────────────── */}
        <section className="w-full py-16 lg:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-12">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-secondary">
                Comunidade & Confiança
              </span>
              <h2 className="text-3xl font-semibold tracking-[-0.015em] text-primary lg:text-4xl lg:tracking-[-0.02em]">
                O que dizem os massoterapeutas
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.city} delay={i * 0.08}>
                  <div className="flex h-full flex-col justify-between rounded-2xl bg-muted p-8">
                    <div className="mb-6">
                      <Icon
                        name="format_quote"
                        className="mb-3 text-[32px] text-primary opacity-60"
                        filled
                      />
                      <p className="italic leading-6 text-muted-foreground">
                        “{t.text}”
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">
                        Nome do Profissional
                      </h4>
                      <p className="text-sm text-secondary">
                        {t.role} • {t.city}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-8 text-center text-xs font-semibold text-outline">
              Depoimentos coletados durante o período de avaliação do sistema.
            </p>
          </div>
        </section>

        {/* ── 8. FAQ ──────────────────────────────────────────────── */}
        <section
          id="duvidas"
          className="w-full scroll-mt-24 bg-muted py-16 lg:py-24"
        >
          <div className="mx-auto w-full max-w-3xl px-5 lg:px-12">
            <Reveal className="mb-12 text-center">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-secondary">
                Tire Suas Dúvidas
              </span>
              <h2 className="text-3xl font-semibold tracking-[-0.015em] text-primary lg:text-4xl lg:tracking-[-0.02em]">
                Perguntas frequentes
              </h2>
            </Reveal>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group cursor-pointer rounded-xl bg-card p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex items-center justify-between text-xl font-semibold text-primary">
                    <span>{faq.q}</span>
                    <Icon
                      name="expand_more"
                      className="text-secondary transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. CTA FINAL ────────────────────────────────────────── */}
        <section id="comprar" className="w-full scroll-mt-24 py-16 lg:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-12">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-container to-secondary p-12 text-center shadow-xl lg:p-24">
                <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary-container/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary-fixed/20 blur-2xl" />
                <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
                  <h2 className="mb-4 text-3xl font-semibold tracking-[-0.015em] text-white lg:text-4xl lg:tracking-[-0.02em]">
                    Comece a cuidar melhor do relacionamento com seus clientes.
                  </h2>
                  <p className="mb-8 text-lg leading-7 text-primary-fixed">
                    Transforme quem veio para uma única sessão em clientes fiéis
                    e satisfeitos, mantendo sua agenda equilibrada e sua mente
                    tranquila.
                  </p>
                  <Link
                    to="/cadastro"
                    className="mb-4 inline-flex items-center justify-center rounded-xl bg-card px-12 py-4 font-bold text-primary shadow-lg transition-all hover:bg-muted"
                  >
                    Teste grátis agora
                  </Link>
                  <p className="text-xs font-semibold text-primary-fixed-dim">
                    Teste grátis de 30 dias • Sem cartão de crédito • Acesso
                    imediato
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="mt-12 w-full bg-muted">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-12">
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            <div className="flex flex-col gap-3 md:col-span-6">
              <div className="flex items-center gap-3">
                <Logo className="h-8 w-8" />
                <span className="text-xl font-bold tracking-tight text-primary">
                  Retorno Massagem
                </span>
              </div>
              <p className="max-w-md text-muted-foreground">
                O sistema de relacionamento pensado com carinho para
                massoterapeutas.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Icon name="verified_user" className="text-xl text-primary" />
                <span className="text-xs font-semibold text-secondary">
                  Ambiente 100% seguro • Sem cartão de crédito exigido
                </span>
              </div>
            </div>
            <div className="flex h-full flex-col justify-between gap-6 md:col-span-6 md:items-end">
              <nav className="flex flex-wrap gap-x-8 gap-y-2">
                {["Privacidade", "Termos de Uso", "Suporte", "Contato"].map(
                  (label) => (
                    <a
                      key={label}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                    >
                      {label}
                    </a>
                  ),
                )}
              </nav>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Retorno Massagem. Todos os
                direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
