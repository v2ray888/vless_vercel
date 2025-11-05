import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { fontSans, fontHeadline } from '@/styles/fonts';

export const metadata: Metadata = {
  title: 'Clash VLess VPN 官网',
  description: '高性能 VPN 工具 Clash 与 VLESS 协议结合，提供稳定、安全、快速的科学上网解决方案，支持 Windows、Mac、Android 等平台。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontHeadline.variable
        )}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}