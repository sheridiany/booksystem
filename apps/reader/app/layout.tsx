import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '高斯图书馆',
  description: '图书借阅平台 - 读者端',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
