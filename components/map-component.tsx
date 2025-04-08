"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { House } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User, Phone, IndianRupee, MapPin } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useRouter } from "next/navigation"

// Fix Leaflet icon issues
const getMarkerIcon = (stage: string) => {
  let iconUrl = ""
  const iconSize = [32, 32]

  switch (stage) {
    case "Completed":
      iconUrl = "/house-completed.svg"
      break
    case "In Progress":
      iconUrl = "/house-in-progress.svg"
      break
    case "Delayed":
      iconUrl = "/house-delayed.svg"
      break
    default:
      iconUrl = "/house-default.svg"
  }

  return new L.Icon({
    iconUrl,
    iconSize,
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Custom component to handle map center and zoom
function MapController({ houses, selectedHouse }: { houses: House[]; selectedHouse: House | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedHouse) {
      map.setView([selectedHouse.lat, selectedHouse.lng], 13)
    } else if (houses.length > 0) {
      // Calculate bounds to fit all markers
      const bounds = L.latLngBounds(houses.map((house) => [house.lat, house.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, houses, selectedHouse])

  return null
}

// House popup component
function HousePopup({ house, onViewDetails }: { house: House; onViewDetails: (id: number) => void }) {
  return (
    <Card className="border-0 shadow-none w-[300px]">
      <CardContent className="p-3">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">{house.beneficiaryName}</h3>
              <Badge
                variant="outline"
                className={
                  house.stage === "Completed"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : house.stage === "In Progress"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-red-100 text-red-800 border-red-300"
                }
              >
                {house.stage}
              </Badge>
            </div>

            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <MapPin className="h-3 w-3" />
              <span>
                {house.village}, {house.district}
              </span>
            </div>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {house.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Construction image ${index + 1}`}
                      className="rounded-md h-[150px] w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="h-7 w-7 -left-3" />
            <CarouselNext className="h-7 w-7 -right-3" />
          </Carousel>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Construction Progress</span>
              <span className="font-medium">{house.progress}%</span>
            </div>
            <Progress value={house.progress} className="h-2" />
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Start Date:</span>
                </div>
                <div>{house.startDate}</div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Expected Completion:</span>
                </div>
                <div>{house.expectedCompletion}</div>

                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Officer:</span>
                </div>
                <div>{house.assignedOfficer}</div>

                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Contact:</span>
                </div>
                <div>{house.contactNumber}</div>
              </div>
            </TabsContent>
            <TabsContent value="finance" className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Allocated:</span>
                </div>
                <div>{house.fundDetails.allocated}</div>

                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Released:</span>
                </div>
                <div>{house.fundDetails.released}</div>

                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Utilized:</span>
                </div>
                <div>{house.fundDetails.utilized}</div>

                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Remaining:</span>
                </div>
                <div>{house.fundDetails.remaining}</div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button size="sm" onClick={() => onViewDetails(house.id)}>
              View Full Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MapComponent({ houses }: { houses: House[] }) {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Find center of the map based on houses
  const getMapCenter = () => {
    if (houses.length === 0) return [27.5, 88.5] // Default center (Sikkim)

    const totalLat = houses.reduce((sum, house) => sum + house.lat, 0)
    const totalLng = houses.reduce((sum, house) => sum + house.lng, 0)

    return [totalLat / houses.length, totalLng / houses.length]
  }

  const handleViewDetails = (id: number) => {
    router.push(`/beneficiaries/${id}`)
  }

  return (
    <MapContainer
      center={getMapCenter() as [number, number]}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <MapController houses={houses} selectedHouse={selectedHouse} />

      {houses.map((house) => (
        <Marker
          key={house.id}
          position={[house.lat, house.lng]}
          icon={getMarkerIcon(house.stage)}
          eventHandlers={{
            click: () => {
              setSelectedHouse(house)
            },
          }}
        >
          <Popup maxWidth={320} minWidth={300}>
            <HousePopup house={house} onViewDetails={handleViewDetails} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

