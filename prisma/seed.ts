/**
 * Prisma Seed Script
 * 
 * Seeds the database with initial data:
 * - 1 admin user
 * - 1 faculty user
 * - 1 student user
 * - Rooms for Ohio Wesleyan University buildings
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...")
  await prisma.auditLog.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.bookingRequest.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log("👥 Creating users...")
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@owu.edu",
      role: "ADMIN",
      department: "Administration",
    },
  })

  const faculty = await prisma.user.create({
    data: {
      name: "Dr. Jane Smith",
      email: "jane.smith@owu.edu",
      role: "FACULTY",
      department: "Computer Science",
    },
  })

  const student = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@owu.edu",
      role: "STUDENT",
      department: "Computer Science",
    },
  })

  console.log(`✅ Created users: ${admin.name}, ${faculty.name}, ${student.name}`)

  // Create rooms for Ohio Wesleyan University buildings
  console.log("🏢 Creating rooms for OWU buildings...")
  
  const rooms = [
    // Elliott Hall
    { name: "Elliott 101", building: "Elliott Hall", capacity: 30, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Elliott 102", building: "Elliott Hall", capacity: 25, equipment: ["whiteboard", "wifi"], restrictedRoles: null },
    { name: "Elliott 201", building: "Elliott Hall", capacity: 40, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Elliott 202", building: "Elliott Hall", capacity: 35, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Elliott Conference Room", building: "Elliott Hall", capacity: 15, equipment: ["projector", "video conferencing", "whiteboard", "wifi"], restrictedRoles: ["FACULTY", "ADMIN"] },
    
    // Slocum Hall
    { name: "Slocum 100", building: "Slocum Hall", capacity: 20, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Slocum 101", building: "Slocum Hall", capacity: 18, equipment: ["whiteboard", "wifi"], restrictedRoles: null },
    { name: "Slocum 200", building: "Slocum Hall", capacity: 30, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Slocum Welcome Center", building: "Slocum Hall", capacity: 10, equipment: ["wifi", "monitor"], restrictedRoles: null },
    
    // University Hall
    { name: "University Hall 101", building: "University Hall", capacity: 50, equipment: ["projector", "sound system", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "University Hall 102", building: "University Hall", capacity: 45, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "University Hall 201", building: "University Hall", capacity: 60, equipment: ["projector", "sound system", "microphone", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "University Hall 202", building: "University Hall", capacity: 40, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Gray Chapel", building: "University Hall", capacity: 200, equipment: ["projector", "sound system", "stage", "lighting", "wifi"], restrictedRoles: null },
    
    // Merrick Hall
    { name: "Merrick 101", building: "Merrick Hall", capacity: 35, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Merrick 102", building: "Merrick Hall", capacity: 30, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Merrick 201", building: "Merrick Hall", capacity: 40, equipment: ["projector", "video conferencing", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Merrick 202", building: "Merrick Hall", capacity: 25, equipment: ["whiteboard", "wifi"], restrictedRoles: null },
    { name: "Merrick Innovation Lab", building: "Merrick Hall", capacity: 20, equipment: ["computers", "projector", "whiteboard", "wifi"], restrictedRoles: null },
    
    // Edwards Gymnasium
    { name: "Edwards Gym Main", building: "Edwards Gymnasium", capacity: 100, equipment: ["sound system", "wifi"], restrictedRoles: null },
    { name: "Edwards Gym Studio A", building: "Edwards Gymnasium", capacity: 30, equipment: ["mirrors", "sound system", "wifi"], restrictedRoles: null },
    { name: "Edwards Gym Studio B", building: "Edwards Gymnasium", capacity: 25, equipment: ["mirrors", "sound system", "wifi"], restrictedRoles: null },
    { name: "Jannuzi Dance Studio", building: "Edwards Gymnasium", capacity: 20, equipment: ["mirrors", "sound system", "wifi"], restrictedRoles: null },
    
    // Stuyvesant Hall
    { name: "Stuyvesant 101", building: "Stuyvesant Hall", capacity: 20, equipment: ["whiteboard", "wifi"], restrictedRoles: null },
    { name: "Stuyvesant 102", building: "Stuyvesant Hall", capacity: 15, equipment: ["whiteboard", "wifi"], restrictedRoles: null },
    { name: "Stuyvesant Common Room", building: "Stuyvesant Hall", capacity: 30, equipment: ["wifi", "monitor"], restrictedRoles: null },
    
    // Sanborn Hall
    { name: "Sanborn 101", building: "Sanborn Hall", capacity: 25, equipment: ["piano", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Sanborn 102", building: "Sanborn Hall", capacity: 20, equipment: ["piano", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Sanborn 201", building: "Sanborn Hall", capacity: 30, equipment: ["piano", "projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Jemison Auditorium", building: "Sanborn Hall", capacity: 150, equipment: ["piano", "projector", "sound system", "stage", "lighting", "wifi"], restrictedRoles: null },
    
    // Schimmel-Conrades Science Center
    { name: "Schimmel 101", building: "Schimmel-Conrades Science Center", capacity: 40, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Schimmel 102", building: "Schimmel-Conrades Science Center", capacity: 35, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Schimmel Lab 201", building: "Schimmel-Conrades Science Center", capacity: 20, equipment: ["lab equipment", "whiteboard", "wifi"], restrictedRoles: ["FACULTY", "ADMIN"] },
    { name: "Schimmel Lab 202", building: "Schimmel-Conrades Science Center", capacity: 20, equipment: ["lab equipment", "whiteboard", "wifi"], restrictedRoles: ["FACULTY", "ADMIN"] },
    { name: "Schimmel 301", building: "Schimmel-Conrades Science Center", capacity: 50, equipment: ["projector", "sound system", "whiteboard", "wifi"], restrictedRoles: null },
    
    // Phillips Hall
    { name: "Phillips 101", building: "Phillips Hall", capacity: 30, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Phillips 102", building: "Phillips Hall", capacity: 25, equipment: ["whiteboard", "wifi"], restrictedRoles: null },
    { name: "Phillips 201", building: "Phillips Hall", capacity: 35, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Phillips 202", building: "Phillips Hall", capacity: 30, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Phillips Conference Room", building: "Phillips Hall", capacity: 12, equipment: ["projector", "video conferencing", "whiteboard", "wifi"], restrictedRoles: ["FACULTY", "ADMIN"] },
    
    // Beeghly Library
    { name: "Library Study Room 1", building: "Beeghly Library", capacity: 4, equipment: ["wifi", "desks"], restrictedRoles: null },
    { name: "Library Study Room 2", building: "Beeghly Library", capacity: 4, equipment: ["wifi", "desks"], restrictedRoles: null },
    { name: "Library Study Room 3", building: "Beeghly Library", capacity: 6, equipment: ["whiteboard", "wifi", "monitor"], restrictedRoles: null },
    { name: "Library Study Room 4", building: "Beeghly Library", capacity: 6, equipment: ["whiteboard", "wifi", "monitor"], restrictedRoles: null },
    { name: "Library Conference Room", building: "Beeghly Library", capacity: 10, equipment: ["projector", "whiteboard", "wifi"], restrictedRoles: null },
    { name: "Library Quiet Room", building: "Beeghly Library", capacity: 8, equipment: ["wifi", "desks"], restrictedRoles: null },
    
    // Richard M. Ross Art Museum
    { name: "Ross Gallery A", building: "Richard M. Ross Art Museum", capacity: 30, equipment: ["wifi", "lighting"], restrictedRoles: null },
    { name: "Ross Gallery B", building: "Richard M. Ross Art Museum", capacity: 25, equipment: ["wifi", "lighting"], restrictedRoles: null },
    { name: "Ross Studio", building: "Richard M. Ross Art Museum", capacity: 15, equipment: ["art supplies", "wifi"], restrictedRoles: ["FACULTY", "ADMIN"] },
  ]

  const createdRooms = []
  for (const roomData of rooms) {
    const room = await prisma.room.create({
      data: {
        name: roomData.name,
        building: roomData.building,
        capacity: roomData.capacity,
        equipment: JSON.stringify(roomData.equipment), // Convert array to JSON string
        images: JSON.stringify([]), // Convert array to JSON string
        restrictedRoles: roomData.restrictedRoles ? JSON.stringify(roomData.restrictedRoles) : null,
        isActive: true,
        isLocked: false,
      },
    })
    createdRooms.push(room)
    console.log(`✅ Created room: ${room.name} (${room.building})`)
  }

  console.log(`✅ Created ${createdRooms.length} rooms across ${new Set(rooms.map(r => r.building)).size} buildings`)

  // Create some sample booking requests (optional)
  console.log("📅 Creating sample booking requests...")
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const dayAfter = new Date(tomorrow)
  dayAfter.setHours(12, 0, 0, 0)

  const bookingRequest = await prisma.bookingRequest.create({
    data: {
      roomId: createdRooms[0].id,
      userId: faculty.id,
      startAt: tomorrow,
      endAt: dayAfter,
      purpose: "Faculty meeting",
      status: "PENDING",
    },
  })

  console.log(`✅ Created sample booking request: ${bookingRequest.id}`)

  // Create an audit log entry
  console.log("📝 Creating audit log entry...")
  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      actionType: "SEED_COMPLETED",
      targetType: "System",
      targetId: null,
      reason: "Database seeded with initial data",
    },
  })

  console.log("✅ Seed completed successfully!")
  console.log("\n📊 Summary:")
  console.log(`   - Users: 3 (1 admin, 1 faculty, 1 student)`)
  console.log(`   - Rooms: ${createdRooms.length}`)
  console.log(`   - Buildings: ${new Set(rooms.map(r => r.building)).size}`)
  console.log(`   - Booking Requests: 1`)
  console.log(`   - Audit Logs: 1`)
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
