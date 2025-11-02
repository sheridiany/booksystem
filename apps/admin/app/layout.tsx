import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: '高斯图书管理系统',
  description: '图书借阅管理平台 - 管理端',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position="top-center" expand={false} />
        </ThemeProvider>
      </body>
    </html>
  );
}
