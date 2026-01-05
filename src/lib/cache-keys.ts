/**
 * Cache Keys and TTL Configuration
 * Centralized cache key generation and TTL values
 */

export const CacheKeys = {
  // Room data (cache for 1 hour, invalidate on update)
  room: (id: string) => `room:${id}`,
  roomList: (filters: string) => `rooms:list:${filters}`,
  
  // Availability (cache for 5 minutes, high traffic)
  availability: (roomId: string, date: string) => 
    `availability:${roomId}:${date}`,
  
  // User data (cache for 30 minutes)
  user: (id: string) => `user:${id}`,
  
  // Booking lists (cache for 2 minutes)
  bookings: (userId: string, filters: string) => 
    `bookings:${userId}:${filters}`,
  bookingsByRoom: (roomId: string, filters: string) =>
    `bookings:room:${roomId}:${filters}`,
  
  // Reports (cache for 15 minutes)
  report: (type: string, params: string) => 
    `report:${type}:${params}`,
  
  // Notification count (cache for 1 minute)
  notificationCount: (userId: string) => `notifications:count:${userId}`,
  
  // Buildings (cache for 1 hour, changes infrequently)
  buildings: () => `buildings:list`,
}

export const CacheTTL = {
  ROOM: 3600,              // 1 hour
  ROOM_LIST: 600,          // 10 minutes
  AVAILABILITY: 300,       // 5 minutes
  USER: 1800,              // 30 minutes
  BOOKINGS: 120,           // 2 minutes
  REPORTS: 900,            // 15 minutes
  NOTIFICATION_COUNT: 60,  // 1 minute
  BUILDINGS: 3600,         // 1 hour
}

