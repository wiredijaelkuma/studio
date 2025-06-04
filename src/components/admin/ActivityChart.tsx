"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer, ChartConfig } from "@/components/ui/chart"


const chartData = [
  { day: "Mon", active: 120, lunch: 20, break: 15 },
  { day: "Tue", active: 150, lunch: 25, break: 18 },
  { day: "Wed", active: 110, lunch: 18, break: 12 },
  { day: "Thu", active: 160, lunch: 22, break: 20 },
  { day: "Fri", active: 140, lunch: 28, break: 17 },
  { day: "Sat", active: 50, lunch: 10, break: 5 },
  { day: "Sun", active: 30, lunch: 5, break: 3 },
]

const chartConfig = {
  active: {
    label: "Active Hours",
    color: "hsl(var(--chart-1))",
  },
  lunch: {
    label: "Lunch Hours",
    color: "hsl(var(--chart-2))",
  },
  break: {
    label: "Break Hours",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ActivityChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Weekly Activity Overview</CardTitle>
        <CardDescription>Total agent hours by activity type this week (mock data)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="active" fill="var(--color-active)" radius={4} />
              <Bar dataKey="lunch" fill="var(--color-lunch)" radius={4} />
              <Bar dataKey="break" fill="var(--color-break)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
