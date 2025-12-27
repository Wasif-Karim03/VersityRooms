# Admin Area Documentation

## Overview

The admin area provides comprehensive management tools for room bookings, with a clean, executive-style interface designed for efficiency and clarity.

## Pages

### 1. `/admin/requests` - Pending Requests Management

**Features:**
- Table view of all pending booking requests
- Approve/Reject buttons for each request
- Modify times option (with date/time pickers)
- Reason required (minimum 10 characters) for all actions
- Automatic notification sending (stub)
- Audit log creation for all actions

**Workflow:**
1. Admin views pending requests in clean table
2. Clicks Approve or Reject
3. Modal opens with:
   - Request details
   - Option to modify times (checkbox)
   - Required reason textarea (min 10 chars)
4. On submit:
   - Request status updated
   - Booking created (if approved)
   - Notification sent to user
   - Audit log entry created

### 2. `/admin/calendar` - Master Calendar

**Features:**
- Week view with time grid (8am-11pm)
- Room selector (multi-select)
- View all bookings and pending requests
- Override booking creation
- Click empty slot to create override booking

**Override Booking Flow:**
1. Admin clicks empty slot
2. Override booking modal opens
3. Select user, set time, purpose
4. **Reason required** (min 10 chars) - explains why override is needed
5. Creates booking with `isOverride: true`
6. Bypasses conflict checks
7. Creates audit log

### 3. `/admin/rooms` - Room Management

**Features:**
- Table view of all rooms
- Create new room
- Edit existing room
- Lock/unlock room toggle
- Set restricted roles
- Equipment management
- Capacity editing

**CRUD Operations:**
- **Create**: Modal with all room fields
- **Edit**: Pre-filled modal with existing data
- **Update**: PUT `/api/admin/rooms/:id`
- **Delete**: Soft delete (deactivates room)
- **Lock/Unlock**: Toggle `isLocked` field

**Room Fields:**
- Name, Building, Capacity
- Equipment (multi-select badges)
- Images (array of URLs)
- Active/Inactive toggle
- Locked toggle
- Restricted Roles (multi-select)

### 4. `/admin/audit` - Audit Log Viewer

**Features:**
- Table view of all audit logs
- Search functionality
- Filter by action type
- Filter by target type
- Detail drawer on click
- Shows reason and metadata

**Filters:**
- Search: Actions, users, reasons
- Action Type: Dropdown filter
- Target Type: Dropdown filter

**Detail Drawer:**
- Actor information
- Target information
- Reason (highlighted if missing)
- Timestamp
- Full metadata

## Components

### AdminTable
Reusable table component with:
- Consistent styling
- Loading skeletons
- Responsive design
- Hover states

### RequestActionModal
Modal for approve/reject actions:
- Request details display
- Modify times option
- Required reason (min 10 chars)
- Validation
- Error handling

### OverrideBookingModal
Modal for creating override bookings:
- User selection
- Time pickers
- Purpose input
- **Required reason** (min 10 chars)
- Conflict warning

### RoomModal
Modal for room CRUD:
- All room fields
- Equipment multi-select
- Restricted roles multi-select
- Active/Locked toggles
- Validation

### AuditDetailDrawer
Slide-in drawer for audit log details:
- Full log information
- Actor details
- Target details
- Reason display
- Timestamp

## API Endpoints

### Admin Rooms
- `GET /api/admin/rooms` - Get all rooms
- `POST /api/admin/rooms` - Create room
- `PUT /api/admin/rooms/:id` - Update room
- `DELETE /api/admin/rooms/:id` - Deactivate room

### Admin Audit
- `GET /api/admin/audit` - Get audit logs with filters

### Admin Users
- `GET /api/admin/users` - Get all users (for override booking)

## Business Rules

### Request Actions
- **Reason Required**: All approve/reject actions require reason (min 10 chars)
- **Time Modification**: Admin can modify times when approving
- **Conflict Check**: Approval checks for conflicts (returns 409 if conflict)
- **Notifications**: Sent after action (stub function)
- **Audit Log**: Created for all actions

### Override Bookings
- **Admin Only**: Only admins can create override bookings
- **Reason Required**: Must provide reason (min 10 chars)
- **Bypasses Conflicts**: Override bookings ignore conflict checks
- **Audit Log**: Always created with reason

### Room Management
- **Soft Delete**: Rooms are deactivated, not deleted
- **Lock Toggle**: Quick lock/unlock functionality
- **Restricted Roles**: Can restrict to specific roles or allow all
- **Audit Log**: Created for updates and deactivations

## Design Principles

### Executive Clean
- **Minimal Clutter**: Clean layouts with generous whitespace
- **Strong Spacing**: Consistent padding and margins
- **Table Styling**: Professional, readable tables
- **Consistent Typography**: Clear hierarchy
- **Subtle Animations**: Smooth transitions (200ms)

### Visual Hierarchy
- Clear section headers
- Consistent button placement
- Status badges for quick scanning
- Color-coded actions (approve=primary, reject=destructive)

### Responsive Design
- Tables scroll horizontally on mobile
- Modals adapt to screen size
- Touch-friendly interactions
- Mobile-optimized layouts

## Notification System

Stub functions in `src/lib/notifications.ts`:
- `notifyBookingApproved()` - Sent when request approved
- `notifyBookingRejected()` - Sent when request rejected

In production, these would:
- Send email notifications
- Send SMS (optional)
- Store in notification database
- Show in-app notifications

## Audit Logging

All admin actions create audit log entries:
- **Actor**: Admin user ID
- **Action Type**: e.g., "BOOKING_REQUEST_APPROVED"
- **Target Type**: e.g., "BookingRequest"
- **Target ID**: ID of affected entity
- **Reason**: Required for all actions
- **Timestamp**: Automatic

## Security

- All admin endpoints require `requireAdmin()` guard
- Role validation on every request
- Audit trail for compliance
- Reason required for accountability

## Future Enhancements

- Bulk approve/reject
- Export audit logs
- Room usage analytics
- User management interface
- Advanced filtering options
- Real-time updates

