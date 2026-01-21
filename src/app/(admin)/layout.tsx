import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Server-side auth

const ADMIN_EMAIL = "contact.arthur.mouton@gmail.com";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
      headers: await headers()
  });

  if (!session || session.user.email !== ADMIN_EMAIL) {
      redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-foreground">
        {children}
    </div>
  );
}
