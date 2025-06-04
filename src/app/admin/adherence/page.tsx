
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function AdminAdherencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Adherence Analysis</h1>
        <p className="text-muted-foreground">
          Information about agent adherence.
        </p>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Feature Update
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
            The AI-powered adherence analysis feature is currently under review and has been temporarily disabled. 
            We are exploring alternative methods for adherence tracking.
          </CardDescription>
          <p className="mt-4 text-muted-foreground">
            Please check back later for updates or contact support for more information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
