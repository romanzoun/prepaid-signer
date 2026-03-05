# Figma Make Guidelines - SDX Design System

## Design System Rules

**Use SDX (Swisscom Design System) for all design decisions.**

- Colors: Only use SDX color tokens (never hardcode hex values)
- Spacing: Follow 8px grid system using SDX spacing tokens
- Typography: Use TheSans font family with SDX font tokens
- Components: Use SDX component patterns and structures
- All styling must reference SDX tokens, not custom values

---

## Layout & Structure

### Responsive Design
- Mobile-first approach
- Breakpoints: Mobile (360px), Tablet (768px), Desktop (1024px+)
- Max container width: 1440px
- Use flexbox/grid layouts (not absolute positioning)

### Grid System
- 12-column grid
- Gutter: 16px mobile, 24px tablet, 32px desktop
- Page padding: 16px mobile, 24px tablet, 32px desktop

### Spacing Scale (8px base)
Use SDX spacing tokens:
- `{sdx.spacing.1}` → 4px (micro adjustments)
- `{sdx.spacing.2}` → 8px (tight spacing)
- `{sdx.spacing.3}` → 16px (default element spacing)
- `{sdx.spacing.4}` → 24px (section spacing)
- `{sdx.spacing.5}` → 32px (component spacing)
- `{sdx.spacing.6}` → 64px (large spacing)
- `{sdx.spacing.7}` → 80px (extra large spacing)

---

## Typography

### Font Family
- Primary: TheSans (all UI text)
- Fallback: sans-serif

### Font Weights
- Regular (400): Body text, default
- Semibold (600): Emphasis, subheadings
- Bold (700): Headings, strong emphasis

### Type Scale

**Display (Large screens only):**
- XL: 104px / 112px line-height (desktop), 80px / 88px (mobile)
- L: 80px / 88px (desktop), 64px / 72px (mobile)
- M: 64px / 72px (desktop), 48px / 56px (mobile)
- S: 48px / 56px (desktop), 40px / 48px (mobile)

**Headings:**
- XXL: 40px / 48px (desktop), 32px / 40px (mobile)
- XL: 32px / 40px (desktop), 28px / 36px (mobile)
- L: 28px / 36px (desktop), 24px / 32px (mobile)
- M: 24px / 32px (desktop), 20px / 28px (mobile)
- S: 20px / 28px (both)
- XS: 18px / 24px (both)

**Body:**
- Base: 16px / 24px (default body text)
- Small: 14px / 20px (secondary text)
- XSmall: 12px / 16px (captions, labels)

### Text Styles
- Headings: Semibold (600) or Bold (700)
- Body: Regular (400)
- Labels: Semibold (600)
- Captions: Regular (400)

---

## Colors

### Brand Colors (Primary palette)
- Navy 800: `{color.navy.800}` (#001155) - Primary brand color
- Blue 800: `{color.blue.800}` (#0445C8) - Interactive elements
- Turquoise 800: `{color.turquoise.800}` - Accent

### Semantic Colors (Use these in components)

**Surface (Backgrounds):**
- `{sdx.color.surface.default}` - Default background (white)
- `{sdx.color.surface.ui.1}` - Subtle background (light gray)
- `{sdx.color.surface.ui.2}` - Distinct background (medium gray)
- `{sdx.color.surface.interaction.default}` - Interactive default (blue)
- `{sdx.color.surface.interaction.hover}` - Interactive hover
- `{sdx.color.surface.interaction.active}` - Interactive pressed

**Text:**
- `{sdx.color.text.heading}` - Headings (navy/black)
- `{sdx.color.text.body}` - Body text (dark gray)
- `{sdx.color.text.secondary}` - Secondary text (medium gray)
- `{sdx.color.text.inverse}` - Text on dark backgrounds (white)
- `{sdx.color.text.disabled}` - Disabled text

**Borders:**
- `{sdx.color.border.ui.1}` - Subtle borders
- `{sdx.color.border.ui.2}` - Default borders
- `{sdx.color.border.interaction.default}` - Interactive borders (blue)
- `{sdx.color.border.error.emphasis}` - Error borders (red)

**Status Colors:**
- Success: `{color.green.800}` - Positive actions, confirmations
- Warning: `{color.orange.800}` - Warnings, important info
- Error: `{color.red.800}` - Errors, destructive actions
- Info: `{color.blue.800}` - Informational messages

---

## Components

### Button
**SDX Component:** [Button in SDX Components](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=51616-807972)

**Variants:**
- **Primary**: Main call-to-action
  - Background: `{sdx.color.surface.interaction.default}`
  - Text: `{sdx.color.text.inverse}`
  - Hover: `{sdx.color.surface.interaction.hover}`

- **Secondary**: Alternative actions
  - Background: transparent
  - Border: 2px `{sdx.color.border.interaction.default}`
  - Text: `{sdx.color.surface.interaction.default}`
  - Hover: Background `{sdx.color.surface.ui.1}`

- **Tertiary**: Subtle actions
  - Background: transparent
  - Text: `{sdx.color.surface.interaction.default}`
  - Hover: Background `{sdx.color.surface.ui.1}`

**Styling:**
- Font-size: 14px
- Font-weight: 600 (semibold)
- Padding: 8px (vertical) × 24px (horizontal)
- Border-radius: `{sdx.border.radius.small}` (4px)
- Min-height: 40px

**States:**
- Default: As defined above
- Hover: Background/border color changes
- Active/Pressed: Slightly darker than hover
- Disabled: Opacity 0.5, not clickable
- Focus: 2px outline `{sdx.color.border.interaction.default}`

**Usage:**
- One primary button per screen/section
- Label should be action-oriented ("Save", "Submit", "Continue")
- Icon optional (16px, left or right of text)

### Input Field
**SDX Component:** [Input Field in SDX Components](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=9727-12503)

**Structure:**
- Label above field (14px, semibold)
- Input field
- Helper text below (optional, 12px)
- Error message below (if invalid, 12px, red)

**Styling:**
- Border: 1px `{sdx.color.border.ui.2}`
- Background: `{sdx.color.surface.default}`
- Text: 16px `{sdx.color.text.body}`
- Padding: 12px (vertical) × 16px (horizontal)
- Border-radius: `{sdx.border.radius.small}` (4px)
- Min-height: 48px

**States:**
- Default: Gray border
- Focus: Border `{sdx.color.border.interaction.default}`, 2px
- Error: Border `{sdx.color.border.error.emphasis}`, show error message
- Disabled: Background `{sdx.color.surface.ui.2}`, reduced opacity
- Read-only: Background `{sdx.color.surface.ui.1}`, no hover

### Card
**SDX Component:** [Card in SDX Components](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=8071-8570)

**Structure:**
- Container with padding
- Optional image/media at top
- Content area (title, description, metadata)
- Optional actions at bottom

**Styling:**
- Background: `{sdx.color.surface.ui.1}`
- Border: 1px `{sdx.color.border.ui.2}` (optional)
- Border-radius: `{sdx.border.radius.medium}` (8px)
- Padding: `{sdx.spacing.4}` (24px)
- Shadow: `{sdx.boxShadow.default}` (optional)

**Hover state (if clickable):**
- Shadow: `{sdx.boxShadow.hover}`
- Cursor: pointer

### Navigation
**SDX Component:** [Navigation Header in SDX Components](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=33045-9264) | [Tab Navigation](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=58652-625)

**Header:**
- Background: `{sdx.color.surface.default}` or `{sdx.color.surface.ui.1}`
- Height: 64px desktop, 56px mobile
- Logo: Left aligned
- Nav items: Horizontal on desktop, hamburger menu on mobile
- Padding: `{sdx.spacing.4}` horizontal

**Tab Navigation:**
- Active tab: Underline 2px `{sdx.color.border.interaction.default}`
- Inactive tab: `{sdx.color.text.secondary}`
- Hover: `{sdx.color.text.body}`
- Spacing between tabs: `{sdx.spacing.4}`

---

## Navigation Rules

Define how screens connect and navigation flows:

### Primary Navigation
- Logo click → Always returns to Home screen
- Back button → Previous screen in history
- Close button (modals/overlays) → Returns to screen before modal opened

### Screen Flow
- Login screen → Home screen (after successful login)
- Home screen → Product detail (click product card)
- Product detail → Checkout (click "Add to cart" then "Checkout")
- Form completion → Confirmation screen

### URL Structure (if applicable)
- Home: `/`
- Products: `/products`
- Product Detail: `/products/[id]`
- Profile: `/profile`

---

## Interactions & Behaviors

### Hover States
- All interactive elements (buttons, links, cards) must have hover states
- Buttons: Background color change (see Button component)
- Links: Underline appears
- Cards: Subtle shadow increase (if clickable)
- Cursor changes to pointer on all interactive elements

### Click/Tap Actions
- Provide visual feedback (active state)
- Brief animation (100-200ms) on click
- Navigate immediately or show loading state if processing

### Focus States
- All interactive elements must have visible focus indicators
- Focus ring: 2px `{sdx.color.border.interaction.default}` with 2px offset
- Focus order follows logical reading order (top to bottom, left to right)

### Animations & Transitions
- Use sparingly and purposefully
- Duration: 200-300ms for most transitions
- Easing: ease-in-out for smooth feel
- Examples:
  - Button hover: 200ms ease-in-out
  - Screen transition: 300ms ease-in-out
  - Modal open/close: 250ms ease-in-out
  - Loading states: 400ms ease-in-out

---

## Form Behavior & Validation

### Input Validation
- Validate on blur (when user leaves field)
- Show error state immediately if invalid
- Show success indicator (green checkmark) if valid

### Error Messages
- Display below the input field
- Color: `{sdx.color.text.error}`
- Font-size: 12px
- Include specific reason: "Email must include @" not just "Invalid"

### Required Fields
- Mark with asterisk (*) in label
- Prevent form submission until all required fields valid

### Form Submission
1. User clicks Submit button
2. Validate all fields
3. If invalid: Show errors, focus first error field, keep Submit enabled
4. If valid: Disable Submit, show loading state (spinner on button)
5. On success: Show success message, navigate to confirmation
6. On error: Show error message, re-enable Submit

### Form States
- Empty: Default state, no validation
- Filling: User typing, no validation yet
- Valid: Green checkmark, ready to submit
- Invalid: Red border + error message
- Submitting: Loading spinner, button disabled
- Success: Confirmation message + navigation
- Error: Error message, allow retry

---

## State Management

### Loading States
**SDX Component:** [Spinner in SDX Components](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=6567-6810)

- Show spinner component for async operations
- Position: Centered in container or on button
- Never leave user wondering if something is happening
- Minimum display time: 400ms (avoid flicker)

### Empty States
- When no data/content available
- Display: Icon + Message + Optional action button
- Message should be helpful: "No items yet. Add your first item!" not "Empty"
- Provide clear next action

### Error States
- When operation fails
- Display: Error icon + Message + Retry button (if applicable)
- Message: Specific and actionable: "Connection failed. Please try again." not "Error"
- Color: `{color.red.800}`

### Success States
- When operation succeeds
- Display: Success icon (checkmark) + Message
- Auto-dismiss after 3-5 seconds (optional)
- Or require user confirmation to proceed
- Color: `{color.green.800}`

### Disabled States
- For buttons/inputs that are temporarily unavailable
- Visual: Reduced opacity (0.5) + not clickable
- Always provide context why disabled (tooltip or helper text)

---

## Data & Content

### Mock Data Structure
Use realistic sample data for prototyping:

**User:**
```json
{
  "name": "Sophie Hauser",
  "email": "sophie.hauser@bluewin.ch",
  "phone": "+41 79 123 45 67",
  "avatar": "[placeholder image]"
}
```

**Product:**
```json
{
  "id": "prod_001",
  "name": "Product Name",
  "description": "Brief product description text",
  "price": "CHF 99.00",
  "image": "[placeholder image]",
  "category": "Category Name"
}
```

### Content Guidelines
- Use Swiss German format for dates: DD.MM.YYYY
- Currency: CHF with space: "CHF 99.50" or "CHF 99.–"
- Phone: +41 format: "+41 79 123 45 67"
- Names: Use Swiss names (e.g., Müller, Meier, Hauser)
- Addresses: Swiss format (Street Number, PLZ City)

### Placeholder Text
- Use realistic content, not "Lorem ipsum"
- Keep text length reasonable (real-world length)
- For images: Use colored placeholders with dimensions noted
- Don't use ß but ss.

### API Simulation
- Mock API calls with 2-second delay
- 90% success rate, 10% error (for testing error states)
- Return structured JSON data

---

## Accessibility

### WCAG 2.1 Level AA Compliance
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Interactive elements: Minimum 44×44px touch target (mobile)
- Focus indicators: Always visible and clear
- Keyboard navigation: All functionality keyboard accessible

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Form labels properly associated with inputs
- Buttons vs Links: Buttons for actions, links for navigation

### Screen Reader Support
- Alt text for all meaningful images
- Aria labels for icon-only buttons
- Status messages announced by screen reader
- Skip to main content link

---

## Border & Shadow Tokens

### Border Radius
- Small: `{sdx.border.radius.small}` (4px) - Buttons, inputs
- Medium: `{sdx.border.radius.medium}` (8px) - Cards, containers
- Large: `{sdx.border.radius.large}` (12px) - Large cards
- XLarge: `{sdx.border.radius.xlarge}` (20px) - Special elements
- Full: `{sdx.border.radius.full}` (80px) - Pills, avatars

### Border Width
- Thin: `{sdx.border.width.thin}` (1px) - Default borders
- Medium: `{sdx.border.width.medium}` (2px) - Focus states, emphasis
- Thick: `{sdx.border.width.thick}` (4px) - Strong emphasis

### Box Shadows
- Default: `{sdx.boxShadow.default}` - Subtle elevation
- Hover: `{sdx.boxShadow.hover}` - Increased elevation on hover
- None: No shadow for flat design

---

## Further SDX Components

These components are available in SDX and should be used when needed:

| Component | Figma Link |
|-----------|------------|
| Checkbox | [SDX Checkbox](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=17841-22612) |
| Radio Button | [SDX Radio Button](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=26003-28571) |
| Toggle / Switch | [SDX Toggle](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=583-74) |
| Dropdown / Select | [SDX Dropdown](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=2675-5259) |
| Modal / Dialog | [SDX Modal](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=9637-11714) |
| Toast / Notification | [SDX Toast](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=31541-84) |
| Badge | [SDX Badge](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=9863-11450) |
| Accordion | [SDX Accordion](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=37958-289) |
| Tooltip | [SDX Tooltip](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=583-56) |
| Loading Bar | [SDX Loading Bar](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=1115-274) |
| Tag / Chip | [SDX Tag](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=21694-23398) |
| Link | [SDX Link](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=1042-232) |
| Stepper | [SDX Stepper](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=26108-28015) |
| Search | [SDX Search](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=1046-284) |
| Status Indicator | [SDX Status](https://www.figma.com/design/q16FIcxqRqmfpYVf3rOolF/SDX-Components?node-id=33459-30621) |

---



### DO:
- Always use SDX design tokens (never hardcode values)
- Follow 8px spacing grid
- Maintain responsive layouts (mobile-first)
- Provide clear visual feedback for all interactions
- Test on multiple screen sizes
- Keep accessibility in mind

### DON'T:
- Don't hardcode colors, spacing, or typography values
- Don't use absolute positioning (use flexbox/grid)
- Don't create custom components when SDX component exists
- Don't skip hover/focus/disabled states
- Don't forget loading/error/empty states
- Don't use decorative images without alt text

---

**Remember:** This is the Swisscom Design System. Consistency across all Swisscom digital products is critical. When in doubt, follow SDX standards strictly.
