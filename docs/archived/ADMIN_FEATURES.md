# Admin Management Features

## Overview

This document describes the new admin management and service management features added to the BECOF website.

## Features

### 1. Super Admin Concept

The system now supports two types of admin users:

- **Super Admin** (`SUPER_ADMIN`): Full access including ability to manage other admins
- **Admin** (`ADMIN`): Can manage content, appointments, payments, and service pricing

### 2. Admin Management (Super Admin Only)

Super Admins can access the Admin Management page at `/admin/users` to:

- **View Active Admins**: See all current admin users with their roles and join dates
- **Invite New Admins**: Send email invitations to new admin users
  - Specify the email address
  - Choose the role (Admin or Super Admin)
  - System generates a secure invitation token
- **Monitor Pending Invitations**: Track invitations that haven't been accepted yet
- **Remove Admins**: Delete admin accounts (cannot delete yourself)

#### Admin Invitation Flow

1. Super Admin invites a new admin by providing their email and role
2. System sends an email to the invitee with a secure setup link
3. The invitation expires in 7 days
4. Invitee clicks the link and completes their profile:
   - Enters their full name
   - Creates a secure password (minimum 8 characters)
5. Account is created and they can immediately log in

### 3. Service Management (All Admins)

Admins can now fully manage services at `/admin/pricing`:

#### Service CRUD Operations

- **Create New Services**:
  - Name (English & French)
  - Description (English & French)
  - Price (numeric or text like "Sur devis")
  - Service Type (from predefined enum)
  - Active/Inactive status
  - Display order

- **Edit Existing Services**:
  - Update all service details
  - Change pricing
  - Modify descriptions and names
  - Adjust display order

- **Delete Services**:
  - Remove services that are no longer offered
  - Confirmation required

- **Toggle Status**:
  - Activate/Deactivate services without deleting them
  - Inactive services can be hidden from public view

## Database Schema Changes

### New Models

#### AdminInvitation
```prisma
model AdminInvitation {
  id        String   @id @default(cuid())
  email     String   @unique
  role      UserRole
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Service
```prisma
model Service {
  id             String      @id @default(cuid())
  nameEn         String
  nameFr         String
  descriptionEn  String
  descriptionFr  String
  price          String
  serviceType    ServiceType @unique
  active         Boolean     @default(true)
  displayOrder   Int         @default(0)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}
```

### Updated Enums

```prisma
enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN  // NEW
}
```

## API Routes

### Admin Management

- `GET /api/admin/users` - List all admins and pending invitations (Super Admin only)
- `POST /api/admin/users` - Invite new admin (Super Admin only)
- `DELETE /api/admin/users?userId=<id>` - Remove admin (Super Admin only)

### Admin Setup

- `GET /api/admin/setup?token=<token>` - Verify invitation token
- `POST /api/admin/setup` - Complete admin registration

### Service Management

- `GET /api/admin/services` - List all services
- `POST /api/admin/services` - Create new service (Admin/Super Admin)
- `PUT /api/admin/services` - Update service (Admin/Super Admin)
- `DELETE /api/admin/services?id=<id>` - Delete service (Admin/Super Admin)

## Scripts

### Seed Default Services

```bash
npm run seed:services
```

Seeds the database with 7 default services:
- Orientation Session
- University Selection
- Application Help
- Career Counseling
- Career Coaching
- Group Workshop
- Follow-up Session

### Promote User to Super Admin

```bash
npm run promote:superadmin <email>
```

Promotes an existing admin user to Super Admin role.

Example:
```bash
npm run promote:superadmin admin@becof.tn
```

## Security Considerations

1. **Role-Based Access Control**: 
   - All admin pages check for ADMIN or SUPER_ADMIN role
   - Super Admin-only pages additionally verify SUPER_ADMIN role

2. **Invitation Security**:
   - Tokens are cryptographically secure (32-byte random hex)
   - Invitations expire after 7 days
   - Tokens are single-use only
   - Cannot reuse or share invitation links

3. **Self-Protection**:
   - Super Admins cannot delete their own account
   - Prevents accidental lockouts

4. **Email Verification**:
   - Invited admins have their email auto-verified
   - Regular users follow standard verification flow

## Email Templates

The system sends formatted HTML emails for:

1. **Admin Invitations**: Professional email with role information and setup link
2. **Existing Emails**: All appointment/payment emails remain unchanged

## UI/UX Updates

### Navigation

- Super Admins see an additional "Admin Management" menu item
- Regular Admins see standard menu without user management

### Service Management

- Modern card-based interface for services
- Inline editing for quick updates
- Visual indicators for active/inactive services
- Drag-and-drop-style ordering (via display order field)
- Real-time status toggling

### Admin Management

- Clean list view of active admins
- Pending invitations section with expiry dates
- Modal-based invitation form
- Role badges for visual distinction

## Testing Checklist

- [ ] Create initial Super Admin
- [ ] Super Admin can invite new Admin
- [ ] Super Admin can invite new Super Admin
- [ ] Email invitation is received
- [ ] Invitation link opens setup page
- [ ] Can complete admin registration
- [ ] New admin can log in
- [ ] New admin cannot access `/admin/users`
- [ ] New Super Admin can access `/admin/users`
- [ ] Can create new service
- [ ] Can edit existing service
- [ ] Can delete service
- [ ] Can toggle service active/inactive
- [ ] Services display in correct order
- [ ] Cannot delete own admin account

## Future Enhancements

Potential improvements for future versions:

1. **Audit Logging**: Track admin actions and changes
2. **Permission Granularity**: Fine-grained permissions per admin
3. **Bulk Operations**: Bulk activate/deactivate services
4. **Service Categories**: Group services into categories
5. **Multi-language Support**: Additional language options
6. **Service Images**: Add images/icons to services
7. **Resend Invitations**: Ability to resend expired invitations
8. **Admin Activity Dashboard**: See last login, recent actions
9. **Two-Factor Authentication**: Enhanced security for admin accounts
10. **Service Templates**: Quick service creation from templates
