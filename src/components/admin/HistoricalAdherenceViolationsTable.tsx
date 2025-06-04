
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
import { AlertTriangle, Loader2, Info, CalendarClock } from "lucide-react";
import Image from "next/image";
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, where, Timestamp, orderBy } from 'firebase/firestore';
import type { AdherenceViolationFirestore } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface HistoricalAdherenceViolationsTableProps {
  selectedDate: Date;
}

export function HistoricalAdherenceViolationsTable({ selectedDate }: HistoricalAdherenceViolationsTableProps) {
  const [violations, setViolations] = useState<AdherenceViolationFirestore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfDayTimestamp = Timestamp.fromDate(startOfDay);
    const endOfDayTimestamp = Timestamp.fromDate(endOfDay);

    const q = query(
      collection(db, "adherenceViolations"),
      where("violationTimestamp", ">=", startOfDayTimestamp),
      where("violationTimestamp", "<=", endOfDayTimestamp),
      orderBy("violationTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedViolations: AdherenceViolationFirestore[] = [];
      querySnapshot.forEach((doc) => {
        fetchedViolations.push({ id: doc.id, ...doc.data() } as AdherenceViolationFirestore);
      });
      setViolations(fetchedViolations);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching historical adherence violations:", err);
      setError("Failed to load historical adherence violations.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading historical violations...</p>
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

  if (violations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Info className="h-10 w-10 text-primary mb-3" />
        <p className="text-lg font-medium text-foreground">No Adherence Violations Recorded</p>
        <p className="text-muted-foreground">No overdue break or lunch alerts were triggered on {format(selectedDate, "PPP")}.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[60px]"></TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Violation Type</TableHead>
            <TableHead>Time of Alert</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {violations.map((violation) => (
            <TableRow key={violation.id} className="hover:bg-muted/50">
              <TableCell>
                 <Image 
                    src={violation.photoURL || "https://placehold.co/40x40.png"} 
                    alt={violation.agentName || "Agent"} 
                    width={40} 
                    height={40} 
                    className="rounded-full"
                    data-ai-hint="profile person"
                  />
              </TableCell>
              <TableCell className="font-medium">{violation.agentName || 'Unknown Agent'}</TableCell>
              <TableCell>
                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                  <AlertTriangle className="h-3 w-3" />
                  Overdue {violation.activityType.charAt(0).toUpperCase() + violation.activityType.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {violation.violationTimestamp.toDate().toLocaleTimeString()}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                Expected: {violation.expectedDurationMinutes}m, Grace: {violation.gracePeriodMinutes}m. Status: {violation.statusWhenTriggered}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
