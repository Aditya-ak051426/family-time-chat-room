
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeScreenProps {
  onUsernameSet: (username: string) => void;
}

const WelcomeScreen = ({ onUsernameSet }: WelcomeScreenProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onUsernameSet(inputValue.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Family Chat Room
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Welcome to our cozy family space! What should we call you?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter your name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-center border-2 border-gray-200 focus:border-blue-400 transition-colors duration-200 rounded-xl h-12"
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 rounded-xl h-12 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              disabled={!inputValue.trim()}
            >
              Join the Family Chat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
