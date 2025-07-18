//todo : add uer permission to property booking (wait for connors stuff)

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
  const propertyId = searchParams.get('propertyId');
  const slug = searchParams.get('slug');

  const deslug = slug ? slug.replace(/-/g, ' ') : '';

  // ✅ Handle missing query data early
  useEffect(() => {
    if (!propertyId || !slug || !startDate || !endDate || !guest || !room) {
      alert('Missing or invalid booking details.');
      navigate('/', { replace: true });
    }
  }, [propertyId, slug, startDate, endDate, guest, room, navigate]);

  const { data, loading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}properties?filters[Title][$eqi]=${deslug}&populate[Images]=true&populate[currency]=true`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
  );

  useEffect(() => {
    if (!loggedIn) {
      const fullPath = window.location.pathname + window.location.search;
      localStorage.setItem('returnTo', fullPath);
      navigate('/sign-in', { replace: true });
    }
  }, [loggedIn, navigate]);

  // ✅ Handle not found or bad response
  if (!loggedIn || loading) return null;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <PageWrapper>
        <h2>Error</h2>
        <p>Sorry, we couldn't find the property you are trying to book.</p>
        <Button type="primary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </PageWrapper>
    );
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
        `${import.meta.env.VITE_APP_API_URL}property-bookings`,
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
          onClick={() => handlePayment('Credit Card')}
        >
          Pay with Credit Card
        </Button>
      </Section>
    </PageWrapper>
  );
};

export default PaymentPage;
