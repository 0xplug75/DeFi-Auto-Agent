'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const DashboardComponent = dynamic(
  () => import('../components/Dashboard'),
  { ssr: false }
);

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardComponent />
    </Suspense>
  );
} 