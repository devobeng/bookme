export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  // Logic to send welcome email
  console.log(`Sending welcome email to ${name} at ${email}`);
};

export const sendBookingConfirmation = async (email: string, bookingDetails: any): Promise<void> => {
  // Logic to send booking confirmation
  console.log(`Sending booking confirmation to ${email}`);
};
