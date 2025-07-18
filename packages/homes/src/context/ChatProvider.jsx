import React, { createContext, useContext, useRef, useState } from 'react';

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const connect = (bookingId) => {
    if (!bookingId) return;
    const wsUrl = `${import.meta.env.VITE_APP_CHAT_WS}?booking=${bookingId}`;
    socketRef.current = new WebSocket(wsUrl);
    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        /* ignore invalid data */
      }
    };
    socketRef.current.onclose = () => {
      socketRef.current = null;
    };
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setMessages([]);
  };

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === 1) {
      socketRef.current.send(JSON.stringify(message));
      setMessages((prev) => [...prev, { ...message, pending: true }]);
    }
  };

  return (
    <ChatContext.Provider
      value={{ messages, connect, disconnect, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

export default ChatProvider;
