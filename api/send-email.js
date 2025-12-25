import { sendBrevoEmail } from '../utils/sendBrevoEmail.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    await sendBrevoEmail({
      toEmail: to,
      toName: '',
      subject,
      htmlContent: html || text.replace(/\n/g, '<br>'),
      textContent: text || html.replace(/<[^>]+>/g, '')
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to send email:', err);
    res.status(500).json({ error: err.message });
  }
}