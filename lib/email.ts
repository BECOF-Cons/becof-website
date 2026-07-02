import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

const FROM = process.env.EMAIL_FROM || 'BECOF Conseil <info@becofconseil.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'becofconseil@gmail.com';
const BASE_URL = process.env.NEXTAUTH_URL || 'https://www.becofconseil.com';

// ─── Google Calendar URL (click-to-add button in email) ───────────────────────
function buildGoogleCalendarUrl(params: {
  title: string;
  date: Date;
  time: string;
  durationMinutes: number;
  description: string;
  location: string;
}): string {
  const dateStr = new Date(params.date).toISOString().split('T')[0];
  const [h, m] = params.time.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const startStr = `${dateStr.replace(/-/g, '')}T${pad(h)}${pad(m)}00`;
  const totalEnd = h * 60 + m + params.durationMinutes;
  const endStr = `${dateStr.replace(/-/g, '')}T${pad(Math.floor(totalEnd / 60) % 24)}${pad(totalEnd % 60)}00`;
  const qs = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${startStr}/${endStr}`,
    details: params.description,
    location: params.location,
  });
  return `https://calendar.google.com/calendar/render?${qs}`;
}

// ─── ICS attachment (works with Apple Calendar, Outlook, all apps) ────────────
function buildIcsContent(params: {
  uid: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  durationMinutes: number;
  attendeeEmails: string[];
  meetingLink?: string;
}): string {
  const [h, m] = params.time.split(':').map(Number);
  const dateStr = new Date(params.date).toISOString().split('T')[0];
  // Tunisia is UTC+1; convert to UTC for ICS
  const startUTC = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+01:00`);
  const endUTC = new Date(startUTC.getTime() + params.durationMinutes * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const now = fmt(new Date());

  const desc = [
    params.meetingLink ? `Lien de réunion: ${params.meetingLink}` : '',
    params.description,
  ].filter(Boolean).join('\\n\\n');

  const attendees = params.attendeeEmails
    .map((e) => `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${e}`)
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BECOF Conseil//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${params.uid}@becofconseil.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${fmt(startUTC)}`,
    `DTEND:${fmt(endUTC)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${params.meetingLink ?? 'En ligne'}`,
    `ORGANIZER;CN=BECOF Conseil:mailto:info@becofconseil.com`,
    attendees,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel — Rendez-vous BECOF Conseil',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

async function getServiceDuration(serviceType: string): Promise<number> {
  try {
    const service = await prisma.service.findFirst({
      where: { serviceType },
      select: { durationMinutes: true },
    });
    return service?.durationMinutes ?? 60;
  } catch {
    return 60;
  }
}

// ─── Shared email styles ──────────────────────────────────────────────────────
const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f3f4f6; color: #1f2937; }
  .outer { padding: 32px 16px; }
  .wrap { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #14B8A6 0%, #9333EA 100%); color: white; padding: 36px 32px; text-align: center; border-radius: 16px 16px 0 0; }
  .header-logo { font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8; margin-bottom: 8px; }
  .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .header p { font-size: 14px; opacity: 0.85; }
  .body { background: #ffffff; padding: 36px 32px; border-radius: 0 0 16px 16px; }
  .greeting { font-size: 16px; color: #374151; margin-bottom: 16px; }
  .lead { font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.6; }
  .card { background: #f9fafb; border-radius: 12px; padding: 20px 24px; margin: 20px 0; border: 1px solid #e5e7eb; }
  .card-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #14B8A6; margin-bottom: 14px; }
  .info-row { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #9ca3af; min-width: 90px; flex-shrink: 0; }
  .info-value { color: #1f2937; font-weight: 500; }
  .meet-box { background: linear-gradient(135deg, #ecfdf5, #f0fdf4); border: 1.5px solid #6ee7b7; border-radius: 12px; padding: 20px 24px; margin: 20px 0; text-align: center; }
  .meet-box p { font-size: 12px; color: #059669; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  .meet-link { display: inline-block; background: #10b981; color: white !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; }
  .actions { text-align: center; margin: 28px 0 20px; }
  .btn-cal { display: inline-block; background: #4285F4; color: white !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
  .secondary-links { text-align: center; margin-top: 12px; font-size: 13px; color: #9ca3af; }
  .secondary-links a { color: #9ca3af; text-decoration: underline; }
  .ics-note { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #1d4ed8; text-align: center; }
  .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
  .footer { text-align: center; padding-top: 4px; }
  .footer p { font-size: 12px; color: #9ca3af; line-height: 1.8; }
  .footer a { color: #14B8A6; text-decoration: none; }
  .outer-footer { text-align: center; margin-top: 20px; font-size: 11px; color: #d1d5db; }
`;

// ─── Client confirmation email ────────────────────────────────────────────────
export async function sendAppointmentConfirmation(appointment: {
  clientName: string;
  clientEmail: string;
  date: Date;
  time: string;
  serviceType: string;
  durationMinutes?: number;
  consultantName?: string;
  consultantEmail?: string;
  cancelUrl?: string;
  modifyUrl?: string;
  meetingLink?: string;
  appointmentId?: string;
}) {
  if (!isEmailConfigured()) {
    console.warn('⚠️ RESEND_API_KEY not set. Skipping confirmation email.');
    return;
  }

  const duration = appointment.durationMinutes ?? await getServiceDuration(appointment.serviceType);

  const formattedDate = new Date(appointment.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const calUrl = buildGoogleCalendarUrl({
    title: `Rendez-vous BECOF Conseil — ${appointment.serviceType}`,
    date: appointment.date,
    time: appointment.time,
    durationMinutes: duration,
    description: [
      appointment.meetingLink ? `🔗 Lien de réunion: ${appointment.meetingLink}` : '',
      `Consultant: ${appointment.consultantName ?? 'BECOF Conseil'}`,
      `Service: ${appointment.serviceType}`,
    ].filter(Boolean).join('\n'),
    location: appointment.meetingLink ?? 'En ligne',
  });

  const icsAttendees = [appointment.clientEmail];
  if (appointment.consultantEmail) icsAttendees.push(appointment.consultantEmail);

  const icsContent = buildIcsContent({
    uid: appointment.appointmentId ?? appointment.clientEmail.replace('@', '-'),
    title: `Rendez-vous BECOF Conseil — ${appointment.serviceType}`,
    description: `Consultant: ${appointment.consultantName ?? 'BECOF Conseil'}\nService: ${appointment.serviceType}`,
    date: appointment.date,
    time: appointment.time,
    durationMinutes: duration,
    attendeeEmails: icsAttendees,
    meetingLink: appointment.meetingLink,
  });

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${STYLES}</style></head><body>
  <div class="outer">
    <div class="wrap">
      <div class="header">
        <div class="header-logo">BECOF Conseil</div>
        <h1>Rendez-vous confirmé ✅</h1>
        <p>Votre paiement a été reçu et votre rendez-vous est confirmé.</p>
      </div>
      <div class="body">
        <p class="greeting">Bonjour <strong>${appointment.clientName}</strong>,</p>
        <p class="lead">Nous avons le plaisir de confirmer votre rendez-vous. Retrouvez tous les détails ci-dessous.</p>

        <div class="card">
          <div class="card-title">📋 Détails du rendez-vous</div>
          <div class="info-row"><span class="info-label">📅 Date</span><span class="info-value">${formattedDate}</span></div>
          <div class="info-row"><span class="info-label">🕐 Heure</span><span class="info-value">${appointment.time} <span style="color:#9ca3af;font-weight:400;">(${duration} min)</span></span></div>
          <div class="info-row"><span class="info-label">💼 Service</span><span class="info-value">${appointment.serviceType}</span></div>
          ${appointment.consultantName ? `<div class="info-row"><span class="info-label">👤 Consultant</span><span class="info-value">${appointment.consultantName}</span></div>` : ''}
          <div class="info-row"><span class="info-label">📍 Format</span><span class="info-value">Consultation en ligne</span></div>
        </div>

        ${appointment.meetingLink ? `
        <div class="meet-box">
          <p>🎥 Lien de votre réunion en ligne</p>
          <a href="${appointment.meetingLink}" class="meet-link">Rejoindre la réunion</a>
          <div style="margin-top:10px;font-size:12px;color:#6b7280;">Copiez ce lien : <span style="font-family:monospace;font-size:11px;">${appointment.meetingLink}</span></div>
        </div>` : `
        <div class="card" style="background:#fefce8;border-color:#fde68a;">
          <div class="card-title" style="color:#d97706;">📍 Lien de réunion</div>
          <p style="font-size:14px;color:#92400e;">Votre consultant vous enverra le lien de connexion avant le rendez-vous.</p>
        </div>`}

        <div class="actions">
          <a href="${calUrl}" class="btn-cal">📅 Ajouter à Google Agenda</a>
        </div>

        <div class="ics-note">
          📎 Un fichier <strong>.ics</strong> est joint à cet email — ouvrez-le pour ajouter l'événement à n'importe quel calendrier (Outlook, Apple Calendar…)
        </div>

        ${(appointment.modifyUrl || appointment.cancelUrl) ? `
        <div class="secondary-links">
          ${appointment.modifyUrl ? `<a href="${appointment.modifyUrl}">✏️ Modifier</a>` : ''}
          ${appointment.modifyUrl && appointment.cancelUrl ? ' &nbsp;·&nbsp; ' : ''}
          ${appointment.cancelUrl ? `<a href="${appointment.cancelUrl}">❌ Annuler</a>` : ''}
        </div>
        <p style="font-size:11px;color:#d1d5db;text-align:center;margin-top:6px;">Modifications et annulations possibles jusqu'à 24h avant le rendez-vous.</p>` : ''}

        <div class="divider"></div>
        <div class="footer">
          <p>Une question ? Répondez à cet email ou contactez-nous :</p>
          <p><a href="mailto:becofconseil@gmail.com">becofconseil@gmail.com</a> &nbsp;·&nbsp; +216 53 216 700</p>
          <p style="margin-top:12px;">© 2026 BECOF Conseil — Orientation &amp; Accompagnement</p>
        </div>
      </div>
    </div>
    <div class="outer-footer">Vous recevez cet email car vous avez réservé un rendez-vous sur becofconseil.com</div>
  </div>
  </body></html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: appointment.clientEmail,
      replyTo: REPLY_TO,
      subject: `✅ Rendez-vous confirmé — ${formattedDate} à ${appointment.time}`,
      html,
      attachments: [{
        filename: 'rendez-vous-becof.ics',
        content: Buffer.from(icsContent).toString('base64'),
      }],
    });
    console.log('✅ Confirmation sent to client:', appointment.clientEmail);
  } catch (error) {
    console.error('Error sending client confirmation:', error);
  }
}

// ─── Consultant notification email ────────────────────────────────────────────
export async function notifyConsultantOfAppointment(appointment: {
  consultantName: string;
  consultantEmail: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: Date;
  time: string;
  serviceType: string;
  durationMinutes?: number;
  message?: string;
  meetingLink?: string;
  appointmentId?: string;
}) {
  if (!isEmailConfigured()) {
    console.warn('⚠️ RESEND_API_KEY not set. Skipping consultant notification.');
    return;
  }

  const duration = appointment.durationMinutes ?? await getServiceDuration(appointment.serviceType);

  const formattedDate = new Date(appointment.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const calUrl = buildGoogleCalendarUrl({
    title: `RDV BECOF — ${appointment.clientName} — ${appointment.serviceType}`,
    date: appointment.date,
    time: appointment.time,
    durationMinutes: duration,
    description: [
      appointment.meetingLink ? `🔗 Lien de réunion: ${appointment.meetingLink}` : '',
      `Client: ${appointment.clientName}`,
      `Email: ${appointment.clientEmail}`,
      `Tél: ${appointment.clientPhone}`,
      `Service: ${appointment.serviceType}`,
      appointment.message ? `Message: ${appointment.message}` : '',
    ].filter(Boolean).join('\n'),
    location: appointment.meetingLink ?? 'En ligne',
  });

  const icsContent = buildIcsContent({
    uid: appointment.appointmentId ?? `${appointment.clientEmail}-${appointment.time}`.replace('@', '-'),
    title: `RDV BECOF — ${appointment.clientName} — ${appointment.serviceType}`,
    description: `Client: ${appointment.clientName}\nEmail: ${appointment.clientEmail}\nTél: ${appointment.clientPhone}\nService: ${appointment.serviceType}`,
    date: appointment.date,
    time: appointment.time,
    durationMinutes: duration,
    attendeeEmails: [appointment.consultantEmail, appointment.clientEmail],
    meetingLink: appointment.meetingLink,
  });

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${STYLES}</style></head><body>
  <div class="outer">
    <div class="wrap">
      <div class="header">
        <div class="header-logo">BECOF Conseil</div>
        <h1>Nouveau rendez-vous 🔔</h1>
        <p>Un rendez-vous a été confirmé et assigné à vous.</p>
      </div>
      <div class="body">
        <p class="greeting">Bonjour <strong>${appointment.consultantName}</strong>,</p>
        <p class="lead">Un nouveau rendez-vous vous a été assigné. Le paiement a été reçu et confirmé.</p>

        <div class="card">
          <div class="card-title">👤 Informations client</div>
          <div class="info-row"><span class="info-label">Nom</span><span class="info-value">${appointment.clientName}</span></div>
          <div class="info-row"><span class="info-label">Email</span><span class="info-value"><a href="mailto:${appointment.clientEmail}" style="color:#14B8A6;">${appointment.clientEmail}</a></span></div>
          <div class="info-row"><span class="info-label">Téléphone</span><span class="info-value"><a href="tel:${appointment.clientPhone}" style="color:#14B8A6;">${appointment.clientPhone}</a></span></div>
          ${appointment.message ? `<div class="info-row"><span class="info-label">Message</span><span class="info-value" style="font-style:italic;color:#6b7280;">"${appointment.message}"</span></div>` : ''}
        </div>

        <div class="card">
          <div class="card-title">📋 Détails du rendez-vous</div>
          <div class="info-row"><span class="info-label">📅 Date</span><span class="info-value">${formattedDate}</span></div>
          <div class="info-row"><span class="info-label">🕐 Heure</span><span class="info-value">${appointment.time} <span style="color:#9ca3af;font-weight:400;">(${duration} min)</span></span></div>
          <div class="info-row"><span class="info-label">💼 Service</span><span class="info-value">${appointment.serviceType}</span></div>
          <div class="info-row"><span class="info-label">📍 Format</span><span class="info-value">En ligne</span></div>
        </div>

        ${appointment.meetingLink ? `
        <div class="meet-box">
          <p>🎥 Lien de réunion</p>
          <a href="${appointment.meetingLink}" class="meet-link">Rejoindre la réunion</a>
          <div style="margin-top:10px;font-size:12px;color:#6b7280;font-family:monospace;">${appointment.meetingLink}</div>
        </div>` : `
        <div style="background:#fff7ed;border:1.5px solid #fdba74;border-radius:12px;padding:20px 24px;margin:20px 0;">
          <p style="font-size:13px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">⚠️ Action requise — Lien de réunion à créer</p>
          <p style="font-size:14px;color:#9a3412;line-height:1.6;margin-bottom:14px;">Le lien Google Meet n'a pas pu être généré automatiquement. Merci de créer le lien et de l'envoyer au client :</p>
          <ol style="font-size:14px;color:#9a3412;line-height:2;padding-left:20px;margin:0;">
            <li>Ouvrez <a href="https://calendar.google.com" style="color:#c2410c;font-weight:600;">Google Agenda</a></li>
            <li>Créez un événement le <strong>${formattedDate} à ${appointment.time}</strong></li>
            <li>Cliquez sur <strong>« Ajouter Google Meet »</strong></li>
            <li>Copiez le lien et envoyez-le à <a href="mailto:${appointment.clientEmail}" style="color:#c2410c;font-weight:600;">${appointment.clientEmail}</a> — il suffit de <strong>répondre à cet email</strong></li>
          </ol>
        </div>`}

        <div class="actions">
          <a href="${calUrl}" class="btn-cal">📅 Ajouter à Google Agenda</a>
        </div>

        <div class="ics-note">
          📎 Un fichier <strong>.ics</strong> est joint — ouvrez-le pour ajouter l'événement à votre calendrier.
        </div>

        <div class="divider"></div>
        <div class="footer">
          <p>© 2026 BECOF Conseil</p>
        </div>
      </div>
    </div>
  </div>
  </body></html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: appointment.consultantEmail,
      replyTo: appointment.clientEmail,
      subject: appointment.meetingLink
        ? `🔔 Nouveau RDV — ${appointment.clientName} — ${formattedDate} à ${appointment.time}`
        : `⚠️ Action requise — Nouveau RDV — ${appointment.clientName} — ${formattedDate} à ${appointment.time}`,
      html,
      attachments: [{
        filename: 'rendez-vous-becof.ics',
        content: Buffer.from(icsContent).toString('base64'),
      }],
    });
    console.log('✅ Consultant notification sent to:', appointment.consultantEmail);
  } catch (error) {
    console.error('Error sending consultant notification:', error);
  }
}

// ─── Cancellation email ───────────────────────────────────────────────────────
export async function sendCancellationNotification(appointment: {
  clientName: string;
  clientEmail: string;
  date: Date;
  serviceType: string;
}) {
  if (!isEmailConfigured()) {
    console.warn('⚠️ RESEND_API_KEY not set. Skipping cancellation email.');
    return;
  }

  const formattedDate = new Date(appointment.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><style>${STYLES}</style></head><body>
  <div class="outer">
    <div class="wrap">
      <div class="header" style="background:#ef4444;">
        <div class="header-logo">BECOF Conseil</div>
        <h1>Rendez-vous annulé</h1>
        <p>Votre rendez-vous a bien été annulé.</p>
      </div>
      <div class="body">
        <p class="greeting">Bonjour <strong>${appointment.clientName}</strong>,</p>
        <p class="lead">Votre rendez-vous du <strong>${formattedDate}</strong> pour le service <strong>${appointment.serviceType}</strong> a bien été annulé.</p>
        <p class="lead">Si vous souhaitez fixer un nouveau rendez-vous, nous sommes disponibles :</p>
        <div class="actions">
          <a href="${BASE_URL}/fr/appointment" style="display:inline-block;background:#14B8A6;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:14px;">Réserver un nouveau rendez-vous</a>
        </div>
        <div class="divider"></div>
        <div class="footer">
          <p><a href="mailto:becofconseil@gmail.com">becofconseil@gmail.com</a> &nbsp;·&nbsp; +216 53 216 700</p>
          <p style="margin-top:8px;">© 2026 BECOF Conseil</p>
        </div>
      </div>
    </div>
  </div>
  </body></html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: appointment.clientEmail,
      replyTo: REPLY_TO,
      subject: 'Annulation de votre rendez-vous — BECOF Conseil',
      html,
    });
    console.log('✅ Cancellation email sent to:', appointment.clientEmail);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
}

// ─── Contact form notification ────────────────────────────────────────────────
export async function notifyAdminsContactForm(contact: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!isEmailConfigured()) {
    console.warn('⚠️ RESEND_API_KEY not set. Skipping contact form notification.');
    return;
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: { email: true },
    });
    const recipients = [...new Set([...admins.map((a) => a.email), 'becofconseil@gmail.com'])];
    if (recipients.length === 0) return;

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><style>${STYLES}</style></head><body>
    <div class="outer">
      <div class="wrap">
        <div class="header">
          <div class="header-logo">BECOF Conseil</div>
          <h1>Nouveau message 📬</h1>
          <p>Un visiteur vous a envoyé un message via le site.</p>
        </div>
        <div class="body">
          <div class="card">
            <div class="card-title">Expéditeur</div>
            <div class="info-row"><span class="info-label">Nom</span><span class="info-value">${contact.name}</span></div>
            <div class="info-row"><span class="info-label">Email</span><span class="info-value"><a href="mailto:${contact.email}" style="color:#14B8A6;">${contact.email}</a></span></div>
            <div class="info-row"><span class="info-label">Sujet</span><span class="info-value">${contact.subject}</span></div>
          </div>
          <div class="card">
            <div class="card-title">Message</div>
            <p style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${contact.message}</p>
          </div>
          <p style="font-size:13px;color:#9ca3af;text-align:center;">💡 Cliquez sur <strong>Répondre</strong> pour répondre directement à ${contact.name}.</p>
          <div class="divider"></div>
          <div class="footer"><p>© 2026 BECOF Conseil</p></div>
        </div>
      </div>
    </div>
    </body></html>`;

    await resend.emails.send({
      from: FROM,
      to: recipients,
      replyTo: contact.email,
      subject: `📬 Message de ${contact.name} — ${contact.subject}`,
      html,
    });
    console.log('✅ Contact form notification sent');
  } catch (error) {
    console.error('Error sending contact form notification:', error);
  }
}

// ─── Admin invitation email ───────────────────────────────────────────────────
export async function sendAdminInvitation(invitation: {
  email: string;
  role: string;
  token: string;
  invitedBy: string;
}) {
  if (!isEmailConfigured()) {
    throw new Error('Email is not configured. Please set RESEND_API_KEY environment variable.');
  }

  const setupUrl = `${BASE_URL}/admin/setup?token=${invitation.token}`;
  const roleDisplay = invitation.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Consultant / Admin';
  const roleDesc = invitation.role === 'SUPER_ADMIN'
    ? 'Vous aurez accès complet à la gestion de la plateforme, des consultants et des rendez-vous.'
    : 'Vous pourrez gérer vos rendez-vous, définir vos disponibilités et accéder au tableau de bord.';

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${STYLES}
    .invite-badge { display:inline-block; background: linear-gradient(135deg,#14B8A6,#9333EA); color:white; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:6px 16px; border-radius:20px; margin-bottom:20px; }
    .setup-btn { display:inline-block; background: linear-gradient(135deg,#14B8A6,#9333EA); color:white !important; text-decoration:none; padding:15px 36px; border-radius:10px; font-weight:700; font-size:15px; letter-spacing:0.3px; }
    .url-box { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:10px 14px; font-size:11px; font-family:monospace; color:#6b7280; word-break:break-all; margin-top:12px; }
    .warning-box { background:#fefce8; border:1px solid #fde68a; border-radius:10px; padding:14px 18px; margin:20px 0; }
    .warning-box p { font-size:13px; color:#92400e; line-height:1.6; }
  </style></head><body>
  <div class="outer">
    <div class="wrap">
      <div class="header">
        <div class="header-logo">BECOF Conseil</div>
        <h1>Vous êtes invité(e) 🎉</h1>
        <p>Rejoignez l'équipe BECOF Conseil</p>
      </div>
      <div class="body">
        <p class="greeting">Bonjour,</p>
        <p class="lead"><strong>${invitation.invitedBy}</strong> vous a invité(e) à rejoindre la plateforme BECOF Conseil.</p>

        <div style="text-align:center;margin:24px 0;">
          <div class="invite-badge">${roleDisplay}</div>
        </div>

        <div class="card">
          <div class="card-title">Votre accès</div>
          <div class="info-row"><span class="info-label">Email</span><span class="info-value">${invitation.email}</span></div>
          <div class="info-row"><span class="info-label">Rôle</span><span class="info-value">${roleDisplay}</span></div>
          <div class="info-row"><span class="info-label">Accès</span><span class="info-value" style="color:#6b7280;font-weight:400;">${roleDesc}</span></div>
        </div>

        <p style="font-size:14px;color:#374151;text-align:center;margin:24px 0;">Cliquez ci-dessous pour créer votre mot de passe et accéder à votre tableau de bord :</p>

        <div class="actions">
          <a href="${setupUrl}" class="setup-btn">Configurer mon compte →</a>
        </div>

        <div class="url-box">🔗 ${setupUrl}</div>

        <div class="warning-box">
          <p>⚠️ <strong>Important :</strong> Ce lien est personnel et expire dans <strong>7 jours</strong>. Ne le partagez avec personne. Si vous n'attendiez pas cette invitation, ignorez cet email.</p>
        </div>

        <div class="divider"></div>
        <div class="footer">
          <p>Des questions ? <a href="mailto:becofconseil@gmail.com">becofconseil@gmail.com</a></p>
          <p style="margin-top:8px;">© 2026 BECOF Conseil — Orientation &amp; Accompagnement</p>
        </div>
      </div>
    </div>
    <div class="outer-footer">Vous recevez cet email car vous avez été invité(e) à rejoindre becofconseil.com</div>
  </div>
  </body></html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: invitation.email,
      subject: `🎉 Invitation — Rejoignez l'équipe BECOF Conseil`,
      html,
    });
    console.log('✅ Admin invitation sent to:', invitation.email);
  } catch (error) {
    console.error('Error sending admin invitation:', error);
    throw error;
  }
}

// ─── Kept for compatibility (no-ops) ─────────────────────────────────────────
export async function notifyAdminsOfAppointment(_: any) {
  // Removed: notifications go to the assigned consultant only (notifyConsultantOfAppointment)
}

export async function sendPaymentConfirmation(_: any) {
  // No-op: merged into sendAppointmentConfirmation
}

export async function sendBankTransferInstructions(_: any) {
  // No-op: payment method not yet implemented
}
