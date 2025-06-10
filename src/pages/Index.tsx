
import { useState } from "react";
import WelcomeScreen from "../components/WelcomeScreen";
import WhatsAppChat from "../components/WhatsAppChat";

const Index = () => {
  const [username, setUsername] = useState<string>("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {!username ? (
        <WelcomeScreen onUsernameSet={setUsername} />
      ) : (
        <WhatsAppChat username={username} />
      )}
    </div>
  );
};

export default Index;
