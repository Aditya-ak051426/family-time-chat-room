
import { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { MessageCircle } from "lucide-react";

interface WhatsAppChatProps {
  username: string;
}

const WhatsAppChat = ({ username }: WhatsAppChatProps) => {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUser: string;
  } | null>(null);

  const handleSelectConversation = (conversationId: string, otherUser: string) => {
    setSelectedConversation({ id: conversationId, otherUser });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-full max-w-7xl mx-auto bg-white shadow-xl flex h-screen">
        {/* Conversation List */}
        <ConversationList
          currentUser={username}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
        />

        {/* Chat Window */}
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            otherUser={selectedConversation.otherUser}
            currentUser={username}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2">Welcome to Chat</h3>
              <p>Select a conversation to start messaging</p>
              <p className="text-sm mt-2">Click the + button to start a new chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
