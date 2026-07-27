const { sendMail } = require('./mailer');

// Marks a ServiceRequest (Seniors plan sign-up, one-time grocery pickup, or gift delivery)
// as paid and sends both the team + customer confirmation emails. Idempotent — safe to call
// from both the Stripe webhook AND a self-heal check on the success page, whichever lands first.
async function markServicePlanPaid(request, { customerId, subscriptionId } = {}) {
  if (request.paymentStatus === 'paid') return; // already handled — don't double-email

  request.paymentStatus = 'paid';
  request.status = 'confirmed';
  if (customerId) request.stripeCustomerId = customerId;
  if (subscriptionId) {
    request.stripeSubscriptionId = subscriptionId;
    request.subscriptionStatus = 'active';
  }
  await request.save();
  console.log(`[SERVICES] Request ${request.requestId} marked paid`);

  const isPlan = !!request.planCode;
  const durationLine = isPlan
    ? (request.billingType === 'auto-renew'
      ? 'This plan renews automatically every month. You can cancel anytime by contacting us — no further action needed on your end.'
      : "This covers one month. Since you chose Pay Month-to-Month, there's no auto-renewal — come back and pay again whenever you're ready for your next month.")
    : '';

  await sendMail(
    `Payment Received — ${isPlan ? 'Seniors Plan' : request.kind === 'gift' ? 'Gift Delivery' : 'Grocery Pickup'} ${request.requestId}`,
    `<h2>${isPlan ? 'Seniors Plan' : 'Payment'} Confirmed</h2>
     <p><b>Request ID:</b> ${request.requestId}</p>
     ${isPlan ? `<p><b>Plan:</b> ${request.planName} — $${request.planPrice}/month (${request.billingType === 'auto-renew' ? 'Auto-Renew' : 'Pay Monthly'})</p>` : `<p><b>Fee:</b> $${request.planPrice}</p>`}
     <p><b>Customer:</b> ${request.customer?.name} — ${request.customer?.phone}${request.customer?.email ? ` — ${request.customer.email}` : ''}</p>`
  );

  if (request.customer?.email) {
    await sendMail(
      isPlan ? `You're signed up — ${request.planName}` : `Payment Confirmed — ${request.requestId}`,
      `<h2>Thank you, ${request.customer.name}!</h2>
       ${isPlan
         ? `<p>You've successfully signed up for the <b>${request.planName}</b> plan — <b>$${request.planPrice}/month</b>.</p><p>${durationLine}</p>`
         : `<p>Your payment of <b>$${request.planPrice}</b> for ${request.kind === 'gift' ? 'gift delivery' : 'one-time grocery pickup & delivery'} has been received.</p>`}
       <p><b>Reference ID:</b> ${request.requestId}</p>
       <p>Our team will be in touch shortly to confirm the details. If you have any questions, just reply to this email or contact us on WhatsApp.</p>`,
      request.customer.email
    );
  }
}

module.exports = { markServicePlanPaid };
