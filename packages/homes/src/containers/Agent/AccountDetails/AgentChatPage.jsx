import React, { useContext, useState } from 'react';
import Container from 'components/UI/Container/Container';
import Heading from 'components/UI/Heading/Heading';
import Loader from 'components/Loader/Loader';
import { AuthContext } from 'context/AuthProvider';
import useDataApi from 'library/hooks/useDataApi';
import ChatModal from './ChatModal';

const AgentChatPage = () => {
  const { user } = useContext(AuthContext);
  const { data: bookingsData, loading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}property-bookings?filters[users_permissions_user][id][$eq]=${user?.id}&populate=property`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
  );

  http: console.log('User ID:', user?.id);
  console.log(
    'API URL:',
    `${import.meta.env.VITE_APP_API_URL}property-bookings?filters[users_permissions_user][id][$eq]=${user?.id}&populate=property`,
  );
  console.log('Bookings Data:', bookingsData);

  const [activeBookingId, setActiveBookingId] = useState(null);

  if (loading) return <Loader />;

  return (
    <Container>
      <Heading as="h3" content="Chat with Hosts" />
      {bookingsData?.length ? (
        bookingsData.map((booking) => (
          <div
            key={booking.id}
            style={{
              padding: '16px',
              border: '1px solid #eee',
              marginBottom: '10px',
            }}
          >
            <p>{booking.property?.Title || 'Untitled Property'}</p>
            <button onClick={() => setActiveBookingId(booking.id)}>
              Open Chat
            </button>
          </div>
        ))
      ) : (
        <p>No bookings found</p>
      )}
      <ChatModal
        bookingId={activeBookingId}
        open={!!activeBookingId}
        onClose={() => setActiveBookingId(null)}
      />
    </Container>
  );
};

export default AgentChatPage;
