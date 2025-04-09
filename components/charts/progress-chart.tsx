"use client"

import { useEffect, useMemo, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { createClient } from "@supabase/supabase-js"
import type { House } from "@/lib/types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

type ProgressChartProps = {
  detailed?: boolean
  houses?: House[]
}

export function ProgressChart({ detailed = false, houses: propHouses }: ProgressChartProps) {
  const [houses, setHouses] = useState<House[]>(propHouses || [])
  const [loading, setLoading] = useState(!propHouses)

  useEffect(() => {
    if (propHouses) return

    const fetchHouses = async () => {
      setLoading(true)
      const { data, error } = await supabase.from("beneficiaries").select("*")

      if (error) {
        console.error("Error fetching houses:", error)
      } else if (data) {
        setHouses(data as House[])
      }

      setLoading(false)
    }

    fetchHouses()
  }, [propHouses])

  const data = useMemo(() => {
    if (!houses.length) return []

    if (!detailed) {
      const stageCount = houses.reduce((acc, house) => {
        const stage = house.stage || "Unknown"
        acc[stage] = (acc[stage] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return Object.entries(stageCount).map(([name, value]) => ({ name, value }))
    } else {
      const progressRanges = {
        "0-25%": 0,
        "26-50%": 0,
        "51-75%": 0,
        "76-99%": 0,
        "100%": 0,
      }

      houses.forEach((house) => {
        const progress = house.progress ?? 0
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

  if (loading) {
    return <div className="flex items-center justify-center h-80">Loading chart...</div>
  }

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-80">No data available</div>
  }

  return (
    <div className="h-80 w-full">
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
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} houses`, ""]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
