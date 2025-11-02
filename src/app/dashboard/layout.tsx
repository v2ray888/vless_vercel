import { DashboardLayout, DashboardLayoutProvider } from '@/components/shared/dashboard-layout';

export default function UserDashboardLayout({
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
