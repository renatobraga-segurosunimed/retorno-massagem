import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  UserRoundCheck,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
  /** Which screen opens first: login ("signIn") or signup ("signUp"). */
  initialStep?: Step;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/app/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

type Step = "signIn" | "signUp" | "forgot" | "reset" | "verify";

const STEP_COPY: Record<
  Step,
  { title: string; description: string }
> = {
  signIn: {
    title: "Entrar no Retorno Massagem",
    description: "Use seu e-mail e senha para acessar sua conta.",
  },
  signUp: {
    title: "Criar sua conta",
    description:
      "Cadastre-se com e-mail e senha. Em seguida, você confirma seu e-mail com um código.",
  },
  forgot: {
    title: "Recuperar acesso",
    description:
      "Informe seu e-mail e enviaremos um código para você criar uma nova senha.",
  },
  reset: {
    title: "Definir nova senha",
    description:
      "Digite o código de 6 dígitos enviado por e-mail e escolha uma nova senha.",
  },
  verify: {
    title: "Verifique seu e-mail",
    description:
      "Enviamos um código de 6 dígitos para confirmar seu e-mail. Ele expira em 15 minutos.",
  },
};

/** Google "G" logo for the sign-in button. */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

/** Password input with a show/hide toggle. */
function PasswordField({
  id,
  value,
  onChange,
  autoComplete,
  placeholder = "••••••••",
  required = true,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-10"
        autoComplete={autoComplete}
        required={required}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

function Auth({ redirectAfterAuth, initialStep = "signIn" }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const clearFeedback = () => {
    setError(null);
    setInfo(null);
  };

  const goTo = (next: Step) => {
    clearFeedback();
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setStep(next);
  };

  /** Starts the Google OAuth flow. The provider reads its credentials from
   *  the AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET Convex environment variables. */
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    clearFeedback();
    try {
      await signIn("google", { redirectTo: redirect });
      // The client redirects the browser to Google; nothing to do here.
    } catch (err) {
      setError(
        `Não foi possível iniciar o login com Google: ${
          err instanceof Error ? err.message : "erro desconhecido"
        }`,
      );
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    clearFeedback();
    try {
      const result = await signIn("password", {
        email: email.trim(),
        password,
        flow: "signIn",
      });
      if (result.signingIn) {
        navigate(redirect);
      } else {
        // E-mail ainda não verificado: o servidor enviou um novo código em
        // vez de iniciar a sessão. Mostre a etapa de verificação.
        setIsLoading(false);
        setInfo(null);
        setStep("verify");
      }
    } catch {
      setError("E-mail ou senha incorretos.");
      setIsLoading(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setIsLoading(true);
    clearFeedback();
    try {
      await signIn("password", {
        email: email.trim(),
        password,
        flow: "signUp",
      });
      // With e-mail verification enabled, signUp does NOT sign the user in:
      // it sends a 6-digit code and waits for the "email-verification" flow.
      setInfo(null);
      setStep("verify");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        /already/i.test(message)
          ? "Já existe uma conta com este e-mail. Tente entrar."
          : "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
      );
      setIsLoading(false);
    }
  };

  /** Verifies the 6-digit code sent after signup. On success the e-mail is
   *  confirmed and the user is signed in. */
  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6) {
      setError("Digite o código de 6 dígitos enviado por e-mail.");
      return;
    }
    setIsLoading(true);
    clearFeedback();
    try {
      await signIn("password", {
        email: email.trim(),
        code,
        flow: "email-verification",
      });
      navigate(redirect);
    } catch {
      setError("Código inválido ou expirado. Solicite um novo código.");
      setIsLoading(false);
    }
  };

  /** Resends the signup/login verification code. Re-running the signIn flow
   *  is safe: with the correct password it just re-sends the code while the
   *  account remains unverified. */
  const resendVerificationCode = async () => {
    setIsLoading(true);
    clearFeedback();
    try {
      await signIn("password", {
        email: email.trim(),
        password,
        flow: "signIn",
      });
      setInfo("Um novo código foi enviado.");
    } catch {
      setError("Não foi possível reenviar o código. Tente novamente.");
    }
    setIsLoading(false);
  };

  /** Requests the reset code. The same message is shown whether or not the
   *  e-mail has an account, to avoid revealing who uses the product. */
  const requestResetCode = async () => {
    setIsLoading(true);
    clearFeedback();
    try {
      await signIn("password", { flow: "reset", email: email.trim() });
    } catch {
      // Ignored on purpose — the info message below never confirms whether
      // the address exists.
    }
    setInfo(
      `Se ${email.trim()} estiver cadastrado, você receberá um código de 6 dígitos. Ele expira em 15 minutos.`,
    );
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setStep("reset");
    setIsLoading(false);
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6) {
      setError("Digite o código de 6 dígitos enviado por e-mail.");
      return;
    }
    if (password.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setIsLoading(true);
    clearFeedback();
    try {
      await signIn("password", {
        email: email.trim(),
        code,
        newPassword: password,
        flow: "reset-verification",
      });
      navigate(redirect);
    } catch {
      setError("Código inválido ou expirado. Solicite um novo código.");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    clearFeedback();
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      setError(
        `Não foi possível entrar como convidado(a): ${
          err instanceof Error ? err.message : "erro desconhecido"
        }`,
      );
      setIsLoading(false);
    }
  };

  const copy = STEP_COPY[step];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex w-full flex-col items-center">
          <Card className="w-full min-w-[320px] max-w-sm pb-0 border-border/70 shadow-md">
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <button
                  type="button"
                  aria-label="Ir para o início"
                  onClick={() => navigate("/")}
                >
                  <BrandMark className="size-14 rounded-xl" />
                </button>
              </div>
              <CardTitle className="font-display text-xl">
                {copy.title}
              </CardTitle>
              <CardDescription>{copy.description}</CardDescription>
            </CardHeader>

            {step === "signIn" && (
              <form onSubmit={handleSignIn}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="signin-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        className="pl-9"
                        autoComplete="email"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Senha</Label>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => goTo("forgot")}
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <PasswordField
                      id="signin-password"
                      value={password}
                      onChange={setPassword}
                      autoComplete="current-password"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Entrando…
                      </>
                    ) : (
                      <>
                        Entrar
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            )}

            {step === "signUp" && (
              <form onSubmit={handleSignUp}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        className="pl-9"
                        autoComplete="email"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <PasswordField
                      id="signup-password"
                      value={password}
                      onChange={setPassword}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use pelo menos 8 caracteres.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="signup-confirm">Confirmar senha</Label>
                    <PasswordField
                      id="signup-confirm"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      autoComplete="new-password"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Criando conta…
                      </>
                    ) : (
                      <>
                        Criar conta
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerify}>
                <CardContent className="grid gap-4">
                  <input
                    type="hidden"
                    autoComplete="email"
                    value={email}
                    readOnly
                  />
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    <MailCheck className="size-4 shrink-0 text-primary" />
                    <span>
                      Enviamos um código para <strong>{email}</strong>
                    </span>
                  </div>
                  <div className="grid justify-items-center gap-2">
                    <Label htmlFor="verify-code">Código de 6 dígitos</Label>
                    <InputOTP
                      id="verify-code"
                      value={code}
                      onChange={setCode}
                      maxLength={6}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={resendVerificationCode}
                      disabled={isLoading}
                    >
                      Reenviar código
                    </button>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {info && (
                    <p className="text-sm text-muted-foreground">{info}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Verificando…
                      </>
                    ) : (
                      <>
                        Confirmar e-mail
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            )}

            {step === "forgot" && (
              <form onSubmit={requestResetCode}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="forgot-email">E-mail da conta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        className="pl-9"
                        autoComplete="email"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        Enviar código de recuperação
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleReset}>
                <CardContent className="grid gap-4">
                  <input
                    type="hidden"
                    autoComplete="email"
                    value={email}
                    readOnly
                  />
                  <div className="grid justify-items-center gap-2">
                    <Label htmlFor="reset-code">Código de 6 dígitos</Label>
                    <InputOTP
                      id="reset-code"
                      value={code}
                      onChange={setCode}
                      maxLength={6}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={requestResetCode}
                      disabled={isLoading}
                    >
                      Reenviar código
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reset-password">Nova senha</Label>
                    <PasswordField
                      id="reset-password"
                      value={password}
                      onChange={setPassword}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reset-confirm">Confirmar nova senha</Label>
                    <PasswordField
                      id="reset-confirm"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      autoComplete="new-password"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {info && (
                    <p className="text-sm text-muted-foreground">{info}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Redefinindo…
                      </>
                    ) : (
                      <>
                        Redefinir senha e entrar
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            )}

            {step !== "verify" && (
              <CardContent className="pb-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <GoogleLogo className="mr-2 size-4" />
                  )}
                  Continuar com Google
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 w-full"
                  onClick={handleGuestLogin}
                  disabled={isLoading || isGoogleLoading}
                >
                  <UserRoundCheck className="mr-2 size-4" />
                  Entrar como convidado(a)
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  O modo convidado(a) cria um espaço temporário para você
                  experimentar o Retorno.
                </p>
              </CardContent>
            )}

            <CardFooter className="flex-col gap-1 pb-4 pt-2">
              {step === "verify" ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={() => goTo("signIn")}
                  disabled={isLoading}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Usar outro e-mail
                </Button>
              ) : step === "signIn" ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => goTo("signUp")}
                  disabled={isLoading}
                >
                  Não tem conta? Criar agora
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={() => goTo("signIn")}
                  disabled={isLoading}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  {step === "reset" || step === "forgot"
                    ? "Voltar para o login"
                    : "Já tem conta? Entrar"}
                </Button>
              )}
            </CardFooter>

            <div className="rounded-b-lg border-t bg-muted px-6 py-4 text-center text-xs text-muted-foreground">
              Retorno Massagem · gestão e relacionamento para massoterapeutas
            </div>
          </Card>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense fallback={null}>
      <Auth {...props} />
    </Suspense>
  );
}
