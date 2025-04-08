"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { House } from "@/lib/types"

export function TimelineChart({ houses }: { houses: House[] }) {
  // This is a simulated timeline since we don't have actual timeline data
  // In a real app, you would use actual dates from your data
  const data = useMemo(() => {
    // Create a simulated timeline based on progress
    // We'll create months from Jan to Dec with simulated progress
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Count houses by progress range
    const countByProgress = (min: number, max: number) =>
      houses.filter((h) => h.progress >= min && h.progress <= max).length

    // Simulate progress over time
    return months.map((month, index) => {
      // Simulate increasing completion over time
      const completionFactor = index / 11 // 0 to 1 over the year
      const inProgressFactor = Math.sin((index / 11) * Math.PI) // Peaks in the middle

      return {
        name: month,
        completed: Math.round(countByProgress(100, 100) * completionFactor),
        inProgress: Math.round(countByProgress(25, 99) * inProgressFactor),
        notStarted: Math.max(
          0,
          houses.length -
            Math.round(countByProgress(100, 100) * completionFactor) -
            Math.round(countByProgress(25, 99) * inProgressFactor),
        ),
      }
    })
  }, [houses])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="inProgress" name="In Progress" stroke="#3b82f6" />
        <Line type="monotone" dataKey="notStarted" name="Not Started" stroke="#ef4444" />
      </LineChart>
    </ResponsiveContainer>
  )
}

