import { Suspense } from 'react';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-28 bg-white border border-neutral-200 rounded-xl animate-pulse" />
            <div className="h-28 bg-white border border-neutral-200 rounded-xl animate-pulse" />
            <div className="h-28 bg-white border border-neutral-200 rounded-xl animate-pulse" />
          </div>
          <div className="h-96 bg-white border border-neutral-200 rounded-xl animate-pulse" />
        </div>
      }
    >
      <AdminDashboardClient />
    </Suspense>
  );
}
