import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - List all services
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nameEn, nameFr, descriptionEn, descriptionFr, price, serviceType, active, displayOrder } = await request.json();

    // Validate required fields
    if (!nameEn || !nameFr || !descriptionEn || !descriptionFr || !price || !serviceType) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        nameEn,
        nameFr,
        descriptionEn,
        descriptionFr,
        price,
        serviceType,
        active: active ?? true,
        displayOrder: displayOrder ?? 0,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update service
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, nameEn, nameFr, descriptionEn, descriptionFr, price, active, displayOrder } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(nameEn && { nameEn }),
        ...(nameFr && { nameFr }),
        ...(descriptionEn && { descriptionEn }),
        ...(descriptionFr && { descriptionFr }),
        ...(price && { price }),
        ...(typeof active === 'boolean' && { active }),
        ...(typeof displayOrder === 'number' && { displayOrder }),
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove service
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
