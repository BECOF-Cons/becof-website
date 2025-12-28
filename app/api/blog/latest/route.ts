import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
      },
      include: {
        category: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 3,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching latest blog posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}
