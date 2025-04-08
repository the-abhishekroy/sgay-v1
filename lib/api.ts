import type { House, Officer } from "@/lib/types"
import beneficiariesData from "@/data/beneficiaries.json"
import officersData from "@/data/officers.json"

// In-memory storage for data manipulation
const houses: House[] = [...beneficiariesData.beneficiaries]
const officers: Officer[] = [...officersData.officers]

// In-memory storage for uploaded images
const uploadedImages: Record<string, string> = {}

// Simulate API calls with minimal delay for better performance
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Cache for API responses
const cache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_TTL = 60000 // 1 minute cache TTL

// Fetch all houses with caching
export const fetchHouses = async (): Promise<House[]> => {
  const cacheKey = "all-houses"

  // Check cache first
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  // Simulate minimal API delay
  await delay(50)

  // Store in cache
  cache[cacheKey] = {
    data: [...houses],
    timestamp: Date.now(),
  }

  return [...houses]
}

// Fetch a single house by ID with caching
export const fetchHouseById = async (id: number): Promise<House | null> => {
  const cacheKey = `house-${id}`

  // Check cache first
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  // Simulate minimal API delay
  await delay(30)

  const house = houses.find((h) => h.id === id)

  // Store in cache
  if (house) {
    cache[cacheKey] = {
      data: house,
      timestamp: Date.now(),
    }
  }

  return house || null
}

// Update house progress (for officer role)
export const updateHouseProgress = async (id: number, progress: number): Promise<House | null> => {
  // Simulate minimal API delay
  await delay(50)

  const houseIndex = houses.findIndex((h) => h.id === id)
  if (houseIndex === -1) return null

  const updatedHouse = {
    ...houses[houseIndex],
    progress,
    // Update stage based on progress
    stage: progress === 100 ? "Completed" : progress < 25 ? "Delayed" : "In Progress",
    lastUpdated: new Date().toISOString().split("T")[0],
  }

  // Update in-memory data
  houses[houseIndex] = updatedHouse

  // Invalidate cache
  Object.keys(cache).forEach((key) => {
    if (key.startsWith("house-") || key === "all-houses") {
      delete cache[key]
    }
  })

  return updatedHouse
}

// Add a new house
export const addHouse = async (house: Omit<House, "id">): Promise<House> => {
  // Simulate minimal API delay
  await delay(50)

  // Generate a new ID
  const newId = Math.max(...houses.map((h) => h.id)) + 1

  const newHouse: House = {
    ...house,
    id: newId,
    lastUpdated: new Date().toISOString().split("T")[0],
  }

  // Add to the data
  houses.push(newHouse)

  // Invalidate cache
  Object.keys(cache).forEach((key) => {
    if (key === "all-houses") {
      delete cache[key]
    }
  })

  return newHouse
}

// Update a house
export const updateHouse = async (id: number, houseData: Partial<House>): Promise<House | null> => {
  // Simulate minimal API delay
  await delay(50)

  const houseIndex = houses.findIndex((h) => h.id === id)
  if (houseIndex === -1) return null

  const updatedHouse = {
    ...houses[houseIndex],
    ...houseData,
    id, // Ensure ID doesn't change
    lastUpdated: new Date().toISOString().split("T")[0],
  }

  // Update in-memory data
  houses[houseIndex] = updatedHouse

  // Invalidate cache
  Object.keys(cache).forEach((key) => {
    if (key.startsWith("house-") || key === "all-houses") {
      delete cache[key]
    }
  })

  return updatedHouse
}

// Delete a house
export const deleteHouse = async (id: number): Promise<boolean> => {
  // Simulate minimal API delay
  await delay(50)

  const houseIndex = houses.findIndex((h) => h.id === id)
  if (houseIndex === -1) return false

  // Remove from the data
  houses.splice(houseIndex, 1)

  // Invalidate cache
  Object.keys(cache).forEach((key) => {
    if (key.startsWith("house-") || key === "all-houses") {
      delete cache[key]
    }
  })

  return true
}

// Upload an image
export const uploadImage = async (imageData: string): Promise<string> => {
  // Simulate API delay
  await delay(50)

  // Generate a unique ID for the image
  const imageId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`

  // In a real app, this would upload to a storage service
  // For this demo, we'll just store the data URL in memory
  uploadedImages[imageId] = imageData

  // Return a URL to the "uploaded" image
  return `/api/images/${imageId}`
}

// Fetch all officers with caching
export const fetchOfficers = async (): Promise<Officer[]> => {
  const cacheKey = "all-officers"

  // Check cache first
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  // Simulate minimal API delay
  await delay(30)

  // Store in cache
  cache[cacheKey] = {
    data: [...officers],
    timestamp: Date.now(),
  }

  return [...officers]
}

// Fetch a single officer by ID with caching
export const fetchOfficerById = async (id: number): Promise<Officer | null> => {
  const cacheKey = `officer-${id}`

  // Check cache first
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data
  }

  // Simulate minimal API delay
  await delay(20)

  const officer = officers.find((o) => o.id === id)

  // Store in cache
  if (officer) {
    cache[cacheKey] = {
      data: officer,
      timestamp: Date.now(),
    }
  }

  return officer || null
}

// Get image by ID (simulates retrieving an uploaded image)
export const getImageById = (imageId: string): string | null => {
  return uploadedImages[imageId] || null
}

