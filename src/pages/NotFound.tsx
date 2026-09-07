import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center"
    >
      <BrandMark className="size-12 rounded-xl" />
      <div>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground">
          404
        </h1>
        <p className="mt-2 text-lg text-foreground">
          Página não encontrada
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          O endereço que você tentou abrir não existe ou mudou de lugar.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </motion.div>
  );
}
