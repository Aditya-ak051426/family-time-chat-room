
interface MessageData {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface MessageProps {
  message: MessageData;
  isOwn: boolean;
}

const Message = ({ message, isOwn }: MessageProps) => {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isSystem = message.username === "System";

  if (isSystem) {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-center mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-sm text-gray-500 font-medium">
            {message.username}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isOwn
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;
