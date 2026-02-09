import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = process.env.CONTACT_EMAIL;
const fromEmail = process.env.SENDER_EMAIL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY || !toEmail) {
    console.error('Missing RESEND_API_KEY or CONTACT_EMAIL');
    return res.status(500).json({ error: 'Contact form not configured' });
  }

  const { name, email, message } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const subject = `Portfolio contact from ${name.trim()}`;
  const text = `${message.trim()}\n\n---\nFrom: ${name.trim()}\nEmail: ${email.trim()}`;
  const html = `<p>${message.trim().replace(/\n/g, '<br>')}</p><hr><p><strong>From:</strong> ${name.trim()}<br><strong>Email:</strong> ${email.trim()}</p>`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email.trim(),
      subject,
      text,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('Contact send error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}
