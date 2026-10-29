# MantraComply Admin - Backoffice Management Portal

A full UI prototype of the **MantraComply Admin Dashboard** built with React 19, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Applications Manager (Credential Applications)**
  - Providers and Groups/Facilities tracking
  - Status management (Draft, Needs Info, Approved, Submitted, Under Review, Rejected)
  - Representative assignment at any stage
  - Full application detail preview & history timeline modals
- **Document Verification**
  - Document review table with file types and expiry dates
  - Interactive status dropdown (Pending, Verified, Unverified, Resubmitted)
  - Document preview sandbox modal with quick approval/rejection actions
- **Enrollment Applications**
  - Insurance enrollment dashboard with payer mappings
  - Status management and specialist tracking
  - Strict specialist data isolation (specialists only see their assigned applications)
- **User Management & Roles Control**
  - Team user list with active status and roles
  - Dedicated **Roles & Permissions** configuration tab for Super Admins
  - Custom role creation with granular module-level checkboxes (View, Edit, Approve, Assign)
  - Data boundary scope configuration (All Records Scope vs. Assigned Only Scope)
- **Plans & Features**
  - Subscription tiers and add-on services overview
  - Interactive "+ New Plan" modal
- **Organization Credits**
  - Quota and credit addon monitoring
  - "+ Set Burn Rates" modal configuration
- **Orders & Subscriptions**
  - B2B and B2C customer subscription tracking
- **Live Persona Switcher (Top Header)**
  - Instantly switch between Super Admin, Admin, and individual Credentialing Specialists to test role-based access control and specialist data isolation live

## 🛠 Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons**

## 📦 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

