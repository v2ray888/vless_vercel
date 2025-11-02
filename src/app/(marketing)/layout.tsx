import { Footer } from '@/components/shared/footer';
import { MainNav } from '@/components/shared/main-nav';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <MainNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}