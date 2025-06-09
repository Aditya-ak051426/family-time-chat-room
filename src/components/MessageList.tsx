
import { useEffect, useRef } from "react";
import Message from "./Message";

interface MessageData {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: MessageData[];
  currentUsername: string;
}

const MessageList = ({ messages, currentUsername }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isOwn={message.username === currentUsername}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
