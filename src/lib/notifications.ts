/**
 * Notification System
 * 
 * Handles sending notifications and storing them in the database.
 * Currently uses console logging and database storage.
 * Can be replaced with SendGrid/SES for email delivery.
 */

import { prisma } from "@/lib/prisma"

export type NotificationType =
  | "REQUEST_SUBMITTED"
  | "REQUEST_APPROVED"
  | "REQUEST_REJECTED"
  | "REQUEST_MODIFIED"
  | "REQUEST_CANCELLED"
  | "OVERRIDE_CREATED"

export interface NotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any>
}

/**
 * Send email notification
 * 
 * Currently logs to console and stores in database.
 * In production, this would integrate with SendGrid/SES.
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  // Log to console (for development)
  console.log("📧 Email Notification:", {
    to,
    subject,
    body,
    timestamp: new Date().toISOString(),
  })

  // In production, this would be:
  // await emailService.send({
  //   to,
  //   subject,
  //   body,
  // })
}

/**
 * Create and send a notification
 * 
 * Stores notification in database and sends email (stub).
 */
export async function createNotification(
  data: NotificationData
): Promise<void> {
  try {
    // Store notification in database
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
      },
    })

    // Get user email for sending
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { email: true, name: true },
    })

    if (user) {
      // Send email (stub - logs to console)
      await sendEmail(user.email, data.title, data.message)
    }
  } catch (error) {
    console.error("Failed to create notification:", error)
    // Don't throw - notification failure shouldn't break the main flow
  }
}

/**
 * Send booking request submitted notification
 */
export async function notifyRequestSubmitted(
  userId: string,
  requestId: string,
  roomName: string,
  startAt: Date,
  endAt: Date
): Promise<void> {
  await createNotification({
    userId,
    type: "REQUEST_SUBMITTED",
    title: `Booking Request Submitted: ${roomName}`,
    message: `Your booking request for ${roomName} has been submitted and is pending approval. Time: ${startAt.toLocaleString()} - ${endAt.toLocaleTimeString()}`,
    metadata: {
      requestId,
      roomName,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    },
  })
}

/**
 * Send booking approval notification
 */
export async function notifyBookingApproved(
  userId: string,
  requestId: string,
  roomName: string,
  startAt: Date,
  endAt: Date
): Promise<void> {
  await createNotification({
    userId,
    type: "REQUEST_APPROVED",
    title: `Booking Approved: ${roomName}`,
    message: `Your booking request for ${roomName} has been approved. Time: ${startAt.toLocaleString()} - ${endAt.toLocaleTimeString()}`,
    metadata: {
      requestId,
      roomName,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    },
  })
}

/**
 * Send booking rejection notification
 */
export async function notifyBookingRejected(
  userId: string,
  requestId: string,
  roomName: string,
  reason: string
): Promise<void> {
  await createNotification({
    userId,
    type: "REQUEST_REJECTED",
    title: `Booking Request Rejected: ${roomName}`,
    message: `Your booking request for ${roomName} has been rejected. Reason: ${reason}`,
    metadata: {
      requestId,
      roomName,
      reason,
    },
  })
}

/**
 * Send booking modified notification
 */
export async function notifyBookingModified(
  userId: string,
  requestId: string,
  roomName: string,
  reason: string,
  oldStartAt: Date,
  oldEndAt: Date,
  newStartAt: Date,
  newEndAt: Date
): Promise<void> {
  await createNotification({
    userId,
    type: "REQUEST_MODIFIED",
    title: `Booking Modified: ${roomName}`,
    message: `Your booking request for ${roomName} has been modified. Original time: ${oldStartAt.toLocaleString()} - ${oldEndAt.toLocaleTimeString()}. New time: ${newStartAt.toLocaleString()} - ${newEndAt.toLocaleTimeString()}. Reason: ${reason}`,
    metadata: {
      requestId,
      roomName,
      reason,
      oldStartAt: oldStartAt.toISOString(),
      oldEndAt: oldEndAt.toISOString(),
      newStartAt: newStartAt.toISOString(),
      newEndAt: newEndAt.toISOString(),
    },
  })
}

/**
 * Send override booking created notification
 */
export async function notifyOverrideCreated(
  userId: string,
  bookingId: string,
  roomName: string,
  startAt: Date,
  endAt: Date,
  reason: string
): Promise<void> {
  await createNotification({
    userId,
    type: "OVERRIDE_CREATED",
    title: `Override Booking Created: ${roomName}`,
    message: `An override booking has been created for ${roomName} on your behalf. Time: ${startAt.toLocaleString()} - ${endAt.toLocaleTimeString()}. Reason: ${reason}`,
    metadata: {
      bookingId,
      roomName,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      reason,
    },
  })
}
