import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Admin Workspace — Rajasthan Vacancy',
  description: 'Protected recruitment publishing and SEO indexing workspace for Rajasthan Vacancy.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
