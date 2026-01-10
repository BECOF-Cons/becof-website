import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Webhook handler for payment gateway callbacks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, status, transactionId, paymentMethod } = body;

    // Verify webhook signature (implement based on payment gateway)
    // For now, we'll just process it

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        userId: true,
        appointmentId: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        transactionId: true,
        createdAt: true,
        updatedAt: true,
        appointment: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            date: true,
            time: true,
            serviceType: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status === 'success' ? 'COMPLETED' : 'FAILED',
        transactionId: transactionId || null,
      },
    });

    // If payment successful, update appointment status
    if (status === 'success' && payment.appointmentId) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      });

      // Send payment confirmation email
      if (process.env.SMTP_USER && process.env.SMTP_PASSWORD && payment.appointment) {
        const { sendPaymentConfirmation, sendAppointmentConfirmation } = await import(
          '@/lib/email'
        );

        // Send payment receipt
        sendPaymentConfirmation({
          appointmentId: payment.appointmentId,
          amount: parseFloat(payment.amount),
          paymentMethod: payment.method || 'Unknown',
          transactionId: transactionId,
          appointment: {
            clientName: payment.appointment.name,
            clientEmail: payment.appointment.email,
            date: payment.appointment.date,
            serviceType: payment.appointment.serviceType,
          },
        }).catch((err) => console.error('Error sending payment confirmation:', err));

        // Send appointment confirmation
        sendAppointmentConfirmation({
          clientName: payment.appointment.name,
          clientEmail: payment.appointment.email,
          date: payment.appointment.date,
          serviceType: payment.appointment.serviceType,
        }).catch((err) =>
          console.error('Error sending appointment confirmation:', err)
        );
      }

      console.log('Payment successful, appointment confirmed:', payment.appointmentId);
    }

    return NextResponse.json({
      message: 'Webhook processed successfully',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
