# EVOLIX OS — RULES.md

## Project Development Rules & Engineering Standards

**Project:** Evolix OS
**Organization:** Evolix
**Version:** 1.0
**Status:** Active
**Primary Database:** PostgreSQL

---

# 1. PURPOSE

Evolix OS is an internal CRM and agency management system for Evolix.

The application manages:

```text
Leads
↓
Sales
↓
Clients
↓
Onboarding
↓
Projects
↓
Tasks
↓
Team
↓
Finance
↓
Reports
```

These rules are mandatory for all development.

Any developer or AI coding agent working on Evolix OS must follow this document.

---

# 2. CORE PRINCIPLES

The application must always prioritize:

1. Simplicity
2. Security
3. Maintainability
4. Performance
5. Clear user experience
6. Correct business logic
7. Role-based access control
8. Scalable architecture
9. Clean code
10. Consistent UI

Do not add complexity without a clear business reason.

---

# 3. TECH STACK — LOCKED

The following technologies are approved.

### Language

**TypeScript**

### Framework

**Next.js**

### Frontend

**React**

### Styling

**Tailwind CSS**

### UI Components

**shadcn/ui**

### Backend

**Next.js Server Actions / API Routes**

### Database

**PostgreSQL**

### ORM

**Prisma**

### Authentication

**Auth.js**

### Validation

**Zod**

### Forms

**React Hook Form**

### Charts

**Recharts**

### File Storage

**Cloudinary**

### Version Control

**Git + GitHub**

Do not replace these technologies without explicit approval.

---

# 4. EXISTING WEBSITE RULE

Evolix already has a public website.

The public website is separate from Evolix OS.

Do not redesign, rebuild or replace the existing website unless explicitly requested.

Evolix OS is an internal application.

Future website integrations may connect to Evolix OS APIs.

---

# 5. MODULE LIMIT

Evolix OS has exactly 8 primary modules.

```text
01 Dashboard
02 Leads & Sales
03 Clients
04 Onboarding
05 Projects & Tasks
06 Team & Interns
07 Finance
08 Reports
```

Do not create additional primary modules unless explicitly approved.

Do not create an AI Assistant module.

---

# 6. USER ROLES

There are only two primary roles in MVP.

```text
CO_FOUNDER
INTERN
```

---

# 7. CO-FOUNDER RULES

There are three co-founders.

All co-founders have equal system permissions.

A co-founder can access:

* All leads
* All clients
* All onboarding records
* All projects
* All tasks
* All team members
* Finance
* Reports
* Profitability

Do not create a CEO hierarchy unless explicitly requested later.

Do not give one co-founder additional permissions by default.

---

# 8. INTERN RULES

Interns have restricted access.

Interns can access only:

* Their dashboard
* Assigned clients
* Assigned projects
* Assigned tasks
* Relevant files
* Task comments
* Their own performance

Interns cannot access:

* Revenue
* Expenses
* Profit
* Payment amounts
* Project profitability
* Financial reports
* Company-wide financial analytics
* Unassigned clients
* Unassigned projects
* Unassigned tasks
* Other interns' performance data

---

# 9. SECURITY RULE

Frontend hiding is NOT security.

Never rely on:

```text
if role === INTERN
hide Finance button
```

as the only protection.

Every protected resource must be checked server-side.

Correct flow:

```text
Request
↓
Authentication
↓
User identification
↓
Role check
↓
Resource ownership check
↓
Permission check
↓
Database query
```

Unauthorized requests must be rejected.

---

# 10. IDOR PREVENTION

Never allow a user to access a record simply because they know its ID.

Example:

```text
/projects/123
```

An intern must not automatically gain access to Project 123.

The backend must verify:

```text
Is this project assigned to the current user?
```

If not:

```text
403 Forbidden
```

---

# 11. DATABASE RULES

PostgreSQL is the primary database.

Use Prisma for database access.

Do not access PostgreSQL directly from client-side code.

All database operations must happen server-side.

---

# 12. DATABASE RELATIONSHIP RULE

Maintain proper relational integrity.

Use:

* Primary keys
* Foreign keys
* Unique constraints
* Appropriate indexes
* Required fields
* Nullable fields only when necessary

Do not duplicate relational data unnecessarily.

---

# 13. DATABASE NAMING

Use consistent naming.

Recommended:

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

Use `snake_case` for database naming.

---

# 14. ID RULE

Do not expose sequential database IDs unnecessarily.

Prefer secure unique identifiers such as UUIDs where appropriate.

Never rely on IDs as authorization.

Authorization must always be based on the current user's permissions.

---

# 15. FINANCE RULE

Finance is strictly:

**CO_FOUNDER ONLY**

Financial information includes:

* Revenue
* Payment amounts
* Expenses
* Profit
* Profit margin
* Project cost
* Outstanding payments
* Financial reports

Interns must never receive this information from the backend.

Do not send restricted financial fields to the frontend and simply hide them.

---

# 16. PROFIT CALCULATION

Project profit:

```text
Revenue - Direct Project Costs
```

Profit margin:

```text
(Project Profit / Revenue) × 100
```

Do not calculate financial values differently in different modules.

Centralize financial calculations.

---

# 17. LEAD RULES

A lead must have a status.

Allowed statuses:

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

Do not create random lead statuses.

---

# 18. LEAD CONVERSION RULE

When a lead becomes:

```text
WON
```

the system should provide:

```text
CONVERT TO CLIENT
```

The original lead must remain available as historical sales data.

Do not delete the lead when converting it.

---

# 19. CLIENT RULES

Client status values:

```text
ONBOARDING
ACTIVE
PAUSED
COMPLETED
ARCHIVED
```

Clients may have multiple projects.

Do not create duplicate client records unnecessarily.

---

# 20. ONBOARDING RULE

A client should normally go through:

```text
WON DEAL
↓
CLIENT
↓
ONBOARDING
↓
PROJECT
```

Onboarding should track:

* Client information
* Requirements
* Assets
* Documents
* Access requirements
* Payment status

Do not expose sensitive client credentials unnecessarily.

---

# 21. PASSWORD / CREDENTIAL RULE

Never store client passwords as plain text.

Do not store sensitive credentials in normal client fields.

If credential storage is implemented later, it must use a dedicated secure design with encryption and strict access control.

---

# 22. PROJECT RULE

Allowed project statuses:

```text
PLANNING
IN_PROGRESS
ON_HOLD
CLIENT_REVIEW
REVISION
COMPLETED
CANCELLED
```

Do not introduce project statuses without checking their effect on reporting and workflows.

---

# 23. TASK RULE

Allowed task statuses:

```text
TODO
IN_PROGRESS
IN_REVIEW
COMPLETED
```

Allowed priorities:

```text
LOW
MEDIUM
HIGH
URGENT
```

Every active task should have:

* Project
* Client
* Assigned user
* Status
* Deadline

where applicable.

---

# 24. TASK ASSIGNMENT RULE

Tasks may be assigned to:

* Co-founders
* Interns

When a task is assigned:

1. Save the assignment.
2. Create a notification.
3. Record an activity log.

---

# 25. OVERDUE TASK RULE

A task is overdue when:

```text
deadline < current date/time
AND
status != COMPLETED
```

Do not manually maintain an "overdue" status.

Calculate it from the task's deadline and status.

---

# 26. PROJECT PROGRESS RULE

Project progress should be derived from task completion where appropriate.

Example:

```text
Completed Tasks / Total Tasks × 100
```

Avoid maintaining multiple conflicting progress values.

If manual project progress is introduced later, clearly define why.

---

# 27. FILE RULE

Files must not be stored directly inside PostgreSQL.

Use Cloudinary or approved object storage.

Database should store metadata such as:

```text
file_name
file_url
file_type
file_size
uploaded_by
entity_id
created_at
```

Files must respect the same authorization rules as the records they belong to.

---

# 28. ACTIVITY LOG RULE

Important business actions must be logged.

Examples:

```text
Lead created
Lead assigned
Lead status changed
Lead converted
Client created
Onboarding completed
Project created
Task assigned
Task completed
File uploaded
Payment added
Expense added
Project status changed
```

Activity logs should contain:

* User
* Action
* Entity
* Entity ID
* Description
* Timestamp

---

# 29. NOTIFICATION RULE

Notifications must be generated for meaningful events.

Examples:

### Intern

* New task assigned
* Deadline approaching
* Task overdue
* Comment added
* File added

### Co-Founder

* New lead
* Follow-up due
* Deal won
* Payment overdue
* Project overdue
* Task completed

Do not create notifications for every minor database update.

---

# 30. VALIDATION RULE

All user input must be validated.

Use:

**Zod**

Validation must happen server-side.

Frontend validation is for user experience.

Backend validation is mandatory for security.

---

# 31. API RULE

API endpoints must:

* Authenticate requests
* Authorize requests
* Validate input
* Handle errors
* Return consistent responses
* Avoid leaking sensitive information

Never return more data than the user needs.

---

# 32. ERROR HANDLING

Never expose:

* Database errors
* Stack traces
* Secrets
* Internal file paths
* Authentication details

to end users.

Use user-friendly error messages.

Log technical errors securely.

---

# 33. LOADING STATES

Every data-heavy screen should have a loading state.

Do not leave users staring at an empty page while data loads.

Use appropriate:

* Skeletons
* Loading indicators
* Disabled button states

---

# 34. EMPTY STATES

Every list should have a meaningful empty state.

Example:

Instead of:

```text
No data
```

Use:

```text
No active projects yet.

Create your first project to start tracking delivery.
```

where appropriate.

---

# 35. FORM RULES

Forms must:

* Have clear labels
* Validate required fields
* Show inline errors
* Prevent duplicate submission
* Show success feedback
* Show failure feedback
* Preserve entered data where reasonable

Use React Hook Form + Zod.

---

# 36. UI RULE

The UI must follow a consistent design system.

Use:

* shadcn/ui
* Tailwind CSS
* Consistent spacing
* Consistent typography
* Consistent button styles
* Consistent cards
* Consistent tables
* Consistent forms

Do not create custom UI components when an approved shadcn component already solves the problem.

---

# 37. DESIGN STYLE

Evolix OS should look like a premium modern SaaS application.

Preferred:

* Light interface
* Clean layouts
* White cards
* Neutral backgrounds
* Evolix blue accents
* Strong typography
* Subtle borders
* Subtle shadows
* Minimal animation

Avoid:

* Excessive gradients
* Neon colors
* Excessive glassmorphism
* Large decorative illustrations
* Excessive animation
* Clutter

The interface should feel professional enough for daily business use.

---

# 38. RESPONSIVE RULE

Desktop is the primary environment.

The application must still work on:

* Laptop
* Tablet
* Mobile

Do not build separate mobile functionality unless necessary.

Use responsive layouts.

---

# 39. DASHBOARD RULE

Dashboards must show information relevant to the user's role.

Co-Founder:

```text
Business
Sales
Clients
Projects
Team
Finance
```

Intern:

```text
My Clients
My Projects
My Tasks
Deadlines
My Progress
```

Never show irrelevant financial or company-wide information to interns.

---

# 40. SEARCH RULE

Search results must respect permissions.

Example:

An intern searching for:

```text
Client
```

must only receive clients assigned to them.

Never fetch all records and filter them only in the frontend.

---

# 41. FILTER RULE

Filters must be applied server-side for protected data.

Do not rely on frontend filtering to hide unauthorized records.

---

# 42. PERFORMANCE RULE

Avoid unnecessary database queries.

Use:

* Proper indexes
* Prisma relations carefully
* Pagination
* Server-side filtering
* Server-side sorting

Do not load thousands of records when only 20 are displayed.

---

# 43. PAGINATION RULE

Large datasets should use pagination.

Especially:

* Leads
* Clients
* Projects
* Tasks
* Activity logs
* Payments
* Expenses

---

# 44. CODE ORGANIZATION

Keep responsibilities separated.

Preferred architecture:

```text
UI
↓
Server Action / API
↓
Validation
↓
Authorization
↓
Business Logic
↓
Prisma
↓
PostgreSQL
```

Do not put database logic directly inside UI components.

---

# 45. COMPONENT RULE

Components should have a single clear responsibility.

Avoid huge components containing:

* UI
* Database queries
* Business calculations
* Permission logic
* Validation
* Notifications

Separate these concerns.

---

# 46. BUSINESS LOGIC RULE

Business logic must be reusable.

For example:

Profit calculation should not be separately implemented in:

* Dashboard
* Finance
* Reports

Create one trusted calculation method and reuse it.

---

# 47. SECURITY-FIRST DEVELOPMENT

Whenever a feature is created, ask:

1. Who can access it?
2. What data can they see?
3. What can they modify?
4. What happens if they manipulate the request?
5. Should the action be logged?
6. Should a notification be created?

Security is part of feature development, not a final step.

---

# 48. NO HARD-CODED BUSINESS DATA

Do not hard-code:

* Users
* Clients
* Leads
* Projects
* Financial values
* Permissions
* Dynamic statuses

Configuration may be centralized, but business records belong in PostgreSQL.

---

# 49. NO DUPLICATE LOGIC

Before creating a new function/component:

Check whether the same functionality already exists.

Reuse existing:

* Components
* Validation schemas
* Permission functions
* Database utilities
* Formatting utilities
* Business calculations

---

# 50. NO UNNECESSARY DEPENDENCIES

Do not install a package simply because it is convenient.

Before adding a dependency:

1. Check whether existing tools solve the problem.
2. Check bundle impact.
3. Check maintenance.
4. Check security.
5. Check whether the dependency is actually necessary.

---

# 51. ENVIRONMENT VARIABLES

Secrets must never be committed to Git.

Use environment variables for:

```text
DATABASE_URL
AUTH_SECRET
CLOUDINARY credentials
Other API secrets
```

Never hard-code credentials.

Never place secrets inside frontend code.

---

# 52. GIT RULES

Use Git.

Recommended branch structure:

```text
main
develop
feature/*
fix/*
```

Do not commit:

* `.env`
* Secrets
* API keys
* Passwords
* Private credentials
* Temporary files

Commit messages should clearly describe the change.

Example:

```text
feat: add lead pipeline
fix: restrict intern project access
feat: add project task assignment
```

---

# 53. MIGRATION RULE

Database schema changes must use Prisma migrations.

Never manually modify production database structure without a corresponding migration.

Every schema change should be reviewed for:

* Existing data
* Relationships
* Indexes
* Backward compatibility

---

# 54. DESTRUCTIVE ACTION RULE

Destructive actions must require confirmation.

Examples:

* Delete lead
* Delete client
* Delete project
* Delete task
* Delete expense

Prefer archive/soft-delete where business history should be preserved.

---

# 55. FINANCIAL DATA RULE

Financial records should generally not be permanently deleted.

Prefer:

```text
VOID
CANCELLED
ARCHIVED
```

where appropriate.

Maintain financial history.

---

# 56. AUDITABILITY

Important business actions should be traceable.

A co-founder should be able to determine:

```text
Who
did what
to which record
and when
```

---

# 57. NO OVERENGINEERING

Do not introduce:

* Microservices
* Kubernetes
* Complex queues
* Multiple databases
* Separate backend applications
* Event-driven architecture

unless the product genuinely requires them.

The MVP should remain simple.

---

# 58. NO FEATURE CREEP

If a requested feature is outside the PRD:

1. Identify it.
2. Check whether it fits an existing module.
3. Do not automatically build it.
4. Ask for approval before expanding the product scope.

---

# 59. MODULE INDEPENDENCE

Each module should be logically separated.

For example:

```text
Leads
Clients
Projects
Finance
```

may be related, but their business logic should not become tightly coupled.

---

# 60. CROSS-MODULE WORKFLOW

The primary workflow is:

```text
Lead
 ↓
Won
 ↓
Client
 ↓
Onboarding
 ↓
Project
 ↓
Tasks
 ↓
Delivery
 ↓
Payment
 ↓
Expenses
 ↓
Profit
 ↓
Reports
```

Changes to one stage must not silently corrupt another stage.

---

# 61. TESTING RULE

Every major feature should be tested for:

### Functional

Does it work?

### Permission

Can the correct role access it?

### Security

Can an unauthorized user bypass it?

### Validation

What happens with invalid input?

### Error

What happens when something fails?

### Responsive

Does it work on smaller screens?

---

# 62. ROLE TESTING

For every protected feature test at minimum:

```text
Co-Founder → Allowed
Intern → Allowed/Denied according to rules
Unauthenticated → Denied
```

---

# 63. DATA INTEGRITY

Never allow:

* Orphan projects
* Tasks without valid users
* Payments linked to nonexistent clients
* Expenses linked to nonexistent projects
* Duplicate relationships
* Invalid status values

Use database constraints where appropriate.

---

# 64. REPORTING RULE

Reports should use trusted source data.

Do not create separate manually maintained reporting data unless necessary.

For example:

Revenue reports should derive from payment records.

Task completion reports should derive from task records.

---

# 65. TIME & DATE RULE

Store timestamps consistently.

Prefer UTC in the database.

Convert timestamps to the user's appropriate timezone when displaying them.

Be careful with:

* Deadlines
* Follow-ups
* Payment dates
* Activity logs
* Notifications

---

# 66. ACCESSIBILITY

UI should support:

* Keyboard navigation
* Clear labels
* Sufficient contrast
* Focus states
* Accessible buttons
* Accessible form errors

Do not sacrifice usability for visual effects.

---

# 67. AI CODING AGENT RULES

If an AI coding agent is used:

Before changing code it must:

1. Understand the existing architecture.
2. Check related files.
3. Check existing components.
4. Check existing database models.
5. Check permission logic.
6. Avoid duplicating existing functionality.
7. Make the smallest appropriate change.

Do not rewrite unrelated files.

Do not modify the architecture without approval.

---

# 68. AI DATABASE RULE

An AI coding agent must never:

* Drop the database
* Delete production data
* Reset production migrations
* Remove tables containing business data

without explicit authorization.

Destructive database commands require explicit confirmation.

---

# 69. AI SECURITY RULE

An AI coding agent must never:

* Expose secrets
* Commit `.env`
* Disable authentication to "make development easier"
* Disable authorization checks
* Bypass permission checks
* Return financial data to interns
* Remove security validation

even temporarily in production code.

---

# 70. FEATURE COMPLETION CHECKLIST

A feature is not complete until:

```text
[ ] UI implemented
[ ] Database implemented
[ ] Server logic implemented
[ ] Validation implemented
[ ] Authorization implemented
[ ] Error handling implemented
[ ] Loading state implemented
[ ] Empty state implemented
[ ] Notifications considered
[ ] Activity logging considered
[ ] Responsive design checked
[ ] Security tested
```

---

# 71. DEFINITION OF DONE

A feature is considered DONE only when:

* It works.
* It is secure.
* It respects roles.
* It follows the design system.
* It has proper validation.
* It handles errors.
* It does not expose restricted data.
* It does not introduce unnecessary complexity.
* It does not break existing modules.

---

# 72. FINAL RULE

When in doubt, follow this priority:

```text
SECURITY
   ↓
DATA INTEGRITY
   ↓
BUSINESS LOGIC
   ↓
USER EXPERIENCE
   ↓
PERFORMANCE
   ↓
VISUAL POLISH
```

Never sacrifice security or data integrity for convenience.

---

# 73. PROJECT NORTH STAR

Evolix OS should feel like:

> **A clean, premium, purpose-built operating system for running a digital agency.**

It should not feel like:

> A complicated enterprise ERP.

Keep the system focused.

Keep it understandable.

Keep permissions strict.

Keep the code maintainable.

Build only what Evolix actually needs.
