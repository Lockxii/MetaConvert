import { MarketingNavbar } from "@/components/layout/MarketingNavbar";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col font-sans bg-paper text-ink"
      suppressHydrationWarning
    >
      <MarketingNavbar />
      <main className="flex-1 pt-20 bg-paper">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
