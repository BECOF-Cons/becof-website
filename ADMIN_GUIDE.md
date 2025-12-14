# BECOF Website - Admin Guide

## Admin Credentials

**Default Admin:**
- Email: `admin@becof.tn`
- Password: `admin123`

⚠️ **Important:** Change the default admin password after first login!

## Creating New Admin Users

To create a new admin user, use the admin creation script:

```bash
npx tsx scripts/create-admin.ts <email> <password> <name>
```

**Example:**
```bash
npx tsx scripts/create-admin.ts john@becof.tn SecurePass123! "John Doe"
```

### Requirements:
- Email must be unique (not already registered)
- Password should be strong (min 8 characters recommended)
- Name should be the full name of the admin

### Output:
The script will display:
- ✅ Success confirmation
- Admin user details (email, name, role)
- Login credentials (for your records)

## Admin Dashboard Access

1. **Login:** http://localhost:3000/admin/login
2. **Dashboard:** http://localhost:3000/admin
3. **Appointments:** http://localhost:3000/admin/appointments

## Admin Features

### 1. Dashboard Overview
- Total appointments statistics
- Pending, confirmed, completed, and cancelled counts
- Recent appointments list

### 2. Appointments Management
- View all appointments with filters
- Confirm bank transfer payments manually
- View client details and service information
- Track payment status

### 3. Payment Confirmation
For bank transfer payments:
1. Admin receives email notification when appointment is booked
2. Client uploads payment proof to contact@becof.tn
3. Admin verifies payment in bank account
4. Click "Confirm Payment" button in dashboard
5. Appointment status changes to CONFIRMED
6. Client receives confirmation email

## Email Configuration

Contact form submissions are sent to:
- All admin users in the database
- `helmiboussetta11@gmail.com`
- `contact@becof.tn`

### SMTP Settings (in .env.local):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=helmiboussetta11@gmail.com
SMTP_PASSWORD=frxmdqftkxptlxop
EMAIL_FROM=BECOF <contact@becof.tn>
```

## Managing Users in Database

### View all users:
```bash
npx prisma studio
```

Then navigate to the `User` model to view/edit users.

### Promote existing user to admin:
1. Open Prisma Studio: `npx prisma studio`
2. Click on `User` model
3. Find the user by email
4. Change `role` field from `USER` to `ADMIN`
5. Save changes

### Remove admin access:
1. Open Prisma Studio
2. Find the admin user
3. Change `role` from `ADMIN` to `USER`
4. Save changes

## Security Best Practices

1. **Change default password immediately**
2. **Use strong passwords** for all admin accounts
3. **Limit admin access** to trusted personnel only
4. **Regularly review** admin user list
5. **Monitor** appointment and payment activities
6. **Keep credentials secure** - never commit .env.local to git

## Troubleshooting

### Can't login as admin
- Verify email and password are correct
- Check that user exists in database (prisma studio)
- Ensure `role` field is set to `ADMIN`
- Clear browser cookies and try again

### Not receiving emails
- Check spam folder
- Verify SMTP credentials in .env.local
- Test email sending with a contact form submission
- Check server logs for email errors

### Payment confirmation button not showing
- Button only appears for appointments with `PENDING` status
- Refresh the page to see updated status
- Check that you're logged in as admin

## Development Commands

```bash
# Start development server
npm run dev

# Open database viewer
npx prisma studio

# Create new admin
npx tsx scripts/create-admin.ts email@example.com password123 "Full Name"

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Run database migrations
npx prisma migrate dev
```

## Support

For technical issues or questions:
- Email: helmiboussetta11@gmail.com
- Check the main README.md for more documentation
