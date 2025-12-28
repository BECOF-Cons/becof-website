import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const blogPostSchema = z.object({
  titleFr: z.string().min(1, 'French title is required'),
  titleEn: z.string().min(1, 'English title is required'),
  slugEn: z.string().min(1, 'English slug is required'),
  slugFr: z.string().min(1, 'French slug is required'),
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
      select: {
        id: true,
        titleEn: true,
        titleFr: true,
        slugEn: true,
        slugFr: true,
        excerptEn: true,
        excerptFr: true,
        contentEn: true,
        contentFr: true,
        coverImage: true,
        published: true,
        featured: true,
        categoryId: true,
        authorId: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            slugEn: true,
            slugFr: true,
          },
        },
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
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role as string;
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    const body = await req.json();
    const validatedData = blogPostSchema.parse(body);

    // Check if slugs are unique
    const existingSlugEn = await prisma.blogPost.findUnique({
      where: { slugEn: validatedData.slugEn },
    });

    if (existingSlugEn) {
      return NextResponse.json(
        { error: 'A post with this English slug already exists' },
        { status: 400 }
      );
    }

    const existingSlugFr = await prisma.blogPost.findUnique({
      where: { slugFr: validatedData.slugFr },
    });

    if (existingSlugFr) {
      return NextResponse.json(
        { error: 'A post with this French slug already exists' },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        ...validatedData,
        authorId: userId,
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
      },
      select: {
        id: true,
        titleEn: true,
        titleFr: true,
        slugEn: true,
        slugFr: true,
        excerptEn: true,
        excerptFr: true,
        contentEn: true,
        contentFr: true,
        coverImage: true,
        published: true,
        featured: true,
        categoryId: true,
        authorId: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
          },
        },
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
