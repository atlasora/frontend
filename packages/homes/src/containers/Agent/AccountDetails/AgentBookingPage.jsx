import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'context/AuthProvider';
import useDataApi from 'library/hooks/useDataApi';
import Container from 'components/UI/Container/Container';
import Heading from 'components/UI/Heading/Heading';
import Loader from 'components/Loader/Loader';
import Text from 'components/UI/Text/Text';
import ChatModal from './ChatModal';
import { useNavigate } from 'react-router-dom';

const AgentBookingPage = () => {
  const { loggedIn, user: userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeBookingId, setActiveBookingId] = useState(null);

  useEffect(() => {
    if (!loggedIn) {
      navigate('/sign-in');
    }
  }, [loggedIn, navigate]);
  //todo : add currency
  const { data: bookingsData, loading: bookingsLoading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}property-bookings?filters[users_permissions_user][id][$eq]=${userInfo?.id}&populate[property][populate]=currency`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
  );
  console.log(bookingsData);
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

  const handleMessageHost = (bookingId) => {
    setActiveBookingId(bookingId);
  };

  if (!loggedIn) return null; // Or <Loader />

  if (bookingsLoading) return <Loader />;
  console.log('bookingsData:', bookingsData);

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
            BookingStatus,
            property,
          } = booking;
          const currencySymbol = property?.currency?.symbol; // fallback to INR
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
                  onClick={() => handleMessageHost(id)}
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
      <ChatModal
        bookingId={activeBookingId}
        open={!!activeBookingId}
        onClose={() => setActiveBookingId(null)}
      />
    </Container>
  );
};

export default AgentBookingPage;
