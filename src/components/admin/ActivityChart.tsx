
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer, ChartConfig, ChartLegendContent } from "@/components/ui/chart"
import type { AgentLogEntry } from "@/lib/types"; // Corrected import
import { format } from "date-fns";
import { useMemo } from "react";

interface ActivityChartProps {
  logs: AgentLogEntry[];
  selectedDate: Date;
}

interface ChartDataItem {
  agentName: string;
  activities: number;
}

const chartConfig = {
  activities: {
    label: "Activities Logged",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ActivityChart({ logs, selectedDate }: ActivityChartProps) {

  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const agentActivityCounts: Record<string, number> = {};

    logs.forEach(log => {
      const agentName = log.agentName || "Unknown Agent";
      agentActivityCounts[agentName] = (agentActivityCounts[agentName] || 0) + 1;
    });

    return Object.entries(agentActivityCounts).map(([agentName, activities]) => ({
      agentName,
      activities,
    })).sort((a,b) => b.activities - a.activities); // Sort by activity count descending
  }, [logs]);

  if (!logs || logs.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Agent Activity Counts</CardTitle>
          <CardDescription>
            Number of activities logged per agent on {selectedDate ? format(selectedDate, "PPP") : "the selected date"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No activity data to display for this date.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Agent Activity Counts</CardTitle>
        <CardDescription>
          Number of activities logged per agent on {selectedDate ? format(selectedDate, "PPP") : "the selected date"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis 
                dataKey="agentName" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                fontSize={12}
                width={120} // Adjust if agent names are long
                interval={0} // Show all agent names if possible
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="activities" fill="var(--color-activities)" radius={4} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
