import { useState } from 'react';

export default function ChatInputArea({ className = '' }: { className?: string }) {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      // In the future, this will use Socket.io to send the message
      setMessage('');
    }
  };

  return (
    <div className={`${className} panel p-3 h-auto`}>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-100 bg-opacity-70 rounded-md px-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-3 py-1 text-xs rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}