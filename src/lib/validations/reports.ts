/**
 * Zod validation schemas for Reports endpoints
 */

import { z } from "zod"

export const reportQuerySchema = z.object({
  weeks: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().int().min(1).max(52).default(4)
  ),
  startDate: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().datetime().optional()
  ),
  endDate: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().datetime().optional()
  ),
})

export const exportQuerySchema = z.object({
  startDate: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().datetime().optional()
  ),
  endDate: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().datetime().optional()
  ),
})

