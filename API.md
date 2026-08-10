# EVOLIX OS — API.md

## 1. Purpose

This document defines the server/API contract for Evolix OS.

The API sits between:

```text
Frontend
   ↓
API / Server Actions
   ↓
Authorization
   ↓
Validation
   ↓
Service Layer
   ↓
Prisma
   ↓
PostgreSQL
```

The API must follow `PRD.md`, `RULES.md`, `ARCHITECTURE.md`, `DATABASE.md`, and `PERMISSIONS.md`.

---

# 2. API PRINCIPLES

1. Authentication is required for all private business operations.
2. Authorization is enforced server-side.
3. Interns can only access assigned operational data.
4. Finance endpoints are CO_FOUNDER only.
5. Never trust role/user IDs sent by the client.
6. Validate every mutation.
7. Use explicit database selections.
8. Never return sensitive financial fields to interns.
9. Mutations should create activity logs where appropriate.
10. Use transactions for multi-step business operations.

---

# 3. API STYLE

Use Next.js server-side API routes and/or Server Actions.

Recommended route structure:

```text
/api/auth/*
/api/dashboard/*
/api/leads/*
/api/clients/*
/api/onboarding/*
/api/projects/*
/api/tasks/*
/api/team/*
/api/finance/*
/api/reports/*
/api/notifications/*
/api/activity/*
```

Use REST-style routes for resource operations.

---

# 4. STANDARD RESPONSE FORMAT

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

Validation error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input.",
    "fields": {}
  }
}
```

---

# 5. HTTP STATUS CODES

Use:

```text
200 OK
201 CREATED
204 NO_CONTENT
400 BAD_REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT_FOUND
409 CONFLICT
422 UNPROCESSABLE_ENTITY
500 INTERNAL_SERVER_ERROR
```

---

# 6. AUTHENTICATION

Authentication is handled by the application's auth system.

The API should expose:

```text
GET /api/auth/me
```

### Access

Authenticated users.

### Response

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "CO_FOUNDER"
  }
}
```

Do not return:

```text
passwordHash
session secrets
tokens
```

---

# 7. AUTHORIZATION HELPERS

Create server-side helpers such as:

```text
requireAuth()
requireCoFounder()
requireIntern()
requireProjectAccess()
requireTaskAccess()
requireClientAccess()
```

Example:

```text
requireCoFounder()
```

must reject:

```text
INTERN
```

with:

```text
403
```

---

# 8. DASHBOARD API

## GET /api/dashboard

Returns the dashboard appropriate to the current user.

### CO_FOUNDER

Return:

```text
totalLeads
newLeads
activeClients
activeProjects
pendingTasks
overdueTasks
revenue
expenses
profit
pendingPayments
leadConversion
teamWorkload
```

### INTERN

Return only:

```text
myTasks
myPendingTasks
myOverdueTasks
myCompletedTasks
myClients
myProjects
myTaskProgress
notifications
```

Never return finance fields to an intern.

---

# 9. LEADS API

## GET /api/leads

### Access

CO_FOUNDER only.

### Query parameters

```text
status
priority
source
assignedToId
search
page
limit
```

### Response

Paginated leads.

---

## POST /api/leads

### Access

CO_FOUNDER only.

### Body

```json
{
  "name": "John",
  "companyName": "ABC",
  "email": "john@example.com",
  "phone": "...",
  "source": "INSTAGRAM",
  "service": "WEBSITE",
  "status": "NEW",
  "priority": "MEDIUM",
  "estimatedValue": "25000",
  "assignedToId": "...",
  "nextFollowUpAt": "...",
  "notes": "..."
}
```

### Actions

1. Validate input.
2. Verify assignee.
3. Create lead.
4. Create activity log.
5. Return lead.

---

## GET /api/leads/:id

### Access

CO_FOUNDER only.

---

## PATCH /api/leads/:id

### Access

CO_FOUNDER only.

Can update:

```text
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
```

Create activity log for important changes.

---

## DELETE /api/leads/:id

### Access

CO_FOUNDER only.

Prefer archive/status changes over permanent deletion.

---

# 10. LEAD ACTIVITIES

## GET /api/leads/:id/activities

### Access

CO_FOUNDER only.

---

## POST /api/leads/:id/activities

### Access

CO_FOUNDER only.

### Body

```json
{
  "type": "CALL",
  "content": "Discussed website requirements."
}
```

---

# 11. LEAD CONVERSION

## POST /api/leads/:id/convert

### Access

CO_FOUNDER only.

### Requirements

Lead must be:

```text
WON
```

### Transaction

```text
Verify lead
 ↓
Create client
 ↓
Mark conversion
 ↓
Create onboarding
 ↓
Create activity logs
 ↓
Commit
```

Return:

```json
{
  "success": true,
  "data": {
    "clientId": "...",
    "onboardingId": "..."
  }
}
```

---

# 12. CLIENT API

## GET /api/clients

### CO_FOUNDER

Can see all clients.

### INTERN

Only clients connected to their assigned work.

Intern response must exclude:

```text
payments
expenses
contractValue
revenue
profit
```

---

## POST /api/clients

### Access

CO_FOUNDER only.

---

## GET /api/clients/:id

### CO_FOUNDER

Full client details.

### INTERN

Only if the intern has legitimate project/task access.

Financial fields must be excluded.

---

## PATCH /api/clients/:id

### CO_FOUNDER

Full editing access.

### INTERN

Limited operational editing only if explicitly allowed by business rules.

Preferred MVP behavior:

```text
INTERN → READ ONLY
```

---

## POST /api/clients/:id/archive

### Access

CO_FOUNDER only.

---

# 13. ONBOARDING API

## GET /api/onboarding

### CO_FOUNDER

All onboarding records.

### INTERN

Only assigned onboarding work.

---

## POST /api/onboarding

### Access

CO_FOUNDER only.

---

## GET /api/onboarding/:id

Resource-level access required.

---

## PATCH /api/onboarding/:id

### CO_FOUNDER

Full access.

### INTERN

Only operational status/comment changes if explicitly permitted.

Never expose financial information.

---

# 14. PROJECT API

## GET /api/projects

### CO_FOUNDER

All projects.

### INTERN

Only:

```text
Projects where user is a member
```

or where they have assigned work.

---

## POST /api/projects

### Access

CO_FOUNDER only.

---

## GET /api/projects/:id

Resource-level authorization required.

---

## PATCH /api/projects/:id

### CO_FOUNDER

Full access.

### INTERN

Limited operational updates only.

Intern cannot change:

```text
contractValue
financial information
owner
```

---

## POST /api/projects/:id/members

### Access

CO_FOUNDER only.

### Body

```json
{
  "userId": "...",
  "role": "MEMBER"
}
```

---

## DELETE /api/projects/:id/members/:userId

### Access

CO_FOUNDER only.

---

# 15. TASK API

## GET /api/tasks

### CO_FOUNDER

Can query all tasks with filters.

### INTERN

Only assigned tasks.

Query parameters:

```text
status
priority
projectId
assignedToId
dueDate
page
limit
```

Intern requests must override arbitrary user filters.

Example:

```text
assignedToId = currentUser.id
```

---

## GET /api/tasks/my

### Access

Authenticated users.

Returns tasks assigned to current user.

---

## POST /api/tasks

### Access

CO_FOUNDER only.

### Body

```json
{
  "projectId": "...",
  "clientId": "...",
  "title": "Create homepage design",
  "description": "...",
  "priority": "HIGH",
  "assignedToId": "...",
  "dueDate": "..."
}
```

Server must verify:

```text
project exists
client matches project
assignee exists
assignee is active
```

---

## GET /api/tasks/:id

Resource-level authorization required.

---

## PATCH /api/tasks/:id

### CO_FOUNDER

Full task editing.

### INTERN

Can update only their assigned task's operational fields.

Allowed:

```text
status
description where appropriate
```

Not allowed:

```text
assignedToId
createdById
projectId
clientId
```

---

## DELETE /api/tasks/:id

### Access

CO_FOUNDER only.

Prefer cancellation/archive where possible.

---

# 16. TASK COMMENTS

## GET /api/tasks/:id/comments

Access requires task access.

---

## POST /api/tasks/:id/comments

Authenticated users with task access.

### Body

```json
{
  "content": "Homepage draft is ready for review."
}
```

---

# 17. TASK ATTACHMENTS

## GET /api/tasks/:id/attachments

Requires task access.

---

## POST /api/tasks/:id/attachments

Requires task access.

File upload should:

1. Validate file type.
2. Validate file size.
3. Upload to external storage.
4. Store metadata in PostgreSQL.
5. Create activity log if appropriate.

---

# 18. TEAM API

## GET /api/team

### Access

CO_FOUNDER only.

Return:

```text
id
name
email
role
avatarUrl
isActive
workload summary
```

Do not expose password hashes.

---

## POST /api/team/users

### Access

CO_FOUNDER only.

Create:

```text
INTERN
```

or another permitted role.

---

## PATCH /api/team/users/:id

### Access

CO_FOUNDER only.

Can update:

```text
name
avatarUrl
isActive
role
```

Role changes must be logged.

---

# 19. PROFILE API

## GET /api/profile

Authenticated user.

Returns own profile.

---

## PATCH /api/profile

Authenticated user.

Allowed:

```text
name
avatarUrl
```

Role cannot be changed by the user.

---

# 20. FINANCE API

All finance endpoints are:

```text
CO_FOUNDER ONLY
```

Intern requests return:

```text
403 FORBIDDEN
```

---

# 21. PAYMENTS API

## GET /api/finance/payments

Query:

```text
clientId
projectId
status
dateFrom
dateTo
page
limit
```

---

## POST /api/finance/payments

Body:

```json
{
  "clientId": "...",
  "projectId": "...",
  "amount": "25000.00",
  "paymentDate": "...",
  "method": "UPI",
  "status": "PAID",
  "reference": "...",
  "notes": "..."
}
```

Validate:

```text
amount > 0
client exists
project belongs to client
```

---

## GET /api/finance/payments/:id

CO_FOUNDER only.

---

## PATCH /api/finance/payments/:id

CO_FOUNDER only.

Important financial changes must create activity logs.

---

# 22. EXPENSE API

## GET /api/finance/expenses

Filters:

```text
category
clientId
projectId
dateFrom
dateTo
page
limit
```

---

## POST /api/finance/expenses

CO_FOUNDER only.

Body:

```json
{
  "projectId": "...",
  "clientId": "...",
  "category": "SOFTWARE",
  "description": "Hosting",
  "amount": "1200.00",
  "expenseDate": "...",
  "vendor": "Example",
  "paymentMethod": "UPI",
  "notes": "..."
}
```

---

## PATCH /api/finance/expenses/:id

CO_FOUNDER only.

---

# 23. FINANCE SUMMARY

## GET /api/finance/summary

### Access

CO_FOUNDER only.

### Query

```text
dateFrom
dateTo
```

### Response

```json
{
  "revenue": "100000.00",
  "expenses": "35000.00",
  "profit": "65000.00",
  "pendingPayments": "20000.00"
}
```

Profit must be calculated:

```text
PAID revenue - expenses
```

Do not store profit as a manually editable database field.

---

# 24. FINANCE CHARTS

## GET /api/finance/chart

CO_FOUNDER only.

Query:

```text
period=month
dateFrom
dateTo
```

Return aggregated data such as:

```json
[
  {
    "period": "2026-08",
    "revenue": "100000",
    "expenses": "35000",
    "profit": "65000"
  }
]
```

Aggregate in PostgreSQL.

---

# 25. REPORT API

## GET /api/reports/overview

### CO_FOUNDER

Return:

```text
lead conversion
client growth
project completion
task completion
revenue
expenses
profit
```

---

## GET /api/reports/operations

### CO_FOUNDER

Return:

```text
project performance
task performance
team workload
completion rates
```

---

## GET /api/reports/my-performance

### Authenticated user

Intern:

```text
own tasks
own completion rate
own overdue tasks
```

Co-founder may receive their own operational stats as well.

No finance for interns.

---

# 26. NOTIFICATIONS API

## GET /api/notifications

Return only:

```text
currentUser.notifications
```

---

## PATCH /api/notifications/:id/read

User can mark only their own notification as read.

---

## POST /api/notifications/read-all

Marks current user's notifications as read.

---

# 27. ACTIVITY API

## GET /api/activity

### Access

CO_FOUNDER only.

Filters:

```text
userId
entityType
entityId
action
dateFrom
dateTo
page
limit
```

Interns cannot access the global activity log.

---

# 28. SEARCH API

## GET /api/search

Search only entities the current user is authorized to see.

CO_FOUNDER may search:

```text
Leads
Clients
Projects
Tasks
```

Intern may search:

```text
Assigned Clients
Assigned Projects
Assigned Tasks
```

Never return unauthorized records.

---

# 29. PAGINATION

List APIs should support:

```text
page
limit
```

Recommended default:

```text
page = 1
limit = 20
```

Maximum:

```text
limit = 100
```

Never allow unlimited database queries from the frontend.

---

# 30. SORTING

Only allow whitelisted sort fields.

Example:

```text
createdAt
updatedAt
deadline
priority
status
```

Never inject arbitrary database column names from user input.

---

# 31. VALIDATION

Use Zod for request validation.

Example:

```text
createLeadSchema
updateLeadSchema
createClientSchema
createProjectSchema
createTaskSchema
createPaymentSchema
createExpenseSchema
```

Validation must happen before database operations.

---

# 32. FINANCIAL VALIDATION

For payment/expense amounts:

```text
must be numeric
must be greater than 0
must respect decimal precision
```

Do not accept:

```text
NaN
Infinity
negative amounts
empty strings
```

---

# 33. RESOURCE OWNERSHIP

Before modifying a resource:

```text
Find resource
 ↓
Check authorization
 ↓
Validate input
 ↓
Mutate
```

Do not rely only on:

```text
URL contains ID
```

---

# 34. TRANSACTIONS

Use database transactions for:

```text
Lead conversion
Task assignment + notification + log
Role change + log
Important financial mutation + log
```

Example:

```text
BEGIN
Create payment
Create activity log
COMMIT
```

---

# 35. NOTIFICATION TRIGGERS

Create notifications for:

```text
Task assigned
Task due
Task overdue
Client assigned
Project assigned
Payment received
Follow-up due
```

Intern notifications must never contain financial amounts.

Bad:

```text
"Payment of ₹50,000 received."
```

Good:

```text
"Client payment was recorded."
```

However, payment notifications themselves should only be sent to authorized co-founders.

---

# 36. ERROR HANDLING

Never expose:

```text
SQL errors
Prisma stack traces
database credentials
internal file paths
```

Production response:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong."
  }
}
```

Log the technical error securely on the server.

---

# 37. RATE LIMITING

Rate limiting should be applied especially to:

```text
Authentication
Search
File uploads
Public-facing endpoints
```

Internal authenticated CRUD can use reasonable request limits as the application scales.

---

# 38. API VERSIONING

MVP does not require complex versioning.

Keep routes under:

```text
/api/
```

If breaking API changes become necessary later:

```text
/api/v2/
```

can be introduced.

---

# 39. SERVER ACTIONS VS API ROUTES

Use Server Actions for:

```text
Internal form mutations
Create/update operations
Authenticated dashboard interactions
```

Use API routes when:

```text
External integrations
Webhooks
File upload endpoints
Client-side data endpoints
Future mobile app access
```

Both must use the same service and authorization layer.

---

# 40. SERVICE LAYER

API routes should remain thin.

Correct:

```text
API Route
 ↓
Auth
 ↓
Validation
 ↓
Service
 ↓
Prisma
```

Avoid putting complex business logic directly inside route handlers.

Recommended services:

```text
lead.service.ts
client.service.ts
onboarding.service.ts
project.service.ts
task.service.ts
finance.service.ts
report.service.ts
notification.service.ts
team.service.ts
```

---

# 41. API DIRECTORY STRUCTURE

Recommended:

```text
src/
├── app/
│   └── api/
│       ├── auth/
│       ├── dashboard/
│       ├── leads/
│       ├── clients/
│       ├── onboarding/
│       ├── projects/
│       ├── tasks/
│       ├── team/
│       ├── finance/
│       ├── reports/
│       ├── notifications/
│       └── activity/
│
├── services/
│   ├── lead.service.ts
│   ├── client.service.ts
│   ├── onboarding.service.ts
│   ├── project.service.ts
│   ├── task.service.ts
│   ├── finance.service.ts
│   ├── report.service.ts
│   ├── notification.service.ts
│   └── team.service.ts
│
├── lib/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   └── prisma.ts
```

---

# 42. NO DIRECT PRISMA IN COMPONENTS

Never:

```text
React Component
 ↓
Prisma
```

Correct:

```text
React Component
 ↓
Server Action/API
 ↓
Service
 ↓
Prisma
```

---

# 43. API SECURITY NORTH STAR

Every request follows:

```text
REQUEST
  ↓
AUTHENTICATE
  ↓
AUTHORIZE
  ↓
VALIDATE
  ↓
QUERY/MUTATE
  ↓
AUDIT
  ↓
RESPONSE
```

For interns:

```text
INTERN
 ↓
ASSIGNED OPERATIONAL DATA ONLY
 ↓
NO FINANCE
```

For co-founders:

```text
CO_FOUNDER
 ↓
FULL BUSINESS ACCESS
```

---

# 44. MVP API CHECKLIST

Before declaring the API complete:

```text
[ ] Authentication works
[ ] Role checks work
[ ] Co-founder routes protected
[ ] Intern routes restricted
[ ] Finance blocked for interns
[ ] Resource-level access works
[ ] Zod validation implemented
[ ] Pagination implemented
[ ] Errors standardized
[ ] Activity logging implemented
[ ] Notifications implemented
[ ] Financial calculations use Decimal
[ ] Transactions implemented where required
[ ] No Prisma access from components
[ ] No sensitive fields returned to interns
```

---

# 45. FINAL API RULE

The API is not merely a way to move data.

It is the enforcement layer between the Evolix UI and the business database.

The canonical architecture is:

```text
USER
 ↓
UI
 ↓
API / SERVER ACTION
 ↓
AUTHENTICATION
 ↓
AUTHORIZATION
 ↓
ZOD VALIDATION
 ↓
SERVICE
 ↓
PRISMA
 ↓
POSTGRESQL
 ↓
AUDIT / NOTIFICATION
 ↓
RESPONSE
```

This architecture must be followed throughout Evolix OS.
