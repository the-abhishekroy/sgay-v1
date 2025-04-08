"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { House } from "@/lib/types"

export function ProgressChart({ houses, detailed = false }: { houses: House[]; detailed?: boolean }) {
  const data = useMemo(() => {
    if (!detailed) {
      // Basic chart - group by stage
      const stageCount = houses.reduce(
        (acc, house) => {
          const stage = house.stage
          acc[stage] = (acc[stage] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      return Object.entries(stageCount).map(([name, value]) => ({ name, value }))
    } else {
      // Detailed chart - group by progress ranges
      const progressRanges = {
        "0-25%": 0,
        "26-50%": 0,
        "51-75%": 0,
        "76-99%": 0,
        "100%": 0,
      }

      houses.forEach((house) => {
        const progress = house.progress
        if (progress <= 25) progressRanges["0-25%"]++
        else if (progress <= 50) progressRanges["26-50%"]++
        else if (progress <= 75) progressRanges["51-75%"]++
        else if (progress < 100) progressRanges["76-99%"]++
        else progressRanges["100%"]++
      })

      return Object.entries(progressRanges).map(([name, value]) => ({ name, value }))
    }
  }, [houses, detailed])

  const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6"]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} houses`, ""]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

