import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, UserCog, User } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <ShieldCheck className="h-24 w-24 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-headline font-bold mb-4">Welcome to AgentAlly</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline agent time tracking, analyze performance, and ensure adherence with our powerful suite of tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <User className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl font-headline">Agent Portal</CardTitle>
              </div>
              <CardDescription className="text-md">
                Track your work activities, including lunches, breaks, and clock-in/out times with a simple interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/agent/dashboard">
                <Button className="w-full text-lg py-6" size="lg">
                  Go to Agent Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <UserCog className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl font-headline">Admin Portal</CardTitle>
              </div>
              <CardDescription className="text-md">
                Access dashboards, visualize agent activity, analyze adherence, and manage your team effectively.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/dashboard">
                <Button className="w-full text-lg py-6" size="lg">
                  Go to Admin Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="text-center py-6 border-t bg-card">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AgentAlly. All rights reserved.</p>
      </footer>
    </div>
  );
}
