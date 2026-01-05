/**
 * Zod validation schemas for Notifications endpoints
 */

import { z } from "zod"

export const notificationQuerySchema = z.object({
  unread: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean().optional()
  ),
  page: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().int().min(1).max(100).default(20)
  ),
})

