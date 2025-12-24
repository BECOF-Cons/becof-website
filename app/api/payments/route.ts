import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const paymentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  paymentMethod: z.enum(['KONNECT', 'FLOUCI', 'D17', 'BANK_TRANSFER']),
  amount: z.number().positive('Amount must be positive'),
});

// POST - Create payment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = paymentSchema.parse(body);

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: validatedData.appointmentId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        appointmentId: validatedData.appointmentId,
        status: { in: ['PENDING', 'COMPLETED'] },
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this appointment' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: appointment.userId, // Get userId from appointment
        appointmentId: validatedData.appointmentId,
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
        status: 'PENDING',
      },
    });

    // Handle different payment methods
    let paymentUrl = null;

    switch (validatedData.paymentMethod) {
      case 'KONNECT':
        // TODO: Integrate Konnect API
        // paymentUrl = await createKonnectPayment(payment);
        console.log('Konnect payment created:', payment.id);
        break;

      case 'FLOUCI':
        // TODO: Integrate Flouci API
        // paymentUrl = await createFlouciPayment(payment);
        console.log('Flouci payment created:', payment.id);
        break;

      case 'D17':
        // TODO: Integrate D17 API
        // paymentUrl = await createD17Payment(payment);
        console.log('D17 payment created:', payment.id);
        break;

      case 'BANK_TRANSFER':
        // For bank transfer, keep status as PENDING until admin verifies
        // Send bank transfer instructions to client
        if (process.env.SMTP_USER && process.env.SMTP_PASSWORD && appointment) {
          const { sendBankTransferInstructions } = await import('@/lib/email');
          
          sendBankTransferInstructions({
            id: appointment.id,
            clientName: appointment.studentName,
            clientEmail: appointment.studentEmail,
            date: appointment.preferredDate,
            service: appointment.serviceType,
            price: appointment.price,
          }).catch((err) => console.error('Error sending bank transfer instructions:', err));
        }
        
        console.log('Bank transfer payment initiated (pending verification):', payment.id);
        break;
    }

    return NextResponse.json(
      {
        message: 'Payment initiated successfully',
        paymentId: payment.id,
        paymentUrl, // Will be null for bank transfer
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

// GET - List payments (admin only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');

    const payments = await prisma.payment.findMany({
      where: appointmentId ? { appointmentId } : undefined,
      include: {
        appointment: {
          select: {
            studentName: true,
            studentEmail: true,
            preferredDate: true,
            serviceType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
