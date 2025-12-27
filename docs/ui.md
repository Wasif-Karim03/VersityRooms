# UI Screens Documentation

## Overview

This document describes the user interface screens and user flows for the University Room Booking System.

## Design Principles

- **Clean & Modern**: Minimal, professional design suitable for university use
- **Accessible**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first design that works on all devices
- **Consistent**: Unified design language across all screens
- **Intuitive**: Clear navigation and user flows

## Layout Structure

### Global Layout
- **Top Navigation Bar**: Logo, app name, theme toggle
- **Desktop Sidebar**: Main navigation (hidden on mobile)
- **Mobile Bottom Nav**: Quick access to main sections
- **Main Content Area**: Page-specific content

## Screen Descriptions

### 1. Dashboard (`/dashboard`)

**Purpose**: Overview of user's booking activity and quick stats

**Components:**
- Welcome message
- Statistics cards:
  - Total Rooms Available
  - My Active Bookings
  - Pending Requests
  - Upcoming Bookings (next 7 days)
- Recent activity feed (to be implemented)
- Quick actions (to be implemented)

**User Flow:**
- Landing page after login
- Redirects from home page (`/`)

---

### 2. Rooms (`/rooms`)

**Purpose**: Browse and search available rooms

**Components:**
- Search and filter bar (to be implemented):
  - Building filter
  - Capacity filter
  - Amenities filter
  - Date/time availability filter
- Room grid/list view:
  - Room card showing:
    - Room name and building
    - Capacity
    - Amenities icons
    - Availability status
    - Quick book button
- Pagination (to be implemented)

**User Flow:**
1. User browses available rooms
2. User can filter by criteria
3. User clicks on a room to view details
4. User can book from room detail or list view

**Future Enhancements:**
- Map view of buildings
- Room photos
- Detailed room information modal

---

### 3. My Requests (`/requests`)

**Purpose**: View and manage user's booking requests

**Components:**
- Tabs or filter buttons:
  - All Requests
  - Pending
  - Approved
  - Rejected
  - Cancelled
- Request list/cards:
  - Room name and building
  - Date and time range
  - Purpose
  - Status badge
  - Actions (view, cancel if pending/approved)
- Empty state when no requests

**User Flow:**
1. User views all their booking requests
2. User can filter by status
3. User can view details of a request
4. User can cancel pending or approved bookings
5. User can see rejection reasons (if applicable)

---

### 4. Calendar (`/calendar`)

**Purpose**: Visual calendar view of room bookings and availability

**Components:**
- Calendar view (month/week/day):
  - Month view (default)
  - Week view
  - Day view
- Room selector (to filter by room)
- Color-coded bookings by status:
  - Pending: Yellow/Orange
  - Approved: Green
  - Rejected: Red
  - Cancelled: Gray
- Click on event to view details
- Navigation controls (prev/next month)

**User Flow:**
1. User selects date range or room
2. User views bookings on calendar
3. User clicks on booking to see details
4. User can create new booking from calendar (to be implemented)

**Future Enhancements:**
- Drag-and-drop to reschedule
- Multiple room view
- Export to iCal/Google Calendar

---

### 5. Admin Panel (`/admin`)

**Purpose**: Administrative functions (admin role only)

**Components:**
- Dashboard cards:
  - Room Management
  - User Management
  - Booking Approvals
  - Analytics
- Quick stats:
  - Total rooms
  - Total users
  - Pending approvals
  - Bookings this month

**Sub-screens (to be implemented):**

#### 5.1 Room Management
- List of all rooms
- Add/Edit/Delete rooms
- Room status toggle (active/inactive)
- Bulk operations

#### 5.2 User Management
- List of all users
- Search and filter users
- Edit user roles
- User activity logs

#### 5.3 Booking Approvals
- List of pending requests
- Approve/Reject actions
- Bulk approval
- Approval history

#### 5.4 Analytics
- Booking statistics
- Room utilization
- User activity
- Reports and exports

**User Flow:**
1. Admin accesses admin panel
2. Admin navigates to specific management section
3. Admin performs management actions
4. Changes are reflected immediately

---

## Component Library

### Reusable Components

#### Cards
- **StatCard**: Dashboard statistics
- **RoomCard**: Room listing item
- **BookingCard**: Booking request item
- **InfoCard**: General information display

#### Forms (to be implemented)
- **BookingForm**: Create/edit booking
- **RoomForm**: Create/edit room (admin)
- **SearchForm**: Room search and filters

#### Navigation
- **TopNav**: Header navigation
- **Sidebar**: Desktop sidebar menu
- **MobileNav**: Mobile bottom navigation
- **Breadcrumbs**: Page navigation (to be implemented)

#### Feedback
- **Skeleton**: Loading states
- **Alert**: Success/error messages
- **Toast**: Notification toasts (to be implemented)
- **Modal**: Dialog modals (to be implemented)

#### Data Display
- **Table**: Data tables (to be implemented)
- **Badge**: Status indicators
- **Avatar**: User avatars (to be implemented)

## Responsive Breakpoints

- **Mobile**: < 768px
  - Bottom navigation
  - Hamburger menu
  - Stacked layouts
  - Touch-optimized interactions

- **Tablet**: 768px - 1024px
  - Sidebar can be toggled
  - Grid layouts (2 columns)
  - Hybrid navigation

- **Desktop**: > 1024px
  - Persistent sidebar
  - Multi-column layouts
  - Hover states
  - Keyboard navigation

## Theme Support

### Light Theme (Default)
- Clean white backgrounds
- Subtle gray borders
- Blue primary color
- High contrast text

### Dark Theme
- Dark backgrounds
- Muted borders
- Adjusted primary color
- Maintained contrast ratios

## Animation Guidelines

- **Page Transitions**: Fade in with slight upward motion (300ms)
- **Hover States**: Subtle scale or color transitions (200ms)
- **Loading States**: Skeleton loaders with pulse animation
- **Modal Transitions**: Fade + scale (200ms)
- **Navigation**: Smooth slide animations

## Accessibility Features

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance
- Responsive text sizing

## Future UI Enhancements

- Drag-and-drop interfaces
- Real-time updates (WebSocket indicators)
- Advanced filtering UI
- Data visualization charts
- Export/print functionality
- Onboarding tour for new users
- Help tooltips and documentation links

