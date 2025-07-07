import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Input, Divider } from 'antd';
import moment from 'moment';
import useDataApi from 'library/hooks/useDataApi';
import resolveURL from '../../library/helpers/resolveURL';

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

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
`;

const SummaryBox = styled.div`
  background: #fafafa;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
`;

//todo : update details price etc from api call
//todo : rener the image in the slug path
//todo : define the booking in the database
//todo : store the booking when payment has been made
//todo : create the thankyou page
//todo : check the booking page if the dates are avalible or not (could be post MVP)

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const guest = searchParams.get('guest');
  const room = searchParams.get('room');
  const slug = searchParams.get('slug');
  //not used but could be useful
  //const propertyId = searchParams.get('propertyId');

  //Now you can use slug safely
  const deslug = slug ? slug.replace(/-/g, ' ') : '';

  const { data, loading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}properties?filters[Title][$eqi]=${deslug}&populate[Images]=true&populate[currency]=true`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
    'properties',
    [],
    true,
  );

  if (loading || !data || !Array.isArray(data) || data.length === 0) {
    return <p>Loading...</p>;
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
  //add the fee to the total
  const totalWithFees = total + nights * atlasfees;
  //get the fee total
  const feesTotal = nights * atlasfees;
  //add the cleaning fee to the total
  const totalWithCleaningFee = totalWithFees + cleaningfee;

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

  return (
    <PageWrapper>
      <h2>Confirm and Pay</h2>

      <Section>
        <h3>Your trip</h3>
        <SummaryBox>
          <p>
            <strong>Location:</strong>
            <a target="_blank" href={`/post/${slug}`} rel="noopener noreferrer">
              <img
                height="100px"
                width="100px"
                src={
                  resolveURL(gallery[0]?.url) || '/images/single-post-bg.jpg'
                }
                alt="{title}"
              />
              {title}
            </a>
          </p>
          <p>This reservation is non-refundable. Full policy</p>
          <p>
            <strong>Dates:</strong>{' '}
            {startDate && endDate
              ? `${moment(startDate).format('MMM D, YYYY')} – ${moment(endDate).format('MMM D, YYYY')}`
              : 'N/A'}
          </p>
          <p>
            <strong>Guests:</strong> {guest}
          </p>
          <p>
            <strong>Rooms:</strong> {room}
          </p>
          <p>
            <strong>Price details:</strong> {currency}
            {price} * {nights} Nights {currency}
            {total}
          </p>
          <p>
            <strong>Atlas Fees:</strong> {currency}
            {feesTotal} ({atlasfees}%)
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
      <Section>
        Lower price. Your dates are $11 less than the avg. nightly rate of the
        last 60 days!
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
        <p style={{ color: '#717171', fontSize: '14px', marginTop: '8px' }}></p>
        <Button
          type="primary"
          size="large"
          onClick={() => handlePayment('Credit Card')}
        >
          Pay With Credit Card
        </Button>
        <p style={{ color: '#717171', fontSize: '14px', marginTop: '8px' }}></p>
      </Section>
    </PageWrapper>
  );
};

export default PaymentPage;
