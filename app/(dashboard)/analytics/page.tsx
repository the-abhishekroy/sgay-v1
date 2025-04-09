"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ProgressChart } from "@/components/charts/progress-chart"
import { ConstituencyChart } from "@/components/charts/constituency-chart"
import { FundUtilizationChart } from "@/components/fund-utilization-chart"
import { TimelineChart } from "@/components/timeline-chart"
import { fetchHouses } from "@/lib/api"
import type { House } from "@/lib/types"

export default function AnalyticsPage() {
  const [houses, setHouses] = useState<House[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchHouses()
        setHouses(data)
      } catch (error) {
        console.error("Failed to fetch houses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="timeframe" className="mr-2">
            Timeframe:
          </Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger id="timeframe" className="w-36">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progress by Stage</CardTitle>
                <CardDescription>Distribution of houses by construction stage</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {!isLoading && <ProgressChart houses={houses} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Constituency Distribution</CardTitle>
                <CardDescription>Houses by constituency</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {!isLoading && <ConstituencyChart houses={houses} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Construction Progress</CardTitle>
              <CardDescription>Detailed view of construction progress</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {!isLoading && <ProgressChart houses={houses} detailed />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fund Utilization</CardTitle>
              <CardDescription>Analysis of fund utilization across constituencies</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {!isLoading && <FundUtilizationChart houses={houses} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Construction Timeline</CardTitle>
              <CardDescription>Progress over time</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {!isLoading && <TimelineChart houses={houses} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
