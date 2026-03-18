export const templates = {
  welcomeLead: (leadName: string, agentName: string, projectName: string) => ({
    subject: `Welcome — Your inquiry for ${projectName}`,
    html: `
      <h2>Hi ${leadName},</h2>
      <p>Thank you for your interest in <strong>${projectName}</strong>.</p>
      <p>${agentName} will reach out to you shortly.</p>
      <p>If you'd like to connect immediately, reply to this email.</p>
      <br/>
      <p style="font-size:12px;color:#888;">
        <a href="{UNSUBSCRIBE_URL}">Unsubscribe from emails</a>
      </p>
    `,
  }),

  visitConfirmation: (leadName: string, projectName: string, visitDate: string, mapsLink: string) => ({
    subject: `Visit Confirmed — ${projectName}`,
    html: `
      <h2>Hi ${leadName},</h2>
      <p>Your site visit to <strong>${projectName}</strong> is confirmed for <strong>${visitDate}</strong>.</p>
      <p><a href="${mapsLink}">Get directions →</a></p>
    `,
  }),

  visitReminder24h: (leadName: string, projectName: string, visitDate: string) => ({
    subject: `Reminder: Visit tomorrow — ${projectName}`,
    html: `<h2>Hi ${leadName},</h2><p>Just a reminder — your visit to <strong>${projectName}</strong> is tomorrow at <strong>${visitDate}</strong>.</p>`,
  }),

  visitReminder2h: (leadName: string, projectName: string, visitDate: string) => ({
    subject: `Your visit is in 2 hours — ${projectName}`,
    html: `<h2>Hi ${leadName},</h2><p>Your visit to <strong>${projectName}</strong> starts in 2 hours at <strong>${visitDate}</strong>.</p>`,
  }),

  paymentDue: (buyerName: string, amount: number, dueDate: string, projectName: string, days: number) => ({
    subject: `Payment Due in ${days} days — ${projectName}`,
    html: `<h2>Hi ${buyerName},</h2><p>Your installment of <strong>₹${amount.toLocaleString('en-IN')}</strong> for <strong>${projectName}</strong> is due on <strong>${dueDate}</strong>.</p>`,
  }),

  bookingConfirmation: (buyerName: string, unitNo: string, projectName: string, amount: number) => ({
    subject: `Booking Confirmed — ${projectName} Unit ${unitNo}`,
    html: `<h2>Congratulations ${buyerName}!</h2><p>Your booking for <strong>Unit ${unitNo}</strong> at <strong>${projectName}</strong> is confirmed. Booking amount: ₹${amount.toLocaleString('en-IN')}.</p>`,
  }),

  otp: (otp: string, projectName: string) => ({
    subject: `Your OTP — ${projectName} Buyer Portal`,
    html: `<h2>Your OTP is: <strong style="font-size:32px;letter-spacing:8px;">${otp}</strong></h2><p>Valid for 10 minutes.</p>`,
  }),
};
