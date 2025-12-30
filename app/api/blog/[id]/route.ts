import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

// GET - Get single blog post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PATCH - Update blog post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = blogPostSchema.parse(body);

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if slugs are unique (if changed)
    if (validatedData.slugEn !== existingPost.slugEn) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slugEn: validatedData.slugEn },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this English slug already exists' },
          { status: 400 }
        );
      }
    }

    if (validatedData.slugFr !== existingPost.slugFr) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slugFr: validatedData.slugFr },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this French slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update publishedAt if status changed to PUBLISHED
    const updateData: any = { ...validatedData };
    if (validatedData.status === 'PUBLISHED' && !existingPost.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
