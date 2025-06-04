import { AppHeader } from '@/components/layout/AppHeader';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="text-center py-4 border-t bg-card mt-auto">
        <p className="text-sm text-muted-foreground">AgentAlly - Agent Portal</p>
      </footer>
    </div>
  );
}
