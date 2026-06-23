import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { prisma } from "./prisma"
import { verifyToken, generateToken, type JWTPayload } from "./jwt"

const SALT_ROUNDS = 10

export type { JWTPayload }

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export { generateToken, verifyToken }

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("pawlink_token")?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      walkerProfile: true,
      specialistProfile: true,
    },
  })
  return user
}

export function requireRole(...roles: string[]) {
  return async () => {
    const session = await getSession()
    if (!session) return false
    if (roles.length > 0 && !roles.includes(session.role)) return false
    return session
  }
}
