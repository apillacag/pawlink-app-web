import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
  console.log("🌱 Seeding PawLink database...")

  const hash = await bcrypt.hash("password123", 10)

  // ── Users ──────────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: "admin@pawlink.com" },
    update: {},
    create: {
      email: "admin@pawlink.com",
      passwordHash: hash,
      name: "Admin User",
      role: "ADMIN",
      isVerified: true,
      phone: "+1 555-000-0001",
    },
  })

  const alice = await prisma.user.upsert({
    where: { email: "alice@pawlink.com" },
    update: {},
    create: {
      email: "alice@pawlink.com",
      passwordHash: hash,
      name: "Alice Johnson",
      role: "OWNER",
      isVerified: true,
      isPremium: true,
      phone: "+1 555-100-0001",
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: "bob@pawlink.com" },
    update: {},
    create: {
      email: "bob@pawlink.com",
      passwordHash: hash,
      name: "Bob Williams",
      role: "OWNER",
      isVerified: true,
      phone: "+1 555-100-0002",
    },
  })

  const carol = await prisma.user.upsert({
    where: { email: "carol@pawlink.com" },
    update: {},
    create: {
      email: "carol@pawlink.com",
      passwordHash: hash,
      name: "Carol Martinez",
      role: "OWNER",
      isVerified: true,
      isPremium: true,
      phone: "+1 555-100-0003",
    },
  })

  const daniel = await prisma.user.upsert({
    where: { email: "daniel@pawlink.com" },
    update: {},
    create: {
      email: "daniel@pawlink.com",
      passwordHash: hash,
      name: "Daniel Smith",
      role: "WALKER",
      isVerified: true,
      phone: "+1 555-200-0001",
    },
  })

  const emma = await prisma.user.upsert({
    where: { email: "emma@pawlink.com" },
    update: {},
    create: {
      email: "emma@pawlink.com",
      passwordHash: hash,
      name: "Emma Davis",
      role: "WALKER",
      isVerified: true,
      phone: "+1 555-200-0002",
    },
  })

  const frank = await prisma.user.upsert({
    where: { email: "frank@pawlink.com" },
    update: {},
    create: {
      email: "frank@pawlink.com",
      passwordHash: hash,
      name: "Frank Lopez",
      role: "WALKER",
      isVerified: false,
      phone: "+1 555-200-0003",
    },
  })

  const grace = await prisma.user.upsert({
    where: { email: "grace@pawlink.com" },
    update: {},
    create: {
      email: "grace@pawlink.com",
      passwordHash: hash,
      name: "Grace Taylor",
      role: "SPECIALIST",
      isVerified: true,
      phone: "+1 555-300-0001",
    },
  })

  const henry = await prisma.user.upsert({
    where: { email: "henry@pawlink.com" },
    update: {},
    create: {
      email: "henry@pawlink.com",
      passwordHash: hash,
      name: "Henry Brown",
      role: "SPECIALIST",
      isVerified: true,
      phone: "+1 555-300-0002",
    },
  })

  // ── Pets ────────────────────────────────────────────────────────────────────

  const max = await prisma.pet.upsert({
    where: { id: "pet-max-001" },
    update: {},
    create: {
      id: "pet-max-001",
      name: "Max",
      species: "DOG",
      breed: "Golden Retriever",
      age: 3,
      weight: 32.5,
      notes: "Loves fetch, nervous around loud noises",
      ownerId: alice.id,
    },
  })

  const luna = await prisma.pet.upsert({
    where: { id: "pet-luna-001" },
    update: {},
    create: {
      id: "pet-luna-001",
      name: "Luna",
      species: "CAT",
      breed: "Siamese",
      age: 2,
      weight: 4.2,
      notes: "Indoor only, needs gentle handling",
      ownerId: alice.id,
    },
  })

  const charlie = await prisma.pet.upsert({
    where: { id: "pet-charlie-001" },
    update: {},
    create: {
      id: "pet-charlie-001",
      name: "Charlie",
      species: "DOG",
      breed: "Beagle",
      age: 4,
      weight: 12.0,
      notes: "Very energetic, loves other dogs",
      ownerId: bob.id,
    },
  })

  const bella = await prisma.pet.upsert({
    where: { id: "pet-bella-001" },
    update: {},
    create: {
      id: "pet-bella-001",
      name: "Bella",
      species: "DOG",
      breed: "French Bulldog",
      age: 1,
      weight: 10.5,
      notes: "Puppy, needs patient handling",
      ownerId: bob.id,
    },
  })

  const rocky = await prisma.pet.upsert({
    where: { id: "pet-rocky-001" },
    update: {},
    create: {
      id: "pet-rocky-001",
      name: "Rocky",
      species: "DOG",
      breed: "German Shepherd",
      age: 5,
      weight: 38.0,
      notes: "Strong puller, use harness",
      ownerId: carol.id,
    },
  })

  // ── Walker Profiles ─────────────────────────────────────────────────────────

  const danielProfile = await prisma.walkerProfile.upsert({
    where: { userId: daniel.id },
    update: {},
    create: {
      userId: daniel.id,
      bio: "Experienced dog walker with a passion for canine care. I treat every dog like my own.",
      experience: 5,
      certifications: "CPR Certified, Professional Dog Walker Association Member",
      ratePerWalk: 20.0,
      currency: "PEN",
      isAvailable: true,
      latitude: 40.7128,
      longitude: -74.006,
      serviceRadius: 5.0,
      totalWalks: 340,
      rating: 4.9,
      reviewCount: 82,
      isFeatured: true,
      completedWalks: 335,
    },
  })

  await prisma.availability.createMany({
    data: [
      { walkerId: danielProfile.id, dayOfWeek: 1, startTime: "08:00", endTime: "18:00" },
      { walkerId: danielProfile.id, dayOfWeek: 2, startTime: "08:00", endTime: "18:00" },
      { walkerId: danielProfile.id, dayOfWeek: 3, startTime: "08:00", endTime: "18:00" },
      { walkerId: danielProfile.id, dayOfWeek: 4, startTime: "08:00", endTime: "18:00" },
      { walkerId: danielProfile.id, dayOfWeek: 5, startTime: "08:00", endTime: "16:00" },
    ],
  })

  const emmaProfile = await prisma.walkerProfile.upsert({
    where: { userId: emma.id },
    update: {},
    create: {
      userId: emma.id,
      bio: "Animal lover and certified dog walker. I provide personalized walks tailored to your dog's needs.",
      experience: 3,
      certifications: "Pet First Aid Certified, Canine Behavior Certificate",
      ratePerWalk: 18.0,
      currency: "PEN",
      isAvailable: true,
      latitude: 40.7282,
      longitude: -73.7949,
      serviceRadius: 4.0,
      totalWalks: 210,
      rating: 4.8,
      reviewCount: 55,
      isFeatured: true,
      completedWalks: 205,
    },
  })

  await prisma.availability.createMany({
    data: [
      { walkerId: emmaProfile.id, dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { walkerId: emmaProfile.id, dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { walkerId: emmaProfile.id, dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { walkerId: emmaProfile.id, dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { walkerId: emmaProfile.id, dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
      { walkerId: emmaProfile.id, dayOfWeek: 6, startTime: "10:00", endTime: "14:00" },
    ],
  })

  const frankProfile = await prisma.walkerProfile.upsert({
    where: { userId: frank.id },
    update: {},
    create: {
      userId: frank.id,
      bio: "New to PawLink but not to dogs! I grew up with dogs and understand their needs.",
      experience: 2,
      ratePerWalk: 15.0,
      currency: "PEN",
      isAvailable: true,
      latitude: 40.7489,
      longitude: -73.968,
      serviceRadius: 3.0,
      totalWalks: 45,
      rating: 4.5,
      reviewCount: 12,
      isFeatured: false,
      completedWalks: 42,
    },
  })

  await prisma.availability.createMany({
    data: [
      { walkerId: frankProfile.id, dayOfWeek: 0, startTime: "10:00", endTime: "16:00" },
      { walkerId: frankProfile.id, dayOfWeek: 1, startTime: "12:00", endTime: "20:00" },
      { walkerId: frankProfile.id, dayOfWeek: 2, startTime: "12:00", endTime: "20:00" },
      { walkerId: frankProfile.id, dayOfWeek: 3, startTime: "12:00", endTime: "20:00" },
      { walkerId: frankProfile.id, dayOfWeek: 4, startTime: "12:00", endTime: "20:00" },
      { walkerId: frankProfile.id, dayOfWeek: 5, startTime: "10:00", endTime: "18:00" },
      { walkerId: frankProfile.id, dayOfWeek: 6, startTime: "10:00", endTime: "16:00" },
    ],
  })

  // ── Specialist Profiles ─────────────────────────────────────────────────────

  await prisma.specialistProfile.upsert({
    where: { userId: grace.id },
    update: {},
    create: {
      userId: grace.id,
      bio: "Certified Applied Animal Behaviorist with over 10 years of experience helping pets and their owners build better relationships.",
      credentials: "PhD Animal Behavior, CAAB Certified, IAABC Member",
      specialties: "BEHAVIOR",
      ratePerSession: 60.0,
      currency: "PEN",
      isAvailable: true,
      totalSessions: 520,
      rating: 4.9,
      reviewCount: 98,
    },
  })

  await prisma.specialistProfile.upsert({
    where: { userId: henry.id },
    update: {},
    create: {
      userId: henry.id,
      bio: "Professional dog trainer specializing in anxiety management and behavioral modification. Positive reinforcement approach.",
      credentials: "CPDT-KA Certified, Fear Free Certified Professional",
      specialties: "ANXIETY",
      ratePerSession: 50.0,
      currency: "PEN",
      isAvailable: true,
      totalSessions: 310,
      rating: 4.7,
      reviewCount: 63,
    },
  })

  // ── Bookings ────────────────────────────────────────────────────────────────

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Completed walks
  const booking1 = await prisma.booking.upsert({
    where: { id: "bkg-001" },
    update: {},
    create: {
      id: "bkg-001",
      ownerId: alice.id,
      walkerId: daniel.id,
      petId: max.id,
      serviceType: "WALKING",
      status: "COMPLETED",
      scheduledAt: yesterday,
      duration: 30,
      pickupLocation: "123 Main St, Apt 4B",
      totalAmount: 23.0,
      commission: 3.0,
      startedAt: new Date(yesterday.getTime() + 1 * 60 * 60 * 1000),
      completedAt: new Date(yesterday.getTime() + 1 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
  })

  await prisma.walkUpdate.createMany({
    data: [
      { bookingId: booking1.id, type: "LOCATION", latitude: 40.7128, longitude: -74.006, note: "Walk started" },
      { bookingId: booking1.id, type: "PHOTO", note: "Max is enjoying the walk!" },
      { bookingId: booking1.id, type: "LOCATION", latitude: 40.715, longitude: -74.003, note: "Halfway point" },
      { bookingId: booking1.id, type: "NOTE", note: "Walk completed. Max was very well behaved." },
    ],
  })

  await prisma.payment.upsert({
    where: { bookingId: booking1.id },
    update: {},
    create: {
      bookingId: booking1.id,
      userId: daniel.id,
      amount: 23.0,
      currency: "PEN",
      status: "COMPLETED",
      method: "credit_card",
    },
  })

  await prisma.review.upsert({
    where: { bookingId: booking1.id },
    update: {},
    create: {
      bookingId: booking1.id,
      rating: 5,
      comment: "Daniel was amazing! Max came back happy and tired. Highly recommend!",
      reviewerId: alice.id,
    },
  })

  const booking2 = await prisma.booking.upsert({
    where: { id: "bkg-002" },
    update: {},
    create: {
      id: "bkg-002",
      ownerId: bob.id,
      walkerId: daniel.id,
      petId: charlie.id,
      serviceType: "WALKING",
      status: "COMPLETED",
      scheduledAt: lastWeek,
      duration: 45,
      pickupLocation: "456 Oak Ave",
      totalAmount: 34.5,
      commission: 4.5,
      startedAt: new Date(lastWeek.getTime() + 1 * 60 * 60 * 1000),
      completedAt: new Date(lastWeek.getTime() + 1 * 60 * 60 * 1000 + 45 * 60 * 1000),
    },
  })

  await prisma.payment.upsert({
    where: { bookingId: booking2.id },
    update: {},
    create: {
      bookingId: booking2.id,
      userId: daniel.id,
      amount: 34.5,
      currency: "PEN",
      status: "COMPLETED",
      method: "credit_card",
    },
  })

  await prisma.review.upsert({
    where: { bookingId: booking2.id },
    update: {},
    create: {
      bookingId: booking2.id,
      rating: 5,
      comment: "Charlie had a great time! Daniel is very reliable.",
      reviewerId: bob.id,
    },
  })

  const booking3 = await prisma.booking.upsert({
    where: { id: "bkg-003" },
    update: {},
    create: {
      id: "bkg-003",
      ownerId: alice.id,
      walkerId: emma.id,
      petId: max.id,
      serviceType: "WALKING",
      status: "COMPLETED",
      scheduledAt: twoDaysAgo,
      duration: 30,
      pickupLocation: "123 Main St, Apt 4B",
      totalAmount: 20.7,
      commission: 2.7,
      startedAt: new Date(twoDaysAgo.getTime() + 2 * 60 * 60 * 1000),
      completedAt: new Date(twoDaysAgo.getTime() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000),
    },
  })

  await prisma.payment.upsert({
    where: { bookingId: booking3.id },
    update: {},
    create: {
      bookingId: booking3.id,
      userId: emma.id,
      amount: 20.7,
      currency: "PEN",
      status: "COMPLETED",
      method: "credit_card",
    },
  })

  // Confirmed/Pending walks
  await prisma.booking.upsert({
    where: { id: "bkg-004" },
    update: {},
    create: {
      id: "bkg-004",
      ownerId: alice.id,
      walkerId: daniel.id,
      petId: max.id,
      serviceType: "WALKING",
      status: "CONFIRMED",
      scheduledAt: tomorrow,
      duration: 30,
      pickupLocation: "123 Main St, Apt 4B",
      totalAmount: 23.0,
      commission: 3.0,
    },
  })

  await prisma.booking.upsert({
    where: { id: "bkg-005" },
    update: {},
    create: {
      id: "bkg-005",
      ownerId: carol.id,
      walkerId: emma.id,
      petId: rocky.id,
      serviceType: "WALKING",
      status: "PENDING",
      scheduledAt: inTwoDays,
      duration: 45,
      pickupLocation: "789 Pine St",
      totalAmount: 27.0,
      commission: 3.0,
      notes: "Rocky pulls strongly, please use the harness by the door",
    },
  })

  await prisma.booking.upsert({
    where: { id: "bkg-006" },
    update: {},
    create: {
      id: "bkg-006",
      ownerId: bob.id,
      walkerId: frank.id,
      petId: bella.id,
      serviceType: "WALKING",
      status: "CONFIRMED",
      scheduledAt: tomorrow,
      duration: 20,
      pickupLocation: "456 Oak Ave",
      totalAmount: 17.25,
      commission: 2.25,
      notes: "Bella is a puppy, short walk only",
    },
  })

  // In-progress walk
  await prisma.booking.upsert({
    where: { id: "bkg-007" },
    update: {},
    create: {
      id: "bkg-007",
      ownerId: alice.id,
      walkerId: daniel.id,
      petId: max.id,
      serviceType: "WALKING",
      status: "IN_PROGRESS",
      scheduledAt: now,
      duration: 30,
      pickupLocation: "123 Main St, Apt 4B",
      totalAmount: 23.0,
      commission: 3.0,
      startedAt: now,
      latitude: 40.713,
      longitude: -74.005,
    },
  })

  await prisma.walkUpdate.create({
    data: {
      bookingId: "bkg-007",
      type: "LOCATION",
      latitude: 40.713,
      longitude: -74.005,
      note: "Walk started! Max is excited.",
    },
  })

  // Consultation bookings
  await prisma.booking.upsert({
    where: { id: "bkg-008" },
    update: {},
    create: {
      id: "bkg-008",
      ownerId: carol.id,
      walkerId: carol.id,
      petId: rocky.id,
      specialistId: grace.id,
      serviceType: "CONSULTATION",
      status: "COMPLETED",
      scheduledAt: lastWeek,
      duration: 60,
      totalAmount: 60.0,
      commission: 9.0,
      startedAt: lastWeek,
      completedAt: new Date(lastWeek.getTime() + 60 * 60 * 1000),
      notes: "Rocky has separation anxiety",
    },
  })

  await prisma.payment.upsert({
    where: { bookingId: "bkg-008" },
    update: {},
    create: {
      bookingId: "bkg-008",
      userId: grace.id,
      amount: 60.0,
      currency: "PEN",
      status: "COMPLETED",
      method: "credit_card",
    },
  })

  await prisma.review.upsert({
    where: { bookingId: "bkg-008" },
    update: {},
    create: {
      bookingId: "bkg-008",
      rating: 5,
      comment: "Grace was incredibly helpful. Rocky's anxiety has improved so much already!",
      reviewerId: carol.id,
    },
  })

  await prisma.booking.upsert({
    where: { id: "bkg-009" },
    update: {},
    create: {
      id: "bkg-009",
      ownerId: alice.id,
      walkerId: alice.id,
      petId: luna.id,
      specialistId: henry.id,
      serviceType: "CONSULTATION",
      status: "PENDING",
      scheduledAt: inTwoDays,
      duration: 45,
      totalAmount: 50.0,
      commission: 7.5,
      notes: "Luna has been scratching furniture and showing aggression",
    },
  })

  // ── Notifications ───────────────────────────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        type: "BOOKING_CONFIRMED",
        title: "Walk Confirmed",
        message: "Daniel will walk Max tomorrow at 10:00 AM",
        link: "/dashboard/owner/bookings",
      },
      {
        userId: alice.id,
        type: "WALK_STARTED",
        title: "Walk Started",
        message: "Daniel is now walking Max! Follow along in real-time.",
        link: "/dashboard/owner/bookings",
      },
      {
        userId: alice.id,
        type: "REVIEW_REQUEST",
        title: "How was your walk?",
        message: "Please leave a review for Emma's walk with Max.",
        link: "/dashboard/owner/bookings",
      },
      {
        userId: daniel.id,
        type: "NEW_BOOKING",
        title: "New Booking Received",
        message: "New walk request from Alice for Max at 10:00 AM tomorrow.",
        link: "/dashboard/walker/walks",
      },
      {
        userId: daniel.id,
        type: "PAYMENT_RECEIVED",
        title: "Payment Received",
        message: "You earned S/23.00 from Max's walk.",
        link: "/dashboard/walker/earnings",
      },
      {
        userId: grace.id,
        type: "NEW_CONSULTATION",
        title: "Consultation Booked",
        message: "New consultation request from Carol for Rocky.",
        link: "/dashboard/specialist/consultations",
      },
    ],
  })

  console.log("✅ Seed completed successfully!")
  console.log("")
  console.log("📋 Test Accounts (password: password123):")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  Admin:       admin@pawlink.com")
  console.log("  Pet Owners:  alice@pawlink.com")
  console.log("               bob@pawlink.com")
  console.log("               carol@pawlink.com")
  console.log("  Dog Walkers: daniel@pawlink.com")
  console.log("               emma@pawlink.com")
  console.log("               frank@pawlink.com")
  console.log("  Specialists: grace@pawlink.com")
  console.log("               henry@pawlink.com")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
