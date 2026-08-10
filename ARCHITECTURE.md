# EVOLIX OS — ARCHITECTURE.md

## 1. Purpose

This document defines the technical architecture of **Evolix OS**.

Evolix OS is an internal agency operating system / CRM used by the three Evolix co-founders and interns.

The architecture must remain:

- Simple
- Secure
- Modular
- Maintainable
- Scalable
- Easy for AI coding agents and developers to understand

The application is a **single web application**, not a collection of microservices.

---

# 2. ARCHITECTURE PRINCIPLE

Use a modular monolith.

```text
                         EVOLIX OS
                             │
                    ┌────────┴────────┐
                    │                 │
                 FRONTEND          BACKEND
                    │                 │
                 Next.js         Server Actions
                 React           / API Routes
                    │                 │
                    │          Authentication
                    │                 │
                    │          Authorization
                    │                 │
                    │          Validation
                    │                 │
                    │          Business Logic
                    │                 │
                    └────────┬────────┘
                             │
                           Prisma
                             │
                        PostgreSQL
```

Do not introduce microservices for the MVP.

---

# 3. TECHNOLOGY STACK

The architecture uses the following stack.

## Frontend

```text
TypeScript
React
Next.js
Tailwind CSS
shadcn/ui
Lucide React
React Hook Form
Zod
Recharts
```

## Backend

```text
Next.js Server Actions
Next.js Route Handlers / API Routes
TypeScript
Zod
Prisma
```

## Database

```text
PostgreSQL
```

## Authentication

```text
Auth.js
```

## File Storage

```text
Cloudinary
```

## Version Control

```text
Git
GitHub
```

---

# 4. APPLICATION TYPE

Evolix OS is a:

**Next.js full-stack application**

The frontend and backend live in the same repository.

```text
Browser
   │
   ▼
Next.js
   ├── UI
   ├── Server Components
   ├── Client Components
   ├── Server Actions
   └── Route Handlers
          │
          ▼
       Services
          │
          ▼
       Prisma
          │
          ▼
     PostgreSQL
```

---

# 5. HIGH-LEVEL SYSTEM

```text
┌──────────────────────────────────────────────────────────────┐
│                        EVOLIX OS                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    PRESENTATION                         │  │
│  │                                                        │  │
│  │ Dashboard │ Leads │ Clients │ Projects │ Finance ...  │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │                 APPLICATION LAYER                       │  │
│  │                                                        │  │
│  │ Validation │ Authorization │ Services │ Calculations  │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │                    DATA LAYER                           │  │
│  │                                                        │  │
│  │                  Prisma ORM                            │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │                   PostgreSQL                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 6. PROJECT STRUCTURE

Recommended project structure:

```text
evolix-os/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── ...
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── clients/
│   │   ├── onboarding/
│   │   ├── projects/
│   │   ├── team/
│   │   ├── finance/
│   │   └── reports/
│   │
│   ├── api/
│   │   └── ...
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── leads/
│   ├── clients/
│   ├── onboarding/
│   ├── projects/
│   ├── team/
│   ├── finance/
│   └── reports/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── permissions/
│   ├── validation/
│   ├── services/
│   ├── calculations/
│   ├── notifications/
│   ├── storage/
│   └── utils/
│
├── actions/
│   ├── leads/
│   ├── clients/
│   ├── onboarding/
│   ├── projects/
│   ├── tasks/
│   ├── finance/
│   └── team/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│
├── types/
│
├── tests/
│
├── .env.example
├── DESIGN.md
├── RULES.md
├── PRD.md
├── ARCHITECTURE.md
├── README.md
├── package.json
└── tsconfig.json
```

---

# 7. APP ROUTING

Use Next.js App Router.

The main authenticated application lives under:

```text
app/(dashboard)/
```

Recommended routes:

```text
/dashboard

/leads
/leads/[id]

/clients
/clients/[id]

/onboarding
/onboarding/[id]

/projects
/projects/[id]
/projects/[id]/tasks

/team
/team/[id]

/finance
/finance/payments
/finance/expenses

/reports
```

---

# 8. AUTH ROUTES

Authentication routes are separated from the main dashboard.

Example:

```text
/login
/forgot-password
```

Authenticated users should be redirected into the dashboard.

Unauthenticated users must not access protected application routes.

---

# 9. ROUTE GROUPS

Use Next.js route groups to keep URL structure clean.

```text
app/
│
├── (auth)/
│
└── (dashboard)/
```

Route groups should not unnecessarily change URLs.

---

# 10. PRESENTATION LAYER

The presentation layer contains:

- Pages
- Layouts
- UI components
- Tables
- Forms
- Cards
- Charts
- Dialogs
- Navigation

Presentation components should not directly contain complex database logic.

---

# 11. SERVER COMPONENTS

Prefer React Server Components for:

- Initial page data
- Dashboard summaries
- Tables
- Reports
- Permission-aware server rendering

Use client components only where interactivity is required.

Examples:

```text
Forms
Dropdowns
Dialogs
Drag and drop
Charts requiring client state
Interactive filters
```

---

# 12. CLIENT COMPONENT RULE

Do not make entire pages client components just because one component requires interactivity.

Prefer:

```text
Server Page
   │
   ├── Server data
   │
   └── Client interactive component
```

instead of:

```text
Entire page = "use client"
```

---

# 13. SERVER ACTIONS

Use Server Actions for normal authenticated mutations where appropriate.

Examples:

```text
createLead()
updateLead()
convertLeadToClient()
createClient()
createProject()
createTask()
assignTask()
completeTask()
recordPayment()
recordExpense()
```

Every Server Action must:

1. Authenticate
2. Authorize
3. Validate
4. Execute business logic
5. Update database
6. Create activity log where appropriate
7. Trigger notification where appropriate
8. Return a safe result

---

# 14. API ROUTES

Use Route Handlers when an HTTP endpoint is genuinely required.

Examples:

- External integrations
- Webhooks
- File operations
- Future mobile client
- Third-party callbacks

Do not create API endpoints for every database operation automatically.

Prefer Server Actions for internal application mutations.

---

# 15. REQUEST FLOW

Every protected mutation follows:

```text
User action
     │
     ▼
Server Action / Route Handler
     │
     ▼
Get authenticated user
     │
     ▼
Check role
     │
     ▼
Check resource ownership/access
     │
     ▼
Validate input with Zod
     │
     ▼
Business service
     │
     ▼
Prisma
     │
     ▼
PostgreSQL
     │
     ├── Activity Log
     │
     └── Notification
     │
     ▼
Safe response
```

---

# 16. AUTHENTICATION ARCHITECTURE

Use Auth.js.

The authenticated session should provide enough information to identify:

```text
userId
name
email
role
```

Roles:

```text
CO_FOUNDER
INTERN
```

Do not rely on client-provided role values.

The backend must determine the authenticated user's actual role.

---

# 17. AUTHORIZATION ARCHITECTURE

Authorization is centralized.

Recommended:

```text
lib/permissions/
```

Example:

```text
canViewFinance(user)
canViewClient(user, clientId)
canEditClient(user, clientId)
canViewProject(user, projectId)
canEditTask(user, taskId)
canManageTeam(user)
```

Do not duplicate permission rules throughout components.

---

# 18. ROLE ACCESS MATRIX

```text
                    CO-FOUNDER       INTERN
------------------------------------------------
Dashboard              YES             YES
Leads & Sales          YES             LIMITED
Clients                YES             ASSIGNED
Onboarding             YES             ASSIGNED
Projects & Tasks       YES             ASSIGNED
Team & Interns         YES             LIMITED
Finance                YES             NO
Reports                YES             LIMITED
```

Intern access must be enforced server-side.

---

# 19. DATA ACCESS ARCHITECTURE

Never:

```text
Fetch everything
      ↓
Filter in browser
```

Correct:

```text
Authenticated User
      ↓
Permission-aware query
      ↓
Only authorized records
      ↓
Browser
```

Example:

```text
Intern
  ↓
getAssignedProjects(internId)
  ↓
PostgreSQL
  ↓
Only assigned projects
```

---

# 20. DATABASE LAYER

Prisma is the only application-level ORM used to communicate with PostgreSQL.

Recommended:

```text
lib/db/prisma.ts
```

Create a reusable Prisma client.

Do not instantiate multiple Prisma clients unnecessarily.

---

# 21. PRISMA ARCHITECTURE

Database schema lives in:

```text
prisma/schema.prisma
```

Migrations live in:

```text
prisma/migrations/
```

Seed data:

```text
prisma/seed.ts
```

---

# 22. CORE DATABASE DOMAIN

The primary domain model is:

```text
User
 │
 ├── Lead
 │
 ├── Client
 │
 ├── Project
 │      │
 │      └── Task
 │
 ├── ActivityLog
 │
 └── Notification


Lead
 │
 └── Client
       │
       ├── Onboarding
       │
       └── Project
              │
              ├── Tasks
              ├── Payments
              └── Expenses
```

---

# 23. EXPECTED CORE MODELS

The exact schema is defined separately in the database specification.

Expected models include:

```text
User
Lead
LeadActivity
Client
Onboarding
Project
ProjectMember
Task
TaskComment
TaskAttachment
Payment
Expense
Notification
ActivityLog
```

Additional supporting models may be introduced only when required.

---

# 24. DATABASE RELATIONSHIPS

Typical relationship:

```text
User
 ├── has many Leads
 ├── has many Clients
 ├── has many Projects
 ├── has many Tasks
 ├── has many Payments
 ├── has many Expenses
 ├── has many Notifications
 └── has many ActivityLogs


Client
 ├── has many Projects
 └── has one/many Onboarding records depending on workflow


Project
 ├── belongs to Client
 ├── has many Tasks
 ├── has many ProjectMembers
 ├── has many Payments
 └── has many Expenses


Task
 ├── belongs to Project
 ├── belongs to Client
 ├── assigned to User
 └── has many Comments
```

---

# 25. SERVICE LAYER

Business logic belongs in services.

Recommended:

```text
lib/services/
```

Example:

```text
lead.service.ts
client.service.ts
onboarding.service.ts
project.service.ts
task.service.ts
finance.service.ts
report.service.ts
team.service.ts
```

Services should orchestrate business operations.

---

# 26. SERVICE RESPONSIBILITY

Example:

```text
createProject()
```

may:

1. Validate business requirements
2. Verify client
3. Verify creator permissions
4. Create project
5. Assign members
6. Create activity log
7. Create notifications

The UI should not implement this workflow itself.

---

# 27. VALIDATION LAYER

Use Zod.

Recommended:

```text
lib/validation/
```

Example:

```text
lead.schema.ts
client.schema.ts
project.schema.ts
task.schema.ts
payment.schema.ts
expense.schema.ts
```

Schemas are shared where appropriate between form and server code.

Server validation remains mandatory.

---

# 28. CALCULATION LAYER

Business calculations must be centralized.

Recommended:

```text
lib/calculations/
```

Examples:

```text
profit.ts
pipeline.ts
project-progress.ts
dashboard.ts
```

---

# 29. FINANCIAL CALCULATION

Central rule:

```text
Net Profit = Revenue - Expenses
```

Project-level:

```text
Project Profit = Project Revenue - Project Expenses
```

Margin:

```text
Profit Margin =
(Project Profit / Project Revenue) × 100
```

All financial dashboards and reports must use the same calculation functions.

---

# 30. DASHBOARD ARCHITECTURE

Dashboard data should be assembled server-side.

Example:

```text
Dashboard Page
      │
      ▼
getDashboardSummary()
      │
      ├── Lead metrics
      ├── Client metrics
      ├── Project metrics
      ├── Task metrics
      ├── Financial metrics
      ├── Pipeline metrics
      └── Attention alerts
```

Do not make the dashboard perform dozens of independent browser requests unnecessarily.

---

# 31. INTERN DASHBOARD

Intern dashboard must use a separate permission-aware data query.

```text
getInternDashboard(userId)
```

It may return:

```text
Assigned Clients
Assigned Projects
Pending Tasks
Overdue Tasks
Today's Tasks
Task Completion
```

It must NOT return:

```text
Revenue
Expenses
Profit
Payment amounts
Company financial analytics
```

The financial fields should never be queried for the intern dashboard.

---

# 32. LEAD ARCHITECTURE

Lead workflow:

```text
NEW
 ↓
CONTACTED
 ↓
QUALIFIED
 ↓
MEETING
 ↓
PROPOSAL_SENT
 ↓
NEGOTIATION
 ↓
WON / LOST
```

Lead conversion:

```text
Lead
 ↓
WON
 ↓
Convert
 ↓
Client
```

The lead remains as historical sales data.

---

# 33. CLIENT ARCHITECTURE

Client lifecycle:

```text
Lead WON
   ↓
Client created
   ↓
Onboarding
   ↓
Project
   ↓
Active
   ↓
Completed
   ↓
Archived
```

Client records should not be duplicated for each project.

---

# 34. PROJECT ARCHITECTURE

A client can have multiple projects.

```text
Client
 ├── Website Project
 ├── Marketing Project
 ├── Branding Project
 └── Software Project
```

Each project has:

```text
Status
Client
Members
Tasks
Financial records
Dates
```

---

# 35. TASK ARCHITECTURE

Tasks belong to projects.

```text
Project
   │
   ├── Task
   ├── Task
   ├── Task
   └── Task
```

Tasks can be assigned to:

```text
CO_FOUNDER
INTERN
```

An intern can only access tasks they are authorized to see.

---

# 36. TEAM ARCHITECTURE

There are three co-founders.

All co-founders have equal permissions.

Interns have restricted access.

The system should not assume there is only one company administrator.

Avoid:

```text
CEO > Founder > Intern
```

unless a future requirement explicitly introduces hierarchy.

Current model:

```text
CO-FOUNDER
CO-FOUNDER
CO-FOUNDER

      ↓

    INTERN
    INTERN
    INTERN
```

---

# 37. FINANCE ARCHITECTURE

Finance is a co-founder-only domain.

```text
Payments
Expenses
Revenue
Profit
Project Costs
Pending Payments
```

Finance services must enforce:

```text
user.role === CO_FOUNDER
```

plus any future permission requirements.

---

# 38. REPORTING ARCHITECTURE

Reports should query authoritative records.

Examples:

```text
Lead records
Client records
Project records
Task records
Payment records
Expense records
```

Avoid creating duplicate "report tables" unless performance later requires them.

---

# 39. ACTIVITY LOG ARCHITECTURE

Important actions create activity logs.

```text
User
 ↓
Action
 ↓
Entity
 ↓
ActivityLog
```

Example:

```text
User: Founder A
Action: TASK_COMPLETED
Entity: Task
Entity ID: xxx
Timestamp: ...
```

Activity logs are append-oriented.

Avoid editing historical activity logs.

---

# 40. NOTIFICATION ARCHITECTURE

Notifications are generated by business services.

Example:

```text
Task assigned
    ↓
Task service
    ├── Database update
    ├── Activity log
    └── Notification
```

Notification model should support:

```text
recipient
type
title
message
entity
read status
created_at
```

---

# 41. FILE ARCHITECTURE

Files are stored externally.

```text
Browser
   ↓
Upload
   ↓
Cloudinary
   ↓
File URL / metadata
   ↓
PostgreSQL
```

PostgreSQL stores metadata, not large binary files.

Every file access must respect the parent record's authorization.

---

# 42. SEARCH ARCHITECTURE

Global search should use a server-side search service.

```text
Search input
    ↓
Search service
    ↓
Permission-aware queries
    ↓
Leads / Clients / Projects / Tasks
    ↓
Ranked results
```

Do not expose records outside the user's permissions.

For MVP, PostgreSQL search is sufficient.

Do not add Elasticsearch or another search engine unless required later.

---

# 43. PAGINATION

Use server-side pagination for large datasets.

Recommended default:

```text
20–50 records per page
```

Applicable to:

```text
Leads
Clients
Projects
Tasks
Payments
Expenses
Activity Logs
```

---

# 44. CACHING

Do not add a complex caching layer for MVP.

Use Next.js caching/revalidation where appropriate.

Financial and permission-sensitive data should prioritize correctness over aggressive caching.

After important mutations, invalidate affected pages/data.

---

# 45. REAL-TIME

Real-time infrastructure is NOT required for MVP.

Use:

```text
Server Actions
Revalidation
Notifications
```

If real-time collaboration becomes necessary later, introduce it deliberately.

Do not add WebSockets simply because they are available.

---

# 46. FILE UPLOADS

File upload flow:

```text
User selects file
      ↓
Validate type/size
      ↓
Authorize parent entity
      ↓
Upload to Cloudinary
      ↓
Save metadata in PostgreSQL
      ↓
Create activity log
```

Never allow arbitrary unauthorized file uploads.

---

# 47. ERROR ARCHITECTURE

Use predictable application errors.

Example categories:

```text
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
DATABASE_ERROR
INTERNAL_ERROR
```

User-facing messages should be safe.

Technical details should remain server-side.

---

# 48. LOGGING

Application logging should focus on:

- Authentication failures
- Authorization failures
- Server errors
- Database errors
- Important business events

Never log:

- Passwords
- Authentication secrets
- API keys
- Client credentials
- Sensitive financial information unnecessarily

---

# 49. TRANSACTIONS

Use database transactions for multi-step operations that must succeed or fail together.

Example:

```text
Convert Lead
    ↓
Create Client
    ↓
Update Lead
    ↓
Create Activity Log
```

If these operations must remain consistent, use a Prisma transaction.

---

# 50. CONCURRENCY

Important updates should account for concurrent actions.

Examples:

- Two founders editing the same lead
- Two users assigning the same task
- Payment being recorded twice

Use database constraints and appropriate transaction logic.

---

# 51. UNIQUE CONSTRAINTS

Use database-level uniqueness where business rules require it.

Examples may include:

```text
User email
Unique external identifiers
Specific relationship combinations
```

Do not rely only on frontend validation for uniqueness.

---

# 52. SOFT DELETE

Prefer soft delete/archive for important business records.

Especially:

```text
Clients
Projects
Payments
Expenses
Activity Logs
```

Permanent deletion should be limited.

---

# 53. DATA RETENTION

Historical business data should remain available unless there is a legitimate reason to remove it.

Sales and financial history should not disappear simply because a client becomes inactive.

---

# 54. ENVIRONMENT ARCHITECTURE

Use separate environments:

```text
Development
Staging
Production
```

At minimum:

```text
Development
Production
```

Each environment must have its own database credentials.

Never connect local development to production accidentally.

---

# 55. ENVIRONMENT VARIABLES

Use:

```text
DATABASE_URL
AUTH_SECRET
AUTH_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Additional integrations may add their own variables.

All secrets belong in environment variables.

---

# 56. DEPLOYMENT ARCHITECTURE

The application should be deployable as a standard Next.js production application.

```text
GitHub
   ↓
Deployment Platform / Hosting
   ↓
Next.js Application
   │
   ├── PostgreSQL
   └── Cloudinary
```

The architecture must not depend on local development services.

---

# 57. HOSTING RULE

The existing hosting environment can be used.

The application should remain portable enough to deploy to another Node-compatible hosting platform if required.

Do not introduce hosting-specific architecture unnecessarily.

---

# 58. DATABASE DEPLOYMENT

Production database migrations must use Prisma migrations.

Never use destructive development commands against production.

Never use:

```text
prisma migrate reset
```

against production.

---

# 59. SEED DATA

Development seed data may include:

```text
3 Co-founders
Sample interns
Sample leads
Sample clients
Sample projects
Sample tasks
Sample payments
Sample expenses
```

Seed data must clearly be development data.

Never seed fake production data into the real production database.

---

# 60. TEST ARCHITECTURE

Testing should be organized around business behavior.

Recommended:

```text
tests/
├── auth/
├── permissions/
├── leads/
├── clients/
├── onboarding/
├── projects/
├── tasks/
├── finance/
└── reports/
```

Priority testing areas:

1. Authentication
2. Authorization
3. Financial privacy
4. Lead conversion
5. Task assignment
6. Data integrity

---

# 61. SECURITY ARCHITECTURE

Security boundaries:

```text
Browser
   ↓
Authentication
   ↓
Authorization
   ↓
Validation
   ↓
Business logic
   ↓
Database
```

Never skip a layer for convenience.

---

# 62. FINANCIAL PRIVACY BOUNDARY

The strongest privacy boundary is:

```text
Intern request
     ↓
Permission check
     ↓
Finance denied
     ↓
No financial query
```

Not:

```text
Intern request
     ↓
Query finance
     ↓
Hide finance in UI
```

The second approach is prohibited.

---

# 63. FRONTEND/BACKEND DATA CONTRACT

Server functions should return typed, minimal objects.

Example:

```text
InternTask
{
  id
  title
  status
  priority
  deadline
  clientName
  projectName
}
```

Do not return unrelated internal database fields.

---

# 64. TYPESCRIPT RULE

TypeScript should be used throughout the application.

Avoid:

```text
any
```

unless there is a documented reason.

Prefer:

```text
interfaces
types
Prisma generated types
Zod inferred types
```

---

# 65. TYPE FLOW

Preferred:

```text
Database
   ↓
Prisma types
   ↓
Service
   ↓
DTO / return type
   ↓
Server Component
   ↓
UI
```

Do not expose raw database models to every component automatically.

---

# 66. DTO RULE

Where appropriate, create DTOs for server-to-client data.

Benefits:

- Prevent accidental sensitive data exposure
- Keep UI contracts stable
- Reduce unnecessary payloads
- Separate database structure from UI structure

---

# 67. BUSINESS DOMAIN SEPARATION

Keep domains logically separated:

```text
Leads
Clients
Onboarding
Projects
Tasks
Team
Finance
Reports
```

Cross-domain operations should occur through services rather than arbitrary direct database manipulation from UI components.

---

# 68. MODULE DEPENDENCY

Preferred dependency direction:

```text
UI
 ↓
Actions / Route Handlers
 ↓
Services
 ↓
Database
```

Supporting layers:

```text
Validation
Permissions
Calculations
Notifications
```

These should not create circular dependencies.

---

# 69. CIRCULAR DEPENDENCY RULE

Avoid:

```text
lead.service
   ↓
client.service
   ↓
lead.service
```

If multiple domains need shared behavior, create a dedicated utility/service.

---

# 70. DESIGN SYSTEM ARCHITECTURE

UI should use shared design components.

```text
components/ui
```

for shadcn primitives.

Shared application components:

```text
components/layout
components/dashboard
```

Domain components:

```text
components/leads
components/clients
components/projects
components/finance
```

---

# 71. SHARED COMPONENT EXAMPLES

Recommended shared components:

```text
AppSidebar
TopHeader
GlobalSearch
NotificationBell
PageHeader
StatCard
SectionCard
DataTable
StatusBadge
PriorityBadge
ConfirmDialog
EmptyState
LoadingSkeleton
ErrorState
```

---

# 72. DATABASE ACCESS RULE

Components must never directly call Prisma.

Incorrect:

```text
React Component
   ↓
Prisma
```

Correct:

```text
React Component
   ↓
Server Action / Server Component
   ↓
Service
   ↓
Prisma
```

---

# 73. CLIENT STATE

Use local React state for UI state.

Examples:

```text
Modal open/closed
Selected filter
Tab selection
Search input
Drag state
```

Do not introduce Redux unless the application genuinely develops complex global client state.

---

# 74. URL STATE

Use URL parameters for shareable/filterable state where appropriate.

Examples:

```text
/leads?status=qualified
/projects?status=in_progress
/tasks?assignee=123
```

This makes filtered pages easier to navigate and refresh.

---

# 75. FORM SUBMISSION

Preferred:

```text
React Hook Form
      ↓
Zod
      ↓
Server Action
      ↓
Service
```

After success:

```text
Database updated
↓
Revalidate relevant page
↓
Show success feedback
```

---

# 76. NOTIFICATION FLOW

Example:

```text
Founder assigns task to Intern
        ↓
Task Service
        ↓
Task created/updated
        ↓
Activity Log
        ↓
Notification
        ↓
Intern sees notification
```

---

# 77. AUDIT FLOW

Important action:

```text
User
 ↓
Service
 ↓
Database mutation
 ↓
ActivityLog
```

Activity logging should happen in the same transaction when consistency is important.

---

# 78. REPORTING FLOW

```text
PostgreSQL
   ↓
Report Service
   ↓
Calculation Functions
   ↓
Typed Report DTO
   ↓
Report Page
   ↓
Chart/Table
```

Do not calculate major business metrics independently inside chart components.

---

# 79. DASHBOARD FLOW

Co-founder:

```text
Authenticated User
      ↓
Permission check
      ↓
Dashboard Service
      ↓
Parallel optimized queries
      ↓
Summary DTO
      ↓
Dashboard UI
```

Intern:

```text
Authenticated User
      ↓
Intern permission boundary
      ↓
Intern Dashboard Service
      ↓
Assigned records only
      ↓
Summary DTO
      ↓
Intern UI
```

---

# 80. PERFORMANCE ARCHITECTURE

Optimize only where needed.

Priorities:

1. Database query efficiency
2. Server rendering
3. Payload size
4. Image optimization
5. Pagination
6. Caching/revalidation

Do not prematurely optimize with complex infrastructure.

---

# 81. DATABASE INDEXING

Indexes should be created for frequently queried fields.

Likely candidates:

```text
User.email
Lead.status
Lead.assignedTo
Client.status
Project.clientId
Project.status
Task.projectId
Task.assignedTo
Task.status
Task.deadline
Payment.clientId
Payment.projectId
Expense.clientId
Expense.projectId
Notification.userId
Notification.read
ActivityLog.entityId
ActivityLog.createdAt
```

Exact indexes should be finalized with the database schema.

---

# 82. QUERY RULE

Avoid N+1 queries.

Prefer appropriate Prisma relations/selects/includes.

Return only fields required by the current operation.

---

# 83. SECURITY OF SEARCH

Search must never bypass permission boundaries.

Example:

```text
Search "Nova"
```

An intern should only receive authorized matching records.

---

# 84. ARCHITECTURE FOR FUTURE GROWTH

The MVP architecture should make it possible to add later:

```text
Client portal
Mobile app
WhatsApp integration
Email integration
Calendar integration
Advanced automation
AI features
Subscription/billing
Advanced analytics
```

But none of these should complicate the MVP unnecessarily.

---

# 85. WHAT NOT TO BUILD NOW

Do not introduce:

```text
Microservices
Kubernetes
Redis
Elasticsearch
Kafka
GraphQL
Redux
WebSockets
Separate backend repository
Separate mobile backend
Complex event bus
```

unless a real requirement appears.

---

# 86. DEVELOPMENT WORKFLOW

Recommended feature workflow:

```text
Requirement
    ↓
PRD check
    ↓
Architecture check
    ↓
Database/schema check
    ↓
Permission check
    ↓
Validation schema
    ↓
Service/business logic
    ↓
Server Action/API
    ↓
UI
    ↓
Testing
    ↓
Review
```

---

# 87. AI CODING AGENT ARCHITECTURE RULE

Before modifying the codebase, an AI coding agent must inspect:

```text
PRD.md
RULES.md
DESIGN.md
ARCHITECTURE.md
Relevant existing files
```

It must understand the current implementation before creating replacements.

Do not blindly rewrite existing pages.

---

# 88. AI CHANGE RULE

When implementing a feature:

```text
Find existing implementation
       ↓
Reuse where possible
       ↓
Modify only required files
       ↓
Preserve existing behavior
       ↓
Test affected flows
```

Avoid unnecessary refactoring.

---

# 89. ARCHITECTURE CHANGE RULE

Any major architecture change requires explicit approval.

Examples:

- Switching ORM
- Switching database
- Adding a second backend
- Adding microservices
- Changing authentication system
- Introducing a new state-management system
- Changing deployment architecture

---

# 90. FINAL ARCHITECTURE

The canonical architecture is:

```text
                         EVOLIX OS
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 Browser            Auth.js
                    │                   │
                    ▼                   │
                 Next.js ◄──────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
     Server Components   Client Components
          │                   │
          └─────────┬─────────┘
                    │
             Server Actions
             / Route Handlers
                    │
             Authentication
                    │
             Authorization
                    │
                Zod
                    │
                Services
                    │
          ┌─────────┴─────────┐
          │                   │
     Calculations        Notifications
          │                   │
          └─────────┬─────────┘
                    │
                  Prisma
                    │
                PostgreSQL
                    │
          ┌─────────┴─────────┐
          │                   │
       Cloudinary          Reports
```

---

# 91. ARCHITECTURE NORTH STAR

Evolix OS is a **secure modular monolith**.

The goal is not to build the most technically complicated system.

The goal is to build the simplest architecture that can reliably run Evolix's:

```text
Sales
→ Clients
→ Onboarding
→ Projects
→ Tasks
→ Team
→ Finance
→ Reports
```

Keep the architecture:

**Simple.**

**Secure.**

**Modular.**

**Permission-aware.**

**Easy to maintain.**

**Ready to scale when Evolix actually needs it.**
