import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import useDataApi from 'library/hooks/useDataApi';
import { AuthContext } from 'context/AuthProvider';

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
  const { user } = useContext(AuthContext);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL || '';

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
    )}&populate[currency]=true&fields[0]=Title&fields[1]=PricePerNight&fields[2]=AtlasFees&fields[3]=CleaningFee&fields[4]=BlockchainPropertyId`
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

        const prop = data[0];
        const blockchainPropertyId = prop.BlockchainPropertyId;
        const _price = prop.PricePerNight;
        const _atlasfees = prop.AtlasFees || 0;
        const _cleaningfee = prop.CleaningFee || 0;
        const _currency = prop.currency?.code || 'USD';
        const _nights =
          startDate && endDate
            ? moment(endDate, 'MM-DD-YYYY').diff(moment(startDate, 'MM-DD-YYYY'), 'days')
            : 0;
        const _total = _nights * _price;
        const _feesTotal = _total * (_atlasfees / 100);
        const _totalWithCleaningFee = _total + _feesTotal + _cleaningfee;

        // Convert to unix timestamps
        const checkInTs = Math.floor(moment(startDate, 'MM-DD-YYYY').valueOf() / 1000);
        const checkOutTs = Math.floor(moment(endDate, 'MM-DD-YYYY').valueOf() / 1000);

        // Convert total to base units (cents/pence)
        const totalAmountUnits = Math.round(_totalWithCleaningFee * 100);

        console.debug('[ThankYou] Creating on-chain booking...', {
          propertyId: blockchainPropertyId,
          revolutOrderId,
          amount: _totalWithCleaningFee,
          userId: user?.id,
        });

        // If property doesn't have blockchain ID, fall back to CMS-only booking
        if (!blockchainPropertyId) {
          console.warn('[ThankYou] Property has no BlockchainPropertyId, creating CMS-only booking');
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
                  StartDate: moment(startDate, 'MM-DD-YYYY').format('YYYY-MM-DD'),
                  EndDate: moment(endDate, 'MM-DD-YYYY').format('YYYY-MM-DD'),
                  Guests: parseInt(guest || '1'),
                  Rooms: parseInt(room || '1'),
                  PriceperNight: _price,
                  NumberOfNights: _nights,
                  AtlasFee: _atlasfees,
                  CleaningFee: _cleaningfee,
                  TotalPaid: _totalWithCleaningFee,
                  PaidBy: 'Credit Card',
                },
              }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Booking error:', errorData);
            throw new Error('Failed to create booking record');
          }
          console.log('[ThankYou] CMS-only booking created successfully');
          return;
        }

        // Create on-chain booking via backend
        const response = await fetch(`${backendBaseUrl}/api/bookings/create-fiat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            propertyId: blockchainPropertyId,
            checkInDate: checkInTs,
            checkOutDate: checkOutTs,
            totalAmount: totalAmountUnits.toString(),
            paymentReference: `revolut:${revolutOrderId || Date.now()}`,
            metadata: {
              guests: parseInt(guest || '1'),
              rooms: parseInt(room || '1'),
              pricePerNight: _price,
              subtotal: _total,
              platformFee: _feesTotal,
              cleaningFee: _cleaningfee,
              currency: _currency,
              cmsPropertyId: prop?.documentId,
              propertyTitle: prop?.Title,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('On-chain booking error:', errorData);
          throw new Error(errorData.error || 'Failed to create on-chain booking');
        }

        const result = await response.json();
        console.log('[ThankYou] On-chain booking created successfully:', result);
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
