
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface ChatRoomProps {
  username: string;
}

// Check if Supabase environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create Supabase client if environment variables are available
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const ChatRoom = ({ username }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // If Supabase is not configured, show local-only mode
  if (!supabase) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="w-full max-w-4xl h-[90vh] bg-white/90 backdrop-blur-sm shadow-2xl border-0 flex flex-col animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Family Chat Room</h1>
                <p className="text-blue-100">Connected as {username} (Local Mode)</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-blue-100">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm">Local Only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Notice */}
          <div className="p-4 border-b border-gray-200">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Required:</strong> To enable real-time family chat, please connect to Supabase using the green button in the top right corner. 
                For now, you can test the interface in local mode.
              </AlertDescription>
            </Alert>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <MessageList messages={messages} currentUsername={username} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <MessageInput onSendMessage={(text) => {
              const newMessage: Message = {
                id: Date.now().toString(),
                username,
                text,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, newMessage]);
            }} />
          </div>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    // Fetch existing messages
    fetchMessages();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = {
            id: payload.new.id,
            username: payload.new.username,
            text: payload.new.text,
            timestamp: new Date(payload.new.created_at)
          };
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    // Add welcome message for new user
    addSystemMessage(`${username} joined the chat! 👋`);

    return () => {
      // Send leave message before cleanup
      addSystemMessage(`${username} left the chat`);
      supabase.removeChannel(channel);
    };
  }, [username]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        username: msg.username,
        text: msg.text,
        timestamp: new Date(msg.created_at)
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Connection Error",
        description: "Could not load chat history. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const addMessage = async (text: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            username,
            text,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Error", 
        description: "Could not send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addSystemMessage = async (text: string) => {
    try {
      await supabase
        .from('messages')
        .insert([
          {
            username: 'System',
            text,
            created_at: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Error sending system message:', error);
    }
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
                <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isConnected ? 'Online' : 'Connecting...'}</span>
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
