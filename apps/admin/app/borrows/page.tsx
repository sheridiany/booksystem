import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UnderDevelopment } from '@/components/common/under-development';

export default function BorrowsPage() {
  return (
    <DashboardLayout>
      <UnderDevelopment title="借阅记录" />
    </DashboardLayout>
  );
}
