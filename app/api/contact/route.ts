import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received contact form data:', body);
    const validatedData = contactSchema.parse(body);

    console.log('Contact form submission validated:', validatedData);

    // Send notification to admins (non-blocking)
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      try {
        const { notifyAdminsContactForm } = await import('@/lib/email');
        await notifyAdminsContactForm({
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
        });
        console.log('Contact notification email sent successfully');
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Error sending contact notification email:', emailError);
      }
    } else {
      console.warn('SMTP credentials not configured - email not sent');
    }

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in contact form:', error);
    
    if (error instanceof z.ZodError) {
      const issues = error.issues || [];
      console.error('Validation error details:', issues);
      const fieldErrors = issues.map(e => `${e.path.join('.')}: ${e.message}`);
      return NextResponse.json(
        { 
          error: 'Validation error', 
          message: fieldErrors.join(', '),
          details: issues
        },
        { status: 400 }
      );
    }

    console.error('Error processing contact form:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: 'Failed to send message', message: errorMessage },
      { status: 500 }
    );
  }
}
