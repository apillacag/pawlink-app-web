export type Role = "OWNER" | "WALKER" | "SPECIALIST" | "ADMIN"

export type ServiceType = "WALKING" | "CONSULTATION"

export type BookingStatus = "PENDING" | "PENDING_PAYMENT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string | null
  avatarUrl: string | null
  role: Role
  isVerified: boolean
  isPremium: boolean
  createdAt: string
}

export interface PetData {
  id: string
  name: string
  species: string
  breed: string | null
  age: number | null
  weight: number | null
  photoUrl: string | null
  notes: string | null
  ownerId: string
}

export interface WalkerProfileData {
  id: string
  userId: string
  bio: string | null
  experience: number | null
  certifications: string | null
  services: string
  ratePerWalk: number
  currency: string
  isAvailable: boolean
  latitude: number | null
  longitude: number | null
  serviceRadius: number
  totalWalks: number
  rating: number
  reviewCount: number
  isFeatured: boolean
  user?: UserProfile
}

export interface SpecialistProfileData {
  id: string
  userId: string
  bio: string | null
  credentials: string | null
  specialties: string
  ratePerSession: number
  currency: string
  isAvailable: boolean
  totalSessions: number
  rating: number
  reviewCount: number
  user?: UserProfile
}

export interface BookingData {
  id: string
  ownerId: string
  walkerId: string
  petId: string
  specialistId: string | null
  serviceType: string
  status: BookingStatus
  scheduledAt: string
  duration: number
  pickupLocation: string | null
  dropoffLocation: string | null
  totalAmount: number | null
  notes: string | null
  latitude: number | null
  longitude: number | null
  startedAt: string | null
  completedAt: string | null
  owner?: UserProfile
  walker?: UserProfile & { walkerProfile?: WalkerProfileData }
  pet?: PetData
  review?: ReviewData | null
}

export interface ReviewData {
  id: string
  bookingId: string
  rating: number
  comment: string | null
  reviewerId: string
  createdAt: string
  reviewer?: UserProfile
}
