// Quest tracking utilities
import { track } from './analytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Get user ID from Telegram WebApp
function getUserId() {
  const tg = window.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.id || 'demo';
}

// Complete a quest
export async function completeQuest(key, showToast = true) {
  try {
    const tgId = getUserId();
    
    console.log('🎯 Completing quest:', key, 'for user:', tgId);
    
    const response = await fetch(`${API_URL}/api/quests/complete`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ tgId, key })
    });
    
    const result = await response.json();
    
    if (result.ok && result.data && !result.data.alreadyCompleted) {
      const reward = result.data.reward || 0;
      
      // Show toast notification
      if (showToast) {
        // Import toast dynamically to avoid circular dependencies
        import('react-hot-toast').then(({ default: toast }) => {
          toast.success(`+${reward} 💎`, {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              borderRadius: '12px',
              padding: '12px 20px'
            }
          });
        });
      }
      
      // Analytics tracking
      track('quest_complete', { 
        key,
        reward,
        balance: result.data.balance
      });
      
      console.log(`✅ Quest completed: ${key} (+${reward} 💎)`);
      return { success: true, reward, balance: result.data.balance };
    }
    
    return { success: false, alreadyCompleted: result.data?.alreadyCompleted };
  } catch (error) {
    console.error('❌ Quest completion error:', error);
    return { success: false, error: error.message };
  }
}

// Check and complete daily login quest
export async function checkDailyLogin() {
  try {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('last_daily_login');
    
    // If already logged in today, skip
    if (lastLogin === today) {
      return { success: false, reason: 'already_logged_in_today' };
    }
    
    // Complete daily login quest
    const result = await completeQuest('daily_login', true);
    
    if (result.success) {
      // Mark as logged in today
      localStorage.setItem('last_daily_login', today);
      console.log('✅ Daily login quest completed');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Daily login check error:', error);
    return { success: false, error: error.message };
  }
}

// Quest keys for different actions
export const QUEST_KEYS = {
  DAILY_LOGIN: 'daily_login',
  OPEN_APP: 'open_app',
  CREATE_PERSONA: 'create_persona',
  START_CHAT: 'start_chat',
  GET_REPLY: 'get_reply'
};

// Auto-complete quests based on user actions
export const questActions = {
  // Called when user opens the app
  onAppOpen: () => completeQuest(QUEST_KEYS.OPEN_APP, false),
  
  // Called when user creates a persona
  onPersonaCreated: () => completeQuest(QUEST_KEYS.CREATE_PERSONA, true),
  
  // Called when user starts a chat
  onChatStarted: () => completeQuest(QUEST_KEYS.START_CHAT, true),
  
  // Called when user sends a chat message
  onChatMessageSent: () => completeQuest(QUEST_KEYS.START_CHAT, true),
  
  // Called when user gets a reply
  onReplyReceived: () => completeQuest(QUEST_KEYS.GET_REPLY, true),
  
  // Called on app initialization
  onAppInit: () => {
    // Check daily login first
    checkDailyLogin();
    // Then complete open_app
    completeQuest(QUEST_KEYS.OPEN_APP, false);
  }
};

// Initialize quest tracking
export function initQuestTracking() {
  // Check daily login on app start
  questActions.onAppInit();
  
  console.log('🎯 Quest tracking initialized');
}
