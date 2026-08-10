# EVOLIX OS — DESIGN.md

## 1. Purpose

This document defines the visual design system and layout rules for **Evolix OS**.

The uploaded Evolix OS dashboard screenshot is the **primary visual reference**.

The implementation should reproduce the same overall:

- page structure
- sidebar
- header
- spacing
- card layout
- typography hierarchy
- navigation behavior
- dashboard density
- light SaaS appearance
- icon treatment
- responsive behavior

Do not redesign the application into a different visual style unless explicitly requested.

---

# 2. DESIGN DIRECTION

## Product Character

Evolix OS should feel like a:

> **Premium, clean, modern agency operating system.**

It should feel professional enough for daily business operations while remaining simple enough for interns.

### Visual qualities

- Clean
- Light
- Minimal
- Premium
- Professional
- Spacious
- Structured
- Fast
- Business-focused

### Avoid

- Heavy gradients
- Neon colors
- Excessive glassmorphism
- Excessive rounded cards
- Huge decorative illustrations
- Excessive animation
- Dark enterprise/ERP styling
- Overly colorful dashboards
- Unnecessary visual decoration

---

# 3. PRIMARY REFERENCE

The reference dashboard uses this structure:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         TOP HEADER / SEARCH                              │
├───────────────┬─────────────────────────────────────────────────────────┤
│               │                                                         │
│   SIDEBAR     │                    PAGE CONTENT                         │
│               │                                                         │
│  EVOLIX OS    │  Greeting                                               │
│               │  Description                                            │
│  Dashboard    │                                                         │
│  Leads        │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│  Clients      │  │ KPI    │ │ KPI    │ │ KPI    │ │ KPI    │            │
│  Onboarding   │  └────────┘ └────────┘ └────────┘ └────────┘            │
│  Projects     │                                                         │
│  Team         │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│  Finance      │  │ KPI    │ │ KPI    │ │ KPI    │ │ KPI    │            │
│  Reports      │  └────────┘ └────────┘ └────────┘ └────────┘            │
│               │                                                         │
│               │  ┌──────────────────────────────┐ ┌──────────────────┐ │
│               │  │                              │ │                  │ │
│  USER PROFILE │  │       SALES OVERVIEW         │ │ NEEDS ATTENTION  │ │
│               │  │                              │ │                  │ │
│               │  └──────────────────────────────┘ └──────────────────┘ │
└───────────────┴─────────────────────────────────────────────────────────┘
```

This layout is the baseline for all application pages.

---

# 4. APPLICATION SHELL

## Desktop

The application uses a fixed left sidebar and a main content area.

### Sidebar

- Fixed to the left
- Full viewport height
- Approximately `256px` wide
- Dark navy background
- Right border
- Independent vertical scrolling for navigation if required

### Main area

- Starts after the sidebar
- Minimum height: viewport height
- Light background
- Top header remains visible while scrolling
- Content uses a centered/max-width layout where appropriate

### Reference dimensions

These are starting values, not hard restrictions:

```text
Sidebar:          256px
Header height:     64px
Main horizontal:   32px desktop
Main vertical:     24px
Card radius:       16px
Button radius:      8px
```

---

# 5. SIDEBAR

## Visual

The sidebar must closely follow the reference screenshot.

### Background

Use a deep navy/slate tone.

Suggested design token:

```css
--sidebar-background: #122238;
```

The exact value can be adjusted slightly to match the reference, but the sidebar must remain clearly darker than the main content.

### Border

Use a subtle darker/lighter navy border.

### Brand area

At the top:

```text
[ E ]  EVOLIX OS
       Agency operating system
```

The `E` mark is displayed inside a small rounded square/circle.

### Brand mark

- Evolix green/teal accent
- Approximately `36–40px`
- Rounded
- Bold `E`
- Clean, no gradient

---

# 6. SIDEBAR NAVIGATION

Navigation order is fixed:

1. Dashboard
2. Leads & Sales
3. Clients
4. Onboarding
5. Projects & Tasks
6. Team & Interns
7. Finance
8. Reports

Use the existing Lucide icon approach.

Recommended icons:

```text
Dashboard       LayoutDashboard
Leads & Sales   Target
Clients         Users
Onboarding      Handshake
Projects        FolderKanban
Team            UserCog
Finance         Wallet
Reports         BarChart3
```

Do not replace these with random icon styles.

---

# 7. SIDEBAR NAV ITEM

Each item:

- Full available width
- Approximately `40–44px` height
- Rounded corners
- Icon on left
- Label on right
- Consistent `12px` horizontal padding
- Approximately `12px` gap between icon and label

### Normal state

- Muted white/slate text
- Muted icon
- Transparent background

### Hover state

- Slightly lighter navy background
- Brighter text

### Active state

Match the screenshot:

- Rounded darker/lighter navy pill
- White/light label
- Accent-colored icon
- Clearly visible but not excessively bright

The active navigation item must be obvious.

---

# 8. SIDEBAR USER AREA

The bottom of the sidebar contains the logged-in user.

Reference structure:

```text
────────────────────────────
[ Q ]  qusaihaider1       [↪]
       CO-FOUNDER
```

### Requirements

Show:

- Avatar/initials
- Full name
- Role
- Logout icon

Role display:

```text
CO-FOUNDER
```

or

```text
INTERN
```

Use uppercase small text with letter spacing.

The profile section is separated from navigation with a subtle horizontal border.

---

# 9. TOP HEADER

The header matches the screenshot.

### Layout

```text
┌───────────────────────────────────────────────────────────┐
│ [ Search Evolix...          ⌘K ]                 [ Bell ] │
└───────────────────────────────────────────────────────────┘
```

### Requirements

- Height approximately `64px`
- White/light background
- Bottom border
- Sticky positioning on desktop
- Search on the left
- Notification bell on the right

---

# 10. GLOBAL SEARCH

The search field should look like the reference.

### Visual

- Light gray background
- Thin border
- Rounded pill
- Search icon
- Placeholder: `Search Evolix...`
- Keyboard shortcut badge on the right

Suggested width:

```text
400–430px desktop
```

It may become full-width on smaller screens.

The search should eventually support global records:

- Leads
- Clients
- Projects
- Tasks
- Team

Results must respect permissions.

---

# 11. NOTIFICATION BELL

Position:

**Top-right of header**

Use a Lucide bell icon.

Normal:

- Muted gray

Unread:

- Small notification indicator

Clicking opens a notification panel/dropdown.

Notifications must respect user permissions.

---

# 12. PAGE BACKGROUND

The content background should be a very light cool gray/off-white.

Suggested token:

```css
--background: #f8fafc;
```

Do not use pure white for the entire page.

Cards should stand out against the slightly tinted page background.

---

# 13. CONTENT WIDTH

The screenshot uses a wide dashboard with comfortable side margins.

Desktop content:

```text
width: calc(100% - sidebar)
padding: 32px
```

On very large screens, use a reasonable max-width if necessary.

Avoid content becoming excessively stretched.

---

# 14. PAGE HEADER / GREETING

Dashboard header follows the reference:

```text
Good afternoon, qusaihaider1

Here is where the business stands right now.
```

### Heading

Large, bold, dark navy/charcoal.

Approximate:

```text
32px desktop
font-weight: 700
```

### Description

Smaller muted text.

Approximate:

```text
14–16px
```

### Other pages

Use:

```text
Page Title
Short description
                     [Actions]
```

Example:

```text
Clients

Manage all Evolix client relationships.

                           + Add Client
```

---

# 15. TYPOGRAPHY

Typography must be clean and highly readable.

Use the project's configured font system.

Recommended hierarchy:

### Page title

```text
30–32px
700
```

### Section heading

```text
14–16px
600
```

### KPI number

```text
28–32px
700
```

### KPI label

```text
11–12px
500
uppercase
letter-spacing: 0.04–0.06em
```

### Body

```text
14px
400
```

### Small metadata

```text
11–12px
400–500
```

Avoid excessive font sizes.

---

# 16. COLOR SYSTEM

## Primary

Evolix accent:

```text
#0FBF9F
```

Use primarily for:

- Brand mark
- Active icons
- Positive business metrics
- Primary actions where appropriate
- Success states

## Sidebar

```text
#122238
```

## Main background

```text
#F8FAFC
```

## Card

```text
#FFFFFF
```

## Primary text

```text
#0F172A
```

## Secondary text

```text
#64748B
```

## Border

```text
#E2E8F0
```

## Success

```text
#16A34A
```

## Warning

```text
#F59E0B
```

## Danger

```text
#DC2626
```

Colors are design tokens and should be centralized.

Do not hard-code colors repeatedly inside components.

---

# 17. CARDS

The dashboard screenshot uses clean white cards with subtle borders/shadows.

### Card requirements

```text
background: white
border: 1px solid #E2E8F0
radius: 16px
```

Use a very subtle shadow.

Do not use heavy shadows.

### Hover

Only interactive cards should have hover elevation.

Non-interactive KPI cards should remain stable.

---

# 18. KPI / STAT CARDS

The screenshot uses a 4-column KPI grid.

Desktop:

```text
4 columns
```

Two rows of four cards for the main dashboard.

Example:

```text
┌──────────────┐
│ TOTAL LEADS  │
│ 12       ◎   │
│ 1 new        │
└──────────────┘
```

### KPI layout

Top:

- Small uppercase label
- Icon aligned right

Middle:

- Large value

Bottom:

- Small contextual hint

---

# 19. KPI CARD DATA

Co-Founder dashboard:

### Row 1

- Total Leads
- Active Clients
- Active Projects
- Pending Tasks

### Row 2

- Revenue Collected
- Expenses
- Net Profit
- Pending Payments

Use the reference screenshot as the visual arrangement.

---

# 20. FINANCIAL KPI COLORS

Financial values should use semantic colors.

### Revenue

Positive/green accent.

### Net Profit

Positive/green accent.

### Expenses

Neutral/dark text.

### Pending Payments

Danger/red.

Do not use color purely for decoration.

---

# 21. DASHBOARD GRID

The main dashboard uses:

```text
KPI GRID
4 columns × 2 rows

Then

CONTENT GRID
approximately 2/3 + 1/3
```

Example:

```text
┌────────────────────────────────────┐ ┌──────────────────────┐
│                                    │ │                      │
│          SALES OVERVIEW            │ │   NEEDS ATTENTION    │
│                                    │ │                      │
│                                    │ │                      │
└────────────────────────────────────┘ └──────────────────────┘
```

The left panel is larger.

The right panel is narrower.

---

# 22. SECTION CARD

Section cards use:

```text
White background
Subtle border
16px radius
```

Header:

```text
Title
Description
```

with a bottom border.

Example:

```text
Sales overview
Pipeline health
────────────────────────────────
content
```

---

# 23. SALES OVERVIEW

Match the reference.

The Sales Overview card contains smaller internal statistic cards.

Example:

```text
┌────────────┐ ┌────────────┐ ┌────────────┐
│ NEW        │ │ QUALIFIED  │ │ MEETINGS   │
│ 1          │ │ 2          │ │ 1          │
└────────────┘ └────────────┘ └────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐
│ PROPOSALS  │ │ WON        │ │ LOST       │
│ 1          │ │ 3          │ │ 1          │
└────────────┘ └────────────┘ └────────────┘
```

These internal cards should be lighter and flatter than the main KPI cards.

---

# 24. NEEDS ATTENTION

The right-side panel is a vertical alert list.

Each alert is a rounded white/light card.

Example:

```text
┌─────────────────────────────────────────┐
│ ⚠  Overdue payment from Nova Interiors  │
│    ₹50,000                               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠  Follow-up overdue: Rohit Sinha       │
│    (Sinha Realty)                        │
└─────────────────────────────────────────┘
```

### Severity

Danger:

- Red alert icon

Warning:

- Amber alert icon

Informational:

- Neutral/blue icon

Alerts should be clickable.

---

# 25. TABLE DESIGN

Tables throughout the system should follow the same visual language.

### Table

- White card container
- Horizontal borders
- Compact but readable rows
- 14px body text
- 11–12px metadata
- Hover row background
- Sticky header where appropriate

### Table columns

Do not make every column equally wide.

Important columns should receive more space.

---

# 26. STATUS PILLS

Use compact status badges.

Examples:

```text
NEW
QUALIFIED
WON
LOST
ACTIVE
ON HOLD
COMPLETED
OVERDUE
```

### Style

- Small
- Rounded
- Medium font weight
- Light semantic background
- Semantic text color

Do not use giant badges.

---

# 27. BUTTONS

Primary button:

- Evolix accent
- Dark/white text depending on contrast
- Medium height
- Rounded `8px`
- Semibold

Secondary button:

- White/light background
- Border
- Dark text

Danger:

- Red semantic treatment

Ghost:

- Transparent
- Hover background

Buttons should not be excessively rounded/pill-shaped unless specifically used for a compact control.

---

# 28. INPUTS

Inputs should match the screenshot's clean SaaS style.

- White background
- Thin gray border
- 8–10px radius
- 40–44px height
- Clear focus ring
- Comfortable horizontal padding

Focus state:

Use the Evolix accent subtly.

---

# 29. MODALS / DIALOGS

Use shadcn dialogs.

Design:

- White
- Rounded
- Clear heading
- Description
- Form content
- Footer actions

Do not create full-screen modal experiences on desktop unless necessary.

---

# 30. DROPDOWNS

Dropdowns should:

- Match card styling
- Have subtle border
- Have small shadow
- Have clear hover states
- Use compact spacing

---

# 31. KANBAN DESIGN

Leads & Sales should use a Kanban pipeline.

Columns:

```text
NEW
CONTACTED
QUALIFIED
MEETING
PROPOSAL SENT
NEGOTIATION
WON
LOST
```

Cards:

- Business name
- Contact
- Service
- Deal value
- Follow-up date
- Priority
- Assigned co-founder

Keep cards compact.

---

# 32. PROJECT & TASK DESIGN

Projects can use:

- Table view
- List view
- Kanban where useful

Tasks should clearly communicate:

```text
Task
Client
Project
Assignee
Priority
Deadline
Status
```

Interns should see a simplified task-first layout.

---

# 33. INTERN DASHBOARD DESIGN

The intern dashboard must use the same shell and visual language but remove financial information.

Suggested layout:

```text
Good afternoon, [Intern Name]

Here is what you need to focus on today.

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ CLIENTS│ │PROJECTS│ │PENDING │ │OVERDUE │
└────────┘ └────────┘ └────────┘ └────────┘

┌───────────────────────────────────────────┐
│ TODAY'S WORK                              │
│                                           │
│ Task       Client      Due      Priority  │
│ ...                                      │
└───────────────────────────────────────────┘

┌─────────────────────────────┐
│ MY PROGRESS                 │
└─────────────────────────────┘
```

No:

- Revenue
- Expenses
- Profit
- Payment values
- Company financial charts

---

# 34. FINANCE PAGE

Finance uses the same design system.

However, financial data should receive clear visual hierarchy.

Top:

```text
Revenue
Expenses
Net Profit
Pending Payments
```

Then:

```text
Revenue / Expense chart
Payment table
Expense table
Project profitability
```

Finance is only rendered for co-founders.

---

# 35. REPORTS PAGE

Reports should use clean dashboard-style cards and charts.

Avoid putting too many charts on one screen.

Use:

- KPI cards
- Line charts
- Bar charts
- Donut charts where useful
- Tables

Charts should support decisions, not decorate the page.

---

# 36. CHART STYLE

Use Recharts.

Charts should:

- Have minimal grid lines
- Use Evolix accent/semantic colors
- Have readable labels
- Have tooltips
- Have legends only when needed
- Avoid unnecessary 3D effects

Do not use pie/donut charts for datasets with many categories.

---

# 37. ICON RULE

Use **Lucide React** consistently.

Icons should generally be:

```text
16px
18px
20px
```

Do not mix multiple icon libraries.

Do not use emojis as UI icons.

---

# 38. ANIMATION

Animation should be subtle.

Allowed:

- Button hover
- Card hover
- Dropdown opening
- Dialog opening
- Sidebar transitions
- Loading skeletons

Avoid:

- Large page transitions
- Bouncing UI
- Excessive motion
- Decorative animation

The product should feel fast.

---

# 39. RESPONSIVE DESIGN

## Desktop

Primary design target.

Sidebar visible.

4-column KPI grid.

Two-column dashboard content.

## Tablet

Sidebar may collapse.

KPI grid becomes 2 columns.

## Mobile

Sidebar becomes drawer.

KPI grid becomes 1 column or 2 columns depending on width.

Dashboard panels stack vertically.

Tables may become:

- horizontally scrollable
- card/list based where appropriate

Never allow content to overflow the viewport horizontally unnecessarily.

---

# 40. MOBILE SIDEBAR

On mobile:

- Sidebar hidden by default
- Hamburger button opens drawer
- Dark overlay behind drawer
- Drawer contains full navigation
- Close button at top
- User section remains at bottom

Match the existing application shell behavior.

---

# 41. SPACING SYSTEM

Use Tailwind spacing consistently.

Preferred rhythm:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
```

Avoid arbitrary spacing values unless needed for visual matching.

---

# 42. BORDER RADIUS

Use a consistent radius hierarchy.

```text
Cards:       16px
Inputs:       8–10px
Buttons:      8px
Small pills: 9999px
Avatar:      50%
```

Avoid making every component a pill.

---

# 43. SHADOWS

Use subtle shadows only.

Primary card:

```text
very low elevation
```

Hover:

```text
slightly increased elevation
```

Dialogs/dropdowns:

```text
moderate elevation
```

Avoid strong black shadows.

---

# 44. SCROLLING

Desktop:

- Sidebar can scroll independently
- Main page scrolls normally
- Header remains sticky

Long tables:

- May use internal horizontal scrolling
- Avoid nested vertical scroll containers unless necessary

---

# 45. ACCESSIBILITY

The visual design must support:

- Keyboard focus
- Clear focus rings
- Accessible labels
- Good contrast
- Tooltips for unfamiliar icons
- Buttons with accessible names
- Proper form error states

Do not use color alone to communicate status.

---

# 46. EMPTY STATES

Use the same `EmptyState` visual pattern throughout the application.

Example:

```text
          [icon]

      No active projects

  Create a project to start tracking
        client delivery.

          [Create Project]
```

Keep empty states concise.

---

# 47. LOADING STATES

Use skeletons matching the final layout.

Do not use a single full-page spinner for normal data loading.

Example:

KPI skeleton:

```text
┌──────────────────┐
│ ███████          │
│ █████            │
│ ████████         │
└──────────────────┘
```

---

# 48. ERROR STATES

Errors should appear close to the affected content.

Example:

```text
Unable to load projects.

[Try Again]
```

Avoid technical error messages.

---

# 49. TOASTS

Use toast notifications for short-lived actions:

- Saved successfully
- Task assigned
- Client created
- Payment recorded
- File uploaded

Do not use toasts for important information that must remain visible.

---

# 50. PAGE CONSISTENCY

Every module must use the same:

- Sidebar
- Header
- Typography
- Cards
- Buttons
- Inputs
- Tables
- Status badges
- Spacing
- Responsive rules

A user should feel that every page belongs to the same product.

---

# 51. COMPONENT REUSE

Use shared components where possible.

Existing shared components include:

```text
AppShell
AppSidebarNav
SidebarBrand
GlobalSearch
NotificationBell
PageHeader
StatCard
SectionCard
EmptyState
Pill
```

Do not duplicate these components unnecessarily.

Extend them when appropriate.

---

# 52. DESIGN IMPLEMENTATION RULE

When a visual decision is unclear, prioritize:

1. Uploaded reference screenshot
2. This DESIGN.md
3. Existing Evolix component system
4. shadcn/ui conventions
5. General SaaS best practices

Do not introduce a new visual direction without approval.

---

# 53. DASHBOARD REFERENCE — FINAL

The dashboard should visually follow this hierarchy:

```text
SIDEBAR
│
├── EVOLIX OS
├── Agency operating system
│
├── Dashboard
├── Leads & Sales
├── Clients
├── Onboarding
├── Projects & Tasks
├── Team & Interns
├── Finance
├── Reports
│
└── Logged-in User


MAIN
│
├── TOP HEADER
│   ├── Global Search
│   └── Notifications
│
├── GREETING
│
├── KPI GRID
│   ├── Total Leads
│   ├── Active Clients
│   ├── Active Projects
│   ├── Pending Tasks
│   ├── Revenue
│   ├── Expenses
│   ├── Net Profit
│   └── Pending Payments
│
└── LOWER GRID
    ├── Sales Overview
    └── Needs Attention
```

This is the canonical Evolix OS dashboard layout.

---

# 54. FINAL DESIGN RULE

The screenshot is not merely inspiration.

It is the **visual baseline** for Evolix OS.

When implementing or modifying the application:

> **Keep the same layout, hierarchy, spacing, visual density, sidebar behavior, card treatment, header structure, and overall visual language.**

Improvements are allowed only when they preserve the same design system and improve usability.

Do not redesign the product from scratch.

---

# 55. DESIGN NORTH STAR

Evolix OS should look like:

> **A premium, modern, clean SaaS operating system built specifically for a digital agency.**

The interface should be:

**Simple enough for interns.**

**Powerful enough for co-founders.**

**Clean enough for daily use.**

**Consistent enough to scale.**
