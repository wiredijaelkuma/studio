
"use client";

import { useEffect, useState } from "react";
import { AgentStatusSummary } from "@/components/admin/AgentStatusSummary";
import { AdherenceAlertsTable } from "@/components/admin/AdherenceAlertsTable";
import { TodaysActivityLogTable } from "@/components/admin/TodaysActivityLogTable";
import { LiveAgentStatusTable } from "@/components/admin/LiveAgentStatusTable"; // Added
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAgentLogsForDate, type AgentLogEntry } from "@/app/actions/getTodaysAgentLogs";
import { db } from '@/lib/firebase/config'; // Added
import { collection, getDocs, type Timestamp } from 'firebase/firestore'; // Added
import type { AgentStatusFirestore } from "@/lib/types"; // Added

import { AlertTriangle, CalendarIcon, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface AgentFilterChoice {
  id: string;
  name: string;
}

export default function AdminDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [logsForDate, setLogsForDate] = useState<AgentLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [logFetchMessage, setLogFetchMessage] = useState<string | null>(null);
  const [logFetchSuccess, setLogFetchSuccess] = useState(true);

  const [availableAgents, setAvailableAgents] = useState<AgentFilterChoice[]>([]); // Added
  const [selectedAgentId, setSelectedAgentId] = useState<string>("all"); // Added, "all" means no filter

  useEffect(() => {
    // Fetch list of agents for the filter dropdown
    async function fetchAgentsForFilter() {
      try {
        const agentSnapshot = await getDocs(collection(db, "agentStatuses"));
        const agents: AgentFilterChoice[] = [];
        agentSnapshot.forEach(doc => {
          const data = doc.data() as AgentStatusFirestore;
          if (data.agentId && data.agentName) {
            agents.push({ id: data.agentId, name: data.agentName });
          }
        });
        // Remove duplicate agentIDs just in case, though agentStatuses should have unique IDs
        const uniqueAgents = Array.from(new Map(agents.map(agent => [agent.id, agent])).values());
        setAvailableAgents(uniqueAgents.sort((a,b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching agents for filter:", error);
        // Not critical if this fails, filter will just be less populated
      }
    }
    fetchAgentsForFilter();
  }, []);

  useEffect(() => {
    async function fetchLogs() {
      if (!selectedDate) return;
      setIsLoadingLogs(true);
      setLogFetchMessage(null);
      setLogFetchSuccess(true);

      const dateToFetch = selectedDate.toISOString();
      const agentIdToFilter = selectedAgentId === "all" ? undefined : selectedAgentId;

      const { success, data, message } = await getAgentLogsForDate(dateToFetch, agentIdToFilter); // Pass agentIdToFilter
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
  }, [selectedDate, selectedAgentId]); // Re-fetch if selectedAgentId changes

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of agent activity and adherence.</p>
      </div>

      <AgentStatusSummary />

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <Users className="h-7 w-7 text-primary"/>
                Live Agent Statuses
            </CardTitle>
            <CardDescription>Real-time status of currently active agents (from Firestore).</CardDescription>
        </CardHeader>
        <CardContent>
            <LiveAgentStatusTable />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-2xl font-headline">Activity Log (from Google Sheet)</CardTitle>
              <CardDescription>
                Raw activity logs for {selectedAgentId === "all" ? "all agents" : availableAgents.find(a => a.id === selectedAgentId)?.name || "selected agent"} on {selectedDate ? format(selectedDate, "PPP") : "selected date"}.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {availableAgents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[200px] justify-start text-left font-normal",
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
                    disabled={(date) => date > new Date() || date < subDays(new Date(), 3650)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLogs && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading logs...</p>
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
               {logFetchMessage || `No activities logged to Google Sheet for the criteria.`}
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
