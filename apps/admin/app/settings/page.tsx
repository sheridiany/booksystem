import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UnderDevelopment } from '@/components/common/under-development';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <UnderDevelopment title="系统设置" />
    </DashboardLayout>
  );
}
