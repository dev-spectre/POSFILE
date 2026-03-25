import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
    });

    return response;
  } catch (error) {
    console.error('WhatsApp error:', error);
    throw error;
  }
};

export const sendOrderConfirmation = async (order) => {
  const itemsList = order.items
    .map((item) => `${item.name} x${item.quantity}`)
    .join(', ');

  const message = `🎉 *Order Confirmed!*

Order ID: ${order.orderId}
Items: ${itemsList}
Subtotal: ₹${order.subtotal}
Tax: ₹${order.tax}
*Total: ₹${order.totalAmount}*

Payment Status: ${order.paymentStatus.toUpperCase()}

Thank you for your order! 🙏`;

  return await sendWhatsAppMessage(order.customerPhone, message);
};

export const sendOrderStatus = async (order, status) => {
  const statusMessages = {
    pending: '⏳ Your order is pending...',
    confirmed: '✅ Your order is confirmed!',
    preparing: '👨‍🍳 Your order is being prepared...',
    ready: '🎁 Your order is ready for pickup!',
    delivered: '🚚 Your order has been delivered!',
    cancelled: '❌ Your order has been cancelled.',
  };

  const message = `${statusMessages[status]}

Order ID: ${order.orderId}
Status: ${status.toUpperCase()}`;

  return await sendWhatsAppMessage(order.customerPhone, message);
};
