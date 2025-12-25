import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const blogPostSchema = z.object({
  titleFr: z.string().min(1, 'French title is required'),
  titleEn: z.string().min(1, 'English title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerptFr: z.string().min(1, 'French excerpt is required'),
  excerptEn: z.string().min(1, 'English excerpt is required'),
  contentFr: z.string().min(1, 'French content is required'),
  contentEn: z.string().min(1, 'English content is required'),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  coverImage: z.string().optional(),
  tags: z.string().optional(),
  metaKeywords: z.string().optional(),
});

// GET - List all blog posts (with filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');

    const posts = await prisma.blogPost.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = blogPostSchema.parse(body);

    // Check if slug is unique
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        ...validatedData,
        authorId: session.user.id!,
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        category: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
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
