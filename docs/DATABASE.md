# EVOLIX OS — DATABASE.md

## 1. Purpose

This document defines the PostgreSQL database design for **Evolix OS**.

The database supports the 8 core modules:

1. Dashboard
2. Leads & Sales
3. Clients
4. Onboarding
5. Projects & Tasks
6. Team & Interns
7. Finance
8. Reports

The database must support:

- 3 co-founders
- Multiple interns
- Lead management
- Client management
- Client onboarding
- Project management
- Task assignment
- Intern work tracking
- Revenue
- Expenses
- Profit
- Payments
- Reports
- Notifications
- Activity history

PostgreSQL is the source of truth.

Prisma is the application ORM.

---

# 2. DATABASE PRINCIPLES

## 2.1 Source of Truth

All business records must be stored in PostgreSQL.

Do not store important business state only in:

- React state
- Local storage
- Browser storage
- Hardcoded arrays

---

## 2.2 Normalization

Keep core entities separate.

For example:

```text
User
Client
Project
Task
Payment
Expense
```

Do not create one giant table containing everything.

---

## 2.3 Historical Data

Business history must remain available.

Prefer:

```text
status = ARCHIVED
```

over permanently deleting important records.

---

## 2.4 Financial Integrity

Financial records must be stored independently from dashboard calculations.

Dashboard values are derived from:

```text
Payment
+
Expense
```

not manually typed into dashboard records.

---

# 3. DATABASE TECHNOLOGY

```text
Database: PostgreSQL
ORM: Prisma
Primary keys: UUID
Timestamps: PostgreSQL-compatible DateTime
Currency: Decimal
```

Never use floating-point numbers for money.

Use:

```text
Decimal
```

for:

- Revenue
- Payment amounts
- Expenses
- Project value
- Cost
- Profit calculations

---

# 4. ID STANDARD

Use UUID identifiers.

Example:

```text
id UUID PRIMARY KEY
```

Application-generated IDs should use Prisma's UUID support.

Do not expose sequential integer IDs unnecessarily.

---

# 5. TIMESTAMP STANDARD

Every major business entity should have:

```text
createdAt
updatedAt
```

Use UTC internally.

The UI can display dates according to the user's locale.

---

# 6. CORE ENTITY MAP

```text
                         USER
                          │
             ┌────────────┼────────────┐
             │            │            │
           LEAD         CLIENT       TASK
             │            │            │
             │            │          PROJECT
             │            │            │
             │        ONBOARDING       │
             │            │            │
             └────────────┴────────────┘
                          │
                       PROJECT
                          │
                    ┌─────┴─────┐
                    │           │
                  TASK        FINANCE
                                │
                         ┌──────┴──────┐
                         │             │
                      PAYMENT       EXPENSE
```

Supporting entities:

```text
Notification
ActivityLog
LeadActivity
ProjectMember
TaskComment
TaskAttachment
```

---

# 7. CORE TABLES

The core database contains:

```text
users
leads
lead_activities
clients
onboardings
projects
project_members
tasks
task_comments
task_attachments
payments
expenses
notifications
activity_logs
```

Do not add additional tables without a real domain requirement.

---

# 8. USER TABLE

## Purpose

Stores all Evolix team members.

### Fields

```text
users

id
name
email
passwordHash / auth provider identifier
role
avatarUrl
isActive
createdAt
updatedAt
```

### Role enum

```text
CO_FOUNDER
INTERN
```

There are currently three co-founders.

The database must not hardcode exactly three users.

It should support additional co-founders if Evolix grows.

---

# 9. USER RULES

Email must be unique.

```text
UNIQUE(email)
```

Inactive users:

```text
isActive = false
```

should not be assignable to new tasks.

Existing historical assignments should remain intact.

---

# 10. LEAD TABLE

## Purpose

Stores sales prospects before they become clients.

### Fields

```text
leads

id
name
companyName
email
phone
source
service
status
priority
estimatedValue
assignedToId
nextFollowUpAt
notes
createdAt
updatedAt
```

### Relationships

```text
Lead
 ├── assignedTo → User
 └── has many LeadActivities
```

---

# 11. LEAD STATUS

Use enum:

```text
NEW
CONTACTED
QUALIFIED
MEETING
PROPOSAL_SENT
NEGOTIATION
WON
LOST
```

This matches the sales pipeline.

---

# 12. LEAD PRIORITY

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# 13. LEAD SOURCE

Use a controlled enum where practical:

```text
INSTAGRAM
FACEBOOK
LINKEDIN
WHATSAPP
WEBSITE
REFERRAL
UPWORK
FIVERR
FREELANCER
COLD_OUTREACH
OTHER
```

If the source needs to become more flexible later, it can be migrated to a separate lookup table.

---

# 14. LEAD ACTIVITIES

## Purpose

Stores the history of communication/actions against a lead.

### Fields

```text
lead_activities

id
leadId
userId
type
content
createdAt
```

### Activity type

```text
NOTE
CALL
EMAIL
WHATSAPP
MEETING
FOLLOW_UP
STATUS_CHANGE
```

---

# 15. LEAD → CLIENT CONVERSION

When a lead is won:

```text
Lead
 ↓
WON
 ↓
Convert
 ↓
Client
```

The original lead must remain.

Do not delete it after conversion.

The client can store:

```text
convertedFromLeadId
```

with a unique constraint if one-to-one conversion is required.

---

# 16. CLIENT TABLE

## Purpose

Stores active and historical Evolix clients.

### Fields

```text
clients

id
name
companyName
email
phone
whatsapp
address
website
industry
status
source
assignedToId
convertedFromLeadId
notes
createdAt
updatedAt
```

---

# 17. CLIENT STATUS

```text
ONBOARDING
ACTIVE
ON_HOLD
COMPLETED
INACTIVE
ARCHIVED
```

---

# 18. CLIENT ASSIGNMENT

A client can have a primary responsible co-founder.

```text
assignedToId → users.id
```

The client can additionally have project-level team members through projects.

Do not overload `assignedToId` with all team assignments.

---

# 19. ONBOARDING TABLE

## Purpose

Tracks client onboarding after conversion.

### Fields

```text
onboardings

id
clientId
status
startDate
completedAt
notes
createdAt
updatedAt
```

---

# 20. ONBOARDING STATUS

```text
NOT_STARTED
IN_PROGRESS
WAITING_FOR_CLIENT
COMPLETED
CANCELLED
```

---

# 21. ONBOARDING CHECKLIST

For MVP, onboarding checklist items can be represented as structured task records if they are operational tasks.

Do not create a separate checklist table unless onboarding requirements become complex.

Example onboarding tasks:

```text
Collect logo
Collect brand assets
Collect business information
Collect social media credentials
Collect website requirements
Confirm scope
Confirm payment
Kickoff meeting
```

These can become project/tasks after onboarding.

---

# 22. PROJECT TABLE

## Purpose

Stores client work.

A client may have multiple projects.

### Fields

```text
projects

id
clientId
name
description
serviceType
status
priority
startDate
deadline
completedAt
contractValue
notes
createdAt
updatedAt
```

---

# 23. PROJECT SERVICE TYPE

Use enum:

```text
WEBSITE
SOFTWARE
BRANDING
SOCIAL_MEDIA
DIGITAL_MARKETING
SEO
3D_ANIMATION
PRODUCT_PHOTOGRAPHY
ECOMMERCE
AI_AUTOMATION
OTHER
```

---

# 24. PROJECT STATUS

```text
PLANNING
IN_PROGRESS
ON_HOLD
COMPLETED
CANCELLED
```

---

# 25. PROJECT PRIORITY

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# 26. PROJECT MEMBERS

## Purpose

Allows multiple users to work on a project.

### Fields

```text
project_members

id
projectId
userId
role
createdAt
```

### Role

```text
OWNER
MEMBER
```

A project can have:

```text
1 owner
multiple members
```

The owner should normally be a co-founder.

---

# 27. TASK TABLE

## Purpose

Stores actionable work.

### Fields

```text
tasks

id
projectId
clientId
title
description
status
priority
assignedToId
createdById
dueDate
completedAt
createdAt
updatedAt
```

---

# 28. TASK STATUS

```text
TODO
IN_PROGRESS
IN_REVIEW
COMPLETED
CANCELLED
```

---

# 29. TASK PRIORITY

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# 30. TASK ASSIGNMENT

Every active task should have:

```text
assignedToId
```

unless it is intentionally unassigned.

The assigned user must be active.

An intern must only see tasks they are allowed to access.

---

# 31. TASK COMMENTS

## Purpose

Internal communication around a task.

### Fields

```text
task_comments

id
taskId
userId
content
createdAt
updatedAt
```

Comments are visible only to authorized team members.

---

# 32. TASK ATTACHMENTS

## Purpose

Stores metadata for task-related files.

### Fields

```text
task_attachments

id
taskId
uploadedById
fileName
fileUrl
fileType
fileSize
createdAt
```

Actual file data is stored externally.

---

# 33. PAYMENT TABLE

## Purpose

Stores money received from clients.

### Fields

```text
payments

id
clientId
projectId
amount
paymentDate
method
status
reference
notes
recordedById
createdAt
updatedAt
```

---

# 34. PAYMENT METHOD

```text
BANK_TRANSFER
UPI
CASH
CARD
OTHER
```

---

# 35. PAYMENT STATUS

```text
PENDING
PAID
FAILED
REFUNDED
```

For the financial dashboard:

```text
Revenue Collected
```

should normally include:

```text
status = PAID
```

---

# 36. EXPENSE TABLE

## Purpose

Stores business/project expenses.

### Fields

```text
expenses

id
projectId
clientId
category
description
amount
expenseDate
vendor
paymentMethod
recordedById
notes
createdAt
updatedAt
```

---

# 37. EXPENSE CATEGORY

```text
SOFTWARE
HOSTING
ADVERTISING
FREELANCER
INTERN
TOOLS
TRAVEL
OFFICE
EQUIPMENT
CLIENT_WORK
OTHER
```

---

# 38. FINANCE RELATIONSHIP

```text
Client
 │
 └── Project
       │
       ├── Payments
       └── Expenses
```

A payment can be associated with a project.

An expense can be associated with a project.

Client-level records are allowed when the transaction is not tied to a specific project.

---

# 39. PROFIT CALCULATION

Do not store a manually editable `profit` field.

Calculate:

```text
Revenue = SUM(PAID payments)

Expenses = SUM(expenses)

Net Profit = Revenue - Expenses
```

Project:

```text
Project Revenue
    -
Project Expenses
    =
Project Profit
```

---

# 40. PENDING PAYMENTS

Pending payment reporting should be based on payment records/status or a future invoice model.

For MVP, if invoices are not yet implemented:

```text
PENDING
```

payments can represent expected-but-not-yet-collected amounts.

Do not count pending amounts as collected revenue.

---

# 41. NOTIFICATION TABLE

## Purpose

Stores user notifications.

### Fields

```text
notifications

id
userId
type
title
message
entityType
entityId
isRead
createdAt
```

---

# 42. NOTIFICATION TYPES

```text
TASK_ASSIGNED
TASK_DUE
TASK_OVERDUE
CLIENT_ASSIGNED
PROJECT_ASSIGNED
PAYMENT_RECEIVED
PAYMENT_OVERDUE
FOLLOW_UP_DUE
SYSTEM
```

---

# 43. ACTIVITY LOG TABLE

## Purpose

Provides an audit trail of important business actions.

### Fields

```text
activity_logs

id
userId
action
entityType
entityId
metadata
createdAt
```

`metadata` may use PostgreSQL JSON/JSONB.

Example:

```json
{
  "oldStatus": "NEW",
  "newStatus": "QUALIFIED"
}
```

Do not store secrets inside metadata.

---

# 44. ACTIVITY ACTIONS

Examples:

```text
LEAD_CREATED
LEAD_UPDATED
LEAD_STATUS_CHANGED
LEAD_CONVERTED

CLIENT_CREATED
CLIENT_UPDATED

ONBOARDING_STARTED
ONBOARDING_COMPLETED

PROJECT_CREATED
PROJECT_UPDATED
PROJECT_COMPLETED

TASK_CREATED
TASK_ASSIGNED
TASK_COMPLETED

PAYMENT_CREATED
PAYMENT_UPDATED

EXPENSE_CREATED
EXPENSE_UPDATED

USER_CREATED
USER_UPDATED
```

---

# 45. ENTITY TYPE

For generic activity logging:

```text
USER
LEAD
CLIENT
ONBOARDING
PROJECT
TASK
PAYMENT
EXPENSE
```

---

# 46. REPORTS

Reports do not require a separate database table for MVP.

Reports are generated from:

```text
Leads
Clients
Projects
Tasks
Payments
Expenses
```

Example:

```text
Monthly Revenue
Monthly Expenses
Monthly Profit
Lead Conversion
Project Completion
Task Completion
```

---

# 47. DASHBOARD DATA

The dashboard is derived from database records.

## Co-founder dashboard

Can calculate:

```text
Total Leads
Active Clients
Active Projects
Pending Tasks
Revenue Collected
Expenses
Net Profit
Pending Payments
```

---

# 48. SALES PIPELINE DATA

Derived from Lead records.

```text
NEW
QUALIFIED
MEETING
PROPOSAL_SENT
WON
LOST
```

Counts should be calculated dynamically.

Do not maintain duplicate counters.

---

# 49. INTERN DASHBOARD DATA

Intern dashboard may access:

```text
Assigned Clients
Assigned Projects
Pending Tasks
Overdue Tasks
Today's Tasks
Completed Tasks
Task Progress
```

Intern dashboard must NOT query:

```text
Payment.amount
Expense.amount
Revenue
Profit
Financial reports
```

---

# 50. INTERN DATA BOUNDARY

The database permission model must follow:

```text
INTERN
 │
 ├── Own profile
 ├── Assigned clients
 ├── Assigned projects
 ├── Assigned tasks
 ├── Relevant comments
 └── Relevant files
```

No financial access.

---

# 51. CO-FOUNDER DATA ACCESS

Co-founders can access:

```text
All leads
All clients
All onboarding records
All projects
All tasks
Team
Finance
Reports
Activity history
```

All three co-founders have equivalent role-level permissions.

---

# 52. ROLE SECURITY

Never trust:

```text
role
```

sent by the browser.

Correct:

```text
Session
 ↓
Authenticated user ID
 ↓
Database user
 ↓
Actual role
 ↓
Permission check
```

---

# 53. FOREIGN KEYS

Use foreign keys for relationships.

Examples:

```text
leads.assignedToId
lead_activities.leadId
lead_activities.userId

clients.assignedToId
clients.convertedFromLeadId

onboardings.clientId

projects.clientId

project_members.projectId
project_members.userId

tasks.projectId
tasks.clientId
tasks.assignedToId
tasks.createdById

task_comments.taskId
task_comments.userId

task_attachments.taskId
task_attachments.uploadedById

payments.clientId
payments.projectId
payments.recordedById

expenses.clientId
expenses.projectId
expenses.recordedById

notifications.userId

activity_logs.userId
```

---

# 54. DELETE RULES

Do not cascade-delete important financial/business history casually.

Recommended behavior:

```text
User
 → restrict/soft deactivate

Client
 → archive

Project
 → archive/status

Payment
 → never casually delete

Expense
 → never casually delete

ActivityLog
 → never delete through normal UI
```

---

# 55. NULLABILITY

Use nullable fields only when information is genuinely optional.

Examples:

```text
companyName
phone
website
notes
deadline
completedAt
projectId on client-level payment
```

Required business fields should remain non-null.

---

# 56. MONEY PRECISION

Use PostgreSQL numeric/Prisma Decimal.

Recommended:

```text
Decimal(12,2)
```

This supports values such as:

```text
₹999.00
₹24,999.00
₹1,00,000.00
```

Do not use:

```text
Float
Double
JavaScript number
```

as the database money type.

---

# 57. INDEXING

Create indexes for frequently filtered fields.

Recommended:

```text
users.email

leads.status
leads.assignedToId
leads.nextFollowUpAt

clients.status
clients.assignedToId

projects.clientId
projects.status
projects.deadline

project_members.projectId
project_members.userId

tasks.projectId
tasks.clientId
tasks.assignedToId
tasks.status
tasks.dueDate

payments.clientId
payments.projectId
payments.status
payments.paymentDate

expenses.clientId
expenses.projectId
expenses.expenseDate

notifications.userId
notifications.isRead

activity_logs.userId
activity_logs.entityType
activity_logs.entityId
activity_logs.createdAt
```

---

# 58. COMPOSITE INDEXES

Where query patterns justify them, use composite indexes.

Examples:

```text
tasks(assignedToId, status)
tasks(assignedToId, dueDate)
payments(clientId, status)
payments(projectId, status)
expenses(projectId, expenseDate)
notifications(userId, isRead)
```

Do not create indexes blindly.

---

# 59. UNIQUE CONSTRAINTS

Required:

```text
users.email
```

Potential:

```text
project_members(projectId, userId)
```

This prevents the same user from being added to the same project twice.

---

# 60. DATABASE ENUMS

Prefer PostgreSQL/Prisma enums for stable states.

Examples:

```text
UserRole
LeadStatus
LeadPriority
LeadSource
LeadActivityType
ClientStatus
OnboardingStatus
ProjectServiceType
ProjectStatus
ProjectPriority
ProjectMemberRole
TaskStatus
TaskPriority
PaymentMethod
PaymentStatus
ExpenseCategory
NotificationType
ActivityAction
EntityType
```

---

# 61. DATABASE TRANSACTIONS

Use transactions for multi-record operations.

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

These should be atomic.

Another example:

```text
Assign Task
    ↓
Update Task
    ↓
Create Activity Log
    ↓
Create Notification
```

---

# 62. LEAD CONVERSION TRANSACTION

Recommended:

```text
BEGIN

1. Verify lead exists
2. Verify lead is WON
3. Verify user permission
4. Create client
5. Update lead conversion state
6. Create onboarding
7. Create activity logs

COMMIT
```

If any critical step fails:

```text
ROLLBACK
```

---

# 63. FINANCIAL TRANSACTIONS

When recording financial data:

```text
Validate user permission
        ↓
Validate amount
        ↓
Validate client/project
        ↓
Create record
        ↓
Activity log
        ↓
Commit
```

Never allow interns to create or modify payments/expenses.

---

# 64. AUDITABILITY

Financial changes must be traceable.

For:

```text
Payment
Expense
```

record:

```text
recordedById
createdAt
updatedAt
```

Important edits should create activity logs.

---

# 65. DASHBOARD PERFORMANCE

Dashboard queries should aggregate directly in PostgreSQL.

Example:

```text
COUNT(leads)
COUNT(active clients)
COUNT(projects)
COUNT(pending tasks)
SUM(paid payments)
SUM(expenses)
```

Do not load thousands of records into Node.js just to calculate totals.

---

# 66. REPORT QUERY RULE

Use database aggregation for:

```text
COUNT
SUM
AVG
GROUP BY
DATE ranges
```

Return only the values needed by the report.

---

# 67. DATE FILTERING

Reports should support:

```text
Today
This week
This month
This quarter
This year
Custom range
```

Use database date filtering.

Avoid timezone bugs by storing timestamps consistently in UTC.

---

# 68. SOFT ARCHIVING

Where appropriate, use:

```text
status
isActive
archivedAt
```

instead of physical deletion.

Do not add `deletedAt` to every table automatically.

Use it only where it serves a real business purpose.

---

# 69. FILE METADATA

PostgreSQL stores:

```text
fileName
fileUrl
fileType
fileSize
uploadedById
createdAt
```

The actual file is stored externally.

---

# 70. SEED DATA

Development seed should create:

```text
3 co-founders
3–5 interns
10+ leads
5+ clients
5+ projects
20+ tasks
sample payments
sample expenses
notifications
activity logs
```

The seed should demonstrate all dashboard states.

---

# 71. SEED USER ROLES

Example:

```text
Founder 1 → CO_FOUNDER
Founder 2 → CO_FOUNDER
Founder 3 → CO_FOUNDER

Intern 1 → INTERN
Intern 2 → INTERN
Intern 3 → INTERN
```

Use clearly fake development credentials.

Never use real passwords or real client information.

---

# 72. DATABASE MIGRATION RULE

All schema changes must be made through Prisma migrations.

Workflow:

```text
Edit schema.prisma
       ↓
Create migration
       ↓
Review migration
       ↓
Test locally
       ↓
Deploy migration
```

Never manually modify production tables without an approved migration process.

---

# 73. SCHEMA CHANGE RULE

Before changing a table:

Check:

```text
PRD.md
RULES.md
ARCHITECTURE.md
DATABASE.md
Existing schema
```

Avoid breaking existing data.

---

# 74. REPORTING SOURCE OF TRUTH

Never create duplicate financial values such as:

```text
dashboardRevenue
dashboardProfit
monthlyProfit
```

as manually maintained fields.

Instead:

```text
Payments
+
Expenses
↓
Calculations
↓
Dashboard
```

---

# 75. DATA OWNERSHIP

The database should preserve clear ownership.

Examples:

```text
Lead → assigned co-founder
Client → assigned co-founder
Project → client + members
Task → assignee
Payment → client/project
Expense → client/project
Notification → user
ActivityLog → actor
```

---

# 76. FUTURE EXTENSIONS

The database is designed so the following can be added later without redesigning the core:

```text
Invoices
Contracts
Recurring payments
Client portal
Time tracking
Attendance
Payroll
WhatsApp integration
Email integration
Calendar
AI automation
Subscription billing
```

These should be separate migrations when actually needed.

---

# 77. WHAT IS NOT IN MVP

Do not create tables for:

```text
AI assistant
Chat system
Payroll
Attendance
Invoices
Contracts
CRM email sync
WhatsApp API
Calendar
Client portal
Subscription billing
```

unless explicitly added to the PRD.

---

# 78. DATABASE SECURITY RULE

The database layer must support the application's permission model.

Most importantly:

```text
CO_FOUNDER
    ↓
Full operational + financial access

INTERN
    ↓
Assigned operational data only
    ↓
NO FINANCIAL DATA
```

The frontend must never be the only security boundary.

---

# 79. FINAL ENTITY RELATIONSHIP

```text
USER
 │
 ├───────────────┐
 │               │
 ▼               ▼
LEAD          CLIENT
 │               │
 ▼               ├───────────────┐
LEAD ACTIVITY    │               │
                 ▼               ▼
             ONBOARDING       PROJECT
                                  │
                         ┌────────┼────────┐
                         │        │        │
                         ▼        ▼        ▼
                       TASK    MEMBERS   FINANCE
                         │                 │
                  ┌──────┴──────┐      ┌──┴──┐
                  ▼             ▼      ▼     ▼
               COMMENTS    ATTACHMENTS PAYMENT EXPENSE


USER
 │
 ├── NOTIFICATIONS
 │
 └── ACTIVITY LOGS
```

---

# 80. CANONICAL DATABASE RULE

The PostgreSQL database is the **single source of truth** for Evolix OS.

The application must follow:

```text
UI
 ↓
Permission
 ↓
Validation
 ↓
Service
 ↓
Prisma
 ↓
PostgreSQL
```

Never:

```text
UI
 ↓
Direct database logic
```

Never:

```text
UI
 ↓
Hide unauthorized information
```

---

# 81. DATABASE NORTH STAR

The database should remain:

**Relational.**

**Normalized.**

**Permission-aware.**

**Financially accurate.**

**Auditable.**

**Simple enough to maintain.**

The database should support the actual Evolix workflow without becoming an over-engineered ERP.

The core flow is:

```text
LEAD
  ↓
CLIENT
  ↓
ONBOARDING
  ↓
PROJECT
  ↓
TASKS
  ↓
PAYMENTS + EXPENSES
  ↓
REPORTS
```

That is the canonical Evolix OS data model.
