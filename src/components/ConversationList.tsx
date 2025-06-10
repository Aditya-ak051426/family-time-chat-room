
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MessageCircle, Search } from "lucide-react";

interface Conversation {
  id: string;
  participant1: string;
  participant2: string;
  created_at: string;
  lastMessage?: {
    text: string;
    created_at: string;
    sender: string;
  };
}

interface ConversationListProps {
  currentUser: string;
  onSelectConversation: (conversationId: string, otherUser: string) => void;
  selectedConversationId?: string;
}

const ConversationList = ({ currentUser, onSelectConversation, selectedConversationId }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatUser, setNewChatUser] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to conversation changes
    const channel = supabase
      .channel('conversations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const fetchConversations = async () => {
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1.eq.${currentUser},participant2.eq.${currentUser}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch last message for each conversation
      const conversationsWithLastMessage = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('text, created_at, sender')
            .eq('conversation_id', conv.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            lastMessage: lastMessage || undefined
          };
        })
      );

      setConversations(conversationsWithLastMessage);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const createNewConversation = async () => {
    if (!newChatUser.trim() || newChatUser === currentUser) return;

    try {
      const { data, error } = await supabase
        .rpc('get_or_create_conversation', {
          user1: currentUser,
          user2: newChatUser.trim()
        });

      if (error) throw error;

      onSelectConversation(data, newChatUser.trim());
      setShowNewChat(false);
      setNewChatUser("");
      fetchConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.participant1 === currentUser 
      ? conversation.participant2 
      : conversation.participant1;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    return otherUser.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
          <Button
            onClick={() => setShowNewChat(!showNewChat)}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* New Chat Input */}
        {showNewChat && (
          <div className="mt-3 flex space-x-2">
            <Input
              placeholder="Enter username..."
              value={newChatUser}
              onChange={(e) => setNewChatUser(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewConversation()}
              className="flex-1"
              autoFocus
            />
            <Button onClick={createNewConversation} size="sm">
              Start
            </Button>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="w-12 h-12 mb-2" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a new chat!</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id, otherUser)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversationId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {otherUser.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{otherUser}</h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.sender === currentUser ? 'You: ' : ''}
                        {conversation.lastMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
