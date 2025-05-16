export default function ChatDisplayArea({ className = '' }: { className?: string }) {
  // Sample messages for visualization
  const sampleMessages = [
    { id: 1, user: '0xf39Fd6...92266', message: 'Welcome to Moon Pixel Map chat!', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, user: '0x7DAd3f...8b54d', message: 'I just bought some pixels near the center!', timestamp: new Date(Date.now() - 1800000) },
    { id: 3, user: '0xf39Fd6...92266', message: 'Nice! I\'m planning to create a logo there.', timestamp: new Date(Date.now() - 900000) }
  ];

  return (
    <div className={`${className} bg-gray-800 bg-opacity-80 rounded-lg shadow-md flex flex-col p-3 h-full`}>
      <h3 className="text-white font-semibold mb-3 px-1">Chat Display</h3>
      <div className="flex-1 overflow-y-auto space-y-3">
        {sampleMessages.map(msg => (
          <div key={msg.id} className="bg-gray-900 bg-opacity-50 rounded-lg p-2 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-blue-300 text-sm font-mono">{msg.user}</span>
              <span className="text-gray-400 text-xs">{msg.timestamp.toLocaleTimeString()}</span>
            </div>
            <p className="text-white text-sm">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}