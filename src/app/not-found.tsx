
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline">Page Not Found</CardTitle>
          <CardDescription className="text-md mt-1">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-muted-foreground">
            The link you followed may be broken, or the page may have been removed.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Go back to Home</Link>
          </Button>
        </CardContent>
      </Card>
       <footer className="text-center py-6 mt-8">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AgentAlly. All rights reserved.</p>
        </footer>
    </div>
  );
}
