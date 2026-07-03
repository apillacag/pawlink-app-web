import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["OWNER", "WALKER", "SPECIALIST"]).default("OWNER"),
  phone: z.string().optional(),
})

export const petSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  species: z.enum(["DOG", "CAT", "OTHER"]).default("DOG"),
  breed: z.string().optional(),
  age: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  notes: z.string().optional(),
})

export const bookingSchema = z.object({
  petId: z.string().min(1, "Pet is required"),
  walkerId: z.string().min(1, "Walker is required"),
  scheduledAt: z.string().min(1, "Date and time is required"),
  duration: z.number().int().positive().default(30),
  pickupLocation: z.string().optional(),
  notes: z.string().optional(),
})

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export const walkerProfileSchema = z.object({
  bio: z.string().optional(),
  experience: z.number().int().positive().optional(),
  certifications: z.string().optional(),
  ratePerWalk: z.number().positive().default(15),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  serviceRadius: z.number().positive().default(5),
})

export const specialistProfileSchema = z.object({
  bio: z.string().optional(),
  credentials: z.string().optional(),
  specialties: z.string().default("BEHAVIOR"),
  ratePerSession: z.number().positive().default(50),
})

export const googleOnboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().optional(),
  role: z.enum(["OWNER", "WALKER", "SPECIALIST"]),
  phone: z.string().optional(),
  bio: z.string().optional(),
  ratePerWalk: z.number().positive().optional(),
  ratePerSession: z.number().positive().optional(),
  specialties: z.string().optional(),
  district: z.string().optional(),
})
