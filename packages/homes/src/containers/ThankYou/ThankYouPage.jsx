import React, { useEffect } from 'react';
import styled from 'styled-components';

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
  useEffect(() => {
    // Clear the listing_search_params from localStorage
    localStorage.removeItem('listing_search_params');
  }, []);

  return (
    <Wrapper>
      <h1>🎉 Thank You!</h1>
      <p>Your booking has been confirmed.</p>
      <p>You’ll receive an email with your reservation details shortly.</p>
    </Wrapper>
  );
};

export default ThankYouPage;
