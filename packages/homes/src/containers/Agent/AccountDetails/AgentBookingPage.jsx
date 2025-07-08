import React, { useContext } from 'react';
import { AuthContext } from 'context/AuthProvider';
import useDataApi from 'library/hooks/useDataApi';
import Container from 'components/UI/Container/Container';
import Heading from 'components/UI/Heading/Heading';
import Loader from 'components/Loader/Loader';
import Text from 'components/UI/Text/Text';

const AgentBookingPage = () => {
  const { user: userInfo } = useContext(AuthContext);

  const { data: bookingsData, loading: bookingsLoading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}proeprty-bookings?filters[users_permissions_user][id][$eq]=${userInfo?.id}&populate=*`,
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

  const handleMessageHost = (property) => {
    console.log('Message host for property:', property);
    // TODO: Open contact modal or messaging system
  };

  if (bookingsLoading) return <Loader />;

  return (
    <Container>
      <Heading as="h3" content="Your Bookings" />
      {bookingsData?.length ? (
        bookingsData.map((booking) => {
          const {
            id,
            StartDate,
            EndDate,
            Guests,
            Rooms,
            PaidBy,
            TotalPaid,
            property,
          } = booking;

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
              <p>💰 Total Paid: ₹{TotalPaid}</p>

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
                  onClick={() => handleMessageHost(property)}
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
