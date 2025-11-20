'use client';

import { FirebaseProvider } from '@/firebase/provider';
import { DashboardHeader } from './_components/dashboard-header';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </FirebaseProvider>
  );
}
