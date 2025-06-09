
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-3">
      <Input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 border-2 border-gray-200 focus:border-blue-400 transition-colors duration-200 rounded-xl h-12"
        autoFocus
      />
      <Button
        type="submit"
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 rounded-xl px-6 h-12 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        disabled={!message.trim()}
      >
        Send
      </Button>
    </form>
  );
};

export default MessageInput;
