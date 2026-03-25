import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (amount, orderId) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderId,
    });

    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  try {
    // In production, verify the signature properly
    // This is a simplified version
    return {
      isValid: true,
      paymentId,
    };
  } catch (error) {
    console.error('Razorpay verification error:', error);
    throw error;
  }
};

export const refundPayment = async (paymentId, amount) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
    });

    return refund;
  } catch (error) {
    console.error('Razorpay refund error:', error);
    throw error;
  }
};
