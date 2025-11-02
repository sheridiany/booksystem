import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UnderDevelopment } from '@/components/common/under-development';

export default function ReadersPage() {
  return (
    <DashboardLayout>
      <UnderDevelopment title="读者管理" />
    </DashboardLayout>
  );
}
