// utils/sendBrevoEmail.js
// Utility function to send emails via Brevo API

export async function sendBrevoEmail({
  toEmail,
  toName = '',
  subject,
  htmlContent,
  textContent = '',
  attachments = [] // Array of { content: base64String, name: filename }
}) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  // If no name provided, use email username or "Recipient"
  const recipientName = toName || toEmail.split('@')[0] || 'Recipient';

  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || "SURE FOUNDATION GROUP OF SCHOOLS",
      email: process.env.BREVO_SENDER_EMAIL || "info@sfgs.com.ng"
    },
    to: [
      {
        email: toEmail,
        name: recipientName
      }
    ],
    subject,
    htmlContent,
    textContent: textContent || htmlContent.replace(/<[^>]+>/g, '').replace(/\n\n+/g, '\n')
  };

  // Only add attachment field if there are attachments
  if (attachments && attachments.length > 0) {
    payload.attachment = attachments.map(att => ({
      content: att.content,
      name: att.name
    }));
  }

  try {
    const response = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch {
        errorMessage = errorText;
      }
      throw new Error(`Brevo API error: ${errorMessage}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send email via Brevo:', error);
    throw error;
  }
}