import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
      {/* 主题切换按钮 - 固定在右上角 */}
      <div className="fixed right-6 top-6 z-50">
        <ThemeToggle />
      </div>

      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          📚 高斯图书馆
        </h1>
        <p className="text-center text-muted-foreground">
          读者端 - 正在开发中...
        </p>
      </div>
    </main>
  );
}
