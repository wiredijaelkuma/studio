import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <ShieldCheck className="h-7 w-7" />
          <h1 className="text-2xl font-headline font-semibold">AgentAlly</h1>
        </Link>
        <nav className="flex items-center gap-4">
          {/* Add navigation items here if needed in the future */}
        </nav>
      </div>
    </header>
  );
}
