"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { House } from "@/lib/types"

export function ConstituencyChart({ houses }: { houses: House[] }) {
  // Memoize data calculation to prevent recalculation on re-renders
  const data = useMemo(() => {
    const constituencyCount = houses.reduce(
      (acc, house) => {
        const constituency = house.constituency
        acc[constituency] = (acc[constituency] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(constituencyCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [houses])

  // Early return if no data
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
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
        <Tooltip formatter={(value) => [`${value} houses`, "Count"]} />
        <Legend />
        <Bar dataKey="value" name="Houses" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}

