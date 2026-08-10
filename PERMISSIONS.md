# EVOLIX OS — PERMISSIONS.md

## 1. Purpose

This document defines the access-control model for Evolix OS.

Evolix currently has two application roles:

```text
CO_FOUNDER
INTERN
```

There are three co-founders, and all three have the same role-level permissions.

Interns have restricted operational access.

The most important security rule is:

> **Interns must never have access to financial data.**

That means the application must not expose to interns:

- Revenue
- Expenses
- Profit
- Payment amounts
- Financial reports
- Finance dashboard
- Financial analytics

---

# 2. SECURITY PRINCIPLE

Permissions must be enforced on the server.

Do not rely on:

```text
Hidden buttons
Hidden menu items
Frontend route guards
```

as the primary security mechanism.

Correct flow:

```text
Request
 ↓
Authentication
 ↓
Identify User
 ↓
Load Role
 ↓
Authorization
 ↓
Validate Input
 ↓
Database Query
 ↓
Response
```

---

# 3. ROLES

## CO_FOUNDER

Full business access.

Can manage:

```text
Dashboard
Leads
Clients
Onboarding
Projects
Tasks
Team
Finance
Reports
Settings
Activity Logs
```

---

## INTERN

Operational access only.

Can access:

```text
Personal Dashboard
Assigned Clients
Assigned Projects
Assigned Tasks
Task Comments
Relevant Files
Notifications
Profile
```

Cannot access:

```text
Finance
Revenue
Expenses
Profit
Payment amounts
Financial reports
Business-wide analytics
Other interns' private work unless explicitly shared
Unassigned client/project data
```

---

# 4. MODULE ACCESS MATRIX

| Module | Co-Founder | Intern |
|---|---|---|
| Dashboard | Full | Personal only |
| Leads | Full | No |
| Clients | Full | Assigned only |
| Onboarding | Full | Assigned only |
| Projects | Full | Assigned only |
| Tasks | Full | Assigned only |
| Team | Full | No |
| Finance | Full | No |
| Reports | Full | Personal operational stats only |
| Notifications | Full | Own only |
| Activity Logs | Full | No |
| Profile | Own + team management | Own only |
| Settings | Full | Limited/none |

---

# 5. DASHBOARD PERMISSIONS

## Co-Founder Dashboard

Can display:

```text
Total Leads
New Leads
Active Clients
Active Projects
Pending Tasks
Overdue Tasks
Revenue
Expenses
Profit
Pending Payments
Lead Conversion
Project Progress
Team Workload
```

---

## Intern Dashboard

Can display only information relevant to that intern:

```text
My Tasks
Pending Tasks
Today's Tasks
Overdue Tasks
Completed Tasks
Assigned Clients
Assigned Projects
Task Progress
Recent Notifications
```

Do NOT calculate or return:

```text
Revenue
Expenses
Profit
Payment Amount
Financial Charts
Company-wide Financial Data
```

---

# 6. INTERN DASHBOARD RULE

The intern dashboard should query only operational data.

Example:

```text
GET /dashboard/intern
```

Server should execute queries filtered by:

```text
currentUser.id
```

Example concept:

```text
tasks.assignedToId = currentUser.id
```

Do not fetch all tasks and filter them in React.

Wrong:

```text
Database
 ↓
All Tasks
 ↓
React filters intern tasks
```

Correct:

```text
Database
 ↓
Only assigned tasks
 ↓
Server
 ↓
Intern
```

---

# 7. LEAD PERMISSIONS

## Co-Founder

Can:

- Create leads
- View all leads
- Edit leads
- Assign leads
- Change status
- Add activities
- Convert lead to client
- Delete/archive where allowed

## Intern

No lead-management access in MVP.

Interns should not see the sales pipeline or lead values.

---

# 8. CLIENT PERMISSIONS

## Co-Founder

Can:

- Create client
- View all clients
- Edit client
- Archive client
- Assign client
- View all projects
- View onboarding
- View financial records

## Intern

Can view only clients connected to their assigned work.

A client is visible to an intern when:

```text
Intern is assigned to a project
```

or:

```text
Intern has an assigned task for that client
```

Intern client data should contain only operational information.

---

# 9. CLIENT FINANCIAL RESTRICTION

Intern client responses must exclude:

```text
payments
expenses
contractValue
revenue
profit
paymentStatus
paymentReference
```

Example safe client response:

```json
{
  "id": "...",
  "name": "Client Name",
  "companyName": "Company",
  "status": "ACTIVE",
  "projects": []
}
```

Do not return the complete database object and hide fields in the UI.

---

# 10. ONBOARDING PERMISSIONS

## Co-Founder

Full access.

Can:

- Create onboarding
- Edit onboarding
- Update status
- Assign work
- Complete onboarding

## Intern

Can view onboarding information relevant to assigned clients/projects.

Can:

- View assigned onboarding work
- Complete assigned operational tasks
- Add task comments

Cannot:

- Modify financial information
- View payment amounts
- View contract values

---

# 11. PROJECT PERMISSIONS

## Co-Founder

Can:

- Create project
- Edit project
- Archive project
- Assign owner
- Add members
- Remove members
- View all projects
- View project financial information

## Intern

Can view only projects where:

```text
project_members.userId = currentUser.id
```

or where they have an assigned task connected to the project.

Intern can:

- View project details
- View assigned work
- Update assigned tasks
- Comment
- Upload relevant files

Intern cannot:

- Change project financial values
- View contractValue
- View project revenue
- View project expenses
- View project profit

---

# 12. TASK PERMISSIONS

## Co-Founder

Full access.

Can:

- Create
- Assign
- Reassign
- Edit
- Delete/archive where appropriate
- Change status
- View all tasks
- Comment
- Attach files

## Intern

Can manage tasks assigned to them.

Allowed:

```text
View
Start
Update status
Complete
Comment
Upload attachment
```

Not allowed:

```text
Assign tasks to others
Reassign tasks
Delete other users' tasks
Modify financial information
```

---

# 13. TASK STATUS CONTROL

Interns may update:

```text
TODO → IN_PROGRESS
IN_PROGRESS → IN_REVIEW
IN_PROGRESS → COMPLETED
IN_REVIEW → COMPLETED
```

Depending on the workflow.

For strict review workflow, completion can require co-founder approval:

```text
IN_PROGRESS
 ↓
IN_REVIEW
 ↓
CO-FOUNDER APPROVES
 ↓
COMPLETED
```

This should be the preferred workflow for important client work.

---

# 14. TASK ASSIGNMENT SECURITY

Only co-founders can:

```text
Assign
Reassign
Change project membership
```

Interns cannot assign themselves to arbitrary client work.

---

# 15. FINANCE PERMISSIONS

Finance is strictly:

```text
CO_FOUNDER ONLY
```

Interns must receive:

```text
403 Forbidden
```

when attempting direct access.

Examples:

```text
/finance
/finance/payments
/finance/expenses
/finance/reports
```

---

# 16. PAYMENT PERMISSIONS

## Co-Founder

Can:

- Create payment
- Edit payment
- Mark payment paid
- Mark payment pending
- Record reference
- View all payments
- View payment history

## Intern

Cannot:

- View payments
- Create payments
- Edit payments
- Delete payments
- View payment amounts
- View payment status

---

# 17. EXPENSE PERMISSIONS

## Co-Founder

Can:

- Create expense
- Edit expense
- View expenses
- Categorize expenses
- View expense reports

## Intern

No access.

Even expenses categorized as:

```text
INTERN
```

must not be visible to interns.

---

# 18. PROFIT PERMISSIONS

Profit is calculated from:

```text
Paid Revenue - Expenses
```

Only co-founders can access the result.

Intern API responses must never contain:

```text
profit
netProfit
revenue
totalExpenses
```

even if the UI does not display them.

---

# 19. REPORT PERMISSIONS

## Co-Founder Reports

Can view:

```text
Revenue
Expenses
Profit
Lead Conversion
Client Growth
Project Performance
Task Performance
Team Workload
```

## Intern Reports

Only personal operational reports:

```text
Tasks Completed
Tasks Pending
Tasks Overdue
Project Work
Completion Rate
```

No financial reports.

---

# 20. TEAM MODULE

## Co-Founder

Can:

- View all users
- Create intern accounts
- Activate/deactivate interns
- Assign work
- View workload
- Manage project membership

## Intern

Can:

- View own profile
- View limited names of teammates where required for collaboration

Cannot:

- Manage users
- Create users
- Change roles
- Activate/deactivate users

---

# 21. ROLE CHANGE

Role changes are highly privileged.

Only co-founders can change:

```text
INTERN → CO_FOUNDER
CO_FOUNDER → INTERN
```

This should require explicit confirmation.

Every role change must create an activity log.

---

# 22. ACTIVITY LOG ACCESS

## Co-Founder

Can view:

```text
All activity logs
```

## Intern

Cannot access the global activity-log module.

Intern actions may still be recorded internally for audit purposes.

---

# 23. NOTIFICATION PERMISSIONS

Users can access only their own notifications.

Rule:

```text
notification.userId = currentUser.id
```

An intern cannot read another user's notifications.

---

# 24. FILE PERMISSIONS

Files inherit the permissions of their parent entity.

Example:

```text
Task attachment
 ↓
Task permissions
```

If an intern can access the task, they can access its permitted attachments.

If they cannot access the task, they cannot access its attachments.

---

# 25. API SECURITY

Every protected server endpoint must check authorization.

Example:

```text
POST /api/projects
```

requires:

```text
Authenticated
+
CO_FOUNDER
```

Example:

```text
GET /api/tasks/my
```

requires:

```text
Authenticated
+
Current user
```

Example:

```text
GET /api/finance
```

requires:

```text
Authenticated
+
CO_FOUNDER
```

---

# 26. SERVER ACTION SECURITY

Server Actions must enforce the same authorization rules as API routes.

Never assume:

```text
Server Action
=
Trusted
```

Every mutation must verify:

```text
session
user
role
resource ownership/access
input
```

---

# 27. RESOURCE-LEVEL AUTHORIZATION

Role checks alone are not enough.

Example:

```text
User = INTERN
```

does not automatically mean they can access every project.

Also check:

```text
ProjectMember
```

or:

```text
Assigned Task
```

---

# 28. ACCESS CHECK EXAMPLES

## Can intern view project?

```text
Is authenticated?
        ↓
Is INTERN?
        ↓
Is user a project member?
        OR
Does user have an assigned task?
        ↓
YES → allow
NO → 403
```

---

## Can intern update task?

```text
Is authenticated?
        ↓
Is task assigned to current user?
        ↓
YES → allow operational update
NO → 403
```

---

## Can user view finance?

```text
Is authenticated?
        ↓
Is CO_FOUNDER?
        ↓
YES → allow
NO → 403
```

---

# 29. DATA MINIMIZATION

Every API response should return only fields needed by the client.

Avoid:

```text
SELECT *
```

for sensitive business objects.

Prefer explicit selections.

Especially for intern queries.

---

# 30. FINANCIAL DATA ISOLATION

Finance queries should live in a dedicated service:

```text
finance.service.ts
```

Example:

```text
getRevenue()
getExpenses()
getProfit()
getPayments()
```

These functions should require:

```text
CO_FOUNDER
```

before execution.

---

# 31. INTERN SERVICES

Create dedicated operational queries such as:

```text
getMyTasks()
getMyProjects()
getMyClients()
getMyNotifications()
getMyWorkStats()
```

This reduces the risk of accidentally exposing financial data.

---

# 32. MIDDLEWARE

Middleware may handle:

```text
Authentication
Route protection
Session checks
```

But middleware should not be the only authorization layer.

Business-level authorization belongs in:

```text
Server Actions
API routes
Service layer
```

---

# 33. DATABASE SECURITY

The application should enforce access control before queries.

Do not depend entirely on frontend restrictions.

For sensitive environments, PostgreSQL Row Level Security may be introduced later.

For MVP:

```text
Application authorization
+
Prisma query filtering
```

is sufficient if implemented correctly.

---

# 34. AUDIT LOGGING

Log important actions:

```text
Lead created
Lead converted
Client created
Project created
Task assigned
Task completed
Payment created
Payment edited
Expense created
Expense edited
User created
Role changed
```

Intern activity should also be logged.

---

# 35. FAILED ACCESS ATTEMPTS

Unauthorized requests should return:

```text
401
```

when authentication is missing.

Return:

```text
403
```

when the user is authenticated but lacks permission.

Do not reveal sensitive information in the error.

Bad:

```text
"You cannot access this because this endpoint contains ₹2,50,000 revenue."
```

Good:

```text
"Forbidden"
```

---

# 36. FRONTEND NAVIGATION

Navigation should reflect permissions.

## Co-Founder

```text
Dashboard
Leads
Clients
Onboarding
Projects
Tasks
Team
Finance
Reports
```

## Intern

```text
Dashboard
My Clients
My Projects
My Tasks
Notifications
Profile
```

Finance should not appear in the intern sidebar.

However:

> Hiding a navigation item is not security.

The backend must still reject unauthorized access.

---

# 37. URL PROTECTION

Intern manually entering:

```text
/finance
```

must receive a protected response.

Intern manually entering:

```text
/reports/financial
```

must also be blocked.

---

# 38. CACHE SECURITY

Do not cache a sensitive co-founder response in a way that another user can receive.

User-specific dashboard data must be keyed by:

```text
userId
role
```

or otherwise isolated.

---

# 39. LOG SECURITY

Do not write sensitive information into application logs.

Never log:

```text
password
session token
database credentials
payment secrets
API keys
```

Financial values should not be logged unnecessarily.

---

# 40. AUTHENTICATION

Authentication establishes:

```text
Who is the user?
```

Authorization establishes:

```text
What can the user do?
```

Both are required.

---

# 41. FINAL PERMISSION MODEL

The system follows:

```text
                     EVOLIX OS
                         │
                ┌────────┴────────┐
                │                 │
          CO_FOUNDER            INTERN
                │                 │
        Full business       Operational only
             access               │
                │                 ├── My Tasks
                │                 ├── My Projects
                │                 ├── My Clients
                │                 ├── Notifications
                │                 └── Profile
                │
                ├── Leads
                ├── Clients
                ├── Onboarding
                ├── Projects
                ├── Tasks
                ├── Team
                ├── Finance
                └── Reports
```

---

# 42. NON-NEGOTIABLE RULES

1. Interns never access financial data.
2. Frontend hiding is never considered security.
3. Every protected mutation checks authorization.
4. Every resource access checks ownership/membership where required.
5. Financial services are co-founder only.
6. Intern dashboard queries only intern-specific operational data.
7. Users cannot change their own role.
8. Interns cannot assign themselves to arbitrary client work.
9. Financial records are never exposed through generic client/project queries.
10. Sensitive actions are logged.

---

# 43. IMPLEMENTATION ORDER

Build authorization in this order:

```text
1. Authentication
2. User/session lookup
3. Role guard
4. Resource access helpers
5. Co-founder authorization
6. Intern restrictions
7. Finance isolation
8. Dashboard-specific queries
9. API/server-action protection
10. Permission tests
```

---

# 44. NORTH STAR

The permission system should make it impossible for an intern to accidentally discover financial information simply because a developer forgot to hide a UI element.

Security must exist at the data-access boundary:

```text
DATABASE QUERY
      ↑
SERVICE AUTHORIZATION
      ↑
SERVER ACTION / API
      ↑
FRONTEND
```

The frontend is the presentation layer.

The server is the security boundary.
