'use client';

import { useState, useEffect } from 'react';

export default function ChatDisplayArea({ className = '' }: { className?: string }) {
  // Use useState to store messages to avoid hydration errors
  const [sampleMessages, setSampleMessages] = useState<Array<{
    id: number;
    user: string;
    message: string;
    timestamp: Date;
    timeString: string;
  }>>([]);

  // Initialize messages after component mounts to avoid hydration errors
  useEffect(() => {
    const messages = [
      { id: 1, user: '0xf39Fd6...92266', message: 'Welcome to Moon Pixel Map chat!', timestamp: new Date(Date.now() - 3600000), timeString: '' },
      { id: 2, user: '0x7DAd3f...8b54d', message: 'I just bought some pixels near the center!', timestamp: new Date(Date.now() - 1800000), timeString: '' },
      { id: 3, user: '0xf39Fd6...92266', message: 'Nice! I\'m planning to create a logo there.', timestamp: new Date(Date.now() - 900000), timeString: '' }
    ];
    
    // Pre-compute time strings to avoid hydration issues
    messages.forEach(msg => {
      msg.timeString = msg.timestamp.toLocaleTimeString();
    });
    
    setSampleMessages(messages);
  }, []);

  return (
    <div className={`${className} panel flex flex-col h-full max-h-full p-0`}> {/* Remove panel padding for custom internal padding */}
      <h3 className="font-semibold px-4 py-2 text-sm border-b border-gray-300">Chat Display</h3>
      <div className="panel-content overflow-y-auto flex-1 px-2 py-1">
        {sampleMessages.map((msg, index) => (
          <div key={msg.id} className={`py-1.5 ${index < sampleMessages.length - 1 ? 'border-b border-gray-300/50' : ''}`}>
            <div className="bg-gray-200 bg-opacity-60 rounded p-1.5 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-blue-700 text-xs font-mono">{msg.user}</span>
                <span className="text-gray-600 text-xs">{msg.timeString}</span>
              </div>
              <p className="text-gray-800 text-xs">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}