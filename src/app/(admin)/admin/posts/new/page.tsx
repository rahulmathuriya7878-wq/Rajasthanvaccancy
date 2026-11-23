import { Suspense } from 'react';
import { PostBuilderClient } from '@/components/admin/PostBuilderClient';

export default function AdminNewPostPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-12 bg-white border border-neutral-200 rounded-xl animate-pulse" />
          <div className="h-[520px] bg-white border border-neutral-200 rounded-xl animate-pulse" />
        </div>
      }
    >
      <PostBuilderClient />
    </Suspense>
  );
}
