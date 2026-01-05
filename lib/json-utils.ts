/**
 * Utility functions to parse JSON strings from SQLite database
 * SQLite stores JSON as strings, so we need to parse them
 */

export function parseJsonField<T = any>(value: string | T | null | undefined): T | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return [] as T // Default to empty array if parsing fails
    }
  }
  return value as T
}

export function stringifyJsonField(value: any): string {
  if (value === null || value === undefined) return '[]'
  if (typeof value === 'string') return value // Already a string
  return JSON.stringify(value)
}

/**
 * Transform a room object to parse JSON fields
 */
export function transformRoom(room: any) {
  return {
    ...room,
    equipment: parseJsonField<string[]>(room.equipment) || [],
    images: parseJsonField<string[]>(room.images) || [],
    restrictedRoles: parseJsonField<string[]>(room.restrictedRoles),
  }
}

/**
 * Transform rooms array
 */
export function transformRooms(rooms: any[]) {
  return rooms.map(transformRoom)
}

