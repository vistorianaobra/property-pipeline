import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — NEXMOVE CRM" },
      {
        name: "description",
        content: "Redefina a senha de acesso ao CRM NEXMOVE.",
      },
      { property: "og:title", content: "Recuperar senha — NEXMOVE CRM" },
      { property: "og:description", content: "Redefina a senha de acesso ao CRM NEXMOVE." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <p className="label-caps text-muted-foreground">NEXMOVE</p>
        <h1 className="mt-3 text-4xl leading-none">Recuperar senha</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enviaremos um link de redefinição para o seu e-mail cadastrado.
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            toast.info("Conecte o Supabase do projeto para enviar o e-mail de recuperação.");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="label-caps">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full rounded-sm">
            Enviar link
          </Button>
          <Link
            to="/"
            className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Voltar ao login
          </Link>
        </form>
      </div>
    </div>
  );
}
