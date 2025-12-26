import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - List all blog categories
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: {
        nameFr: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nameEn, nameFr } = body;

    if (!nameEn || !nameFr) {
      return NextResponse.json(
        { error: 'Both English and French names are required' },
        { status: 400 }
      );
    }

    const category = await prisma.blogCategory.create({
      data: {
        nameEn,
        nameFr,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
