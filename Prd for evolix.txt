# EVOLIX OS

## Product Requirements Document — v1.0

**Product Name:** Evolix OS
**Product Type:** Internal CRM + Agency Management System
**Version:** MVP v1.0
**Organization:** Evolix
**Primary Users:** 3 Co-Founders + Interns
**Database:** PostgreSQL
**Status:** Product Definition

---

# 1. PRODUCT OVERVIEW

Evolix OS is a private internal software system built to manage the complete workflow of Evolix.

Evolix provides digital services including:

* Website Development
* Software Development
* Branding
* Logo & Brand Identity
* Social Media Management
* Digital Marketing
* Product/A+ Listing
* 3D Animation
* UI/UX Design
* Other custom digital services

The purpose of Evolix OS is to bring the agency's internal operations into one system.

The system will manage:

**Leads → Sales → Clients → Onboarding → Projects → Tasks → Team → Finance → Reports**

---

# 2. RELATIONSHIP WITH EXISTING EVOLIX WEBSITE

Evolix already has a public website.

The existing website and Evolix OS are separate products.

## Existing Evolix Website

The public website is responsible for:

* Marketing
* Services
* Portfolio
* Company information
* SEO
* Lead generation
* Contact forms

## Evolix OS

Evolix OS is responsible for:

* Lead management
* Sales pipeline
* Client management
* Client onboarding
* Project management
* Task management
* Intern management
* Payments
* Expenses
* Profitability
* Business reporting

---

# 3. FUTURE WEBSITE INTEGRATION

The system should be designed so the existing Evolix website can eventually connect to Evolix OS.

Example:

```text
Existing Evolix Website
        ↓
Contact / Enquiry Form
        ↓
Evolix OS API
        ↓
New Lead
        ↓
Co-Founder Assigned
        ↓
Follow-Up
        ↓
Proposal
        ↓
Won
        ↓
Client
```

This integration is **not required for the first MVP** unless implemented later.

The database and API architecture should allow it in the future.

---

# 4. PRODUCT GOAL

Evolix OS should give the three co-founders a complete view of the business.

A co-founder should be able to quickly understand:

* How many leads exist
* Which leads need follow-up
* Which deals are being negotiated
* Which deals are won
* Which clients are active
* Which clients are onboarding
* Which projects are running
* Who is working on each project
* Which tasks are pending
* Which tasks are overdue
* How much money has been received
* How much is pending
* What expenses have occurred
* How much profit Evolix is making
* How the team is performing

The intern experience should be completely different.

An intern should only need to know:

> **What work is assigned to me, for which client, and when is it due?**

---

# 5. USERS

There are two system roles.

## ROLE 1 — CO-FOUNDER

There are three co-founders.

All three co-founders have the same permissions.

They have full access to Evolix OS.

They can:

* Manage leads
* Manage sales
* Manage clients
* Manage onboarding
* Manage projects
* Manage tasks
* Assign work
* Manage interns
* Manage payments
* Manage expenses
* View profit
* View reports

---

# ROLE 2 — INTERN

Interns have restricted access.

Interns can only access information related to their assigned work.

They can:

* View their dashboard
* View assigned clients
* View assigned projects
* View assigned tasks
* Update task status
* Comment on tasks
* Upload relevant files
* View deadlines
* View their own performance

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
* Other interns' private performance data

---

# 6. CORE PRODUCT PRINCIPLE

## Co-Founder

The system should answer:

> **"What is happening in Evolix?"**

## Intern

The system should answer:

> **"What do I need to work on?"**

The interface should remain simple and focused.

---

# 7. MODULES

Evolix OS will contain exactly **8 primary modules**.

### 01 — Dashboard

### 02 — Leads & Sales

### 03 — Clients

### 04 — Onboarding

### 05 — Projects & Tasks

### 06 — Team & Interns

### 07 — Finance

### 08 — Reports

There will be **no AI assistant module** in the MVP.

Do not add unnecessary modules.

---

# 8. MODULE 01 — DASHBOARD

The dashboard must be role-based.

---

## CO-FOUNDER DASHBOARD

### Main KPIs

Display:

* Total Leads
* Active Clients
* Active Projects
* Revenue
* Expenses
* Net Profit
* Pending Payments
* Pending Tasks

---

## SALES OVERVIEW

Display:

* New Leads
* Qualified Leads
* Meetings
* Proposals
* Negotiations
* Won Deals
* Lost Deals
* Conversion Rate

---

## PROJECT OVERVIEW

Display:

* Active Projects
* Completed Projects
* Overdue Projects
* Projects At Risk

---

## TEAM OVERVIEW

Display:

* Total Team Members
* Active Interns
* Pending Tasks
* Overdue Tasks

---

## ATTENTION REQUIRED

Show important alerts:

* Overdue follow-ups
* Overdue payments
* Upcoming project deadlines
* Overdue tasks
* Projects at risk

Clicking an alert should open the relevant record.

---

# INTERN DASHBOARD

The intern dashboard must contain no financial information.

Display:

### My Clients

Number of assigned clients.

### My Projects

Number of assigned projects.

### My Pending Tasks

Number of incomplete tasks.

### Due Today

Tasks due today.

### Overdue

Overdue tasks.

### Today's Work

Each task shows:

* Task name
* Client
* Project
* Deadline
* Priority
* Status

### My Progress

Display:

* Completed Tasks
* Pending Tasks
* Overdue Tasks
* Completion Rate

---

# 9. MODULE 02 — LEADS & SALES

## Purpose

Manage every potential customer from initial enquiry to deal closure.

---

## LEAD FIELDS

Each lead contains:

* Lead ID
* Name
* Business Name
* Phone
* WhatsApp
* Email
* Instagram
* Website
* Lead Source
* Service Interested In
* Estimated Deal Value
* Assigned Co-Founder
* Status
* Priority
* Next Follow-Up
* Notes
* Created Date
* Last Contacted

---

# LEAD SOURCES

* Instagram
* Facebook
* WhatsApp
* Website
* LinkedIn
* Referral
* Freelancer Platform
* Direct Contact
* Other

---

# SALES STAGES

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

---

# SALES PIPELINE

Use a Kanban board.

Each lead can move between stages.

Co-founders can:

* Create leads
* Edit leads
* Assign leads
* Move stages
* Add notes
* Schedule follow-ups
* Mark won/lost

---

# FOLLOW-UP

Track:

* Last contacted
* Next follow-up
* Follow-up history
* Follow-up notes

Highlight overdue follow-ups.

---

# WON DEAL

When a lead becomes WON:

Show:

**CONVERT TO CLIENT**

The system should preserve the lead history.

---

# 10. MODULE 03 — CLIENTS

## Purpose

Maintain complete client information.

---

# CLIENT INFORMATION

### Business

* Business Name
* Owner Name
* Phone
* WhatsApp
* Email
* Website
* Instagram
* Address

### Services

Services purchased.

### Projects

Client projects.

### Tasks

Relevant tasks.

### Files

* Logo
* Images
* Documents
* Brand assets
* Project files

### Notes

Internal notes.

### Activity

Track important client activity.

---

# CLIENT STATUS

```text
ONBOARDING
ACTIVE
PAUSED
COMPLETED
ARCHIVED
```

---

# CLIENT ACCESS

Co-founder:

**All clients**

Intern:

**Only assigned clients**

---

# 11. MODULE 04 — ONBOARDING

## Purpose

Turn a won deal into an organized active client.

---

# ONBOARDING FLOW

```text
WON DEAL
   ↓
CLIENT CREATED
   ↓
ONBOARDING
   ↓
CLIENT INFORMATION
   ↓
REQUIREMENTS
   ↓
ASSETS
   ↓
ACCESS
   ↓
AGREEMENT
   ↓
PAYMENT
   ↓
ONBOARDING COMPLETE
   ↓
CREATE PROJECT
```

---

# ONBOARDING CHECKLIST

## CLIENT INFORMATION

* Business Name
* Contact Person
* Phone
* Email
* Address
* Website
* Social Profiles

## REQUIREMENTS

* Website
* Software
* Branding
* Social Media
* Marketing
* Product Listing
* 3D Animation
* Other

## ASSETS

Upload:

* Logo
* Product images
* Brand guidelines
* Existing designs
* Content
* Documents

## AGREEMENTS

Store:

* Proposal
* Agreement
* Contract
* Documents

## PAYMENT

Co-founder only:

* Deal Value
* Advance
* Paid Amount
* Remaining Amount
* Payment Status

Interns must not see these values.

---

# 12. MODULE 05 — PROJECTS & TASKS

## Purpose

Manage service delivery.

---

# PROJECT FIELDS

* Project Name
* Client
* Service
* Project Manager
* Start Date
* Deadline
* Status
* Priority
* Description
* Assigned Team
* Progress

---

# PROJECT STATUS

```text
PLANNING
IN_PROGRESS
ON_HOLD
CLIENT_REVIEW
REVISION
COMPLETED
CANCELLED
```

---

# TASK FIELDS

* Task Name
* Client
* Project
* Description
* Assigned Person
* Priority
* Deadline
* Status
* Attachments
* Comments
* Created Date
* Completed Date

---

# TASK STATUS

```text
TODO
IN_PROGRESS
IN_REVIEW
COMPLETED
```

---

# TASK PRIORITY

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# TASK ASSIGNMENT

Co-founders can assign tasks to:

* Co-founders
* Interns

The assigned user receives a notification.

---

# INTERN EXPERIENCE

Interns see only:

* Assigned clients
* Assigned projects
* Assigned tasks
* Task descriptions
* Files
* Comments
* Deadlines
* Status

They do not see:

* Project revenue
* Project cost
* Project profit
* Payment information

---

# 13. MODULE 06 — TEAM & INTERNS

## Purpose

Manage team members and work allocation.

---

# TEAM LIST

Display:

* Name
* Role
* Status
* Active Projects
* Active Tasks
* Pending Tasks
* Overdue Tasks
* Completion Rate

---

# TEAM PROFILE

* Name
* Profile Photo
* Role
* Email
* Phone
* Joining Date
* Skills
* Status

---

# WORKLOAD

Co-founders can view:

* Tasks per person
* Projects per person
* Pending tasks
* Overdue tasks
* Workload distribution

---

# INTERN PERFORMANCE

Track:

* Completed Tasks
* Pending Tasks
* Overdue Tasks
* Completion Rate
* On-Time Completion
* Assigned Clients
* Assigned Projects

Interns can only view their own performance.

---

# 14. MODULE 07 — FINANCE

## Access

**CO-FOUNDER ONLY**

Interns have zero access.

---

# PAYMENTS

Track:

* Client
* Project
* Deal Value
* Invoice Amount
* Paid Amount
* Pending Amount
* Payment Date
* Payment Status
* Payment Reference
* Notes

---

# EXPENSES

Track:

* Expense Name
* Category
* Amount
* Date
* Description
* Related Project
* Paid By
* Receipt

---

# EXPENSE CATEGORIES

* Freelancer
* Intern
* Software
* Hosting
* Domain
* Advertising
* Equipment
* Transportation
* Miscellaneous

---

# PROFIT CALCULATION

Project Profit:

```text
Revenue - Direct Costs = Project Profit
```

Profit Margin:

```text
Project Profit ÷ Revenue × 100
```

---

# FINANCE DASHBOARD

Display:

* Total Revenue
* Total Expenses
* Net Profit
* Pending Payments
* Monthly Revenue
* Monthly Expenses
* Project Profitability

---

# 15. MODULE 08 — REPORTS

## CO-FOUNDER REPORTS

### Sales

* Leads
* Qualified Leads
* Won Deals
* Lost Deals
* Conversion Rate
* Pipeline
* Sales by Co-Founder
* Lead Source Performance

### Clients

* Total Clients
* Active Clients
* New Clients
* Completed Clients

### Projects

* Active Projects
* Completed Projects
* Overdue Projects
* Projects At Risk
* Average Completion Time

### Team

* Tasks Completed
* Tasks Pending
* Tasks Overdue
* Workload
* Intern Performance

### Finance

* Revenue
* Expenses
* Profit
* Pending Payments
* Project Profitability
* Monthly Performance

---

# INTERN REPORTS

Interns can only see their own:

* Completed Tasks
* Pending Tasks
* Overdue Tasks
* Completion Rate
* On-Time Completion
* Assigned Projects

No company-wide financial information.

---

# 16. PERMISSION MATRIX

| Module        | Co-Founder    | Intern          |
| ------------- | ------------- | --------------- |
| Dashboard     | Full Business | Personal        |
| Leads & Sales | Full          | Assigned Work   |
| Clients       | All           | Assigned Only   |
| Onboarding    | Full          | Assigned Work   |
| Projects      | All           | Assigned Only   |
| Tasks         | All           | Assigned Only   |
| Team          | Full          | Own Profile     |
| Finance       | Full          | No Access       |
| Reports       | Full          | Own Performance |

---

# 17. SECURITY

Security is a core requirement.

Permissions must be enforced on the backend.

Do not rely on hiding frontend components.

For example:

```text
Intern
   ↓
GET /finance
   ↓
Authorization Check
   ↓
403 Forbidden
```

An intern must not be able to access restricted data by:

* Changing URLs
* Manipulating IDs
* Calling APIs directly
* Modifying frontend state
* Inspecting network requests

---

# 18. DATABASE

The primary database will be:

# PostgreSQL

The database should use relational structures with proper:

* Primary keys
* Foreign keys
* Indexes
* Constraints
* Relationships

---

# CORE DATABASE ENTITIES

```text
Users
Leads
LeadActivities
Clients
Onboardings
Projects
ProjectMembers
Tasks
TaskComments
TaskAttachments
Payments
Expenses
Notifications
ActivityLogs
```

---

# 19. CORE DATA RELATIONSHIP

```text
USER
 │
 ├── LEADS
 │
 └── PROJECTS / TASKS
          │
          ▼
        CLIENT
          │
          ▼
      ONBOARDING
          │
          ▼
       PROJECT
          │
          ▼
         TASK
          │
          ▼
       TEAM MEMBER
          
CLIENT
  │
  ├── PAYMENTS
  │
  └── PROJECT

PROJECT
  │
  └── EXPENSES
```

---

# 20. ACTIVITY LOG

Important system actions should be recorded.

Examples:

* Lead created
* Lead assigned
* Lead status changed
* Lead converted
* Client created
* Onboarding completed
* Project created
* Task assigned
* Task completed
* File uploaded
* Payment added
* Expense added
* Project status changed

This creates an audit trail.

---

# 21. NOTIFICATIONS

## Co-Founder

Notify about:

* New leads
* Follow-ups
* Won deals
* New clients
* Payment issues
* Overdue projects
* Overdue tasks
* Completed tasks

## Intern

Notify about:

* New task assignment
* Deadline approaching
* Task overdue
* Comment added
* File added
* Task status change

---

# 22. SEARCH & FILTERS

Co-founders should be able to search and filter:

* Leads
* Clients
* Projects
* Tasks
* Team Members
* Payments
* Expenses

Interns should only search records they are authorized to access.

---

# 23. DESIGN REQUIREMENTS

The design should feel like a premium modern SaaS product.

## Visual Direction

* Light-first interface
* Clean
* Minimal
* Professional
* Premium
* Spacious
* Modern
* Fast
* Responsive

Use Evolix branding.

Avoid:

* Excessive gradients
* Excessive animations
* Overly colorful dashboards
* Cluttered screens
* Old-fashioned ERP appearance

---

# 24. RESPONSIVE DESIGN

Support:

* Desktop
* Laptop
* Tablet
* Mobile

Desktop is the primary environment.

---

# 25. TECH STACK

## Language

**TypeScript**

## Framework

**Next.js**

## Frontend

**React + Next.js**

## Styling

**Tailwind CSS**

## UI Components

**shadcn/ui**

## Backend

**Next.js Server Actions / API Routes**

## Database

**PostgreSQL**

## ORM

**Prisma**

## Authentication

**Auth.js**

## Validation

**Zod**

## Forms

**React Hook Form**

## Charts

**Recharts**

## File Storage

**Cloudinary**

## Version Control

**Git + GitHub**

## Hosting

Use the existing Evolix hosting infrastructure.

No new hosting architecture is required at the PRD stage.

---

# 26. APPLICATION STRUCTURE

Recommended structure:

```text
evolix-os/
│
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── leads/
│   ├── clients/
│   ├── onboarding/
│   ├── projects/
│   ├── team/
│   ├── finance/
│   └── reports/
│
├── components/
│   ├── ui/
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
│   ├── validations/
│   └── utils/
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
└── types/
```

---

# 27. MVP OUT OF SCOPE

Do not build these in v1:

* AI assistant
* Customer portal
* Mobile app
* WhatsApp automation
* Email marketing
* Payroll
* Advanced accounting
* Inventory management
* Complex HR management
* Multi-company management
* Subscription billing
* Enterprise features

These can be considered after the core system is stable.

---

# 28. DEVELOPMENT PHASES

## PHASE 1 — FOUNDATION

Build:

* Next.js application
* TypeScript
* PostgreSQL
* Prisma
* Authentication
* User roles
* Permissions
* Base UI
* Navigation

---

## PHASE 2 — DASHBOARD

Build:

* Co-founder dashboard
* Intern dashboard
* Role-based information
* KPI cards
* Task overview
* Alerts

---

## PHASE 3 — LEADS & SALES

Build:

* Lead CRUD
* Pipeline
* Lead stages
* Follow-ups
* Lead assignment
* Convert to client

---

## PHASE 4 — CLIENTS

Build:

* Client CRUD
* Client profiles
* Client projects
* Client tasks
* Files
* Activity timeline

---

## PHASE 5 — ONBOARDING

Build:

* Onboarding checklist
* Requirements
* Asset uploads
* Documents
* Payment status
* Completion

---

## PHASE 6 — PROJECTS & TASKS

Build:

* Projects
* Tasks
* Assignments
* Deadlines
* Priorities
* Comments
* Files
* Project progress

---

## PHASE 7 — TEAM

Build:

* Team members
* Intern profiles
* Workload
* Performance
* Assignments

---

## PHASE 8 — FINANCE

Build:

* Payments
* Expenses
* Revenue
* Profit
* Profit margin
* Financial dashboard

---

## PHASE 9 — REPORTS

Build:

* Sales reports
* Client reports
* Project reports
* Team reports
* Financial reports
* Intern personal reports

---

## PHASE 10 — FINAL QA

Test:

* Authentication
* Permissions
* CRUD operations
* Database relationships
* API security
* File uploads
* Calculations
* Responsive UI
* Error handling
* Loading states
* Empty states
* Unauthorized access

---

# 29. SUCCESS CRITERIA

The MVP is considered successful when a co-founder can complete the following workflow:

```text
Create Lead
     ↓
Track Sales
     ↓
Win Deal
     ↓
Convert to Client
     ↓
Complete Onboarding
     ↓
Create Project
     ↓
Assign Intern
     ↓
Create Tasks
     ↓
Track Delivery
     ↓
Record Payment
     ↓
Record Expenses
     ↓
Calculate Profit
     ↓
View Reports
```

And an intern can:

```text
Login
 ↓
See Assigned Client
 ↓
See Assigned Project
 ↓
See Assigned Tasks
 ↓
Work
 ↓
Update Task
 ↓
Upload Files
 ↓
Comment
 ↓
Complete Task
 ↓
See Personal Progress
```

without ever accessing restricted company financial information.

---

# 30. FINAL PRODUCT DEFINITION

**Evolix OS is the internal operating system of Evolix.**

It connects:

**LEADS → SALES → CLIENTS → ONBOARDING → PROJECTS → TASKS → TEAM → FINANCE → REPORTS**

The three co-founders receive a complete business overview.

Interns receive a focused work-management experience.

The product should remain:

**Simple.**

**Fast.**

**Secure.**

**Professional.**

**Agency-focused.**

**Easy to scale.**

---

# 31. FINAL TECHNICAL DECISION

The development stack is locked as:

> **TypeScript + Next.js + React + Tailwind CSS + shadcn/ui + PostgreSQL + Prisma + Auth.js + Zod + React Hook Form + Recharts + Cloudinary**

The existing Evolix website remains separate.

PostgreSQL is the single primary relational database for Evolix OS.

The application should be developed module-by-module according to this PRD.
