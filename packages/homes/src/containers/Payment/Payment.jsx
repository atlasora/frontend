import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Input, Divider } from 'antd';
import moment from 'moment';
import useDataApi from 'library/hooks/useDataApi';

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
    `${import.meta.env.VITE_APP_API_URL}properties?filters[Title][$eqi]=${deslug}&populate[Images]=true`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
    'properties',
    [],
    true,
  );

  const handlePayment = () => {
    alert('Payment submitted!');
    navigate('/thank-you');
  };

  return (
    <PageWrapper>
      <h2>Confirm and Pay</h2>

      <Section>
        <h3>Your trip</h3>
        <SummaryBox>
          <p>
            <strong>Location:</strong>{' '}
            <a target="_blank" href="/post/house-number-2">
              House Number 2
            </a>
          </p>
          <p>
            <strong>Dates:</strong>{' '}
            {startDate && endDate
              ? `${moment(startDate).format('MMM D, YYYY')} – ${moment(endDate).format('MMM D, YYYY')}`
              : 'N/A'}
          </p>
          <p>
            <strong>Guests:</strong> {guest || 1}
          </p>
          <p>
            <strong>Rooms:</strong> {room || 1}
          </p>
          <p>
            <strong>Price details:</strong> $100 * 10 Nights $1,000
          </p>
          <p>
            <strong>Total:</strong> $1,000
          </p>
        </SummaryBox>
      </Section>
      <Section>
        Lower price. Your dates are $11 less than the avg. nightly rate of the
        last 60 days!
      </Section>

      <Divider />

      <Section style={{ textAlign: 'center' }}>
        <Button type="primary" size="large" onClick={handlePayment}>
          Pay with Crypto
        </Button>
        <p style={{ color: '#717171', fontSize: '14px', marginTop: '8px' }}></p>
        <Button type="primary" size="large" onClick={handlePayment}>
          Pay With Credit Card
        </Button>
        <p style={{ color: '#717171', fontSize: '14px', marginTop: '8px' }}></p>
      </Section>
    </PageWrapper>
  );
};

export default PaymentPage;
