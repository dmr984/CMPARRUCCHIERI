'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface DashboardChartsProps {
  weeklyAppointmentsData: {
    date: string;
    count: number;
  }[];
}

const chartConfig = {
  appointments: {
    label: 'Appointments',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function DashboardCharts({
  weeklyAppointmentsData,
}: DashboardChartsProps) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Weekly Appointments</CardTitle>
        <CardDescription>
          An overview of appointments scheduled this week.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={weeklyAppointmentsData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-appointments)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
