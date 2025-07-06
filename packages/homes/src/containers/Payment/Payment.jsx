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
            <strong>Location:</strong> {address}
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
        </SummaryBox>
      </Section>

      <Section>
        <h3>Enter your details</h3>
        <Label>Full name</Label>
        <Input placeholder="John Doe" />

        <Label style={{ marginTop: '16px' }}>Email address</Label>
        <Input type="email" placeholder="email@example.com" />
      </Section>

      <Section>
        <h3>Payment</h3>
        <p>
          This is a placeholder. You can plug in Stripe or another provider
          here.
        </p>
        <Input placeholder="Card number" style={{ marginBottom: '8px' }} />
        <Input placeholder="MM/YY" style={{ marginBottom: '8px' }} />
        <Input placeholder="CVC" />
      </Section>

      <Divider />

      <Section style={{ textAlign: 'center' }}>
        <Button type="primary" size="large" onClick={handlePayment}>
          Confirm and Pay
        </Button>
        <p style={{ color: '#717171', fontSize: '14px', marginTop: '8px' }}>
          You won’t be charged yet
        </p>
      </Section>
    </PageWrapper>
  );
};

export default PaymentPage;
