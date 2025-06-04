
"use client";

import { useEffect, useState } from "react";
import { AgentStatusSummary } from "@/components/admin/AgentStatusSummary";
import { AdherenceAlertsTable } from "@/components/admin/AdherenceAlertsTable";
import { TodaysActivityLogTable } from "@/components/admin/TodaysActivityLogTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAgentLogsForDate, type AgentLogEntry } from "@/app/actions/getTodaysAgentLogs"; // Updated import
import { AlertTriangle, CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns"; // Import subDays for default past date example if needed

export default function AdminDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [logsForDate, setLogsForDate] = useState<AgentLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [logFetchMessage, setLogFetchMessage] = useState<string | null>(null);
  const [logFetchSuccess, setLogFetchSuccess] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!selectedDate) return;
      setIsLoadingLogs(true);
      setLogFetchMessage(null);
      setLogFetchSuccess(true);

      // Format date to YYYY-MM-DD for consistency if sending to server action
      // The server action currently handles date conversion, so sending Date object or ISO string is fine
      const dateToFetch = selectedDate.toISOString();

      const { success, data, message } = await getAgentLogsForDate(dateToFetch);
      if (success) {
        setLogsForDate(data || []);
      } else {
        setLogsForDate([]);
      }
      setLogFetchMessage(message);
      setLogFetchSuccess(success);
      setIsLoadingLogs(false);
    }
    fetchLogs();
  }, [selectedDate]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of agent activity and adherence.</p>
      </div>

      <AgentStatusSummary />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">Activity Log (from Google Sheet)</CardTitle>
              <CardDescription>Raw activity logs for agents on {selectedDate ? format(selectedDate, "PPP") : "selected date"}.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date > new Date() || date < subDays(new Date(), 3650)} // Example: disable future dates and dates older than 10 years
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLogs && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading logs for {selectedDate ? format(selectedDate, "PPP") : "selected date"}...</p>
            </div>
          )}
          {!isLoadingLogs && !logFetchSuccess && (
            <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
              <AlertTriangle className="h-5 w-5" />
              <p>Error fetching logs: {logFetchMessage}</p>
            </div>
          )}
          {!isLoadingLogs && logFetchSuccess && logsForDate.length > 0 && (
            <TodaysActivityLogTable logs={logsForDate} selectedDate={selectedDate || new Date()} />
          )}
          {!isLoadingLogs && logFetchSuccess && logsForDate.length === 0 && (
             <p className="text-muted-foreground p-4 text-center">
               {logFetchMessage || `No activities logged to Google Sheet for ${selectedDate ? format(selectedDate, "PPP") : "selected date"}.`}
             </p>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Real-time Out-of-Adherence Alerts</CardTitle>
          <CardDescription>Agents currently flagged for adherence issues (from Firestore).</CardDescription>
        </CardHeader>
        <CardContent>
          <AdherenceAlertsTable />
        </CardContent>
      </Card>
    </div>
  );
}
