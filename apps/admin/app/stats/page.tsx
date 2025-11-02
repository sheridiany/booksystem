import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UnderDevelopment } from '@/components/common/under-development';

export default function StatsPage() {
  return (
    <DashboardLayout>
      <UnderDevelopment title="统计报表" />
    </DashboardLayout>
  );
}
