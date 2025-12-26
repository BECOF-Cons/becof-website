import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const blogPostSchema = z.object({
  titleEn: z.string().min(1),
  titleFr: z.string().min(1),
  slugEn: z.string().min(1),
  slugFr: z.string().min(1),
  contentEn: z.string().min(1),
  contentFr: z.string().min(1),
  excerptEn: z.string().min(1),
  excerptFr: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  published: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role as string;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any)?.id;
    if (!userId) {
      console.error('User ID not found in session:', session);
      return NextResponse.json(
        { error: 'User ID not found. Please log out and log in again.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = blogPostSchema.parse(body);

    const post = await prisma.blogPost.create({
      data: {
        ...validatedData,
        categoryId: validatedData.categoryId || null,
        coverImage: validatedData.coverImage || null,
        authorId: userId,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
