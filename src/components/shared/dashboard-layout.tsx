'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { adminNavItems, userNavItems } from '@/lib/data';
import { UserNav } from './user-nav';
import { cn } from '@/lib/utils';
import { MainNav } from './main-nav';
import { Footer } from './footer';

function DashboardNavs() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const navItems = isAdminRoute ? adminNavItems : userNavItems;

  return (
    <>
      {navItems.map((item, index) => {
        const IconComponent = Icons[item.icon as keyof typeof Icons];
        return (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              className="font-headline justify-start"
              tooltip={item.title}
            >
              <Link href={item.href}>
                <span className="flex w-6 shrink-0 items-center justify-center">
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                </span>
                <span className="min-w-0">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isMobile) {
    return (
      <>
        <MainNav />
        <main className="container max-w-5xl flex-1 py-6">{children}</main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg font-headline text-foreground group-data-[collapsible=icon]:hidden">
                VLess Pro
              </span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <DashboardNavs />
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="font-headline justify-start" tooltip="退出登录">
                <Link href="/">
                  <span className="flex w-6 shrink-0 items-center justify-center">
                    <Icons.logout className="h-4 w-4" />
                  </span>
                  <span>退出登录</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div
        className={cn(
          'flex min-h-dvh flex-1 flex-col transition-[padding]',
          state === 'expanded' ? 'md:pl-[14rem]' : 'md:pl-[3.5rem]'
        )}
      >
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card/50 backdrop-blur-sm px-4 sm:px-6">
          <SidebarTrigger className="flex md:hidden" />
          <div className="ml-auto flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </>
  );
}

export function DashboardLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
