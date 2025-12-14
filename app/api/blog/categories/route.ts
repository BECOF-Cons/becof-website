import { NextResponse } from 'next/server';
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
