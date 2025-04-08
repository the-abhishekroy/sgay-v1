"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { fetchHouses } from "@/lib/api"
import type { House } from "@/lib/types"
import { MapPin, Home, Filter, Search, RefreshCw } from "lucide-react"

// Dynamically import the MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-muted">
      <p>Loading map...</p>
    </div>
  ),
})

export default function MapPage() {
  const [houses, setHouses] = useState<House[]>([])
  const [filteredHouses, setFilteredHouses] = useState<House[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    constituency: "",
    stage: "",
    search: "",
    progressRange: [0, 100],
    showCompleted: true,
    showInProgress: true,
    showDelayed: true,
  })
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchHouses()
        setHouses(data)
        setFilteredHouses(data)
      } catch (error) {
        console.error("Failed to fetch houses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Apply filters
    let result = houses

    if (filters.constituency) {
      result = result.filter((house) => house.constituency === filters.constituency)
    }

    if (filters.stage) {
      result = result.filter((house) => house.stage === filters.stage)
    }

    // Filter by progress range
    result = result.filter(
      (house) => house.progress >= filters.progressRange[0] && house.progress <= filters.progressRange[1],
    )

    // Filter by stage toggles
    result = result.filter((house) => {
      if (house.stage === "Completed" && !filters.showCompleted) return false
      if (house.stage === "In Progress" && !filters.showInProgress) return false
      if (house.stage === "Delayed" && !filters.showDelayed) return false
      return true
    })

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (house) =>
          house.beneficiaryName.toLowerCase().includes(searchLower) ||
          house.village.toLowerCase().includes(searchLower) ||
          house.assignedOfficer.toLowerCase().includes(searchLower),
      )
    }

    setFilteredHouses(result)
  }, [filters, houses])

  // Get unique constituencies and stages for filters
  const constituencies = [...new Set(houses.map((house) => house.constituency))].sort()
  const stages = [...new Set(houses.map((house) => house.stage))].sort()

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      constituency: "",
      stage: "",
      search: "",
      progressRange: [0, 100],
      showCompleted: true,
      showInProgress: true,
      showDelayed: true,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Map View</CardTitle>
              <CardDescription>Geographic distribution of houses under the scheme</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
                <Filter className="mr-2 h-4 w-4" />
                {isFilterExpanded ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="map">

            <TabsContent value="map">
              <div className={`grid gap-4 ${isFilterExpanded ? "md:grid-cols-3" : "md:grid-cols-3"} mb-4`}>
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or village"
                      className="pl-8"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="constituency">Constituency</Label>
                  <Select value={filters.constituency} onValueChange={(value) => handleFilterChange("constituency", value)}>
                    <SelectTrigger id="constituency">
                      <SelectValue placeholder="All Constituencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Constituencies</SelectItem>
                      {constituencies.map((constituency) => (
                        <SelectItem key={constituency} value={constituency}>
                          {constituency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={filters.stage} onValueChange={(value) => handleFilterChange("stage", value)}>
                    <SelectTrigger id="stage">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {stages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isFilterExpanded && (
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div className="space-y-4">
                    <Label>
                      Progress Range: {filters.progressRange[0]}% - {filters.progressRange[1]}%
                    </Label>
                    <Slider
                      defaultValue={[0, 100]}
                      max={100}
                      step={5}
                      value={filters.progressRange}
                      onValueChange={(value) => handleFilterChange("progressRange", value)}
                      className="py-4"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Show/Hide by Status</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-green-500"></div>
                          <Label htmlFor="show-completed">Completed</Label>
                        </div>
                        <Switch
                          id="show-completed"
                          checked={filters.showCompleted}
                          onCheckedChange={(checked) => handleFilterChange("showCompleted", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                          <Label htmlFor="show-in-progress">In Progress</Label>
                        </div>
                        <Switch
                          id="show-in-progress"
                          checked={filters.showInProgress}
                          onCheckedChange={(checked) => handleFilterChange("showInProgress", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-red-500"></div>
                          <Label htmlFor="show-delayed">Delayed</Label>
                        </div>
                        <Switch
                          id="show-delayed"
                          checked={filters.showDelayed}
                          onCheckedChange={(checked) => handleFilterChange("showDelayed", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-[600px] rounded-md border">
                {!isLoading && <MapComponent houses={filteredHouses} />}
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 text-sm">
                <p className="text-muted-foreground">
                  Showing {filteredHouses.length} of {houses.length} houses
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4 text-green-500" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4 text-blue-500" />
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4 text-red-500" />
                    <span>Delayed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Click on markers for details</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>
                      Progress Range: {filters.progressRange[0]}% - {filters.progressRange[1]}%
                    </Label>
                    <Slider
                      defaultValue={[0, 100]}
                      max={100}
                      step={5}
                      value={filters.progressRange}
                      onValueChange={(value) => handleFilterChange("progressRange", value)}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Show/Hide by Status</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-green-500"></div>
                          <Label htmlFor="show-completed-tab">Completed</Label>
                        </div>
                        <Switch
                          id="show-completed-tab"
                          checked={filters.showCompleted}
                          onCheckedChange={(checked) => handleFilterChange("showCompleted", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                          <Label htmlFor="show-in-progress-tab">In Progress</Label>
                        </div>
                        <Switch
                          id="show-in-progress-tab"
                          checked={filters.showInProgress}
                          onCheckedChange={(checked) => handleFilterChange("showInProgress", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-red-500"></div>
                          <Label htmlFor="show-delayed-tab">Delayed</Label>
                        </div>
                        <Switch
                          id="show-delayed-tab"
                          checked={filters.showDelayed}
                          onCheckedChange={(checked) => handleFilterChange("showDelayed", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-tab">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search-tab"
                        placeholder="Search by name, village or officer"
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="constituency-tab">Constituency</Label>
                    <Select value={filters.constituency} onValueChange={(value) => handleFilterChange("constituency", value)}>
                      <SelectTrigger id="constituency-tab">
                        <SelectValue placeholder="All Constituencies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Constituencies</SelectItem>
                        {constituencies.map((constituency) => (
                          <SelectItem key={constituency} value={constituency}>
                            {constituency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage-tab">Stage</Label>
                    <Select value={filters.stage} onValueChange={(value) => handleFilterChange("stage", value)}>
                      <SelectTrigger id="stage-tab">
                        <SelectValue placeholder="All Stages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Stages</SelectItem>
                        {stages.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button onClick={resetFilters} className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset All Filters
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

