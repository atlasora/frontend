import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Explicitly handle preflight for this route (some environments require it)
app.options('/payments/revolut/checkout', cors());

// Revolut hosted checkout stub for development
// Replace with real Revolut API call when credentials are available.
app.post('/payments/revolut/checkout', async (req, res) => {
  try {
    const { amount, currency, description, successUrl, cancelUrl, metadata } = req.body || {};
    console.log('[payments-server] POST /payments/revolut/checkout', {
      amount,
      currency,
      hasSuccessUrl: !!successUrl,
      hasCancelUrl: !!cancelUrl,
      metadata,
    });
    if (!amount || !currency || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production: create a Revolut order via Merchant API and return its hosted checkout URL.
    // For now, simulate success by redirecting back with success flags.
    const params = new URLSearchParams({
      ...((metadata && typeof metadata === 'object') ? metadata : {}),
      revolut_status: 'success',
      orderId: 'stub_order_123',
      paymentId: 'stub_payment_abc',
      amount: String(amount),
      currency,
    });
    const redirectUrl = `${successUrl.split('?')[0]}?${params.toString()}`;

    console.log('[payments-server] responding with redirectUrl', redirectUrl);
    res.json({ redirectUrl });
  } catch (e) {
    console.error('checkout error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`[payments-server] listening on :${PORT}`);
});
