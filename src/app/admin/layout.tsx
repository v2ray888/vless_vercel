import { DashboardLayout, DashboardLayoutProvider } from '@/components/shared/dashboard-layout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardLayoutProvider>
  );
}
