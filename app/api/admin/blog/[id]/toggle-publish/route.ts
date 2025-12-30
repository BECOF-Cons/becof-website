import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current post
    const currentPost = await prisma.blogPost.findUnique({
      where: { id },
      select: { published: true },
    });

    if (!currentPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Toggle the published status
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        published: !currentPost.published,
        publishedAt: !currentPost.published ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, published: post.published });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle publish status' },
      { status: 500 }
    );
  }
}
