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

    const body = await request.json();
    const { nameEn, nameFr, descriptionEn, descriptionFr, price, serviceType, active, displayOrder } = body;

    // Validate required fields
    if (!nameEn || !nameFr || !descriptionEn || !descriptionFr || !price || !serviceType) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    try {
      // Get all existing services sorted
      const allServices = await prisma.service.findMany({
        orderBy: { displayOrder: 'asc' },
      });

      let targetPosition = displayOrder && displayOrder > 0 ? displayOrder : allServices.length + 1;
      
      // Cap the target position to max existing + 1
      if (targetPosition > allServices.length + 1) {
        targetPosition = allServices.length + 1;
      }

      // Create the new service temporarily at the end
      const newService = await prisma.service.create({
        data: {
          nameEn,
          nameFr,
          descriptionEn,
          descriptionFr,
          price,
          serviceType,
          active: active ?? true,
          displayOrder: 9999, // Temporary high value
        },
      });

      // Rebuild the entire list with new normalized positions
      const allServicesWithNew = [...allServices, newService];
      
      // Insert the new service at the target position
      allServicesWithNew.splice(allServicesWithNew.length - 1, 1); // Remove from end
      allServicesWithNew.splice(targetPosition - 1, 0, newService); // Insert at target position

      // Update all services with sequential positions (1, 2, 3, 4...)
      for (let i = 0; i < allServicesWithNew.length; i++) {
        await prisma.service.update({
          where: { id: allServicesWithNew[i].id },
          data: { displayOrder: i + 1 },
        });
      }

      // Get the updated list
      const finalServices = await prisma.service.findMany({
        orderBy: { displayOrder: 'asc' },
      });

      return NextResponse.json({ service: newService, allServices: finalServices });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Database operation failed', 
        details: dbError instanceof Error ? dbError.message : 'Unknown error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update service
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, nameEn, nameFr, descriptionEn, descriptionFr, price, active, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    try {
      // Build update object for non-position fields
      const updateFields: Record<string, any> = {};
      if (nameEn !== undefined) updateFields.nameEn = nameEn;
      if (nameFr !== undefined) updateFields.nameFr = nameFr;
      if (descriptionEn !== undefined) updateFields.descriptionEn = descriptionEn;
      if (descriptionFr !== undefined) updateFields.descriptionFr = descriptionFr;
      if (price !== undefined) updateFields.price = price;
      if (typeof active === 'boolean') updateFields.active = active;

      // Update non-position fields first
      if (Object.keys(updateFields).length > 0) {
        await prisma.service.update({
          where: { id },
          data: updateFields,
        });
      }

      // Handle position change separately if provided
      if (typeof displayOrder === 'number' && displayOrder >= 1) {
        // Get all services sorted
        const allServices = await prisma.service.findMany({
          orderBy: { displayOrder: 'asc' },
        });

        // Find the current service
        const currentIndex = allServices.findIndex(s => s.id === id);
        if (currentIndex === -1) {
          throw new Error('Service not found');
        }

        const currentPosition = currentIndex + 1; // Convert to 1-based
        let targetPosition = displayOrder;

        // Cap target position to valid range
        if (targetPosition > allServices.length) {
          targetPosition = allServices.length;
        }

        // Only reorder if position changed
        if (currentPosition !== targetPosition) {
          // Remove service from current position
          const [movedService] = allServices.splice(currentIndex, 1);
          
          // Insert at new position (convert to 0-based index)
          allServices.splice(targetPosition - 1, 0, movedService);

          // Update all services with sequential positions (1, 2, 3, 4...)
          for (let i = 0; i < allServices.length; i++) {
            await prisma.service.update({
              where: { id: allServices[i].id },
              data: { displayOrder: i + 1 },
            });
          }
        }
      }

      // Get the final updated list
      const finalServices = await prisma.service.findMany({
        orderBy: { displayOrder: 'asc' },
      });

      const updatedService = finalServices.find(s => s.id === id);

      return NextResponse.json({ service: updatedService, allServices: finalServices });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Database operation failed', 
        details: dbError instanceof Error ? dbError.message : 'Unknown error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
