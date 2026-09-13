'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '../../components/Admin/AdminLayout';

export default function AdminPage() {
  const router = useRouter();

  return (
    <AdminLayout
      onExitToStore={() => router.push('/')}
      initialSection="overview"
    />
  );
}
