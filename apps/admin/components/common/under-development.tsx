import { Construction } from 'lucide-react';

interface UnderDevelopmentProps {
  title: string;
  description?: string;
}

export function UnderDevelopment({
  title,
  description = '该功能正在开发中,敬请期待',
}: UnderDevelopmentProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Construction className="h-16 w-16 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {description}
      </p>
    </div>
  );
}
