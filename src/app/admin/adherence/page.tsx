import { AdherenceAnalysisForm } from "@/components/admin/AdherenceAnalysisForm";

export default function AdminAdherencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Adherence Analysis</h1>
        <p className="text-muted-foreground">
          Utilize AI to analyze agent activity against schedules and detect adherence issues.
        </p>
      </div>
      
      <AdherenceAnalysisForm />
    </div>
  );
}
