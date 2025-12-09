import React, { useContext, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Container from 'components/UI/Container/Container';
import Heading from 'components/UI/Heading/Heading';
import Text from 'components/UI/Text/Text';
import useChatApi from 'library/hooks/useChatApi';
import { AuthContext } from 'context/AuthProvider';

// Simple chat page keyed by bookingId. Stubbed UI you can wire to your backend later.
const ChatPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId, propertyTitle, hostId, hostName } = location.state || {};
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user, token } = useContext(AuthContext);
  const currentUserId = user?.id;

  const POLL_MS = Number(import.meta.env.VITE_CHAT_POLL_MS || 5000);
  const { messages, loading, error, sendMessage, refresh } = useChatApi(bookingId, token, { pollMs: POLL_MS });

  // Optional custom icons via env; fallback to emoji/initials
  const HOST_ICON_URL = import.meta.env.VITE_HOST_ICON_URL;
  const BOOKER_ICON_URL = import.meta.env.VITE_BOOKER_ICON_URL;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || isSending) return;
    try {
      setIsSending(true);
      // Send to Strapi and refresh via hook
      await sendMessage({ text, currentUserId });
      setMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 16 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '6px 12px' }}>
          ← Back
        </button>
        <Heading as="h3" content={`Chat for booking #${bookingId}`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {propertyTitle && (
            <Text content={`Property: ${propertyTitle}${propertyId ? ` (ID: ${propertyId})` : ''}`} />
          )}
          {hostName && (
            <Text content={`Host: ${hostName}${hostId ? ` (ID: ${hostId})` : ''}`} />
          )}
        </div>
        <button type="button" onClick={() => refresh()} style={{ padding: '6px 12px', marginLeft: 'auto' }} title={`Refresh (auto every ${Math.round(POLL_MS/1000)}s)`}>
          ⟳ Refresh
        </button>
      </div>

      {/* Inline Refreshing indicator (do not hide conversation) */}
      {loading && (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Refreshing…
        </div>
      )}
      {error && (
        <div style={{ marginTop: 12, color: '#b00020' }}>
          <Text content={`Error loading chat: ${error.message || error}`} />
        </div>
      )}

      {/* Conversation (always visible) */}
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
          minHeight: 240,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {(!messages || messages.length === 0) ? (
          <Text content="No messages yet. Start the conversation!" />
        ) : (
          messages.map((m) => {
            const isHost = !!m.adminMessage;
            const bubbleBg = isHost ? '#f1f5f9' : '#e6f7ff';
            const alignSelf = isHost ? 'flex-start' : 'flex-end';
            const tailStyle = isHost
              ? {
                  position: 'absolute',
                  left: -8,
                  bottom: 10,
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: `8px solid ${bubbleBg}`,
                }
              : {
                  position: 'absolute',
                  right: -8,
                  bottom: 10,
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderLeft: `8px solid ${bubbleBg}`,
                };

              // Fallback display names when relations aren't populated on first load
              const fallbackUserName = user?.username || user?.email || 'You';
              const displayName = m.userName || (isHost ? (hostName || 'Host') : fallbackUserName);

              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignSelf, maxWidth: '80%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {/* Avatar with defaults */}
                    {isHost ? (
                      HOST_ICON_URL ? (
                        <img
                          src={HOST_ICON_URL}
                          alt="Host"
                          width={24}
                          height={24}
                          style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          aria-label="Host avatar"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: '#fde68a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                          }}
                        >
                          🏠
                        </div>
                      )
                    ) : BOOKER_ICON_URL ? (
                      <img
                        src={BOOKER_ICON_URL}
                        alt="Booker"
                        width={24}
                        height={24}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        aria-label="Booker avatar"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#bfdbfe',
                          color: '#1e3a8a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {(displayName)
                          .split(/\s+/)
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: 12, opacity: 0.85 }}>{displayName}</span>
                  </div>

                  {/* Speech bubble */}
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        background: bubbleBg,
                        padding: '10px 12px',
                        borderRadius: 12,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div>{m.message || m.text || (m.attributes && m.attributes.message) || '(no message)'}</div>
                      {m.createdAt && (
                        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6, textAlign: 'right' }}>
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div style={tailStyle} />
                  </div>
                </div>
              );
            })
          )}
      </div>

      <form onSubmit={handleSend} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6 }}
        />
        <button type="submit" style={{ padding: '8px 14px' }}>
          Send
        </button>
      </form>

      
    </Container>
  );
};

export default ChatPage;
