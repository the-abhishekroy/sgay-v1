export interface House {
  id: number
  beneficiaryName: string
  constituency: string
  village: string
  stage: string
  progress: number
  fundUtilized: string
  lat: number
  lng: number
  images: string[]
  lastUpdated: string
  startDate: string
  expectedCompletion: string
  contactNumber: string
  aadharNumber: string
  familyMembers: number
  assignedOfficer: string
  remarks: string
  fundDetails: {
    allocated: string
    released: string
    utilized: string
    remaining: string
  }
  constructionDetails: {
    foundation: {
      status: "Not Started" | "In Progress" | "Completed"
      completionDate?: string
    }
    walls: {
      status: "Not Started" | "In Progress" | "Completed"
      completionDate?: string
    }
    roof: {
      status: "Not Started" | "In Progress" | "Completed"
      completionDate?: string
    }
    finishing: {
      status: "Not Started" | "In Progress" | "Completed"
      completionDate?: string
    }
  }
}

export interface Officer {
  id: number
  name: string
  designation: string
  constituency: string
  contactNumber: string
  email: string
  assignedHouses: number[]
}

export type ConstructionStage = "Not Started" | "Foundation" | "Walls" | "Roof" | "Finishing" | "Completed" | "Delayed"

