# UI Style Guide

## Design Philosophy

This style guide defines the visual language and interaction patterns for the University Room Booking System. Our design prioritizes:

- **Readability**: Clear typography, sufficient contrast, and logical information hierarchy
- **Low Cognitive Load**: Simple, intuitive interfaces that don't require mental effort to understand
- **Subtle Interactions**: Animations and transitions that enhance without distracting (150-250ms)
- **Consistency**: Unified design language across all screens and components

## Design Tokens

All design tokens are centralized in `src/styles/design-tokens.ts` for consistency.

### Spacing

Use consistent spacing scale for all margins, padding, and gaps:

```typescript
xs: 0.25rem  // 4px
sm: 0.5rem   // 8px
md: 1rem     // 16px
lg: 1.5rem   // 24px
xl: 2rem     // 32px
2xl: 3rem    // 48px
3xl: 4rem    // 64px
4xl: 6rem    // 96px
```

**Usage**: Always use the spacing scale. Avoid arbitrary values.

### Border Radius

Consistent rounded corners for a modern, friendly appearance:

```typescript
sm: 0.25rem   // 4px
md: 0.5rem    // 8px
lg: 0.75rem   // 12px
xl: 1rem      // 16px
2xl: 1.5rem   // 24px
full: 9999px  // Full circle
```

**Usage**: 
- Cards, buttons: `md` or `lg`
- Badges, pills: `full`
- Inputs: `md`

### Shadows

Soft, subtle shadows for depth and hierarchy:

```typescript
sm: Subtle elevation
md: Standard card elevation
lg: Modal/dialog elevation
xl: High elevation (rarely used)
```

**Usage**: 
- Cards: `shadow-sm` with `hover:shadow-md`
- Modals: `shadow-lg`
- Buttons: `shadow-sm` with `hover:shadow-md`

### Motion

All animations follow these principles:

**Duration**:
- Fast: 150ms (micro-interactions, hover states)
- Normal: 200ms (page transitions, component mounts)
- Slow: 250ms (complex animations, rarely used)

**Easing**:
- Default: `easeOut` for natural, responsive feel
- Spring: For playful, bouncy interactions (rarely used)

**Rules**:
1. Never exceed 250ms for standard interactions
2. Use `easeOut` for most animations
3. Page transitions: fade + slight upward motion (200ms)
4. Hover states: subtle scale (1.02) or shadow increase (150ms)
5. Loading states: pulse animation on skeletons

## Component Guidelines

### Buttons

- Use primary variant for main actions
- Use outline variant for secondary actions
- Use ghost variant for tertiary actions
- Always include hover and active states
- Disable state: 50% opacity, no pointer events

**Example**:
```tsx
<Button variant="default" size="default">
  Primary Action
</Button>
```

### Cards

- Always use subtle shadow (`shadow-sm`)
- Hover: increase shadow (`hover:shadow-md`)
- Consistent padding: `p-6` for content
- Rounded corners: `rounded-lg`

### Badges

- Use for status indicators
- Color coding:
  - Success: Green
  - Warning: Yellow
  - Error: Red
  - Default: Primary color
- Rounded: `rounded-full`

### Inputs

- Clear focus states with ring
- Consistent height: `h-10`
- Placeholder text: muted color
- Error states: red border + message

### Empty States

Always include:
- Icon (muted, large)
- Clear title
- Helpful description
- Optional CTA button

**Example**:
```tsx
<EmptyState
  icon={<Icon className="h-12 w-12" />}
  title="No items found"
  description="Get started by creating your first item."
  action={{
    label: "Create Item",
    onClick: handleCreate,
  }}
/>
```

### Loading States

- Use skeleton loaders for content areas
- Match skeleton shape to actual content
- Pulse animation (subtle)
- Show skeletons immediately, don't delay

**Example**:
```tsx
{isLoading ? (
  <Skeleton className="h-8 w-32" />
) : (
  <div>Content</div>
)}
```

## Motion Components

### PageTransition

Wrap page content for consistent page transitions:

```tsx
<PageTransition>
  {/* Page content */}
</PageTransition>
```

### FadeIn

Fade in content with optional delay:

```tsx
<FadeIn delay={0.1}>
  {/* Content */}
</FadeIn>
```

### SlideUp

Slide up with fade:

```tsx
<SlideUp delay={0.1} distance={20}>
  {/* Content */}
</SlideUp>
```

### StaggerList

Animate list items with stagger:

```tsx
<StaggerList>
  {items.map(item => <Item key={item.id} />)}
</StaggerList>
```

## Typography

### Headings

- h1: `text-3xl font-bold` - Page titles
- h2: `text-2xl font-semibold` - Section titles
- h3: `text-xl font-semibold` - Subsection titles

### Body Text

- Default: `text-base` (16px)
- Small: `text-sm` (14px)
- Muted: `text-muted-foreground` for secondary text

### Font Weights

- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Color Usage

### Semantic Colors

- Primary: Main actions, links, highlights
- Secondary: Secondary actions, backgrounds
- Muted: Placeholder text, secondary information
- Destructive: Delete, error actions
- Success: Success states, confirmations
- Warning: Warning states

### Text Colors

- Foreground: Primary text
- Muted Foreground: Secondary text, placeholders
- Always maintain WCAG AA contrast ratios

## Layout Patterns

### Page Structure

1. Page title and description (FadeIn)
2. Main content area (PageTransition)
3. Cards/grids (StaggerList for multiple items)

### Spacing Between Sections

- Between major sections: `space-y-6` or `space-y-8`
- Within components: `space-y-4`
- Tight grouping: `space-y-2`

## Accessibility

### Focus States

- All interactive elements must have visible focus indicators
- Use ring with offset: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order
- Escape key closes modals/dialogs

### Screen Readers

- Use semantic HTML
- Include ARIA labels where needed
- Provide alt text for icons when they convey meaning

## Dark Mode

- All components automatically support dark mode
- Test all components in both themes
- Maintain contrast ratios in both themes
- Use CSS variables for colors (never hardcode)

## Best Practices

1. **Consistency**: Use design tokens, not arbitrary values
2. **Subtlety**: Animations should enhance, not distract
3. **Feedback**: Always provide visual feedback for user actions
4. **Loading**: Show skeletons immediately, don't delay
5. **Empty States**: Always provide helpful empty states with CTAs
6. **Error States**: Clear error messages with actionable guidance
7. **Responsive**: Test on mobile, tablet, and desktop
8. **Accessibility**: Test with keyboard navigation and screen readers

## Examples

### Complete Page Example

```tsx
export default function ExamplePage() {
  return (
    <PageTransition className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
          <p className="text-muted-foreground mt-1">
            Page description
          </p>
        </div>
      </FadeIn>

      <StaggerList className="grid gap-4 md:grid-cols-2">
        {items.map(item => (
          <Card key={item.id}>
            {/* Card content */}
          </Card>
        ))}
      </StaggerList>
    </PageTransition>
  )
}
```

### Loading State Example

```tsx
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-96" />
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
) : (
  <ActualContent />
)}
```

