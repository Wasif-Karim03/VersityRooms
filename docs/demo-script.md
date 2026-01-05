# Demo Script: University Room Booking System

This document provides a step-by-step guide for demonstrating the room booking system to stakeholders.

## Prerequisites

1. **Database Setup**: Ensure the database is seeded with sample data
   ```bash
   npm run db:seed
   ```

2. **Start the Application**:
   ```bash
   npm run dev
   ```

3. **Access the Application**: Navigate to `http://localhost:3000`

## Demo Flow

### Part 1: Student Experience - Requesting a Booking

**Goal**: Show how a student discovers rooms and submits a booking request.

1. **Login as Student**
   - Navigate to `/login`
   - Enter email: `student@university.edu` (or any email)
   - Select role: **Student**
   - Click "Sign In (Demo)"
   - **Highlight**: Clean login interface, role selection

2. **Browse Rooms**
   - Navigate to `/rooms` (or click "Rooms" in sidebar)
   - **Highlight**: 
     - Filter bar (capacity, building, equipment)
     - Room cards with key information
     - Responsive grid layout
   - Apply filters:
     - Select a building
     - Set minimum capacity
     - Select equipment (e.g., "projector")
   - **Highlight**: Real-time filtering, empty states

3. **View Room Details**
   - Click on a room card (e.g., "Lecture Hall A")
   - **Highlight**:
     - Hero header with room name and building
     - Info grid (capacity, equipment, policies)
     - Image gallery (if available)
     - Schedule view showing availability
   - Scroll to see the schedule section
   - **Highlight**: Week/day toggle, time slots, booked vs available

4. **Request a Booking**
   - Click "Request Booking" button
   - **Highlight**: Multi-step modal with smooth transitions
   - **Step 1 - Select Time**:
     - Choose start date (future date)
     - Select start time (e.g., 10:00 AM)
     - Choose end date
     - Select end time (e.g., 11:00 AM)
     - **Highlight**: 
       - Real-time conflict checking
       - Warning message if conflict detected
       - Validation messages
   - Click "Next"
   - **Step 2 - Purpose**:
     - Enter purpose: "Study group meeting"
     - **Highlight**: Character counter, validation
   - Click "Next"
   - **Step 3 - Review**:
     - Review all details
     - **Highlight**: Summary of booking details
   - Click "Submit Request"
   - **Highlight**: 
     - Success toast notification
     - Modal closes smoothly
     - Status: "Pending approval"

5. **View My Requests**
   - Navigate to `/requests` (or click "My Requests" in sidebar)
   - **Highlight**:
     - Tab filters (All, Pending, Approved, Rejected)
     - Request cards with status badges
     - Click a request to see detail drawer
   - Click on the pending request
   - **Highlight**: 
     - Detail drawer slides in
     - Full request information
     - Cancel button (for pending requests)
   - Close drawer

6. **Check Notifications**
   - Navigate to `/notifications` (or click "Notifications" in sidebar)
   - **Highlight**:
     - Unread badge count in sidebar
     - Notification list with icons
     - Relative timestamps ("Just now", "2h ago")
     - Mark as read functionality
     - "Mark all as read" button

---

### Part 2: Admin Experience - Managing Requests

**Goal**: Show how an admin reviews, approves, and manages booking requests.

1. **Login as Admin**
   - Sign out (click profile dropdown → Sign Out)
   - Navigate to `/login`
   - Enter email: `admin@university.edu` (or any email)
   - Select role: **Admin**
   - Click "Sign In (Demo)"
   - **Highlight**: Admin sees additional "Admin" link in sidebar

2. **Review Pending Requests**
   - Navigate to `/admin/requests` (or Admin → Pending Requests)
   - **Highlight**:
     - Clean table layout
     - Request details (room, user, purpose, time)
     - Approve/Reject buttons
   - Click "Approve" on a request
   - **Highlight**: 
     - Action modal opens
     - Request details displayed
     - Option to modify times (checkbox)
     - Required reason field (minimum 10 characters)
     - Character counter
   - Enter reason: "Approved for academic use"
   - (Optional) Check "Modify times" and adjust if needed
   - Click "Approve Request"
   - **Highlight**:
     - Success toast
     - Request removed from table (optimistic update)
     - Notification sent to user

3. **View Calendar**
   - Navigate to `/admin/calendar`
   - **Highlight**:
     - Master calendar view
     - Room selector (multi-select)
     - Week view with time grid
     - Booked blocks (approved bookings)
     - Pending blocks (pending requests)
     - Different badges for status
   - Select multiple rooms
   - Click on a booking block
   - **Highlight**: Detail popover with booking information
   - Click on an empty slot
   - **Highlight**: Override booking modal opens

4. **Create Override Booking**
   - Click an empty slot on the calendar
   - **Highlight**: Override booking modal
   - Fill in:
     - Select user (dropdown)
     - Set date and time
     - Enter purpose
     - **Required**: Reason for override (minimum 10 characters)
   - **Highlight**: 
     - Validation messages
     - Character counter
   - Enter reason: "Emergency faculty meeting required"
   - Click "Create Override"
   - **Highlight**:
     - Success toast
     - Booking appears on calendar
     - Notification sent to user
     - Audit log entry created

5. **View Audit Log**
   - Navigate to `/admin/audit`
   - **Highlight**:
     - List of all system actions
     - Filters (action type, target type)
     - Search functionality
   - Click on an audit log entry
   - **Highlight**: 
     - Detail drawer slides in
     - Shows actor, action, target, reason
     - Timestamp
   - Close drawer

6. **Manage Rooms**
   - Navigate to `/admin/rooms`
   - **Highlight**:
     - Table of all rooms
     - Create/Edit/Delete actions
     - Lock/Unlock toggle
   - Click "Create Room"
   - **Highlight**: Room modal with all fields
   - Fill in:
     - Name, Building, Capacity
     - Select equipment (multi-select badges)
     - Add image URLs
     - Set active/locked status
     - Set restricted roles (if any)
   - Click "Save"
   - **Highlight**: 
     - Success toast
     - Room appears in table
   - Click lock/unlock toggle on a room
   - **Highlight**: Optimistic update, instant feedback

7. **View Analytics**
   - Navigate to `/admin/reports`
   - **Highlight**:
     - Room utilization chart (top 10 rooms)
     - Peak booking hours chart
     - Bookings by role (pie chart + statistics)
   - Adjust week selector (1-12 weeks)
   - Click "Refresh"
   - **Highlight**: Charts update with new data
   - **Export CSV**:
     - Set date range (start and end dates)
     - Click "Export CSV"
     - **Highlight**: File downloads with booking data

---

### Part 3: Notification Flow

**Goal**: Show the complete notification lifecycle.

1. **As Student**:
   - Submit a booking request
   - Check notifications → See "Request Submitted" notification

2. **As Admin**:
   - Approve the request
   - **Highlight**: Notification sent to student

3. **Switch Back to Student**:
   - Check notifications → See "Request Approved" notification
   - Click notification → Mark as read
   - **Highlight**: Unread count decreases

---

## Key Features to Highlight

### User Experience
- ✅ **Clean, modern interface** with consistent design system
- ✅ **Smooth animations** (subtle, 200ms transitions)
- ✅ **Responsive design** (works on mobile, tablet, desktop)
- ✅ **Real-time feedback** (toasts, optimistic updates)
- ✅ **Accessibility** (keyboard navigation, ARIA labels)

### Functionality
- ✅ **Role-based access control** (Student, Faculty, Admin)
- ✅ **Conflict detection** (real-time availability checking)
- ✅ **Audit logging** (all actions tracked)
- ✅ **Notification system** (in-app + email stubs)
- ✅ **Analytics dashboard** (utilization, peak hours, role breakdown)

### Technical Highlights
- ✅ **Type-safe** (TypeScript throughout)
- ✅ **Validated** (Zod schemas)
- ✅ **Optimistic UI** (instant feedback)
- ✅ **Error handling** (graceful failures, user-friendly messages)
- ✅ **Performance** (skeleton loaders, efficient queries)

---

## Troubleshooting

### If login doesn't work:
- Check that NextAuth is configured correctly
- Verify `.env` has `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

### If no data appears:
- Run seed script: `npm run db:seed`
- Check database connection in `.env`

### If charts don't load:
- Ensure there are bookings in the database
- Check browser console for errors

---

## Demo Tips

1. **Start with Student Flow**: Shows the primary use case
2. **Emphasize Real-time Features**: Conflict checking, optimistic updates
3. **Show Admin Power**: Override bookings, audit logs, analytics
4. **Highlight Polish**: Animations, empty states, error handling
5. **Mobile Demo**: Resize browser to show responsive design

---

## Expected Duration

- **Full Demo**: 15-20 minutes
- **Quick Demo**: 8-10 minutes (focus on student request + admin approval)

---

## Post-Demo Discussion Points

- **Scalability**: How the system handles growth
- **Integration**: OWU SSO replacement for mock auth
- **Email**: SendGrid/SES integration for notifications
- **Analytics**: Additional metrics and reporting
- **Mobile App**: Potential native app development

