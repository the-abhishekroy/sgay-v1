"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { House } from "@/lib/types"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

type ConstituencyChartProps = {
  detailed?: boolean
  houses?: House[]
}

export function ConstituencyChart({ detailed = false, houses: propHouses }: ConstituencyChartProps) {
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
    const counts: Record<string, number> = {}

    houses.forEach((house) => {
      const key = house.constituency || "Unknown"
      counts[key] = (counts[key] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [houses])

  if (loading) {
    return <div className="flex items-center justify-center h-80">Loading chart...</div>
  }

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-80">No data available</div>
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} houses`, "Count"]} />
          <Legend />
          <Bar dataKey="value" name="Houses" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
