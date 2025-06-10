
-- Drop the existing messages table and recreate with proper structure for individual chats
DROP TABLE IF EXISTS public.messages;

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1 TEXT NOT NULL,
  participant2 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant1, participant2)
);

-- Create messages table for individual conversations
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create indexes for better performance
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_conversations_participants ON public.conversations(participant1, participant2);

-- Enable real-time subscriptions
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1 TEXT, user2 TEXT)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    conv_id UUID;
    p1 TEXT;
    p2 TEXT;
BEGIN
    -- Order participants to ensure consistency
    IF user1 < user2 THEN
        p1 := user1;
        p2 := user2;
    ELSE
        p1 := user2;
        p2 := user1;
    END IF;
    
    -- Try to find existing conversation
    SELECT id INTO conv_id
    FROM public.conversations
    WHERE participant1 = p1 AND participant2 = p2;
    
    -- If not found, create new conversation
    IF conv_id IS NULL THEN
        INSERT INTO public.conversations (participant1, participant2)
        VALUES (p1, p2)
        RETURNING id INTO conv_id;
    END IF;
    
    RETURN conv_id;
END;
$$;
