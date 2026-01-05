# Notification System

## Overview

The notification system stores user notifications in the database and sends email notifications (currently stubbed with console logging). It can be easily replaced with SendGrid, AWS SES, or other email providers.

## Database Schema

### Notification Model

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  metadata  Json?            // Additional data (e.g., requestId, roomId)
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@index([createdAt])
  @@map("notifications")
}

enum NotificationType {
  REQUEST_SUBMITTED
  REQUEST_APPROVED
  REQUEST_REJECTED
  REQUEST_MODIFIED
  REQUEST_CANCELLED
  OVERRIDE_CREATED
}
```

## Migration

To add the Notification model to your database, run:

```bash
npm run db:migrate
```

Or if using `db:push`:

```bash
npm run db:push
```

## API Endpoints

### GET /api/notifications

Get current user's notifications.

**Query Parameters:**
- `unread` (boolean): Filter to unread only
- `limit` (number): Maximum number of notifications (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 5
  }
}
```

### POST /api/notifications/:id/read

Mark a notification as read.

**Response:**
```json
{
  "success": true,
  "data": { ...notification }
}
```

### POST /api/notifications/read-all

Mark all notifications as read for the current user.

**Response:**
```json
{
  "success": true,
  "data": { "success": true }
}
```

## Notification Functions

### Core Functions

#### `sendEmail(to, subject, body)`

Currently logs to console. In production, replace with:
- SendGrid
- AWS SES
- Resend
- Nodemailer

#### `createNotification(data)`

Stores notification in database and sends email.

**Parameters:**
- `userId`: User ID
- `type`: NotificationType
- `title`: Notification title
- `message`: Notification message
- `metadata`: Optional metadata object

### Specific Notification Functions

#### `notifyRequestSubmitted(userId, requestId, roomName, startAt, endAt)`

Sent when a user submits a booking request.

#### `notifyBookingApproved(userId, requestId, roomName, startAt, endAt)`

Sent when an admin approves a booking request.

#### `notifyBookingRejected(userId, requestId, roomName, reason)`

Sent when an admin rejects a booking request.

#### `notifyBookingModified(userId, requestId, roomName, reason, oldStartAt, oldEndAt, newStartAt, newEndAt)`

Sent when an admin modifies a booking request (changes times).

#### `notifyOverrideCreated(userId, bookingId, roomName, startAt, endAt, reason)`

Sent when an admin creates an override booking.

## Integration Points

Notifications are automatically sent from:

1. **POST /api/requests** - Request submitted
2. **PATCH /api/requests/:id** - Request approved/rejected/modified
3. **POST /api/bookings/override** - Override booking created
4. **POST /api/requests/:id/cancel** - Request cancelled

## UI

### Notifications Page (`/notifications`)

- List view of all notifications
- Unread badge indicator
- Mark as read functionality
- Mark all as read button
- Type icons (different icons for each notification type)
- Relative timestamps (e.g., "2h ago", "Just now")
- Click to mark as read

### Navigation Integration

- Sidebar shows unread count badge on Notifications link
- Mobile nav includes Notifications link
- Badge updates automatically

## Email Integration

To integrate with a real email service, update `sendEmail()` in `src/lib/notifications.ts`:

### Example: SendGrid

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  await sgMail.send({
    to,
    from: process.env.FROM_EMAIL!,
    subject,
    text: body,
    html: `<p>${body}</p>`,
  })
}
```

### Example: AWS SES

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({ region: 'us-east-1' })

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  await sesClient.send(
    new SendEmailCommand({
      Source: process.env.FROM_EMAIL!,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    })
  )
}
```

## Notification Types

- **REQUEST_SUBMITTED**: User submitted a booking request
- **REQUEST_APPROVED**: Admin approved a booking request
- **REQUEST_REJECTED**: Admin rejected a booking request
- **REQUEST_MODIFIED**: Admin modified a booking request (changed times)
- **REQUEST_CANCELLED**: User cancelled their own request
- **OVERRIDE_CREATED**: Admin created an override booking

## Future Enhancements

- Email templates (HTML)
- Push notifications
- SMS notifications
- Notification preferences (user settings)
- Digest emails (daily/weekly summaries)
- Real-time updates (WebSocket/Server-Sent Events)

