# User Tour/Guidance System

This document describes the comprehensive user tour and guidance system implemented in the application. The system allows you to create guided tours that can navigate users through sequences, switch between pages, and highlight specific elements.

## Features

### Core Functionality
- **Step-by-step guidance** with visual highlighting
- **Automatic page navigation** during tours
- **Element highlighting** with spotlight effects
- **Progress tracking** and completion status
- **Role-based tours** (admin vs user)
- **Tour persistence** (completed/skipped tours stored in localStorage)
- **Responsive design** with mobile-friendly tooltips

### Visual Elements
- **Spotlight overlay** with animated borders
- **Tooltip positioning** (top, bottom, left, right, center)
- **Progress indicators** showing tour completion
- **Smooth animations** and transitions
- **Responsive tooltips** that adapt to viewport

## Architecture

### Components

#### 1. TourContext (`contexts/TourContext.tsx`)
The main context provider that manages tour state and provides tour functionality.

**Key Features:**
- Tour state management (active, current step, progress)
- Tour execution (start, next, previous, pause, resume, stop)
- Element visibility detection
- Automatic scrolling to elements
- Action execution (navigate, click, wait, scroll)

#### 2. TourOverlay (`components/TourOverlay.tsx`)
The visual overlay component that renders the spotlight and tooltips.

**Key Features:**
- Spotlight effect with animated borders
- Tooltip positioning and content display
- Progress bar and step indicators
- Navigation controls (previous, next, skip, exit)
- Responsive positioning

#### 3. TourLauncher (`components/TourLauncher.tsx`)
Component for launching tours with different UI variants.

**Variants:**
- `button` - Dropdown button with tour list
- `dropdown` - Select dropdown for tour selection
- `modal` - Full modal with detailed tour information

#### 4. TourDemo (`components/TourDemo.tsx`)
Demo component showing available tours and current tour status.

## Tour Definition

Tours are defined in the `TourContext.tsx` file. Each tour consists of:

```typescript
interface Tour {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Tour description
  steps: TourStep[];            // Array of tour steps
  category?: 'onboarding' | 'feature' | 'admin' | 'user';
  requiredRole?: 'admin' | 'user' | 'any';
  estimatedDuration?: number;    // Duration in minutes
}
```

### Tour Steps

Each step defines what the user should see and do:

```typescript
interface TourStep {
  id: string;                    // Unique step identifier
  target: string;               // CSS selector for element to highlight
  title: string;                // Step title
  content: string;              // Step description
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'wait' | 'navigate' | 'scroll';
  actionTarget?: string;        // Target for actions
  actionData?: any;             // Additional action data
  waitTime?: number;            // Wait duration in ms
  requiredView?: string;        // Required page/view
  skipIfNotFound?: boolean;     // Skip if target not found
  beforeStep?: () => void;      // Pre-step function
  afterStep?: () => void;       // Post-step function
}
```

## Predefined Tours

### 1. Welcome Tour (`welcome-tour`)
- **Target**: New users
- **Duration**: ~3 minutes
- **Steps**: 4
- **Features**: App overview, subscription cards, help system, user menu

### 2. Admin Tour (`admin-tour`)
- **Target**: Admin users
- **Duration**: ~5 minutes
- **Steps**: 5
- **Features**: Training management, user management, voucher system

### 3. Attendance Tour (`attendance-tour`)
- **Target**: All users
- **Duration**: ~4 minutes
- **Steps**: 3
- **Features**: Attendance marking, kiosk mode

## Integration

### Adding Tour Data Attributes

To make elements highlightable in tours, add `data-tour` attributes:

```tsx
<button data-tour="nav-trainings">Trainings</button>
<div data-tour="subscription-cards">...</div>
<form data-tour="create-training-form">...</form>
```

### Using the Tour System

#### Starting a Tour
```tsx
import { useTour } from '../contexts/TourContext';

const { startTour } = useTour();
await startTour('welcome-tour');
```

#### Checking Tour State
```tsx
const { state } = useTour();
if (state.isActive) {
  // Tour is running
  console.log('Current tour:', state.currentTour?.name);
  console.log('Current step:', state.currentStepIndex);
  console.log('Progress:', state.progress);
}
```

#### Adding Tour Launcher
```tsx
import { TourLauncher } from './components/TourLauncher';

// Button variant
<TourLauncher variant="button" />

// Dropdown variant
<TourLauncher variant="dropdown" />

// Modal variant
<TourLauncher variant="modal" />
```

## Customization

### Creating Custom Tours

1. **Define the tour** in `TourContext.tsx`:
```typescript
const customTour: Tour = {
  id: 'custom-tour',
  name: 'Custom Feature Tour',
  description: 'Learn about custom features',
  category: 'feature',
  requiredRole: 'any',
  estimatedDuration: 2,
  steps: [
    {
      id: 'step-1',
      target: '[data-tour="custom-element"]',
      title: 'Custom Element',
      content: 'This is a custom element you should know about.',
      position: 'top'
    }
  ]
};
```

2. **Add to TOURS array** in `TourContext.tsx`

3. **Add data attributes** to target elements:
```tsx
<div data-tour="custom-element">Custom content</div>
```

### Styling Customization

The tour system uses Tailwind CSS classes. You can customize:

- **Spotlight color**: Modify border colors in `TourOverlay.tsx`
- **Tooltip styling**: Update classes in the tooltip section
- **Animation effects**: Modify CSS animations and transitions

### Action Types

#### Navigation Actions
```typescript
{
  action: 'navigate',
  actionTarget: 'trainings', // View name
  requiredView: 'public'     // Current view requirement
}
```

#### Click Actions
```typescript
{
  action: 'click',
  actionTarget: '[data-tour="some-button"]'
}
```

#### Wait Actions
```typescript
{
  action: 'wait',
  waitTime: 2000 // milliseconds
}
```

#### Scroll Actions
```typescript
{
  action: 'scroll',
  target: '[data-tour="target-element"]'
}
```

## Best Practices

### Tour Design
1. **Keep tours short** - 3-5 steps maximum
2. **Use clear, actionable language** in step content
3. **Test on different screen sizes** for responsive behavior
4. **Provide skip options** for experienced users
5. **Group related features** in single tours

### Element Targeting
1. **Use specific selectors** - prefer IDs or data attributes
2. **Avoid fragile selectors** - don't rely on CSS classes that might change
3. **Test element visibility** - ensure targets are accessible
4. **Handle missing elements** - use `skipIfNotFound` when appropriate

### Performance
1. **Limit tour complexity** - avoid too many steps
2. **Use efficient selectors** - prefer `getElementById` over complex queries
3. **Debounce scroll events** - prevent excessive position updates
4. **Clean up event listeners** - proper cleanup in useEffect

## Troubleshooting

### Common Issues

#### Tour Not Starting
- Check if target elements exist
- Verify `data-tour` attributes are present
- Ensure required view is correct

#### Elements Not Highlighting
- Verify CSS selectors are correct
- Check if elements are visible in viewport
- Ensure elements have proper dimensions

#### Navigation Not Working
- Verify view names match expected values
- Check if navigation events are properly dispatched
- Ensure required permissions for view access

#### Performance Issues
- Reduce number of tour steps
- Optimize CSS selectors
- Check for memory leaks in event listeners

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('tour-debug', 'true');
```

This will log detailed information about tour execution, element detection, and navigation events.

## Future Enhancements

### Planned Features
- **Tour analytics** - Track completion rates and user behavior
- **A/B testing** - Compare different tour versions
- **Dynamic tours** - Generate tours based on user behavior
- **Video integration** - Embed video content in tour steps
- **Accessibility improvements** - Better screen reader support
- **Tour templates** - Reusable tour patterns
- **Multi-language support** - Localized tour content

### API Extensions
- **Tour import/export** - Share tours between environments
- **Remote tour management** - Update tours without code changes
- **User feedback** - Collect tour experience feedback
- **Tour scheduling** - Show tours at specific times or conditions
