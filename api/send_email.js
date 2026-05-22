import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    to,
    customerName,
    bookingRef,
    bookingDate,
    bookingTime,
    serviceType,
    packageName
  } = req.body;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
      <h1 style="color:#7a1c2a;">Nikole Studio</h1>
      <h2>Booking Confirmed ✓</h2>

      <p>Hi ${customerName},</p>
      <p>Your session has been confirmed.</p>

      <div style="background:#faf7f3;padding:20px;border-radius:12px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#9a7a7a;font-size:12px;">
          YOUR REFERENCE CODE
        </p>

        <p style="margin:0;font-family:monospace;font-size:20px;color:#7a1c2a;font-weight:bold;">
          ${bookingRef}
        </p>
      </div>

      <p><strong>Date:</strong> ${bookingDate}</p>
      <p><strong>Time:</strong> ${bookingTime}</p>
      <p><strong>Package:</strong> ${packageName}</p>
      <p><strong>Session:</strong> ${serviceType}</p>

      <p style="color:#9a7a7a;font-size:13px;margin-top:30px;">
        Screenshot your reference code. You'll need it to leave a review.
      </p>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Nikole Studio <booking@nikolestudio.me>',
      to,
      subject: `Your booking has been confirmed! - ${bookingRef}`,
      html,
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      id: data?.id,
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}