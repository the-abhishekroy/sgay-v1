"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { fetchHouses } from "@/lib/api"
import type { House } from "@/lib/types"

export default function BeneficiariesPage() {
  const [houses, setHouses] = useState<House[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      <Card>
        <CardHeader>
          <CardTitle>Beneficiaries</CardTitle>
          <CardDescription>Complete list of beneficiaries under the scheme</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <p>Loading data...</p>
            </div>
          ) : (
            <DataTable houses={houses} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

