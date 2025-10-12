import { useState } from 'react';
import InspiredTab from '../components/create/InspiredTab';
import PresetTab from '../components/create/PresetTab';
import FromScratchTab from '../components/create/FromScratchTab';

export default function Create() {
  const [activeTab, setActiveTab] = useState('inspired');

  const tabs = [
    { id: 'preset', label: 'Preset', icon: '🎭' },
    { id: 'fromscratch', label: 'From Scratch', icon: '✏️' },
    { id: 'inspired', label: 'Inspired', icon: '✨' },
  ];

  return (
    <div style={{ 
      padding: '20px',
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#fff',
        marginBottom: '24px',
        marginTop: '20px'
      }}>
        Создать персонажа
      </h1>

      {/* Табы */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #2a2a2f',
        paddingBottom: '8px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? '#8b5cf6' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#9ca3af',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Контент табов */}
      <div>
        {activeTab === 'preset' && <PresetTab />}
        {activeTab === 'fromscratch' && <FromScratchTab />}
        {activeTab === 'inspired' && <InspiredTab />}
      </div>
    </div>
  );
}
