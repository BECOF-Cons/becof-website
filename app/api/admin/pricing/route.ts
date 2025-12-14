import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const pricingSchema = z.object({
  orientation: z.string().min(1),
  careerCounseling: z.string().min(1),
  careerCoaching: z.string().min(1),
  groupWorkshop: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = pricingSchema.parse(body);

    // Update or create pricing settings
    const pricingUpdates = [
      { key: 'price_orientation', value: validatedData.orientation },
      { key: 'price_career_counseling', value: validatedData.careerCounseling },
      { key: 'price_career_coaching', value: validatedData.careerCoaching },
      { key: 'price_group_workshop', value: validatedData.groupWorkshop },
    ];

    for (const update of pricingUpdates) {
      await prisma.siteSettings.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: {
          key: update.key,
          value: update.value,
        },
      });
    }

    return NextResponse.json(
      { message: 'Prices updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating prices:', error);
    return NextResponse.json(
      { error: 'Failed to update prices' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const prices = await prisma.siteSettings.findMany({
      where: {
        key: {
          in: [
            'price_orientation',
            'price_career_counseling',
            'price_career_coaching',
            'price_group_workshop',
          ],
        },
      },
    });

    const priceMap = {
      orientation: prices.find((p) => p.key === 'price_orientation')?.value || '150',
      careerCounseling: prices.find((p) => p.key === 'price_career_counseling')?.value || '200',
      careerCoaching: prices.find((p) => p.key === 'price_career_coaching')?.value || 'Sur devis',
      groupWorkshop: prices.find((p) => p.key === 'price_group_workshop')?.value || '80',
    };

    return NextResponse.json(priceMap, { status: 200 });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
