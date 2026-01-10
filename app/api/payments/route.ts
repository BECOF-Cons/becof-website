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
      include: {
        payment: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists and is completed
    if (appointment.payment && appointment.payment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment already completed for this appointment' },
        { status: 400 }
      );
    }

    // Update existing payment or create new one
    let payment;
    if (appointment.payment) {
      // Update existing payment
      payment = await prisma.payment.update({
        where: { id: appointment.payment.id },
        data: {
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod,
          status: 'PENDING',
        },
      });
    } else {
      // Create new payment record
      // Get a valid userId - use appointment userId or find first admin
      let paymentUserId = appointment.userId;
      if (!paymentUserId) {
        const adminUser = await prisma.user.findFirst({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        });
        paymentUserId = adminUser?.id || '';
      }

      payment = await prisma.payment.create({
        data: {
          userId: paymentUserId,
          appointmentId: validatedData.appointmentId,
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod,
          status: 'PENDING',
        },
      });
    }

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
          
          // Get price from payment amount
          const price = parseFloat(payment.amount);
          
          sendBankTransferInstructions({
            id: appointment.id,
            clientName: appointment.name,
            clientEmail: appointment.email,
            date: appointment.date,
            serviceType: appointment.serviceType,
            price: price,
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
            name: true,
            email: true,
            date: true,
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
