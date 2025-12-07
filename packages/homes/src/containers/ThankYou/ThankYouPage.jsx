import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import useDataApi from 'library/hooks/useDataApi';

const Wrapper = styled.div`
  max-width: 600px;
  margin: 60px auto;
  padding: 40px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clear the listing_search_params from localStorage
    localStorage.removeItem('listing_search_params');
  }, []);

  const searchParams = new URLSearchParams(location.search);
  const revolutStatus = searchParams.get('revolut_status') || searchParams.get('status');
  const propertyId = searchParams.get('propertyId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const guest = searchParams.get('guest');
  const room = searchParams.get('room');
  const alreadyBooked = searchParams.get('booking_created');

  // Fetch property data if we need to create a booking
  const shouldCreateBooking =
    revolutStatus &&
    (revolutStatus.toLowerCase() === 'success' || revolutStatus.toLowerCase() === 'completed') &&
    !alreadyBooked &&
    propertyId;

  const propertiesUrl = shouldCreateBooking
    ? `${import.meta.env.VITE_APP_API_URL}properties?filters[documentId][$eq]=${encodeURIComponent(
      propertyId
    )}&populate[currency]=true`
    : null;

  const { data, loading } = useDataApi(
    propertiesUrl,
    import.meta.env.VITE_APP_API_TOKEN,
    1,
    'properties',
    [],
    !!propertiesUrl
  );

  useEffect(() => {
    if (!shouldCreateBooking || loading || !data || !Array.isArray(data) || data.length === 0 || processing) {
      return;
    }

    const createBooking = async () => {
      setProcessing(true);
      try {
        // Mark as processed in URL to prevent double submission on reload
        searchParams.set('booking_created', '1');
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, '', newUrl);

        const revolutOrderId = searchParams.get('revolut_order_id') || searchParams.get('orderId');
        const revolutPaymentId = searchParams.get('revolut_payment_id') || searchParams.get('paymentId');
        const revolutAmount = searchParams.get('amount');
        const revolutCurrency = searchParams.get('currency');

        const prop = data[0];
        const _price = prop.PricePerNight;
        const _atlasfees = prop.AtlasFees;
        const _cleaningfee = prop.CleaningFee;
        const _currency = prop.currency?.code || 'USD';
        const _nights =
          startDate && endDate
            ? moment(endDate, 'MM-DD-YYYY').diff(moment(startDate, 'MM-DD-YYYY'), 'days')
            : 0;
        const _total = _nights * _price;
        const _feesTotal = _nights * _atlasfees;
        const _totalWithCleaningFee = _total + _feesTotal + _cleaningfee;

        console.debug('[ThankYou] Creating booking...', {
          propertyId,
          revolutOrderId,
          amount: _totalWithCleaningFee,
        });

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
                Guests: parseInt(guest || '1'),
                Rooms: parseInt(room || '1'),
                PriceperNight: _price,
                NumberOfNights: _nights,
                AtlasFee: _atlasfees,
                CleaningFee: _cleaningfee,
                TotalPaid: _totalWithCleaningFee,
                PaidBy: 'Credit Card',
                // PaymentProvider: 'Revolut', // Removed due to schema validation error
                // PaymentOrderId: revolutOrderId || null,
                // PaymentId: revolutPaymentId || null,
                // PaymentStatus: revolutStatus,
                // PaymentCurrency: revolutCurrency || _currency,
                // PaymentAmount: revolutAmount ? Number(revolutAmount) : _totalWithCleaningFee,
              },
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Booking error:', errorData);
          throw new Error('Failed to create booking record');
        }

        console.log('[ThankYou] Booking created successfully');
      } catch (err) {
        console.error('Error in ThankYou page booking:', err);
        setError('Payment was successful, but we failed to save your booking. Please contact support.');
      } finally {
        setProcessing(false);
      }
    };

    createBooking();
  }, [shouldCreateBooking, loading, data]);

  if (shouldCreateBooking && (loading || processing)) {
    return (
      <Wrapper>
        <h1>Processing...</h1>
        <p>Please wait while we confirm your booking details.</p>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <h1 style={{ color: 'red' }}>⚠️ Issue Detected</h1>
        <p>{error}</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <h1>🎉 Thank You!</h1>
      <p>Your booking has been confirmed.</p>
      <p>You’ll receive an email with your reservation details shortly.</p>
    </Wrapper>
  );
};

export default ThankYouPage;
