import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Strapi endpoints for PropertyChat collection type
// - GET:  `${VITE_APP_API_URL}property-chats?filters[proeprty_booking][id][$eq]={bookingId}&populate=users_permissions_user,admin_user,proeprty_booking&sort=createdAt:asc`
// - POST: `${VITE_APP_API_URL}property-chats`

const API_URL = import.meta.env.VITE_APP_API_URL; // e.g. http://localhost:1337/api/
const API_TOKEN = import.meta.env.VITE_APP_API_TOKEN; // Bearer token (fallback)
const USE_API_TOKEN_FOR_READ = String(import.meta.env.VITE_CHAT_USE_API_TOKEN_FOR_READ || '').toLowerCase() === 'true';

export default function useChatApi(bookingId, authToken, options = {}) {
  const { pollMs = 0 } = options;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken || API_TOKEN}`,
    }),
    [authToken],
  );

  const fetchMessages = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      // Strapi v4 filter for relation id equality
      // filters[proeprty_booking][id][$eq] = bookingId
      params.set('filters[proeprty_booking][id][$eq]', String(bookingId));
      // Populate relations individually (correct Strapi syntax)
      params.set('populate[users_permissions_user]', 'true');
      params.set('populate[admin_user]', 'true');
      params.set('populate[proeprty_booking]', 'true');
      // Include drafts (in case entries aren't published yet)
      params.set('publicationState', 'preview');
      // Sort ascending by createdAt so conversation is chronological
      params.set('sort', 'createdAt:asc');

      const url = `${API_URL}property-chats?${params.toString()}`;

      // Option: use API token directly for reads to avoid double call (403 -> 200)
      const readHeaders = USE_API_TOKEN_FOR_READ
        ? { ...headers, Authorization: `Bearer ${API_TOKEN}` }
        : headers;

      let res = await fetch(url, { headers: readHeaders });
      // If using JWT and get forbidden, retry once with API token fallback
      if (!USE_API_TOKEN_FOR_READ && res.status === 403 && authToken) {
        const fallbackHeaders = { ...headers, Authorization: `Bearer ${API_TOKEN}` };
        res = await fetch(url, { headers: fallbackHeaders });
      }
      if (!res.ok) throw new Error(`Failed to fetch chats (${res.status})`);
      const json = await res.json();
      // Debug: inspect API payload
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[useChatApi] GET property-chats response:', json);
      }

      // Support both shapes:
      // 1) Default Strapi v4: { data: [{ id, attributes: { message, adminMessage, createdAt, users_permissions_user: { data: { attributes }}, admin_user: { data: { attributes }}}}] }
      // 2) Flattened: { data: [{ id, message, adminMessage, createdAt, users_permissions_user: {...}, admin_user: {...} }] }
      const items = Array.isArray(json?.data) ? json.data : [];
      const mapped = items.map((item) => {
        const attr = item?.attributes || item || {};
        // Extract related user/admin across both shapes
        const userRel =
          attr?.users_permissions_user?.data?.attributes ||
          attr?.users_permissions_user ||
          null;
        const adminRel =
          attr?.admin_user?.data?.attributes ||
          attr?.admin_user ||
          null;

        // Determine host vs booker: prefer explicit flag, then relation presence
        const isHost = attr?.adminMessage === true || !!adminRel;

        // Choose the relation to use for display name
        // If it's a host message, prefer the property owner relation (users_permissions_user) when present,
        // otherwise fall back to admin_user. For non-host, use users_permissions_user.
        const nameSource = isHost
          ? (userRel || adminRel || null)
          : (userRel || null);

        // Generic helper over chosen relation
        const pickName = (rel) =>
          (rel?.username && String(rel.username).trim()) ||
          (rel?.firstname && String(rel.firstname).trim()) ||
          (rel?.firstName && String(rel.firstName).trim()) ||
          (rel?.lastname && String(rel.lastname).trim()) ||
          (rel?.lastName && String(rel.lastName).trim()) ||
          (rel?.email && String(rel.email).trim()) ||
          null;

        const displayName = pickName(nameSource) || (isHost ? 'Admin' : 'User');

        return {
          id: item.id,
          message: attr.message,
          adminMessage: !!attr.adminMessage,
          createdAt: attr.createdAt || item?.createdAt,
          isHost,
          userName: displayName,
        };
      });
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[useChatApi] mapped messages:', mapped);
      }
      setMessages(mapped);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [API_URL, bookingId, headers]);

  const sendMessage = useCallback(
    async ({ text, currentUserId, isAdmin = false, adminUserId } = {}) => {
      if (!bookingId) throw new Error('bookingId is required');
      if (!text || !text.trim()) return;

      const body = {
        data: {
          uid: `property-chat-${bookingId}-${Date.now()}`,
          message: text.trim(),
          adminMessage: !!isAdmin,
          proeprty_booking: bookingId,
          // Immediately publish so it appears without requiring publish action in Strapi
          publishedAt: new Date().toISOString(),
        },
      };
      // Only attach relations when provided; Strapi will set authenticated user if using user JWT.
      if (currentUserId && !isAdmin) {
        body.data.users_permissions_user = currentUserId;
      }
      if (isAdmin && adminUserId) {
        body.data.admin_user = adminUserId;
      }

      let res = await fetch(`${API_URL}property-chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      // If forbidden with user token, retry with API token fallback
      if (res.status === 403 && authToken) {
        const fallbackHeaders = { ...headers, Authorization: `Bearer ${API_TOKEN}` };
        res = await fetch(`${API_URL}property-chats`, {
          method: 'POST',
          headers: fallbackHeaders,
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) throw new Error(`Failed to send message (${res.status})`);
      // Optimistically append; alternatively re-fetch
      await fetchMessages();
    },
    [API_URL, bookingId, headers, fetchMessages],
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Optional polling
  useEffect(() => {
    if (!pollMs) return;
    // Clear any existing interval
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollRef.current = setInterval(() => {
      fetchMessages();
    }, pollMs);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [pollMs, fetchMessages]);

  return {
    messages,
    loading,
    error,
    refresh: fetchMessages,
    sendMessage,
  };
}
