import nodemailer from 'nodemailer';
import { prisma } from './prisma';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Get admin emails
async function getAdminEmails(): Promise<string[]> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });
    return admins.map((admin) => admin.email);
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    // Fallback to env variable
    return process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : [];
  }
}

// Send appointment confirmation to client
export async function sendAppointmentConfirmation(appointment: {
  clientName: string;
  clientEmail: string;
  date: Date;
  service: string;
}) {
  const formattedDate = new Date(appointment.date).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'BECOF <noreply@becof.tn>',
    to: appointment.clientEmail,
    subject: 'Confirmation de rendez-vous - BECOF',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14B8A6, #9333EA); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14B8A6; }
          .button { display: inline-block; background: #14B8A6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BECOF</h1>
            <p>Confirmation de Rendez-vous</p>
          </div>
          <div class="content">
            <p>Bonjour ${appointment.clientName},</p>
            <p>Votre rendez-vous a été confirmé avec succès !</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #14B8A6;">Détails du rendez-vous</h3>
              <p><strong>📅 Date :</strong> ${formattedDate}</p>
              <p><strong>💼 Service :</strong> ${appointment.service}</p>
              <p><strong>📍 Lieu :</strong> BECOF - Tunis, Tunisia</p>
            </div>

            <p>Un événement Google Calendar a été créé et envoyé à votre adresse email. Vous recevrez une invitation que vous pourrez ajouter à votre calendrier.</p>

            <p><strong>Important :</strong></p>
            <ul>
              <li>Veuillez arriver 5 minutes avant l'heure du rendez-vous</li>
              <li>Apportez vos documents académiques (relevés de notes, diplôme du baccalauréat)</li>
              <li>Préparez vos questions sur l'orientation</li>
            </ul>

            <div class="footer">
              <p>Pour toute question, contactez-nous :</p>
              <p>📧 contact@becof.tn | 📞 +216 12 345 678</p>
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                © 2025 BECOF - Orientation Consulting
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation sent to:', appointment.clientEmail);
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
  }
}

// Notify admins of new appointment
export async function notifyAdminsNewAppointment(appointment: {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: Date;
  service: string;
  notes?: string;
}) {
  const adminEmails = await getAdminEmails();
  if (adminEmails.length === 0) return;

  const formattedDate = new Date(appointment.date).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'BECOF <noreply@becof.tn>',
    to: adminEmails,
    subject: `Nouveau rendez-vous - ${appointment.clientName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14B8A6, #9333EA); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-grid { display: grid; gap: 15px; }
          .info-item { background: white; padding: 15px; border-radius: 6px; border-left: 3px solid #14B8A6; }
          .button { display: inline-block; background: #14B8A6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 Nouveau Rendez-vous</h2>
          </div>
          <div class="content">
            <p><strong>Un nouveau rendez-vous a été réservé !</strong></p>
            
            <div class="info-grid">
              <div class="info-item">
                <strong>👤 Client :</strong> ${appointment.clientName}
              </div>
              <div class="info-item">
                <strong>📧 Email :</strong> ${appointment.clientEmail}
              </div>
              <div class="info-item">
                <strong>📞 Téléphone :</strong> ${appointment.clientPhone}
              </div>
              <div class="info-item">
                <strong>📅 Date :</strong> ${formattedDate}
              </div>
              <div class="info-item">
                <strong>💼 Service :</strong> ${appointment.service}
              </div>
              ${
                appointment.notes
                  ? `
              <div class="info-item">
                <strong>📝 Notes :</strong> ${appointment.notes}
              </div>
              `
                  : ''
              }
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/appointments" class="button">
                Voir dans le dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification sent for appointment:', appointment.id);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

// Send payment confirmation
export async function sendPaymentConfirmation(payment: {
  appointmentId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string | null;
  appointment?: {
    clientName: string;
    clientEmail: string;
    date: Date;
    service: string;
  };
}) {
  if (!payment.appointment) return;

  const formattedDate = new Date(payment.appointment.date).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'BECOF <noreply@becof.tn>',
    to: payment.appointment.clientEmail,
    subject: 'Confirmation de paiement - BECOF',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14B8A6, #9333EA); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
          .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #14B8A6; }
          .total { font-size: 24px; color: #14B8A6; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Paiement Confirmé</h1>
          </div>
          <div class="content">
            <p>Bonjour ${payment.appointment.clientName},</p>
            
            <div class="success-badge">
              ✓ Paiement réussi
            </div>

            <div class="receipt">
              <h3 style="margin-top: 0; color: #14B8A6;">Reçu de paiement</h3>
              <p><strong>Montant payé :</strong> <span class="total">${payment.amount} TND</span></p>
              <p><strong>Méthode :</strong> ${payment.paymentMethod}</p>
              ${payment.transactionId ? `<p><strong>ID Transaction :</strong> ${payment.transactionId}</p>` : ''}
              <hr style="border: 1px solid #e5e7eb; margin: 15px 0;">
              <p><strong>Rendez-vous :</strong> ${formattedDate}</p>
              <p><strong>Service :</strong> ${payment.appointment.service}</p>
            </div>

            <p>Votre rendez-vous est maintenant <strong>confirmé</strong>. Vous recevrez un rappel 24 heures avant.</p>

            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #FEF3C7; border-radius: 8px;">
              <p style="margin: 0;"><strong>💡 Conseil :</strong> Ajoutez l'événement Google Calendar à votre agenda pour ne pas l'oublier !</p>
            </div>

            <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
              <p>Besoin d'aide ? Contactez-nous :</p>
              <p>📧 contact@becof.tn | 📞 +216 12 345 678</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation sent to:', payment.appointment.clientEmail);
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
  }
}

// Send contact form notification to admins
export async function notifyAdminsContactForm(contact: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const adminEmails = await getAdminEmails();
  
  // Add helmiboussetta11@gmail.com if not already in admin list
  const recipients = [...adminEmails];
  const helmiEmail = 'helmiboussetta11@gmail.com';
  if (!recipients.includes(helmiEmail)) {
    recipients.push(helmiEmail);
  }
  
  // Also add contact@becof.tn if not in list
  const becofEmail = 'contact@becof.tn';
  if (!recipients.includes(becofEmail)) {
    recipients.push(becofEmail);
  }
  
  if (recipients.length === 0) return;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'BECOF <noreply@becof.tn>',
    to: recipients,
    replyTo: contact.email,
    subject: `Nouveau message - ${contact.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #14B8A6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #14B8A6; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📬 Nouveau Message de Contact</h2>
          </div>
          <div class="content">
            <p><strong>De :</strong> ${contact.name} (${contact.email})</p>
            <p><strong>Sujet :</strong> ${contact.subject}</p>
            
            <div class="message-box">
              <h3 style="margin-top: 0;">Message :</h3>
              <p style="white-space: pre-wrap;">${contact.message}</p>
            </div>

            <p style="color: #666; font-size: 14px;">
              💡 Vous pouvez répondre directement en cliquant sur "Répondre" dans votre client email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Contact form notification sent to admins');
  } catch (error) {
    console.error('Error sending contact form notification:', error);
  }
}

// Send cancellation notification
export async function sendCancellationNotification(appointment: {
  clientName: string;
  clientEmail: string;
  date: Date;
  service: string;
}) {
  const formattedDate = new Date(appointment.date).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'BECOF <noreply@becof.tn>',
    to: appointment.clientEmail,
    subject: 'Annulation de rendez-vous - BECOF',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rendez-vous Annulé</h1>
          </div>
          <div class="content">
            <p>Bonjour ${appointment.clientName},</p>
            
            <p>Votre rendez-vous du <strong>${formattedDate}</strong> pour le service <strong>${appointment.service}</strong> a été annulé.</p>

            <p>Si vous souhaitez réserver un autre rendez-vous, n'hésitez pas à visiter notre site web.</p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/appointment" style="display: inline-block; background: #14B8A6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
                Réserver un nouveau rendez-vous
              </a>
            </div>

            <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
              <p>Pour toute question :</p>
              <p>📧 contact@becof.tn | 📞 +216 12 345 678</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Cancellation notification sent to:', appointment.clientEmail);
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
  }
}

// Send bank transfer instructions to client
export async function sendBankTransferInstructions(appointment: {
  id: string;
  clientName: string;
  clientEmail: string;
  date: Date;
  service: string;
}) {
  const formattedDate = new Date(appointment.date).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const referenceNumber = appointment.id.slice(-8).toUpperCase();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'BECOF <noreply@becof.tn>',
    to: appointment.clientEmail,
    subject: 'Instructions de paiement - Rendez-vous BECOF',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14B8A6, #9333EA); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14B8A6; }
          .payment-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; }
          .reference { background: #14B8A6; color: white; padding: 15px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
          .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .step { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .step:last-child { border-bottom: none; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BECOF</h1>
            <p>Instructions de Paiement</p>
          </div>
          <div class="content">
            <p>Bonjour ${appointment.clientName},</p>
            <p>Merci d'avoir réservé un rendez-vous avec BECOF ! Votre demande a été enregistrée.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #14B8A6;">Détails du rendez-vous</h3>
              <p><strong>📅 Date :</strong> ${formattedDate}</p>
              <p><strong>💼 Service :</strong> ${appointment.service}</p>
              <p><strong>💰 Montant :</strong> 50 TND</p>
            </div>

            <div class="payment-box">
              <h3 style="margin-top: 0; color: #f59e0b;">⚠️ Instructions de virement bancaire</h3>
              <p><strong>Banque :</strong> BIAT</p>
              <p><strong>RIB :</strong> 08 000 0000000000000 00</p>
              <p><strong>Titulaire :</strong> BECOF</p>
              
              <div class="reference">
                RÉFÉRENCE À INCLURE:<br>
                ${appointment.clientName} - ${referenceNumber}
              </div>
              
              <p style="font-size: 14px; color: #92400e;">
                ⚠️ Important : Veuillez inclure cette référence exacte lors de votre virement pour faciliter l'identification de votre paiement.
              </p>
            </div>

            <div class="steps">
              <h3 style="margin-top: 0; color: #14B8A6;">📋 Prochaines étapes</h3>
              <div class="step">
                <strong>1.</strong> Effectuez le virement bancaire de 50 TND avec la référence ci-dessus
              </div>
              <div class="step">
                <strong>2.</strong> Prenez une capture d'écran de la preuve de paiement (reçu bancaire)
              </div>
              <div class="step">
                <strong>3.</strong> Envoyez la capture d'écran à <strong>contact@becof.tn</strong> avec la référence <strong>${referenceNumber}</strong>
              </div>
              <div class="step">
                <strong>4.</strong> Votre rendez-vous sera confirmé dans les 24 heures après vérification
              </div>
            </div>

            <p style="background: #dbeafe; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              💡 <strong>Conseil :</strong> Pour une confirmation plus rapide, envoyez votre preuve de paiement dès que possible après le virement.
            </p>

            <div class="footer">
              <p>Pour toute question, contactez-nous :</p>
              <p>📧 contact@becof.tn | 📞 +216 12 345 678</p>
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                © 2025 BECOF - Orientation Consulting
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Bank transfer instructions sent to:', appointment.clientEmail);
  } catch (error) {
    console.error('Error sending bank transfer instructions:', error);
  }
}
