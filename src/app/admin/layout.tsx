import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader'; // Using a simplified header for admin area as well
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="sr-only">AgentAlly Admin</span>
            </Link>
            <div className="ml-auto">
                {/* Admin specific header actions can go here */}
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="text-center py-4 border-t bg-card mt-auto">
          <p className="text-sm text-muted-foreground">AgentAlly - Admin Portal</p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
