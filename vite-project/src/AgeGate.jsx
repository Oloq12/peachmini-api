import React from 'react';

export default function AgeGate({ onAccept }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', zIndex: 9999
    }}>
      <div style={{ maxWidth: 320, textAlign: 'center' }}>
        <h2>Только для взрослых (18+)</h2>
        <p>Продолжая, вы подтверждаете, что вам<br />18&nbsp;лет или больше.</p>
        <button
          onClick={onAccept}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            background: '#ff2dc6',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            color: '#fff'
          }}
        >
          Мне 18+ — продолжить
        </button>
      </div>
    </div>
  );
}
