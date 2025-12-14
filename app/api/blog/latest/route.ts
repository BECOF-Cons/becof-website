import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            nameEn: true,
            nameFr: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching latest blog posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}
