#!/bin/bash

# BECOF Production Database Setup Script
# This script helps you set up the production database after deployment

echo "🚀 BECOF Production Database Setup"
echo "=================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it to your production PostgreSQL connection string"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    exit 1
fi

echo "✅ Migrations completed"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generate failed"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Prompt for admin creation
echo "👤 Admin User Setup"
echo "-------------------"
read -p "Do you want to create an admin user now? (y/n): " create_admin

if [ "$create_admin" = "y" ] || [ "$create_admin" = "Y" ]; then
    read -p "Admin email: " admin_email
    read -s -p "Admin password: " admin_password
    echo ""
    read -p "Admin name: " admin_name
    
    echo ""
    echo "Creating admin user..."
    npx tsx scripts/create-admin.ts "$admin_email" "$admin_password" "$admin_name"
    
    if [ $? -ne 0 ]; then
        echo "❌ Admin user creation failed"
    else
        echo "✅ Admin user created successfully!"
    fi
fi

echo ""
echo "🎉 Production database setup complete!"
echo ""
echo "Next steps:"
echo "1. Initialize pricing settings via admin panel or SQL"
echo "2. Create your first blog post"
echo "3. Test the booking flow"
echo "4. Configure email settings for notifications"
