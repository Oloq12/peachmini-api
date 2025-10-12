import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
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

export default function App() {
  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        background: '#0b0b10',
        color: '#fff'
      }}>
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
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
