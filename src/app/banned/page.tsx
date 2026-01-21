import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function BannedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-8 rounded-full bg-red-100 p-6 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <ShieldAlert size={48} />
      </div>
      <h1 className="mb-4 text-3xl font-bold text-foreground">Compte Suspendu</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Votre compte a été suspendu par un administrateur pour violation de nos conditions d'utilisation.
        Vous ne pouvez plus accéder à votre tableau de bord ni effectuer de conversions.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/">Retour à l'accueil</Link>
        </Button>
        <Button asChild>
          <Link href="mailto:contact.arthur.mouton@gmail.com">Contacter le support</Link>
        </Button>
      </div>
    </div>
  );
}
