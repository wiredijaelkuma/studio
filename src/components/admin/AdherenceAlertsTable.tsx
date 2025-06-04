
"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, type Timestamp as FirestoreTimestampType } from 'firebase/firestore'; // Use FirestoreTimestampType alias
import type { AgentStatusFirestore } from "@/lib/types"; // Use updated type

// Duration constants from TimeTrackingControls (or define centrally)
const LUNCH_DURATION_MINUTES = 30;
const BREAK_DURATION_MINUTES = 15;
const NOTIFICATION_GRACE_PERIOD_MINUTES = 5; // Agent is notified after base + grace

// Admin alert thresholds (can be same or different from agent notification)
const LUNCH_ALERT_THRESHOLD_MS = (LUNCH_DURATION_MINUTES + NOTIFICATION_GRACE_PERIOD_MINUTES) * 60 * 1000; // e.g., 35 mins
const BREAK_ALERT_THRESHOLD_MS = (BREAK_DURATION_MINUTES + NOTIFICATION_GRACE_PERIOD_MINUTES) * 60 * 1000; // e.g., 20 mins


interface AdherenceAlert {
  id: string;
  agentName: string;
  avatar: string;
  team?: string; 
  issue: string; 
  deviation: string; 
  details?: string;
}

export function AdherenceAlertsTable() {
  const [alerts, setAlerts] = useState<AdherenceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "agentStatuses"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const now = new Date().getTime();
      const currentAlerts: AdherenceAlert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as AgentStatusFirestore;
        if (data.activityStartTime && data.currentActivityType) {
          const startTimeMs = (data.activityStartTime as unknown as FirestoreTimestampType).toDate().getTime();
          const durationMs = now - startTimeMs;
          let thresholdMs = 0;
          let activityName = "";

          if (data.currentActivityType === 'lunch' && data.currentStatus === 'On Lunch') {
            thresholdMs = LUNCH_ALERT_THRESHOLD_MS;
            activityName = "Lunch";
          } else if (data.currentActivityType === 'break' && data.currentStatus === 'On Break') {
            thresholdMs = BREAK_ALERT_THRESHOLD_MS;
            activityName = "Break";
          }
          // Bathroom breaks could be added here if they have a strict time limit for alerts

          if (activityName && durationMs > thresholdMs) {
            const overdueMs = durationMs - thresholdMs;
            const overdueMinutes = Math.round(overdueMs / (60 * 1000));
            currentAlerts.push({
              id: data.agentId,
              agentName: data.agentName || "Unknown Agent",
              avatar: data.photoURL || "https://placehold.co/40x40.png",
              issue: `Overdue ${activityName}`,
              deviation: `${overdueMinutes} min${overdueMinutes !== 1 ? 's' : ''} over`,
              details: `${activityName} started at ${(data.activityStartTime as unknown as FirestoreTimestampType).toDate().toLocaleTimeString()}`,
            });
          }
        }
      });

      setAlerts(currentAlerts);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching adherence data from Firestore:", err);
      setError("Failed to load real-time adherence alerts.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading adherence alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
        <AlertTriangle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Info className="h-10 w-10 text-primary mb-3" />
        <p className="text-lg font-medium text-foreground">No Adherence Alerts</p>
        <p className="text-muted-foreground">All agents are currently within their scheduled activity times.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]"></TableHead>
          <TableHead>Agent</TableHead>
          {/* <TableHead>Team</TableHead> */}
          <TableHead>Issue</TableHead>
          <TableHead>Deviation</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.id} className="hover:bg-muted/50">
            <TableCell>
               <Image src={alert.avatar} alt={alert.agentName} width={40} height={40} className="rounded-full" data-ai-hint="profile person"/>
            </TableCell>
            <TableCell className="font-medium">{alert.agentName}</TableCell>
            {/* <TableCell>{alert.team || 'N/A'}</TableCell> */}
            <TableCell>
              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                <AlertTriangle className="h-3 w-3" />
                {alert.issue}
              </Badge>
            </TableCell>
            <TableCell>{alert.deviation}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" aria-label="View details" title="View agent details (not implemented)">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
