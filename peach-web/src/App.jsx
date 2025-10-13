import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import Home from './pages/Home';
import Chats from './pages/Chats';
import Create from './pages/Create';
import Images from './pages/Images';
import Store from './pages/Store';
import Settings from './pages/Settings';
import Referrals from './pages/Referrals';
import Quests from './pages/Quests';
import Character from './pages/Character';
import ChatScreen from './components/chat/ChatScreen';
import Landing from './pages/Landing';
import { initQuestTracking } from './utils/questTracker';
import { track } from './utils/analytics';

export default function App() {
  useEffect(() => {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
      }
      
      @keyframes typingDot {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
    `;
    document.head.appendChild(style);
    
    // Track app open
    track('open_app', {
      platform: window.Telegram?.WebApp?.platform || 'web',
      version: window.Telegram?.WebApp?.version || 'unknown',
      timestamp: Date.now()
    });
    
    // Initialize quest tracking on app start
    initQuestTracking();
  }, []);

  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        background: '#0b0b10',
        color: '#fff'
      }}>
        <Onboarding />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chats/:girlId" element={<ChatScreen />} />
          <Route path="/create" element={<Create />} />
          <Route path="/images" element={<Images />} />
          <Route path="/store" element={<Store />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/c/:slug" element={<Character />} />
          <Route path="/landing" element={<Landing />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
