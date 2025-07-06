import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Input, Divider } from 'antd';
import moment from 'moment';

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

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const guest = searchParams.get('guest');
  const room = searchParams.get('room');
  const address = searchParams.get('address');

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
        last 60 days
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
