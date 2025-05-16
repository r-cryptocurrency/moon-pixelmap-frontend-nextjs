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
    <div className={`${className} panel flex flex-col p-3 h-full max-h-full`}>
      <h3 className="font-semibold mb-2 px-1">Chat Display</h3>
      <div className="panel-content space-y-2 overflow-y-auto flex-1">
        {sampleMessages.map(msg => (
          <div key={msg.id} className="bg-gray-200 bg-opacity-70 rounded-lg p-2 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-blue-700 text-sm font-mono">{msg.user}</span>
              <span className="text-gray-600 text-xs">{msg.timeString}</span>
            </div>
            <p className="text-gray-800 text-sm">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}