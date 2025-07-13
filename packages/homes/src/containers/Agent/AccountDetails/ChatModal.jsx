import React, { useEffect, useState } from 'react';
import { Modal, Input, Button, List } from 'antd';
import PropTypes from 'prop-types';
import { useChat } from 'context/ChatProvider';

const ChatModal = ({ bookingId, open, onClose }) => {
  const { messages, connect, disconnect, sendMessage } = useChat();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (open) {
      connect(bookingId);
    }
    return () => disconnect();
  }, [open, bookingId]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({ bookingId, message: input });
    setInput('');
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Chat">
      <List
        dataSource={messages}
        renderItem={(item, index) => (
          <List.Item key={index}>{item.message}</List.Item>
        )}
        style={{ marginBottom: '1rem' }}
      />
      <Input.TextArea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button type="primary" onClick={handleSend} style={{ marginTop: '8px' }}>
        Send
      </Button>
    </Modal>
  );
};

ChatModal.propTypes = {
  bookingId: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default ChatModal;
