
import { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface ChatRoomProps {
  username: string;
}

const ChatRoom = ({ username }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      username: "System",
      text: `Welcome to the family chat room! 🏠`,
      timestamp: new Date(),
    },
  ]);

  const addMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      username,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl h-[90vh] bg-white/90 backdrop-blur-sm shadow-2xl border-0 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Family Chat Room</h1>
              <p className="text-blue-100">Connected as {username}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-blue-100">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} currentUsername={username} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <MessageInput onSendMessage={addMessage} />
        </div>
      </Card>
    </div>
  );
};

export default ChatRoom;
