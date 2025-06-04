"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { analyzeAdherence, type AnalyzeAdherenceInput, type AnalyzeAdherenceOutput } from "@/ai/flows/analyze-adherence";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdherenceAnalysisForm() {
  const [agentActivityData, setAgentActivityData] = useState("");
  const [expectedSchedule, setExpectedSchedule] = useState("");
  const [adherenceThreshold, setAdherenceThreshold] = useState<number>(10);
  const [result, setResult] = useState<AnalyzeAdherenceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    if (!agentActivityData.trim() || !expectedSchedule.trim()) {
      setError("Agent activity data and expected schedule cannot be empty.");
      setIsLoading(false);
      return;
    }
    if (isNaN(adherenceThreshold) || adherenceThreshold < 0) {
        setError("Adherence threshold must be a non-negative number.");
        setIsLoading(false);
        return;
    }

    try {
      const input: AnalyzeAdherenceInput = {
        agentActivityData,
        expectedSchedule,
        adherenceThreshold,
      };
      const analysisResult = await analyzeAdherence(input);
      setResult(analysisResult);
    } catch (err) {
      console.error("Error analyzing adherence:", err);
      setError("Failed to analyze adherence. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Adherence Analysis (AI Powered)</CardTitle>
        <CardDescription>
          Input agent activity and schedule to detect out-of-adherence instances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="agentActivityData" className="text-lg font-medium">Agent Activity Data</Label>
            <Textarea
              id="agentActivityData"
              value={agentActivityData}
              onChange={(e) => setAgentActivityData(e.target.value)}
              placeholder="e.g., Clock In: 09:00, Lunch Start: 12:05, Lunch End: 12:55, Break Start: 15:00, Break End: 15:20, Clock Out: 17:03"
              rows={5}
              className="mt-1 text-base"
              required
            />
             <p className="text-sm text-muted-foreground mt-1">Provide a log of agent activities with timestamps.</p>
          </div>
          <div>
            <Label htmlFor="expectedSchedule" className="text-lg font-medium">Expected Schedule</Label>
            <Textarea
              id="expectedSchedule"
              value={expectedSchedule}
              onChange={(e) => setExpectedSchedule(e.target.value)}
              placeholder="e.g., Work Hours: 09:00-17:00, Lunch: 12:00-13:00 (60 mins), Break: 15:00-15:15 (15 mins)"
              rows={3}
              className="mt-1 text-base"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">Describe the agent's expected schedule for the day.</p>
          </div>
          <div>
            <Label htmlFor="adherenceThreshold" className="text-lg font-medium">Adherence Threshold (minutes)</Label>
            <Input
              id="adherenceThreshold"
              type="number"
              value={adherenceThreshold}
              onChange={(e) => setAdherenceThreshold(parseInt(e.target.value, 10))}
              className="mt-1 text-base"
              min="0"
              required
            />
             <p className="text-sm text-muted-foreground mt-1">Maximum allowed deviation in minutes.</p>
          </div>
          <Button type="submit" className="w-full py-3 text-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Adherence"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && !error && (
          <div className="mt-8 p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-4 text-center font-headline">Analysis Result</h3>
            {result.isOutOfAdherence ? (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg">Out of Adherence</AlertTitle>
                <AlertDescription className="text-base">{result.reason}</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="bg-accent/20 border-accent">
                 <CheckCircle2 className="h-5 w-5 text-accent" />
                <AlertTitle className="text-lg text-accent">In Adherence</AlertTitle>
                <AlertDescription className="text-base">{result.reason || "Agent is within the adherence threshold."}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
