"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { House } from "@/lib/types"

export function FundUtilizationChart({ houses }: { houses: House[] }) {
  const data = useMemo(() => {
    // Group by district and calculate total fund utilization
    const districtFunds: Record<string, { total: number; count: number }> = {}

    houses.forEach((house) => {
      const district = house.district
      // Extract numeric value from fund string (e.g., "Rs. 1,20,000" -> 120000)
      const fundValue = Number.parseInt(house.fundUtilized.replace(/[^0-9]/g, ""))

      if (!districtFunds[district]) {
        districtFunds[district] = { total: 0, count: 0 }
      }

      districtFunds[district].total += fundValue
      districtFunds[district].count += 1
    })

    // Convert to array format for chart
    return Object.entries(districtFunds).map(([name, { total, count }]) => ({
      name,
      total: total,
      average: Math.round(total / count),
    }))
  }, [houses])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, ""]} />
        <Legend />
        <Bar dataKey="total" name="Total Fund (Rs.)" fill="#8884d8" />
        <Bar dataKey="average" name="Average Fund (Rs.)" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

