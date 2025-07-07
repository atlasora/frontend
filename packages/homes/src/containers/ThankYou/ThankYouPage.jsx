import React from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const PageWrapper = styled.div`
  max-width: 600px;
  margin: 100px auto;
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h1`
  font-size: 32px;
  margin-bottom: 16px;
`;

const SubText = styled.p`
  font-size: 18px;
  color: #555;
  margin-bottom: 32px;
`;
//todo send an email
const ThankYouPage = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Heading>Thank you for your booking!</Heading>
      <SubText>
        We’ve received your reservation and sent you a confirmation email.
      </SubText>
      <Button type="primary" size="large" onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </PageWrapper>
  );
};

export default ThankYouPage;
