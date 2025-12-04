import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email
export const sendEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  const mailOptions = {
    from: `BookMe <${process.env.EMAIL_FROM || 'noreply@bookme.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Booking confirmation email
export const sendBookingConfirmationEmail = async (
  email: string,
  bookingDetails: {
    listingTitle: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    bookingId: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Confirmed! 🎉</h2>
      <p>Your booking has been confirmed.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${bookingDetails.listingTitle}</h3>
        <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
        <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
        <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
        <p><strong>Total:</strong> GHS ${bookingDetails.totalPrice}</p>
        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
      </div>
      
      <p>We're looking forward to hosting you!</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Booking Confirmation - BookMe',
    html
  });
};

// Payment confirmation email
export const sendPaymentConfirmationEmail = async (
  email: string,
  paymentDetails: {
    amount: number;
    bookingId: string;
    transactionId: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Received ✓</h2>
      <p>Your payment has been processed successfully.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> GHS ${paymentDetails.amount}</p>
        <p><strong>Booking ID:</strong> ${paymentDetails.bookingId}</p>
        <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
      </div>
      
      <p>Thank you for your payment!</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Payment Confirmation - BookMe',
    html
  });
};

// Review reminder email
export const sendReviewReminderEmail = async (
  email: string,
  reminderDetails: {
    listingTitle: string;
    checkOut: string;
    bookingId: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>How was your stay? ⭐</h2>
      <p>We hope you enjoyed your stay at ${reminderDetails.listingTitle}!</p>
      
      <p>Your feedback helps other travelers and hosts improve their experience.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/bookings/${reminderDetails.bookingId}/review" 
           style="background: #FF385C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Write a Review
        </a>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Share Your Experience - BookMe',
    html
  });
};

// New message notification email
export const sendNewMessageEmail = async (
  email: string,
  messageDetails: {
    senderName: string;
    message: string;
    conversationId: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Message from ${messageDetails.senderName}</h2>
      <p>${messageDetails.message.substring(0, 200)}${messageDetails.message.length > 200 ? '...' : ''}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/messages/${messageDetails.conversationId}" 
           style="background: #FF385C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          View Message
        </a>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `New message from ${messageDetails.senderName} - BookMe`,
    html
  });
};

// Cancellation notification email
export const sendCancellationEmail = async (
  email: string,
  cancellationDetails: {
    listingTitle: string;
    refundAmount: number;
    bookingId: string;
  }
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Cancelled</h2>
      <p>Your booking for ${cancellationDetails.listingTitle} has been cancelled.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Refund Amount:</strong> GHS ${cancellationDetails.refundAmount}</p>
        <p><strong>Booking ID:</strong> ${cancellationDetails.bookingId}</p>
      </div>
      
      <p>The refund will be processed within 5-7 business days.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Booking Cancellation - BookMe',
    html
  });
};

export default {
  sendEmail,
  sendBookingConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendReviewReminderEmail,
  sendNewMessageEmail,
  sendCancellationEmail
};
