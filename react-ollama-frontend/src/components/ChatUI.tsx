import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatUI.css'
import avatarIcon from '../assets/avatar-icon.png';

const BASE_URL = "http://localhost:3000";

type Role = 'system' | 'user' | 'assistant'

interface Message {
    role: Role
    content: string
    timestamp: Date
}

const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Merhaba! Size nasıl yardımcı olabilirim?", timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      const newUserMessage: Message = { role: 'user', content: inputValue, timestamp: new Date() };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputValue('');
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post(`${BASE_URL}/generate`, { prompt: inputValue });
        const assistantMessage: Message = { role: 'assistant', content: response.data.message, timestamp: new Date() };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error(error);
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="avatar">
          <img src={avatarIcon} alt="Avatar" />
        </div>
        <h2>Gemma</h2>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">{formatTime(message.timestamp)}</div>
          </div>
        ))}
        {isLoading && <div className="message assistant">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>}
        {error && <div className="error-message">{error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          className="prompt-input"
          placeholder="Mesajınızı yazın..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
        />
        <button className="send-button" onClick={handleSendMessage} disabled={isLoading}>
          <svg className="send-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatUI;