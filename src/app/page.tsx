
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/AppHeader';

// IMPORTANT: Update this list with your actual authorized admin email addresses.
const AUTHORIZED_ADMIN_EMAILS = ['admin@example.com', 'your-email@example.com'];

export default function HomePage() {
  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setPageLoading(true); // Ensure loading state while auth is resolving
      return;
    }

    if (user && user.email) {
      if (AUTHORIZED_ADMIN_EMAILS.includes(user.email)) {
        router.push('/admin/dashboard');
        // setPageLoading(true) is maintained to show loading until redirect completes
      } else {
        setAuthMessage('You are not authorized to access the admin portal.');
        setPageLoading(false);
      }
    } else if (user && !user.email) {
      // Edge case: Google user without an email (highly unlikely)
      setAuthMessage('Your Google account does not have an associated email address.');
      setPageLoading(false);
    }
    else {
      // No user signed in
      setAuthMessage(null);
      setPageLoading(false);
    }
  }, [user, authLoading, router]);

  const handleSignIn = async () => {
    setAuthMessage(null);
    setPageLoading(true);
    try {
      await signInWithGoogle();
      // useEffect will handle redirect or message after user state updates
    } catch (error) {
      console.error("Sign in failed:", error);
      setAuthMessage('Sign in failed. Please try again.');
      setPageLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading, please wait...</p>
        </main>
        <footer className="text-center py-6 border-t bg-card">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AgentAlly. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-headline">AgentAlly Admin Portal</CardTitle>
            {!user && (
              <CardDescription className="text-md mt-1">
                Please sign in with your Google account to access the admin dashboard.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {user && authMessage && (
              <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/30 flex flex-col items-center space-y-3">
                <AlertCircle className="h-8 w-8" />
                <p className="text-center">{authMessage}</p>
                <Button onClick={() => { signOut(); setAuthMessage(null);}} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/20">
                  Sign Out
                </Button>
              </div>
            )}
            {!user && (
              <Button onClick={handleSignIn} className="w-full text-lg py-6" size="lg" disabled={authLoading}>
                {authLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                Sign in with Google
              </Button>
            )}
             {user && !authMessage && ( // User signed in, no auth error yet (likely being redirected)
                <div className="flex flex-col items-center justify-center space-y-3 p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Authenticating...</p>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="text-center py-6 border-t bg-card">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AgentAlly. All rights reserved.</p>
      </footer>
    </div>
  );
}
