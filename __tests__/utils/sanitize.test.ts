/**
 * Unit tests for sanitization utilities
 */

import { describe, it, expect } from "vitest"
import { sanitizeString, sanitizeStringArray } from "@/src/lib/utils/sanitize"

describe("Sanitization Utilities", () => {
  describe("sanitizeString", () => {
    it("should remove null bytes", () => {
      const input = "test\0string"
      const result = sanitizeString(input)
      expect(result).toBe("teststring")
      expect(result).not.toContain("\0")
    })

    it("should trim whitespace", () => {
      const input = "  test string  "
      const result = sanitizeString(input)
      expect(result).toBe("test string")
    })

    it("should remove control characters", () => {
      const input = "test\x01string"
      const result = sanitizeString(input)
      expect(result).not.toContain("\x01")
    })

    it("should preserve valid characters", () => {
      const input = "Room 101 - Science Building"
      const result = sanitizeString(input)
      expect(result).toBe("Room 101 - Science Building")
    })

    it("should handle empty strings", () => {
      const result = sanitizeString("")
      expect(result).toBe("")
    })

    it("should handle strings with only whitespace", () => {
      const result = sanitizeString("   ")
      expect(result).toBe("")
    })
  })

  describe("sanitizeStringArray", () => {
    it("should sanitize all strings in array", () => {
      const input = ["  item1  ", "item\0two", "item3"]
      const result = sanitizeStringArray(input)
      expect(result).toEqual(["item1", "itemtwo", "item3"])
    })

    it("should handle empty array", () => {
      const result = sanitizeStringArray([])
      expect(result).toEqual([])
    })
  })
})

