import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Divider } from 'antd';
import moment from 'moment';
import useDataApi from 'library/hooks/useDataApi';
import resolveURL from 'library/helpers/resolveURL';
import { AuthContext } from 'context/AuthProvider';

const PageWrapper = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SummaryBox = styled.div`
  background: #fafafa;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
`;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loggedIn } = useContext(AuthContext);

  const searchParams = new URLSearchParams(location.search);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const guest = searchParams.get('guest');
  const room = searchParams.get('room');
  const slug = searchParams.get('slug');
  const propertyId = searchParams.get('propertyId');
  const deslug = slug ? slug.replace(/-/g, ' ') : '';
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL || '';
  const paymentsServerUrl = import.meta.env.VITE_PAYMENTS_SERVER_URL || backendBaseUrl;
  const revolutStatusParam = searchParams.get('revolut_status') || searchParams.get('status');

  const propertiesUrl = `${import.meta.env.VITE_APP_API_URL}properties?filters[$or][0][documentId][$eq]=${encodeURIComponent(
    propertyId || ''
  )}&filters[$or][1][Title][$eqi]=${encodeURIComponent(
    deslug
  )}&populate[Images]=true&populate[currency]=true`;

  const { data, loading } = useDataApi(
    propertiesUrl,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
    'properties',
    [],
    true,
  );

  useEffect(() => {
    if (!loggedIn) {
      const fullPath = window.location.pathname + window.location.search;
      localStorage.setItem('returnTo', fullPath);
      navigate('/sign-in', { replace: true });
    }
  }, [loggedIn, navigate]);

  // Handle Revolut return: if redirected back with success parameters, create the booking then go to thank you
  useEffect(() => {
    // Wait until property data has loaded to compute booking fields
    if (loading || !data || !Array.isArray(data) || data.length === 0) return;

    const p = new URLSearchParams(window.location.search);
    const revolutStatus = p.get('revolut_status') || p.get('status');
    const revolutOrderId = p.get('revolut_order_id') || p.get('orderId');
    const revolutPaymentId = p.get('revolut_payment_id') || p.get('paymentId');
    const revolutAmount = p.get('amount');
    const revolutCurrency = p.get('currency');
    const alreadyBooked = p.get('booking_created');

    const shouldCreateBooking =
      revolutStatus && (revolutStatus.toLowerCase() === 'success' || revolutStatus.toLowerCase() === 'completed') && !alreadyBooked;

    if (!shouldCreateBooking) return;
    console.debug('[payments] detected Revolut success, creating booking', {
      revolutStatus,
      revolutOrderId,
      revolutPaymentId,
      revolutAmount,
      revolutCurrency,
    });

    (async () => {
      try {
        // Append a flag so we don't double-create on re-render
        p.set('booking_created', '1');
        const newUrl = `${window.location.pathname}?${p.toString()}`;
        window.history.replaceState(null, '', newUrl);

        // Compute booking fields now that data is available
        const prop = data[0];
        const _price = prop.PricePerNight;
        const _atlasfees = prop.AtlasFees;
        const _cleaningfee = prop.CleaningFee;
        const _currency = prop.currency?.symbol || '$';
        const _nights =
          startDate && endDate
            ? moment(endDate, 'MM-DD-YYYY').diff(moment(startDate, 'MM-DD-YYYY'), 'days')
            : 0;
        const _total = _nights * _price;
        const _feesTotal = _nights * _atlasfees;
        const _totalWithCleaningFee = _total + _feesTotal + _cleaningfee;

        // Create booking record with Revolut payment details
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}proeprty-bookings`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_APP_API_TOKEN}`,
            },
            body: JSON.stringify({
              data: {
                property: prop?.documentId,
                StartDate: moment(startDate).format('YYYY-MM-DD'),
                EndDate: moment(endDate).format('YYYY-MM-DD'),
                Guests: parseInt(guest),
                Rooms: parseInt(room),
                PriceperNight: _price,
                NumberOfNights: _nights,
                AtlasFee: _atlasfees,
                CleaningFee: _cleaningfee,
                TotalPaid: _totalWithCleaningFee,
                PaidBy: 'Credit Card',
                PaymentProvider: 'Revolut',
                PaymentOrderId: revolutOrderId || null,
                PaymentId: revolutPaymentId || null,
                PaymentStatus: revolutStatus,
                PaymentCurrency: revolutCurrency || _currency,
                PaymentAmount: revolutAmount ? Number(revolutAmount) : _totalWithCleaningFee,
              },
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Booking error (post-Revolut):', errorData);
          alert('Payment succeeded but booking creation failed. Please contact support.');
          return;
        }
        console.debug('[payments] booking created successfully after Revolut');
        alert('Booking confirmed.');
        navigate('/thank-you');
      } catch (err) {
        console.error('Error submitting booking after Revolut payment:', err);
        alert('Payment succeeded but booking failed.');
      }
    })();
  }, [loading, data, navigate]);

  if (!loggedIn) {
    return null;
  }
  if (loading || !data || !Array.isArray(data) || data.length === 0) {
    if (revolutStatusParam) {
      return (
        <PageWrapper>
          <h2>Processing payment…</h2>
          <p>Please wait while we confirm your booking.</p>
        </PageWrapper>
      );
    }
    return null;
  }

  const raw = data[0];
  const title = raw.Title;
  const price = raw.PricePerNight;
  const gallery = raw.Images || [];
  const homeImage = gallery[0]?.url;
  const currency = raw.currency?.symbol || '$';
  const atlasfees = raw.AtlasFees;
  const cleaningfee = raw.CleaningFee;

  const nights =
    startDate && endDate
      ? moment(endDate, 'MM-DD-YYYY').diff(
          moment(startDate, 'MM-DD-YYYY'),
          'days',
        )
      : 0;

  const total = nights * price;
  const feesTotal = nights * atlasfees;
  const totalWithCleaningFee = total + feesTotal + cleaningfee;

  const handlePayment = async (paymentMethod) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}proeprty-bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_APP_API_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              property: raw.documentId,
              StartDate: moment(startDate).format('YYYY-MM-DD'),
              EndDate: moment(endDate).format('YYYY-MM-DD'),
              Guests: parseInt(guest),
              Rooms: parseInt(room),
              PriceperNight: price,
              NumberOfNights: nights,
              AtlasFee: atlasfees,
              CleaningFee: cleaningfee,
              TotalPaid: totalWithCleaningFee,
              PaidBy: paymentMethod,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking error:', errorData);
        alert('There was an issue submitting your booking.');
        return;
      }

      navigate('/thank-you');
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to complete booking.');
    }
  };

  const startRevolutHostedCheckout = async () => {
    try {
      if (!backendBaseUrl) {
        alert('Backend URL not configured. Please set VITE_BACKEND_BASE_URL');
        return;
      }
      // Require property data to avoid bad propertyId (e.g., 'disconnect')
      if (!Array.isArray(data) || data.length === 0 || !data[0]?.documentId) {
        alert('Loading property details, please try again in a moment.');
        return;
      }
      const propIdForCheckout = data[0].documentId;

      const successUrl = `${window.location.origin}${window.location.pathname}?${new URLSearchParams({
        startDate,
        endDate,
        guest,
        room,
        propertyId: propIdForCheckout,
        slug,
        revolut_status: 'success',
      }).toString()}`;
      const cancelUrl = `${window.location.href}`;
      console.debug('[payments] starting Revolut checkout', { endpoint: `${paymentsServerUrl}/payments/revolut/checkout`, successUrl, cancelUrl });

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${paymentsServerUrl}/payments/revolut/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalWithCleaningFee,
          currency,
          description: `Booking for ${title}`,
          successUrl,
          cancelUrl,
          metadata: {
            propertyId: propIdForCheckout,
            startDate,
            endDate,
            guest,
            room,
            slug,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to create Revolut checkout', err);
        alert('Failed to start payment.');
        return;
      }

      const payload = await res.json().catch(() => null);
      console.debug('[payments] checkout response', payload);
      const redirectUrl = payload?.redirectUrl || payload?.url;
      if (!redirectUrl) {
        alert('Payment could not be started.');
        return;
      }
      window.location.assign(redirectUrl);
    } catch (e) {
      console.error('Revolut checkout error', e);
      const aborted = e?.name === 'AbortError';
      alert(aborted ? 'Payment server did not respond in time. Please try again.' : 'Failed to start Revolut payment.');
    }
  };

  return (
    <PageWrapper>
      <h2>Confirm and Pay</h2>
      <Section>
        <h3>Your trip</h3>
        <SummaryBox>
          <p>
            <strong>Location:</strong>{' '}
            <a target="_blank" href={`/post/${slug}`} rel="noopener noreferrer">
              <img
                height="100px"
                width="100px"
                src={resolveURL(homeImage) || '/images/single-post-bg.jpg'}
                alt={title}
              />
              {title}
            </a>
          </p>
          <p>This reservation is non-refundable.</p>
          <p>
            <strong>Dates:</strong> {moment(startDate).format('MMM D, YYYY')} –{' '}
            {moment(endDate).format('MMM D, YYYY')}
          </p>
          <p>
            <strong>Guests:</strong> {guest}
          </p>
          <p>
            <strong>Rooms:</strong> {room}
          </p>
          <p>
            <strong>Price:</strong> {currency}
            {price} × {nights} nights = {currency}
            {total}
          </p>
          <p>
            <strong>Atlas Fees:</strong> {currency}
            {feesTotal}
          </p>
          <p>
            <strong>Cleaning Fee:</strong> {currency}
            {cleaningfee}
          </p>
          <p>
            <strong>Total:</strong> {currency}
            {totalWithCleaningFee}
          </p>
        </SummaryBox>
      </Section>

      <Divider />

      <Section style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          onClick={() => handlePayment('ETH')}
        >
          Pay with Crypto
        </Button>
        <div style={{ height: '10px' }} />
        <Button
          type="primary"
          size="large"
          onClick={startRevolutHostedCheckout}
        >
          Pay with Credit Card
        </Button>
      </Section>
    </PageWrapper>
  );
};

export default PaymentPage;
