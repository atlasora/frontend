import React, { useContext, useEffect } from 'react';
import { AuthContext } from 'context/AuthProvider';
import useDataApi from 'library/hooks/useDataApi';
import Container from 'components/UI/Container/Container';
import Heading from 'components/UI/Heading/Heading';
import Loader from 'components/Loader/Loader';
import Text from 'components/UI/Text/Text';
import { useNavigate } from 'react-router-dom';

const AgentBookingPage = () => {
  const { loggedIn, user: userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      navigate('/sign-in');
    }
  }, [loggedIn, navigate]);
  //todo : add currency
  const { data: bookingsData, loading: bookingsLoading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}proeprty-bookings?filters[users_permissions_user][id][$eq]=${userInfo?.id}&populate=property`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
    'proeprty-bookings',
    [],
  );

  const handleCancelBooking = (bookingId) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      console.log(`Cancel booking ID: ${bookingId}`);
      // TODO: Call API to cancel booking
    }
  };

  const handleModifyBooking = (booking) => {
    console.log('Modify booking:', booking);
    // TODO: Show modal or redirect with form
  };

  const handleMessageHost = (booking) => {
    if (!booking?.id) return;
    const { id: bookingId, property } = booking || {};
    const state = {
      propertyId: property?.id || property?._id,
      propertyTitle: property?.Title,
      hostId: property?.Owner?.id,
      hostName: property?.Owner?.username || property?.Owner?.name,
    };
    // Navigate to chat screen with booking identifier and preload info
    navigate(`/chat/${bookingId}`, { state });
  };

  if (!loggedIn) return null; // Or <Loader />

  if (bookingsLoading) return <Loader />;

  return (
    <Container>
      <Heading as="h3" content="Your Bookings" />
      {Array.isArray(bookingsData) && bookingsData.length ? (
        bookingsData.map((booking) => {
          const {
            id,
            StartDate,
            EndDate,
            Guests,
            Rooms,
            PaidBy,
            TotalPaid,
            BookingStatus,
            property,
          } = booking;
          const currencySymbol = property?.currency?.symbol;
          return (
            <div
              key={id}
              style={{
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid #eee',
                borderRadius: '8px',
              }}
            >
              <h4>{property?.Title || 'Untitled Property'}</h4>
              <p>
                🗓 {StartDate} → {EndDate}
              </p>
              <p>👥 Guests: {Guests}</p>
              <p>🛏 Rooms: {Rooms}</p>
              <p>💳 Paid via: {PaidBy}</p>
              <p>
                💰 Total Paid: {currencySymbol}
                {TotalPaid}
              </p>
              <p>BookingStatus: {BookingStatus}</p>

              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <button
                  style={{ padding: '6px 12px' }}
                  onClick={() => handleCancelBooking(id)}
                >
                  ❌ Cancel Booking
                </button>
                <button
                  style={{ padding: '6px 12px' }}
                  onClick={() => handleModifyBooking(booking)}
                >
                  ✏️ Modify
                </button>
                <button
                  style={{ padding: '6px 12px' }}
                  onClick={() => handleMessageHost(booking)}
                >
                  💬 Message Host
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <Text content="You have no bookings yet." />
      )}
    </Container>
  );
};

export default AgentBookingPage;
